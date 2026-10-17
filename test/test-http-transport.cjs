const express = require('express');
const http = require('http');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { registerDocumentTools } = require('../src/engine/mcp-tools.cjs');
const { TransactionManager } = require('../src/engine/transaction-manager.cjs');
const path = require('path');
const fs = require('fs');

async function testHttpTransport() {
  console.log('--- TESTING STREAMABLE HTTP TRANSPORT (MAIN.CJS PATTERN) ---');

  const testState = path.join(__dirname, 'test_http_state.json');
  fs.writeFileSync(testState, JSON.stringify({ revision: 1, pages: [] }));
  const tm = new TransactionManager(testState);

  const expressApp = express();
  // Matching electron/main.cjs lines 102-108
  expressApp.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  const embeddedMcpServer = new McpServer({
    name: 'y-master-editor',
    version: '3.0.0'
  });

  registerDocumentTools(embeddedMcpServer, tm);

  const streamableTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => `mcp_sess_${Date.now()}`
  });
  await embeddedMcpServer.connect(streamableTransport);

  expressApp.all('/mcp', async (req, res) => {
    try {
      await streamableTransport.handleRequest(req, res, req.body);
    } catch (err) {
      if (!res.headersSent) res.status(500).json({ error: err.message });
    }
  });

  const server = http.createServer(expressApp);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  console.log(`Test HTTP server on http://127.0.0.1:${port}/mcp`);

  const url = `http://127.0.0.1:${port}/mcp`;

  // Test 1: OPTIONS CORS Preflight
  console.log('\n[Test 1] Testing OPTIONS CORS Preflight...');
  const optionsRes = await fetch(url, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, mcp-session-id'
    }
  });
  console.log('OPTIONS status:', optionsRes.status);
  console.log('Access-Control-Allow-Origin:', optionsRes.headers.get('access-control-allow-origin'));
  console.log('Access-Control-Allow-Methods:', optionsRes.headers.get('access-control-allow-methods'));
  console.log('Access-Control-Allow-Headers:', optionsRes.headers.get('access-control-allow-headers'));
  console.log('Access-Control-Expose-Headers:', optionsRes.headers.get('access-control-expose-headers'));

  // Test 2: Missing Accept header on POST
  console.log('\n[Test 2] Testing POST without Accept header...');
  const noAcceptRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'c1', version: '1' } } })
  });
  console.log('POST without Accept status:', noAcceptRes.status, await noAcceptRes.text());

  // Test 3: Client 1 Initialize with required Accept and Content-Type headers
  console.log('\n[Test 3] Client 1: Valid Initialize...');
  const c1InitRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'client-1', version: '1' } }
    })
  });
  console.log('Client 1 Init status:', c1InitRes.status);
  const c1SessionId = c1InitRes.headers.get('mcp-session-id');
  console.log('Client 1 Session ID header:', c1SessionId);
  const c1Text = await c1InitRes.text();
  console.log('Client 1 Body preview:', c1Text.slice(0, 150));

  // Test 4: Client 2 Initialize (Concurrent Client)
  console.log('\n[Test 4] Client 2: Attempting Concurrent Initialize...');
  const c2InitRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'client-2', version: '1' } }
    })
  });
  console.log('Client 2 Init status:', c2InitRes.status);
  console.log('Client 2 Body:', await c2InitRes.text());

  // Test 5: GET SSE stream with Accept: text/event-stream and Session ID
  console.log('\n[Test 5] Client 1: GET SSE Stream...');
  const controller = new AbortController();
  const getRes = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      'mcp-session-id': c1SessionId,
      'mcp-protocol-version': '2024-11-05'
    },
    signal: controller.signal
  });
  console.log('GET SSE status:', getRes.status);
  console.log('GET Content-Type:', getRes.headers.get('content-type'));

  // Test 6: Second GET SSE stream (Testing 1 SSE stream per session invariant)
  console.log('\n[Test 6] Client 1: Second Concurrent GET SSE Stream...');
  const getRes2 = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      'mcp-session-id': c1SessionId,
      'mcp-protocol-version': '2024-11-05'
    }
  });
  console.log('Second GET SSE status:', getRes2.status);
  console.log('Second GET body:', await getRes2.text());

  // Test 7: DELETE session termination
  console.log('\n[Test 7] Client 1: DELETE Session...');
  const delRes = await fetch(url, {
    method: 'DELETE',
    headers: {
      'mcp-session-id': c1SessionId
    }
  });
  console.log('DELETE status:', delRes.status);

  // Test 8: Client 2 Initialize after DELETE
  console.log('\n[Test 8] Client 2: Initialize after Session DELETE...');
  const c2AfterDel = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'client-2', version: '1' } }
    })
  });
  console.log('Client 2 Init after DELETE status:', c2AfterDel.status);
  console.log('Client 2 Body after DELETE:', await c2AfterDel.text());

  controller.abort();
  server.close();
  try { fs.unlinkSync(testState); } catch (e) {}
  console.log('\n--- TEST COMPLETE ---');
}

testHttpTransport().catch(err => {
  console.error('Test crashed:', err);
  process.exit(1);
});
