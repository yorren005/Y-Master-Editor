const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { z } = require('zod');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { TransactionManager } = require('../src/engine/transaction-manager.cjs');
const { registerDocumentTools } = require('../src/engine/mcp-tools.cjs');

async function testMcpToolsDeep() {
  console.log('--- DEEP TECHNICAL TEST OF ALL 9 MCP TOOLS ---');

  const testFile = path.join(__dirname, 'mcp_tools_test_state.json');
  const initialData = {
    id: 'doc_tools_test',
    title: 'Tools Test Doc',
    revision: 1,
    revisionHash: '',
    dimensions: { pageSize: 'A4', orientation: 'portrait' },
    pages: [
      {
        id: 'p1',
        pageNumber: 1,
        rawHtml: '<div id="main"><h1>Hello</h1></div>',
        css: '',
        components: [{ id: 'comp1', type: 'text', content: 'Hello' }],
        regions: []
      }
    ],
    comments: [
      {
        id: 'c1',
        pageIndex: 0,
        userComment: 'Revise title',
        authorized: false,
        status: 'pending'
      }
    ]
  };

  fs.writeFileSync(testFile, JSON.stringify(initialData, null, 2), 'utf-8');
  const tm = new TransactionManager(testFile);
  const initialHash = tm.getDocument().revisionHash;

  const server = new McpServer({ name: 'test', version: '1.0' });
  let broadcastCalls = [];
  registerDocumentTools(server, tm, (payload) => {
    broadcastCalls.push(payload);
  });

  const tools = server._registeredTools;
  const toolNames = Object.keys(tools);
  console.log(`Registered ${toolNames.length} tools:`, toolNames.join(', '));
  assert.strictEqual(toolNames.length, 9, 'Must have exactly 9 tools');

  // Verify all tools have Zod inputSchema
  for (const name of toolNames) {
    const t = tools[name];
    assert(t.inputSchema, `Tool ${name} must have an inputSchema`);
    assert(t.inputSchema instanceof z.ZodObject || t.inputSchema._def, `Tool ${name} inputSchema must be a Zod schema`);
    console.log(`✓ Tool '${name}' has valid Zod schema`);
  }

  // Helper to check error result structure
  function assertErrorResult(res, toolName, testCase) {
    assert(res, `${toolName} (${testCase}): result must not be null`);
    assert.strictEqual(res.isError, true, `${toolName} (${testCase}): isError must be true`);
    assert(Array.isArray(res.content) && res.content.length > 0, `${toolName} (${testCase}): content must be non-empty array`);
    assert.strictEqual(res.content[0].type, 'text', `${toolName} (${testCase}): content[0].type must be 'text'`);
    const text = res.content[0].text;
    assert(text.startsWith('Error:'), `${toolName} (${testCase}): text must start with 'Error:'`);
    const hasRemediation = text.includes('Remediation:');
    console.log(`  [${toolName}] Error check: "${text.split('\n')[0]}" | Has Remediation: ${hasRemediation}`);
    return hasRemediation;
  }

  console.log('\n--- PROBING ERROR HANDLING & REMEDIATIONS ---');
  let remediationFailures = [];

  // 1. get_document_outline
  // Outline succeeds on valid doc
  const outlineRes = await tools['get_document_outline'].handler({});
  assert(!outlineRes.isError, 'Outline should succeed');

  // 2. get_selection_context: Invalid page
  const selContextErr = await tools['get_selection_context'].handler({ pageNumber: 99 });
  if (!assertErrorResult(selContextErr, 'get_selection_context', 'invalid page')) {
    remediationFailures.push('get_selection_context (invalid page)');
  }

  // 3. get_pending_instructions: authorizedOnly
  const pendingRes = await tools['get_pending_instructions'].handler({ authorizedOnly: false });
  assert(!pendingRes.isError, 'Pending instructions should succeed');

  // 4. authorize_instruction: Non-existent comment
  const authErr = await tools['authorize_instruction'].handler({ commentId: 'non_existent_123', authorize: true });
  if (!assertErrorResult(authErr, 'authorize_instruction', 'non-existent comment')) {
    remediationFailures.push('authorize_instruction (non-existent comment)');
  }

  // 5. propose_component_change: Unauthorized comment
  const compUnauthErr = await tools['propose_component_change'].handler({
    expectedRevisionHash: initialHash,
    commentId: 'c1',
    pageNumber: 1,
    componentId: 'comp1',
    type: 'text',
    content: 'Mutated'
  });
  if (!assertErrorResult(compUnauthErr, 'propose_component_change', 'unauthorized comment')) {
    remediationFailures.push('propose_component_change (unauthorized comment)');
  }

  // 5b. propose_component_change: Stale revision hash
  const compStaleErr = await tools['propose_component_change'].handler({
    expectedRevisionHash: 'stale_hash_xyz',
    pageNumber: 1,
    componentId: 'comp1',
    type: 'text',
    content: 'Mutated'
  });
  if (!assertErrorResult(compStaleErr, 'propose_component_change', 'stale hash')) {
    remediationFailures.push('propose_component_change (stale hash)');
  }

  // 5c. propose_component_change: Non-existent page
  const compPageErr = await tools['propose_component_change'].handler({
    expectedRevisionHash: initialHash,
    pageNumber: 99,
    componentId: 'comp1',
    type: 'text',
    content: 'Mutated'
  });
  if (!assertErrorResult(compPageErr, 'propose_component_change', 'non-existent page')) {
    remediationFailures.push('propose_component_change (non-existent page)');
  }

  // 6. propose_region_replacement: Stale revision hash
  const regionStaleErr = await tools['propose_region_replacement'].handler({
    expectedRevisionHash: 'stale_hash_xyz',
    pageNumber: 1,
    bounds: { x: 0.1, y: 0.1, width: 0.5, height: 0.5 },
    replacementAsset: '<svg></svg>',
    assetType: 'svg'
  });
  if (!assertErrorResult(regionStaleErr, 'propose_region_replacement', 'stale hash')) {
    remediationFailures.push('propose_region_replacement (stale hash)');
  }

  // 7. update_page_content: Stale revision hash
  const pageStaleErr = await tools['update_page_content'].handler({
    expectedRevisionHash: 'stale_hash_xyz',
    pageNumber: 1,
    html: '<div>New HTML</div>'
  });
  if (!assertErrorResult(pageStaleErr, 'update_page_content', 'stale hash')) {
    remediationFailures.push('update_page_content (stale hash)');
  }

  // 8. add_page: Stale revision hash
  const addPageStaleErr = await tools['add_page'].handler({
    expectedRevisionHash: 'stale_hash_xyz'
  });
  if (!assertErrorResult(addPageStaleErr, 'add_page', 'stale hash')) {
    remediationFailures.push('add_page (stale hash)');
  }

  // 9. rollback_transaction: Empty undo stack
  const rollbackEmptyErr = await tools['rollback_transaction'].handler({});
  if (!assertErrorResult(rollbackEmptyErr, 'rollback_transaction', 'empty undo stack')) {
    remediationFailures.push('rollback_transaction (empty undo stack)');
  }

  // 9b. rollback_transaction: Non-existent transaction ID
  const rollbackMissingErr = await tools['rollback_transaction'].handler({ transactionId: 'tx_fake_999' });
  if (!assertErrorResult(rollbackMissingErr, 'rollback_transaction', 'non-existent tx')) {
    remediationFailures.push('rollback_transaction (non-existent tx)');
  }

  console.log('\n--- REMEDIATION AUDIT SUMMARY ---');
  if (remediationFailures.length > 0) {
    console.log(`⚠️ MISSING REMEDIATIONS FOUND IN ${remediationFailures.length} SCENARIOS:`);
    for (const f of remediationFailures) {
      console.log(`  - ${f}`);
    }
  } else {
    console.log('✓ All tool errors contain actionable remediation suggestions.');
  }

  // Test broadcastFn throwing an exception (testing resilience against unhandled rejection)
  console.log('\n--- TESTING BROADCAST THROW RESILIENCE ---');
  const errorServer = new McpServer({ name: 'error-test', version: '1.0' });
  registerDocumentTools(errorServer, tm, () => {
    throw new Error('Exploding broadcast callback!');
  });

  try {
    const explodingResult = await errorServer._registeredTools['add_page'].handler({
      expectedRevisionHash: tm.getDocument().revisionHash
    });
    console.log('Exploding result returned safely without crash:', explodingResult);
  } catch (uncaughtErr) {
    console.error('❌ UNHANDLED EXCEPTION IN TOOL HANDLER (broadcast throw):', uncaughtErr.message);
  }

  try { fs.unlinkSync(testFile); } catch (e) {}
}

testMcpToolsDeep().catch(err => {
  console.error('Test crashed:', err);
  process.exit(1);
});
