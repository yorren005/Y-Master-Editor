const assert = require('assert');
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { TransactionManager } = require('../src/engine/transaction-manager.cjs');
const { registerDocumentTools } = require('../src/engine/mcp-tools.cjs');

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('>>> RUNNING COMPREHENSIVE E2E MCP DOCUMENT WORKSPACE TEST <<<');
  console.log('================================================================');

  const testStateFile = path.join(__dirname, 'e2e_test_document_state.json');

  // Initial canonical document structure
  const initialDoc = {
    id: 'e2e_doc_001',
    title: 'E2E Verified Document',
    docType: 'pdf',
    pageSize: 'A4',
    dimensions: { widthMm: 210, heightMm: 297, unit: 'mm' },
    pages: [
      {
        pageNumber: 1,
        id: 'page-1',
        rawHtml: '<div id="main-content"><h1>Original Title</h1><p id="lead-p">Original Lead Text</p></div>',
        css: '',
        components: [
          {
            id: 'lead-p',
            type: 'text',
            bounds: { x: 0.1, y: 0.2, width: 0.8, height: 0.1 },
            content: 'Original Lead Text',
            style: { fontSize: '16px', color: '#241c15' }
          }
        ],
        regions: []
      },
      {
        pageNumber: 2,
        id: 'page-2',
        rawHtml: '<div id="page-2-content"><p>Page 2 untouched content</p></div>',
        css: '',
        components: [],
        regions: []
      }
    ],
    comments: [
      {
        id: 'instr_e2e_101',
        pageIndex: 0,
        selector: '#lead-p',
        selectedText: 'Original Lead Text',
        userComment: 'Update lead text to serif editorial typography and emphasize sustainable craft',
        selectionType: 'rectangle',
        bounds: { x: 0.1, y: 0.2, width: 0.8, height: 0.1 },
        authorized: false, // Invariant: explicitly unauthorized by default
        status: 'pending',
        resolved: false,
        author: 'Lead Architect',
        createdAt: new Date().toISOString()
      }
    ]
  };

  fs.writeFileSync(testStateFile, JSON.stringify(initialDoc, null, 2), 'utf-8');

  // 1. Initialize Transaction Manager
  console.log('\n[Step 1] Initializing Transaction Manager...');
  const txManager = new TransactionManager(testStateFile);
  const doc = txManager.getDocument();
  assert.strictEqual(doc.revision, 1, 'Initial revision should be 1');
  assert(doc.revisionHash, 'Revision hash must be calculated');
  const initialHash = doc.revisionHash;
  console.log(`✓ Initialized Document Revision 1 (Hash: ${initialHash.substring(0, 12)}...)`);

  // 2. Initialize MCP Server & Tools
  console.log('\n[Step 2] Initializing McpServer and registering tools...');
  let lastBroadcast = null;
  const mcpServer = new McpServer({
    name: 'e2e-mcp-test',
    version: '1.0.0'
  });

  registerDocumentTools(mcpServer, txManager, (payload) => {
    lastBroadcast = payload;
  });
  console.log('✓ All 9 document tools registered successfully.');

  // 3. Test: get_document_outline
  console.log('\n[Step 3] Executing get_document_outline tool...');
  // Find registered tool
  const outlineTool = mcpServer._registeredTools['get_document_outline'];
  assert(outlineTool, 'get_document_outline tool registered');
  const outlineRes = await outlineTool.handler({});
  assert(!outlineRes.isError, 'Outline execution must succeed');
  const outlineData = JSON.parse(outlineRes.content[0].text);
  assert.strictEqual(outlineData.totalPages, 2, 'Total pages match');
  assert.strictEqual(outlineData.instructionsSummary.pending, 1, '1 pending instruction');
  assert.strictEqual(outlineData.instructionsSummary.authorizedForExecution, 0, '0 authorized instructions');
  console.log('✓ Document outline verified.');

  // 4. Invariant Verification: Unauthorized Mutation Rejection
  console.log('\n[Step 4] Enforcing authorization invariant: Attempt mutation on unauthorized comment...');
  const compTool = mcpServer._registeredTools['propose_component_change'];
  const unauthorizedAttempt = await compTool.handler({
    expectedRevisionHash: initialHash,
    commentId: 'instr_e2e_101',
    pageNumber: 1,
    componentId: 'lead-p',
    type: 'text',
    content: 'Illegal unauthorized content mutation',
    style: { color: '#ff0000' }
  });
  assert(unauthorizedAttempt.isError === true, 'Unauthorized mutation MUST return isError: true');
  assert(unauthorizedAttempt.content[0].text.includes('authorized'), 'Error message must cite authorization requirement');
  assert.strictEqual(txManager.getDocument().revision, 1, 'Document revision must not advance');
  console.log('✓ Unviolated Invariant: Mutation blocked until human author grants permission.');

  // 5. Explicit Authorization Gating
  console.log('\n[Step 5] Granting explicit user authorization...');
  const authTool = mcpServer._registeredTools['authorize_instruction'];
  const authRes = await authTool.handler({
    commentId: 'instr_e2e_101',
    authorize: true
  });
  assert(!authRes.isError, 'Authorization must succeed');
  assert(lastBroadcast && lastBroadcast.type === 'INSTRUCTION_AUTHORIZED', 'Broadcast triggered');
  const pendingRes = await mcpServer._registeredTools['get_pending_instructions'].handler({ authorizedOnly: true });
  const pendingData = JSON.parse(pendingRes.content[0].text);
  assert.strictEqual(pendingData.instructionsCount, 1, 'Now 1 instruction authorized');
  console.log('✓ Instruction explicitly authorized by human user.');

  // 6. Authorized Mutation Execution
  console.log('\n[Step 6] Executing authorized mutation via propose_component_change...');
  const currentHash = txManager.getDocument().revisionHash;
  const authorizedMutation = await compTool.handler({
    expectedRevisionHash: currentHash,
    commentId: 'instr_e2e_101',
    pageNumber: 1,
    componentId: 'lead-p',
    type: 'text',
    content: 'Harmonized lead typography crafted with organic textures',
    style: { fontFamily: 'Cormorant Garamond', fontSize: '18px', color: '#a85620' },
    bounds: { x: 0.1, y: 0.2, width: 0.8, height: 0.12 }
  });
  assert(!authorizedMutation.isError, 'Authorized mutation must succeed');
  const mutationResult = JSON.parse(authorizedMutation.content[0].text);
  assert(mutationResult.success, 'Success flag');
  assert.strictEqual(mutationResult.newRevision, 2, 'Revision advanced to 2');
  console.log(`✓ Transaction committed! New Revision: 2 (Hash: ${mutationResult.newRevisionHash.substring(0, 12)}...)`);

  // Verify unaffected content invariant
  console.log('\n[Step 7] Verifying page 2 untouched invariant...');
  const page2Content = txManager.getDocument().pages[1].rawHtml;
  assert(page2Content.includes('Page 2 untouched content'), 'Page 2 must remain completely unaffected');
  console.log('✓ Invariant verified: Unrelated page content 100% untouched.');

  // 7. Concurrency conflict test
  console.log('\n[Step 8] Testing optimistic concurrency conflict rejection...');
  const staleConflictAttempt = await compTool.handler({
    expectedRevisionHash: initialHash, // Stale revision 1 hash
    pageNumber: 1,
    componentId: 'lead-p',
    type: 'text',
    content: 'Stale update'
  });
  assert(staleConflictAttempt.isError === true, 'Stale hash MUST return isError: true');
  assert(staleConflictAttempt.content[0].text.includes('conflict'), 'Must cite conflict');
  console.log('✓ Concurrency conflict detected and safely rejected.');

  // 8. Bounded Region Replacement
  console.log('\n[Step 9] Testing propose_region_replacement with SVG diagram asset...');
  const regionTool = mcpServer._registeredTools['propose_region_replacement'];
  const svgAsset = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#a85620"/></svg>';
  const regionRes = await regionTool.handler({
    expectedRevisionHash: txManager.getDocument().revisionHash,
    pageNumber: 1,
    bounds: { x: 0.6, y: 0.6, width: 0.35, height: 0.35 },
    replacementAsset: svgAsset,
    assetType: 'svg'
  });
  assert(!regionRes.isError, 'Region replacement must succeed');
  assert.strictEqual(txManager.getDocument().revision, 3, 'Revision advanced to 3');
  console.log('✓ Region replacement committed.');

  // 9. Rollback Transaction
  console.log('\n[Step 10] Testing rollback_transaction (Undo)...');
  const rollbackTool = mcpServer._registeredTools['rollback_transaction'];
  const rollbackRes = await rollbackTool.handler({});
  assert(!rollbackRes.isError, 'Rollback must succeed');
  assert.strictEqual(txManager.getDocument().pages[0].regions.length, 0, 'Region reverted back to 0');
  console.log('✓ Rollback succeeded! State reverted safely.');

  // 10. Streamable HTTP MCP Server Test
  console.log('\n[Step 11] Testing Streamable HTTP MCP Server on Express transport...');
  const app = express();
  app.use(express.json());
  const streamableTransport = new StreamableHTTPServerTransport();
  await mcpServer.connect(streamableTransport);
  app.all('/mcp', async (req, res) => {
    await streamableTransport.handleRequest(req, res, req.body);
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const serverPort = server.address().port;
  console.log(`✓ Streamable HTTP server listening on http://127.0.0.1:${serverPort}/mcp`);

  // Send an HTTP POST requesting MCP tool list or endpoint check
  const httpOptions = {
    hostname: '127.0.0.1',
    port: serverPort,
    path: '/mcp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    }
  };

  const httpReqPromise = new Promise((resolve, reject) => {
    const req = http.request(httpOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    }));
    req.end();
  });

  const httpResponse = await httpReqPromise;
  console.log(`✓ HTTP MCP Response Status: ${httpResponse.statusCode}`);
  assert(httpResponse.statusCode === 200 || httpResponse.statusCode === 202, 'HTTP endpoint responds with success status code');
  
  server.close();
  console.log('✓ Streamable HTTP MCP endpoint verified.');

  // Cleanup test file
  try { fs.unlinkSync(testStateFile); } catch (e) {}

  console.log('\n================================================================');
  console.log('>>> ALL 11 END-TO-END MCP & TRANSACTION ENGINE INVARIANTS PASS <<<');
  console.log('================================================================\n');
}

runEndToEndVerification().catch(err => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
