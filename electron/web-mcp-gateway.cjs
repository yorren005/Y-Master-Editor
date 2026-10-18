/**
 * electron/web-mcp-gateway.cjs
 * Universal Model Context Protocol (MCP) Gateway for Y Master Editor
 * 
 * Features:
 * 1. Standard Server-Sent Events (SSE) Transport (/sse + /messages)
 *    - Full, native compatibility with Claude Custom Connectors (claude.ai / remote) and Claude Desktop SSE.
 * 2. Multi-Session Streamable HTTP Transport (/mcp)
 *    - Full compatibility with Google Gemini Connected Apps, Cursor, and modern MCP clients.
 * 3. OpenAI Custom GPTs OpenAPI 3.1 & REST Actions Bridge (/api/v1/openapi.json & /api/v1/tools/:toolName)
 * 4. Google Gemini Function Calling Schema (/api/v1/gemini-tools)
 * 5. Permissive Out-of-the-Box Mode for Zero-Friction Connection (Protected by human-in-the-loop authorization gating)
 * 6. Dynamic Port Discovery & Status Persistence (.mcp-port.json)
 */

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const { registerDocumentTools, executeToolDirectly, TOOL_DEFINITIONS } = require('../src/engine/mcp-tools.cjs');

class WebMcpGateway {
  /**
   * @param {Object} options
   * @param {import('../src/engine/transaction-manager.cjs').TransactionManager} options.transactionManager
   * @param {Function} [options.broadcastFn]
   * @param {number} [options.port=48721]
   * @param {string} [options.apiKey]
   * @param {boolean} [options.requireAuth=false]
   */
  constructor(options = {}) {
    this.transactionManager = options.transactionManager;
    this.broadcastFn = options.broadcastFn || null;
    this.basePort = options.port || 48721;
    this.apiKey = options.apiKey || process.env.MCP_API_KEY || 'ymaster_mcp_default_token';
    this.requireAuth = options.requireAuth || (process.env.MCP_REQUIRE_AUTH === 'true');

    this.server = null;
    this.actualPort = null;
    this.activeHttpTransports = new Map(); // sessionId -> { transport, server, lastActive: number }
    this.activeSseTransports = new Map();  // sessionId -> { transport, server, lastActive: number }
    this.app = express();

    this.setupMiddlewares();
    this.setupRoutes();
    this.startSessionJanitor();
  }

  setupMiddlewares() {
    this.app.use(express.json({ limit: '25mb' }));

    // 1. CORS Configuration for Claude, OpenAI, Gemini, Cursor, and IDEs
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, mcp-session-id, mcp-protocol-version, Last-Event-ID, x-api-key, traceparent, baggage, Cache-Control'
      );
      res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id, Content-Type');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // 2. Authentication Middleware
    // Out-of-the-box permissive mode allows Claude Custom Connector ("No sign in") to connect instantly.
    // Human-in-the-loop authorization gating in the TransactionManager protects all document mutations.
    this.app.use((req, res, next) => {
      // Always allow discovery and health endpoints
      if (
        req.path === '/' ||
        req.path === '/health' ||
        req.path === '/api/v1/openapi.json' ||
        req.path === '/api/v1/gemini-tools'
      ) {
        return next();
      }

      const authHeader = req.headers['authorization'] || req.headers['x-api-key'];
      const queryToken = req.query.token || req.query.apiKey;

      let token = queryToken;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      } else if (authHeader) {
        token = authHeader.trim();
      }

      // If auth is explicitly required, enforce it
      if (this.requireAuth) {
        const isLoopback = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost';
        if (!isLoopback) {
          if (!token) {
            return res.status(401).json({
              jsonrpc: '2.0',
              error: { code: -32000, message: 'Unauthorized: Missing API Key or Bearer Token' },
              id: null
            });
          }

          if (token !== this.apiKey) {
            // Check Firebase Auth JWT format
            let validJwt = false;
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
                if (payload && (payload.firebase || payload.user_id || payload.sub)) {
                  validJwt = true;
                  req.authContext = { type: 'firebase_jwt', uid: payload.user_id || payload.sub, email: payload.email };
                }
              }
            } catch (_) {}

            if (!validJwt) {
              return res.status(403).json({
                jsonrpc: '2.0',
                error: { code: -32000, message: 'Forbidden: Invalid API Key' },
                id: null
              });
            }
          } else {
            req.authContext = { type: 'static_api_key' };
          }
        }
      } else {
        // Optional context recording if client supplied credentials
        if (token) {
          req.authContext = { type: token === this.apiKey ? 'static_api_key' : 'token', token };
        } else {
          req.authContext = { type: 'unauthenticated' };
        }
      }

      next();
    });
  }

  setupRoutes() {
    // -----------------------------------------------------------------
    // Root Information & Diagnostic Landing Page
    // -----------------------------------------------------------------
    this.app.get('/', (req, res) => {
      res.json({
        service: 'y-master-editor-mcp-gateway',
        name: 'Y Master Editor Universal Model Context Protocol Gateway',
        version: '3.0.0',
        status: 'online',
        endpoints: {
          claude_custom_connector: {
            description: 'Claude.ai / Claude Desktop Custom Connector (Server-Sent Events)',
            sseUrl: `${req.protocol}://${req.get('host')}/sse`,
            messagesUrl: `${req.protocol}://${req.get('host')}/messages`,
            recommendedAuth: 'No sign in'
          },
          streamable_http: {
            description: 'Streamable HTTP endpoint for Google Gemini, modern MCP clients',
            url: `${req.protocol}://${req.get('host')}/mcp`
          },
          openai_custom_gpt: {
            description: 'OpenAPI 3.1 schema for ChatGPT Custom GPT Actions',
            specUrl: `${req.protocol}://${req.get('host')}/api/v1/openapi.json`
          },
          gemini_function_declarations: {
            description: 'Google Gemini FunctionDeclarations schema',
            url: `${req.protocol}://${req.get('host')}/api/v1/gemini-tools`
          },
          health: `${req.protocol}://${req.get('host')}/health`
        },
        toolsCount: Object.keys(TOOL_DEFINITIONS || {}).length,
        tools: Object.keys(TOOL_DEFINITIONS || {})
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'online',
        service: 'y-master-editor-mcp-gateway',
        version: '3.0.0',
        activeHttpSessions: this.activeHttpTransports.size,
        activeSseSessions: this.activeSseTransports.size,
        port: this.actualPort
      });
    });

    // -----------------------------------------------------------------
    // 1. STANDARD SERVER-SENT EVENTS (SSE) TRANSPORT FOR CLAUDE
    //    Endpoint: GET /sse  &  POST /messages
    // -----------------------------------------------------------------
    this.app.get('/sse', async (req, res) => {
      try {
        // Essential SSE streaming headers for Claude & Cloudflare proxy traversal
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        const serverInstance = new McpServer({
          name: 'y-master-editor',
          version: '3.0.0'
        });

        registerDocumentTools(serverInstance, this.transactionManager, this.broadcastFn);

        // SSEServerTransport directs client to post to /messages?sessionId=...
        const transport = new SSEServerTransport('/messages', res);
        const sessionId = transport.sessionId;

        const entry = {
          transport,
          server: serverInstance,
          sessionId,
          lastActive: Date.now()
        };

        this.activeSseTransports.set(sessionId, entry);

        let isClosed = false;
        transport.onclose = () => {
          if (isClosed) return;
          isClosed = true;
          this.activeSseTransports.delete(sessionId);
        };

        await serverInstance.connect(transport);
        console.error(`[Web MCP Gateway] Established SSE stream for Claude session: ${sessionId}`);
      } catch (err) {
        console.error('[Web MCP Gateway] GET /sse error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to establish SSE connection', details: err.message });
        }
      }
    });

    // POST /messages for SSE client-to-server JSON-RPC communication
    this.app.post('/messages', async (req, res) => {
      const sessionId = req.query.sessionId;
      const entry = sessionId ? this.activeSseTransports.get(sessionId) : null;

      if (!entry) {
        return res.status(404).json({
          jsonrpc: '2.0',
          error: { code: -32001, message: `Session ${sessionId || 'unknown'} not found or expired. Re-connect to /sse.` },
          id: null
        });
      }

      entry.lastActive = Date.now();
      try {
        // Crucial: pass req.body as parsedBody so express.json() body is passed to transport
        await entry.transport.handlePostMessage(req, res, req.body);
      } catch (err) {
        console.error('[Web MCP Gateway] POST /messages error:', err);
        if (!res.headersSent) {
          res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: err.message }, id: null });
        }
      }
    });

    // -----------------------------------------------------------------
    // 2. STREAMABLE HTTP TRANSPORT
    //    Endpoint: POST /mcp & GET /mcp & DELETE /mcp
    // -----------------------------------------------------------------
    this.app.post('/mcp', async (req, res) => {
      try {
        if (!req.headers['accept'] || req.headers['accept'] === '*/*') {
          req.headers['accept'] = 'application/json, text/event-stream';
        }

        const sessionIdHeader = req.headers['mcp-session-id'];
        let sessionEntry = sessionIdHeader ? this.activeHttpTransports.get(sessionIdHeader) : null;

        if (sessionEntry) {
          sessionEntry.lastActive = Date.now();
          await sessionEntry.transport.handleRequest(req, res, req.body);
          return;
        }

        // New Session Initialization:
        const newSessionId = `mcp_sess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        const serverInstance = new McpServer({
          name: 'y-master-editor',
          version: '3.0.0'
        });

        registerDocumentTools(serverInstance, this.transactionManager, this.broadcastFn);

        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => newSessionId
        });

        await serverInstance.connect(transport);

        const entry = {
          transport,
          server: serverInstance,
          sessionId: newSessionId,
          lastActive: Date.now()
        };

        this.activeHttpTransports.set(newSessionId, entry);

        let isClosed = false;
        transport.onclose = () => {
          if (isClosed) return;
          isClosed = true;
          this.activeHttpTransports.delete(newSessionId);
        };

        await transport.handleRequest(req, res, req.body);
      } catch (err) {
        console.error('[Web MCP Gateway] POST /mcp error:', err);
        if (!res.headersSent) {
          res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: err.message }, id: null });
        }
      }
    });

    // GET /mcp: Streamable HTTP session stream OR SSE fallback for clients pointing to /mcp
    this.app.get('/mcp', async (req, res) => {
      const sessionIdHeader = req.headers['mcp-session-id'] || req.query.sessionId;
      const sessionEntry = sessionIdHeader ? this.activeHttpTransports.get(sessionIdHeader) : null;

      if (sessionEntry) {
        sessionEntry.lastActive = Date.now();
        await sessionEntry.transport.handleRequest(req, res);
        return;
      }

      // If an SSE client (like Claude) connects to /mcp via GET expecting an SSE stream:
      // Gracefully establish an SSE transport session rather than returning 404!
      try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        const serverInstance = new McpServer({
          name: 'y-master-editor',
          version: '3.0.0'
        });
        registerDocumentTools(serverInstance, this.transactionManager, this.broadcastFn);

        const transport = new SSEServerTransport('/mcp/messages', res);
        const sessionId = transport.sessionId;

        const entry = {
          transport,
          server: serverInstance,
          sessionId,
          lastActive: Date.now()
        };
        this.activeSseTransports.set(sessionId, entry);

        let isClosed = false;
        transport.onclose = () => {
          if (isClosed) return;
          isClosed = true;
          this.activeSseTransports.delete(sessionId);
        };

        await serverInstance.connect(transport);
        console.error(`[Web MCP Gateway] Established SSE stream on /mcp for Claude session: ${sessionId}`);
      } catch (err) {
        console.error('[Web MCP Gateway] GET /mcp SSE fallback error:', err);
        if (!res.headersSent) {
          res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: err.message }, id: null });
        }
      }
    });

    // POST /mcp/messages for /mcp SSE sessions
    this.app.post('/mcp/messages', async (req, res) => {
      const sessionId = req.query.sessionId;
      const entry = sessionId ? this.activeSseTransports.get(sessionId) : null;

      if (!entry) {
        return res.status(404).json({
          jsonrpc: '2.0',
          error: { code: -32001, message: `Session ${sessionId || 'unknown'} not found.` },
          id: null
        });
      }

      entry.lastActive = Date.now();
      try {
        await entry.transport.handlePostMessage(req, res, req.body);
      } catch (err) {
        console.error('[Web MCP Gateway] POST /mcp/messages error:', err);
        if (!res.headersSent) {
          res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: err.message }, id: null });
        }
      }
    });

    // DELETE /mcp (Explicit session teardown)
    this.app.delete('/mcp', async (req, res) => {
      const sessionIdHeader = req.headers['mcp-session-id'] || req.query.sessionId;
      const sessionEntry = sessionIdHeader ? this.activeHttpTransports.get(sessionIdHeader) : null;

      if (sessionEntry) {
        try {
          await sessionEntry.transport.handleRequest(req, res);
        } catch (_) {}
        this.activeHttpTransports.delete(sessionIdHeader);
      } else {
        res.status(404).json({ jsonrpc: '2.0', error: { code: -32001, message: 'Session not found' }, id: null });
      }
    });

    // -----------------------------------------------------------------
    // 3. OPENAI CUSTOM GPTS REST & OPENAPI 3.1 SPEC
    // -----------------------------------------------------------------
    this.app.get('/api/v1/openapi.json', (req, res) => {
      const protocol = req.protocol;
      const host = req.get('host');
      const openApiSpec = this.generateOpenApiSpec(`${protocol}://${host}`);
      res.json(openApiSpec);
    });

    this.app.post('/api/v1/tools/:toolName', async (req, res) => {
      const { toolName } = req.params;
      try {
        const result = await executeToolDirectly(
          toolName,
          req.body || {},
          this.transactionManager,
          this.broadcastFn
        );

        if (result.isError) {
          return res.status(400).json({
            success: false,
            tool: toolName,
            error: result.content?.[0]?.text || 'Execution failed'
          });
        }

        let parsedData = result.content?.[0]?.text;
        try {
          parsedData = JSON.parse(parsedData);
        } catch (_) {}

        return res.json({
          success: true,
          tool: toolName,
          result: parsedData
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          tool: toolName,
          error: err.message
        });
      }
    });

    // -----------------------------------------------------------------
    // 4. GOOGLE GEMINI FUNCTION CALLING SCHEMA
    // -----------------------------------------------------------------
    this.app.get('/api/v1/gemini-tools', (req, res) => {
      res.json({
        functionDeclarations: this.generateGeminiDeclarations()
      });
    });
  }

  startSessionJanitor() {
    this.janitorTimer = setInterval(() => {
      const now = Date.now();
      const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

      for (const [sessionId, entry] of this.activeHttpTransports) {
        if (now - entry.lastActive > SESSION_TTL_MS) {
          console.log(`[Session Janitor] Pruning inactive HTTP session: ${sessionId}`);
          try { entry.transport.close(); } catch (_) {}
          try { entry.server.close(); } catch (_) {}
          this.activeHttpTransports.delete(sessionId);
        }
      }

      for (const [sessionId, entry] of this.activeSseTransports) {
        if (now - entry.lastActive > SESSION_TTL_MS) {
          console.log(`[Session Janitor] Pruning inactive SSE session: ${sessionId}`);
          try { entry.transport.close(); } catch (_) {}
          try { entry.server.close(); } catch (_) {}
          this.activeSseTransports.delete(sessionId);
        }
      }
    }, 60 * 1000);

    if (this.janitorTimer.unref) this.janitorTimer.unref();
  }

  generateOpenApiSpec(serverUrl) {
    const paths = {};
    for (const [name, def] of Object.entries(TOOL_DEFINITIONS || {})) {
      paths[`/api/v1/tools/${name}`] = {
        post: {
          operationId: name,
          summary: def.description || `Execute ${name}`,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: def.openApiSchema || { type: 'object' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Successful execution',
              content: {
                'application/json': {
                  schema: { type: 'object' }
                }
              }
            }
          }
        }
      };
    }

    return {
      openapi: '3.1.0',
      info: {
        title: 'Y Master Editor AI Agent Tools API',
        version: '3.0.0',
        description: 'Universal MCP Tool actions bridge for OpenAI Custom GPTs, Claude Web, and External AI agents.'
      },
      servers: [{ url: serverUrl }],
      paths
    };
  }

  generateGeminiDeclarations() {
    return Object.entries(TOOL_DEFINITIONS || {}).map(([name, def]) => ({
      name,
      description: def.description || '',
      parameters: def.openApiSchema || { type: 'object' }
    }));
  }

  listen(port = this.basePort) {
    return new Promise((resolve, reject) => {
      const server = http.createServer(this.app);

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          const nextPort = port < this.basePort + 20 ? port + 1 : 0;
          console.warn(`[Web MCP Gateway] Port ${port} in use, attempting ${nextPort}...`);
          try { server.close(); } catch (_) {}
          setTimeout(() => {
            this.listen(nextPort).then(resolve).catch(reject);
          }, 300);
        } else {
          reject(err);
        }
      });

      server.listen(port, '0.0.0.0', () => {
        this.server = server;
        this.actualPort = server.address().port;

        // Persist discovery port file for tools and scripts
        try {
          const portFilePath = path.join(__dirname, '..', '.mcp-port.json');
          fs.writeFileSync(portFilePath, JSON.stringify({
            port: this.actualPort,
            sseUrl: `http://127.0.0.1:${this.actualPort}/sse`,
            mcpUrl: `http://127.0.0.1:${this.actualPort}/mcp`,
            openapiUrl: `http://127.0.0.1:${this.actualPort}/api/v1/openapi.json`,
            pid: process.pid,
            updatedAt: new Date().toISOString()
          }, null, 2));
        } catch (_) {}

        console.error(`[Web MCP Gateway] 🚀 Live on http://127.0.0.1:${this.actualPort}`);
        console.error(`  - Claude SSE: http://127.0.0.1:${this.actualPort}/sse`);
        console.error(`  - Streamable HTTP: http://127.0.0.1:${this.actualPort}/mcp`);
        console.error(`  - OpenAI OpenAPI: http://127.0.0.1:${this.actualPort}/api/v1/openapi.json`);
        resolve(this.actualPort);
      });
    });
  }

  close() {
    if (this.janitorTimer) clearInterval(this.janitorTimer);
    for (const [_, entry] of this.activeHttpTransports) {
      try { entry.transport.close(); } catch (_) {}
    }
    for (const [_, entry] of this.activeSseTransports) {
      try { entry.transport.close(); } catch (_) {}
    }
    this.activeHttpTransports.clear();
    this.activeSseTransports.clear();
    if (this.server) {
      return new Promise(r => this.server.close(r));
    }
    return Promise.resolve();
  }
}

module.exports = {
  WebMcpGateway
};

// Standalone execution support
if (require.main === module) {
  const { TransactionManager } = require('../src/engine/transaction-manager.cjs');
  const mcpStatePath = path.join(__dirname, '..', 'document_state.json');
  const tm = new TransactionManager(mcpStatePath);
  const port = parseInt(process.env.MCP_PORT || '48721', 10);
  const gateway = new WebMcpGateway({
    transactionManager: tm,
    port
  });
  gateway.listen(port).then((actualPort) => {
    console.error(`[Standalone Web MCP Gateway] 🚀 Live at http://127.0.0.1:${actualPort}`);
  }).catch((err) => {
    console.error('[Web MCP Gateway Error]', err);
    process.exit(1);
  });
}
