/**
 * electron/mcp-server.cjs
 * Y Master Editor — Failproof Universal Model Context Protocol Server
 * Compatible with Anthropic (Claude Desktop/Code), OpenAI (ChatGPT/Agents SDK), Cursor, and Windsurf
 */

// 1. Mandatory Stdio Guard: Redirect all stdout logging methods to stderr
// StdioServerTransport uses process.stdout exclusively for JSON-RPC messages.
console.log = (...args) => console.error('[MCP LOG]', ...args);
console.info = (...args) => console.error('[MCP INFO]', ...args);
console.debug = (...args) => console.error('[MCP DEBUG]', ...args);
console.dir = (...args) => console.error('[MCP DIR]', ...args);
console.table = (...args) => console.error('[MCP TABLE]', ...args);

// Ensure process exits cleanly when host closes stdin (prevents zombie processes)
process.stdin.on('close', () => process.exit(0));
process.stdin.on('end', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const { TransactionManager } = require('../src/engine/transaction-manager.cjs');
const { registerDocumentTools } = require('../src/engine/mcp-tools.cjs');

const fs = require('fs');

const { ensureSeededFile, resolveWritablePath } = require('./storage-paths.cjs');

const STATE_FILE = ensureSeededFile('document_state.json');
const PORT_FILE = resolveWritablePath('.mcp-port.json');

// 2. Initialize Core Engine & Transaction Manager
const transactionManager = new TransactionManager(STATE_FILE);

// 3. WebSocket Bridge to Running Electron App Window with Dynamic Discovery & Backoff
let ws = null;
let reconnectTimer = null;
let reconnectAttempts = 0;

function resolveWsUrl() {
  if (process.env.MCP_WS_PORT) {
    return `ws://127.0.0.1:${process.env.MCP_WS_PORT}`;
  }
  try {
    if (fs.existsSync(PORT_FILE)) {
      const data = JSON.parse(fs.readFileSync(PORT_FILE, 'utf-8'));
      if (data && data.port) {
        return `ws://127.0.0.1:${data.port}`;
      }
    }
  } catch (_) {}
  return 'ws://127.0.0.1:48721';
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectAttempts++;
  const baseDelay = 1000;
  const maxDelay = 10000;
  const jitter = Math.floor(Math.random() * 500);
  const delay = Math.min(baseDelay * Math.pow(1.5, Math.min(reconnectAttempts, 6)), maxDelay) + jitter;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectToElectronApp();
  }, delay);
  if (reconnectTimer.unref) reconnectTimer.unref();
}

function connectToElectronApp() {
  const targetWsUrl = resolveWsUrl();
  try {
    ws = new WebSocket(targetWsUrl);

    ws.on('open', () => {
      reconnectAttempts = 0;
      console.error('[MCP Bridge] Connected to Electron Window on', targetWsUrl);
      ws.send(JSON.stringify({
        type: 'SYNC_STATE_TO_APP',
        document: transactionManager.getDocument()
      }));
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const doc = msg.document || msg.state;
        if ((msg.type === 'APP_STATE_UPDATE' || msg.type === 'SYNC_STATE_TO_APP') && doc) {
          transactionManager.setDocument(doc);
        }
      } catch (err) {
        console.error('[MCP Bridge] WS parse error:', err.message);
      }
    });

    ws.on('close', () => {
      ws = null;
      scheduleReconnect();
    });

    ws.on('error', () => {
      ws = null;
      // 'close' will also fire after 'error', so reconnect is handled there
    });
  } catch (err) {
    ws = null;
    scheduleReconnect();
  }
}

connectToElectronApp();

function broadcastToApp(payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(payload));
    } catch (e) {
      console.error('[MCP Bridge] Broadcast failed:', e.message);
    }
  }
}

// 4. Initialize McpServer
const mcpServer = new McpServer({
  name: 'y-master-editor',
  version: '3.0.0'
});

// 5. Register AI-Agent Tools
registerDocumentTools(mcpServer, transactionManager, broadcastToApp);

// 6. Start Transports (Dual: Stdio + HTTP always run together)
async function start() {
  const transportMode = process.env.MCP_TRANSPORT || 'stdio';
  const httpPort = process.env.MCP_HTTP_PORT ? parseInt(process.env.MCP_HTTP_PORT, 10) : 48722;

  // Always start the HTTP gateway so any MCP-compatible agent can connect via URL
  try {
    const { WebMcpGateway } = require('./web-mcp-gateway.cjs');
    const gateway = new WebMcpGateway({
      transactionManager,
      broadcastFn: broadcastToApp,
      port: httpPort
    });
    await gateway.listen(httpPort);
    console.error(`[MCP] Universal Web MCP Gateway listening on http://127.0.0.1:${gateway.actualPort}/mcp`);
    console.error(`[MCP] OpenAPI schema at http://127.0.0.1:${gateway.actualPort}/api/v1/openapi.json`);
    console.error(`[MCP] Gemini tools at http://127.0.0.1:${gateway.actualPort}/api/v1/gemini-tools`);
  } catch (err) {
    console.error('[MCP] HTTP Gateway failed to start (non-fatal):', err.message);
  }

  if (transportMode !== 'http') {
    // Stdio Transport for Claude Desktop, Cursor, and IDEs (default)
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.error('[MCP] Stdio Transport connected. Ready for JSON-RPC messages.');
  }
}

start().catch((err) => {
  console.error('[Fatal MCP Error]:', err);
  process.exit(1);
});
