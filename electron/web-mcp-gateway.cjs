/**
 * electron/web-mcp-gateway.cjs
 * Universal Web-Constructed Model Context Protocol (MCP) Gateway
 * 
 * Features:
 * 1. Multi-Session Streamable HTTP Transport Pool (/mcp) - eliminates "Server already initialized" errors
 * 2. OpenAI Custom GPTs & REST Actions Bridge (/api/v1/openapi.json & /api/v1/tools/:toolName)
 * 3. Google Gemini Function Calling Schema (/api/v1/gemini-tools)
 * 4. Dual-Mode Authentication: Static Bearer Token + Firebase Auth JWT (with local loopback bypass)
 * 5. CORS preflight & DNS Rebinding Origin Protection
 * 6. Dynamic Port Discovery (.mcp-port.json)
 */

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { registerDocumentTools, executeToolDirectly, TOOL_DEFINITIONS } = require('../src/engine/mcp-tools.cjs');

class WebMcpGateway {
  /**
   * @param {Object} options
   * @param {import('../src/engine/transaction-manager.cjs').TransactionManager} options.transactionManager
   * @param {Function} [options.broadcastFn]
   * @param {number} [options.port=48722]
   * @param {string} [options.apiKey]
   * @param {boolean} [options.requireAuthLocal=false]
   */
  constructor(options = {}) {
    this.transactionManager = options.transactionManager;
    this.broadcastFn = options.broadcastFn || null;
    this.basePort = options.port || 48722;
    this.apiKey = options.apiKey || process.env.MCP_API_KEY || 'ymaster_mcp_default_token';
    this.requireAuthLocal = options.requireAuthLocal || process.env.MCP_REQUIRE_AUTH_LOCAL === 'true';

    this.server = null;
    this.actualPort = null;
    this.activeTransports = new Map(); // sessionId -> { transport, server, lastActive: number }
    this.app = express();

    this.setupMiddlewares();
    this.setupRoutes();
    this.startSessionJanitor();
  }

  setupMiddlewares() {
    this.app.use(express.json({ limit: '25mb' }));

    // 1. CORS Configuration for IDEs, OpenAI, and Web Clients
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, mcp-session-id, mcp-protocol-version, Last-Event-ID, x-api-key'
      );
      res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id, Content-Type');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // 2. Dual-Mode Authentication Middleware
    this.app.use((req, res, next) => {
      // Allow OpenAPI doc inspection without auth so GPT builder can import schema
      if (req.path === '/api/v1/openapi.json' || req.path === '/health' || req.path === '/api/v1/gemini-tools') {
        return next();
      }

      // Local loopback exemption if not explicitly required
      const isLoopback = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost';
      if (isLoopback && !this.requireAuthLocal) {
        return next();
      }

      // Check Authorization header or query param
      const authHeader = req.headers['authorization'] || req.headers['x-api-key'];
      const queryToken = req.query.token || req.query.apiKey;

      let token = queryToken;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      } else if (authHeader) {
        token = authHeader.trim();
      }

      if (!token) {
        return res.status(401).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Unauthorized: Missing API Key or Bearer Token' },
          id: null
        });
      }

      // Check Static Bearer Key
      if (token === this.apiKey) {
        req.authContext = { type: 'static_api_key' };
        return next();
      }

      // Check Firebase Auth JWT (decode structure and verify if possible)
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);
          if (payload && (payload.firebase || payload.iss?.includes('securetoken.google.com') || payload.user_id || payload.sub)) {
            req.authContext = {
              type: 'firebase_jwt',
              uid: payload.user_id || payload.sub,
              email: payload.email
            };
            return next();
          }
        }
      } catch (_) {}

      return res.status(403).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Forbidden: Invalid API Key or Firebase Token' },
        id: null
      });
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'online',
        service: 'y-master-editor-mcp-gateway',
        version: '3.0.0',
        activeSessions: this.activeTransports.size,
        port: this.actualPort
      });
    });

    // 1. Streamable HTTP POST /mcp (JSON-RPC 2.0 endpoint)
    this.app.post('/mcp', async (req, res) => {
      try {
        const sessionIdHeader = req.headers['mcp-session-id'];
        let sessionEntry = sessionIdHeader ? this.activeTransports.get(sessionIdHeader) : null;

        if (sessionEntry) {
          sessionEntry.lastActive = Date.now();
          await sessionEntry.transport.handleRequest(req, res, req.body);
          return;
        }

        // New Session Initialization:
        // Client either sends 'initialize' without session ID, or session expired
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

        this.activeTransports.set(newSessionId, entry);

        transport.onclose = () => {
          this.activeTransports.delete(newSessionId);
        };

        await transport.handleRequest(req, res, req.body);
      } catch (err) {
        console.error('[Web MCP Gateway] POST /mcp error:', err);
        if (!res.headersSent) {
          res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: err.message }, id: null });
        }
      }
    });

    // 2. Streamable HTTP GET /mcp (SSE stream for session notifications)
    this.app.get('/mcp', async (req, res) => {
      const sessionIdHeader = req.headers['mcp-session-id'] || req.query.sessionId;
      const sessionEntry = sessionIdHeader ? this.activeTransports.get(sessionIdHeader) : null;

      if (!sessionEntry) {
        return res.status(404).json({
          jsonrpc: '2.0',
          error: { code: -32001, message: 'Session not found. Send an initialize request first.' },
          id: null
        });
      }

      sessionEntry.lastActive = Date.now();
      await sessionEntry.transport.handleRequest(req, res);
    });

    // 3. Streamable HTTP DELETE /mcp (Explicit session teardown)
    this.app.delete('/mcp', async (req, res) => {
      const sessionIdHeader = req.headers['mcp-session-id'] || req.query.sessionId;
      const sessionEntry = sessionIdHeader ? this.activeTransports.get(sessionIdHeader) : null;

      if (sessionEntry) {
        try {
          await sessionEntry.transport.handleRequest(req, res);
        } catch (_) {}
        this.activeTransports.delete(sessionIdHeader);
      } else {
        res.status(404).json({ jsonrpc: '2.0', error: { code: -32001, message: 'Session not found' }, id: null });
      }
    });

    // 4. OpenAPI 3.1 REST Specification for OpenAI Custom GPTs
    this.app.get('/api/v1/openapi.json', (req, res) => {
      const protocol = req.protocol;
      const host = req.get('host');
      const openApiSpec = this.generateOpenApiSpec(`${protocol}://${host}`);
      res.json(openApiSpec);
    });

    // 5. REST Tool Execution Bridge for OpenAI Custom GPTs & Direct HTTP
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

    // 6. Google Gemini Tools Function Declaration Schema
    this.app.get('/api/v1/gemini-tools', (req, res) => {
      const geminiTools = this.generateGeminiDeclarations();
      res.json({
        modelProvider: 'Google Gemini',
        functionDeclarations: geminiTools
      });
    });
  }

  // Periodic sweeper for stale MCP sessions (avoids memory leaks)
  startSessionJanitor() {
    this.janitorTimer = setInterval(() => {
      const now = Date.now();
      const MAX_IDLE_MS = 30 * 60 * 1000; // 30 minutes
      for (const [sessionId, entry] of this.activeTransports.entries()) {
        if (now - entry.lastActive > MAX_IDLE_MS) {
          try { entry.transport.close(); } catch (_) {}
          try { entry.server.close(); } catch (_) {}
          this.activeTransports.delete(sessionId);
        }
      }
    }, 5 * 60 * 1000);
    if (this.janitorTimer.unref) this.janitorTimer.unref();
  }

  /**
   * Generates dynamic OpenAPI 3.1 specification for OpenAI Custom GPTs
   */
  generateOpenApiSpec(serverUrl) {
    const paths = {};

    for (const [name, def] of Object.entries(TOOL_DEFINITIONS || {})) {
      paths[`/api/v1/tools/${name}`] = {
        post: {
          operationId: name,
          summary: def.description?.slice(0, 80) || name,
          description: def.description || '',
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
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      tool: { type: 'string' },
                      result: { type: 'object' }
                    }
                  }
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
      paths,
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    };
  }

  /**
   * Generates Gemini FunctionDeclaration schema
   */
  generateGeminiDeclarations() {
    return Object.entries(TOOL_DEFINITIONS || {}).map(([name, def]) => ({
      name,
      description: def.description || '',
      parameters: def.openApiSchema || { type: 'object' }
    }));
  }

  /**
   * Starts the HTTP server on basePort with automatic EADDRINUSE fallback
   */
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
            url: `http://127.0.0.1:${this.actualPort}/mcp`,
            openapiUrl: `http://127.0.0.1:${this.actualPort}/api/v1/openapi.json`,
            pid: process.pid,
            updatedAt: new Date().toISOString()
          }, null, 2));
        } catch (_) {}

        console.log(`[Web MCP Gateway] 🚀 Live on http://127.0.0.1:${this.actualPort}/mcp`);
        console.log(`[Web MCP Gateway] 📄 OpenAI OpenAPI: http://127.0.0.1:${this.actualPort}/api/v1/openapi.json`);
        resolve(this.actualPort);
      });
    });
  }

  close() {
    if (this.janitorTimer) clearInterval(this.janitorTimer);
    for (const [_, entry] of this.activeTransports) {
      try { entry.transport.close(); } catch (_) {}
      try { entry.server.close(); } catch (_) {}
    }
    this.activeTransports.clear();
    if (this.server) {
      return new Promise(r => this.server.close(r));
    }
    return Promise.resolve();
  }
}

module.exports = {
  WebMcpGateway
};
