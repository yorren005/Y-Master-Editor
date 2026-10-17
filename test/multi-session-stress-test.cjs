/**
 * test/multi-session-stress-test.cjs
 * Stress-tests the Web MCP Gateway with 10 concurrent AI provider client sessions
 */

const { WebMcpGateway } = require('../electron/web-mcp-gateway.cjs');
const { TransactionManager } = require('../src/engine/transaction-manager.cjs');
const path = require('path');
const fs = require('fs');

async function runMultiSessionStressTest() {
  console.log('=== RUNNING 10-CLIENT CONCURRENT MULTI-SESSION STRESS TEST ===');

  const testStatePath = path.join(__dirname, 'temp_multisession_test_state.json');
  fs.writeFileSync(testStatePath, JSON.stringify({
    id: 'test_doc_multi',
    title: 'Multi-Session Document',
    revision: 1,
    revisionHash: 'rev_hash_multi_1',
    dimensions: { width: 595, height: 842 },
    pages: [{
      id: 'p1',
      pageNumber: 1,
      rawHtml: '<h1>Multi-Session Test</h1>',
      components: [],
      regions: []
    }],
    comments: []
  }));

  const tm = new TransactionManager(testStatePath);
  const gateway = new WebMcpGateway({
    transactionManager: tm,
    port: 54910,
    requireAuthLocal: false
  });

  const port = await gateway.listen(54910);
  const mcpUrl = `http://127.0.0.1:${port}/mcp`;

  try {
    const CLIENT_COUNT = 10;
    const providerNames = [
      'Anthropic Claude Desktop',
      'OpenAI ChatGPT Desktop',
      'Cursor IDE Cascade',
      'Windsurf Cascade',
      'Google Gemini Assistant',
      'GitHub Copilot VSCode',
      'Claude Code CLI',
      'OpenAI Agents SDK',
      'Ollama LangChain Client',
      'LlamaIndex Agent'
    ];

    console.log(`\n[Phase 1] Concurrently initializing ${CLIENT_COUNT} distinct AI clients...`);

    // Helper: Initialize Client
    async function initClient(clientIndex) {
      const provider = providerNames[clientIndex];
      const res = await fetch(mcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: provider, version: '1.0.0' }
          },
          id: clientIndex + 1
        })
      });

      if (res.status !== 200) {
        const text = await res.text();
        throw new Error(`Client ${clientIndex + 1} (${provider}) failed to init: HTTP ${res.status} - ${text}`);
      }

      const sessionId = res.headers.get('mcp-session-id');
      if (!sessionId) {
        throw new Error(`Client ${clientIndex + 1} missing mcp-session-id header`);
      }

      const bodyText = await res.text();
      return { clientIndex, provider, sessionId, bodyText };
    }

    // Launch all 10 in parallel
    const initPromises = Array.from({ length: CLIENT_COUNT }, (_, i) => initClient(i));
    const initResults = await Promise.all(initPromises);

    const sessionIds = new Set(initResults.map(r => r.sessionId));
    console.log(`✓ All ${CLIENT_COUNT} clients initialized successfully!`);
    console.log(`✓ Distinct Session IDs verified (${sessionIds.size} unique sessions).`);
    if (sessionIds.size !== CLIENT_COUNT) {
      throw new Error(`Expected ${CLIENT_COUNT} unique sessions, got ${sessionIds.size}`);
    }

    console.log(`\n[Phase 2] Concurrently executing 'get_document_outline' from all 10 sessions...`);

    async function executeOutline(client) {
      const res = await fetch(mcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'mcp-session-id': client.sessionId
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'get_document_outline',
            arguments: {}
          },
          id: 100 + client.clientIndex
        })
      });

      if (res.status !== 200) {
        const text = await res.text();
        throw new Error(`Client ${client.clientIndex + 1} call failed: HTTP ${res.status} - ${text}`);
      }

      const data = await res.text();
      return { clientIndex: client.clientIndex, ok: true, data };
    }

    const toolCalls = await Promise.all(initResults.map(c => executeOutline(c)));
    console.log(`✓ All ${toolCalls.length} concurrent tool calls returned HTTP 200.`);

    console.log(`\n[Phase 3] Testing graceful session teardown (DELETE /mcp)...`);
    for (const client of initResults.slice(0, 5)) {
      const delRes = await fetch(mcpUrl, {
        method: 'DELETE',
        headers: { 'mcp-session-id': client.sessionId }
      });
      if (delRes.status !== 200) {
        throw new Error(`DELETE failed for ${client.sessionId}: HTTP ${delRes.status}`);
      }
    }
    console.log(`✓ Successfully tore down 5 sessions.`);

    console.log(`\n>>> MULTI-SESSION 10-CLIENT STRESS TEST PASSED 100% <<<\n`);
  } finally {
    await gateway.close();
    try { fs.unlinkSync(testStatePath); } catch (_) {}
  }
}

runMultiSessionStressTest().catch(err => {
  console.error('[Multi-Session Stress Test Failed]:', err);
  process.exit(1);
});
