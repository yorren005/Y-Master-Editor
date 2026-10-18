/**
 * test/claude-mcp-connector-test.cjs
 * Comprehensive Verification Suite for Claude Custom Connector & Claude Desktop SSE Transports
 */

const assert = require('assert');
const path = require('path');
const { WebMcpGateway } = require('../electron/web-mcp-gateway.cjs');
const { TransactionManager } = require('../src/engine/transaction-manager.cjs');

async function runClaudeConnectorTests() {
  console.log('================================================================');
  console.log('>>> RUNNING CLAUDE CUSTOM CONNECTOR & SSE MCP VERIFICATION <<<');
  console.log('================================================================\n');

  const testStatePath = path.join(__dirname, '..', 'document_state.json');
  const transactionManager = new TransactionManager(testStatePath);
  const TEST_PORT = 52780;

  const gateway = new WebMcpGateway({
    transactionManager,
    port: TEST_PORT,
    requireAuth: false // Permissive out-of-the-box mode for Claude Custom Connector
  });

  const actualPort = await gateway.listen(TEST_PORT);
  console.log(`[Step 1] Gateway listening on http://127.0.0.1:${actualPort}`);

  const baseUrl = `http://127.0.0.1:${actualPort}`;

  // Test 1: Root Info & Discovery
  console.log('[Step 2] Testing root discovery and diagnostic endpoint...');
  const rootRes = await fetch(`${baseUrl}/`);
  assert.strictEqual(rootRes.status, 200, 'Root discovery must respond with 200 OK');
  const rootData = await rootRes.json();
  assert.strictEqual(rootData.service, 'y-master-editor-mcp-gateway');
  assert.ok(rootData.endpoints.claude_custom_connector, 'Claude custom connector endpoint must be documented');
  console.log('✓ Root discovery verified. Tools exposed:', rootData.toolsCount);

  // Test 2: Claude Custom Connector SSE Handshake (GET /sse)
  console.log('\n[Step 3] Initiating Claude Custom Connector SSE stream (GET /sse)...');
  const sseAbortController = new AbortController();
  const sseResponse = await fetch(`${baseUrl}/sse`, {
    headers: {
      'Accept': 'text/event-stream',
      'User-Agent': 'Claude-Custom-Connector/1.0 (Anthropic Cloud)'
    },
    signal: sseAbortController.signal
  });

  assert.strictEqual(sseResponse.status, 200, 'SSE stream must return HTTP 200');
  assert.ok(
    sseResponse.headers.get('content-type')?.includes('text/event-stream'),
    'Content-Type must be text/event-stream'
  );
  assert.strictEqual(sseResponse.headers.get('x-accel-buffering'), 'no', 'Buffering must be disabled');

  const sseReader = sseResponse.body.getReader();
  const { value } = await sseReader.read();
  const initialEventText = new TextDecoder().decode(value);
  console.log('✓ Initial SSE Stream Event Received:');
  console.log(initialEventText.trim());

  assert.ok(initialEventText.includes('event: endpoint'), 'Must emit endpoint event for Claude routing');
  const sessionIdMatch = initialEventText.match(/sessionId=([a-zA-Z0-9-]+)/);
  assert.ok(sessionIdMatch, 'Must provide sessionId parameter in endpoint URL');
  const sessionId = sessionIdMatch[1];
  console.log(`✓ Active Claude MCP Session Established: ${sessionId}`);

  // Test 3: Claude Initialization Handshake (POST /messages?sessionId=...)
  console.log('\n[Step 4] Sending JSON-RPC initialize packet via POST /messages...');
  const initRes = await fetch(`${baseUrl}/messages?sessionId=${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'claude-ai-connector', version: '2.0.0' }
      }
    })
  });

  assert.strictEqual(initRes.status, 202, 'POST /messages must respond 202 Accepted');
  console.log('✓ Claude initialization packet accepted (HTTP 202)');

  // Test 4: Dynamic Tool Discovery via SSE (POST tools/list)
  console.log('\n[Step 5] Requesting tool list via POST /messages (tools/list)...');
  const toolsListRes = await fetch(`${baseUrl}/messages?sessionId=${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    })
  });
  assert.strictEqual(toolsListRes.status, 202, 'tools/list packet must be accepted');
  console.log('✓ tools/list accepted (HTTP 202)');

  // Test 5: Tool Execution via SSE (POST tools/call)
  console.log('\n[Step 6] Executing get_document_outline tool via POST /messages...');
  const toolCallRes = await fetch(`${baseUrl}/messages?sessionId=${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'get_document_outline',
        arguments: {}
      }
    })
  });
  assert.strictEqual(toolCallRes.status, 202, 'Tool call packet must be accepted');
  console.log('✓ Tool execution get_document_outline accepted (HTTP 202)');

  sseAbortController.abort();

  // Test 6: Fallback SSE support on /mcp for clients configured with /mcp
  console.log('\n[Step 7] Testing Claude SSE fallback on /mcp (GET /mcp)...');
  const mcpSseController = new AbortController();
  const mcpSseRes = await fetch(`${baseUrl}/mcp`, {
    headers: { 'Accept': 'text/event-stream' },
    signal: mcpSseController.signal
  });
  assert.strictEqual(mcpSseRes.status, 200, 'GET /mcp fallback must return 200 for SSE clients');
  const mcpReader = mcpSseRes.body.getReader();
  const mcpChunk = await mcpReader.read();
  const mcpText = new TextDecoder().decode(mcpChunk.value);
  assert.ok(mcpText.includes('event: endpoint'), '/mcp fallback must emit endpoint event');
  mcpSseController.abort();
  console.log('✓ /mcp fallback SSE stream verified');

  // Test 7: Streamable HTTP POST /mcp for Google Gemini
  console.log('\n[Step 8] Testing Streamable HTTP on /mcp for Gemini...');
  const geminiRes = await fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 10,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'gemini-connected-app', version: '1.0' }
      }
    })
  });
  assert.strictEqual(geminiRes.status, 200, 'Streamable HTTP POST /mcp must return 200');
  console.log('✓ Streamable HTTP POST /mcp verified for Gemini');

  await gateway.close();
  console.log('\n================================================================');
  console.log('>>> ALL CLAUDE CUSTOM CONNECTOR & SSE VERIFICATIONS PASS 100% <<<');
  console.log('================================================================\n');
  process.exit(0);
}

runClaudeConnectorTests().catch((err) => {
  console.error('\n❌ Claude MCP Verification Failed:', err);
  process.exit(1);
});
