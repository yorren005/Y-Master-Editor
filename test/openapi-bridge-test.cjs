/**
 * test/openapi-bridge-test.cjs
 * Verifies OpenAPI 3.1 generation and REST tool execution for OpenAI Custom GPTs
 */

const { WebMcpGateway } = require('../electron/web-mcp-gateway.cjs');
const { TransactionManager } = require('../src/engine/transaction-manager.cjs');
const path = require('path');
const fs = require('fs');

async function runOpenApiBridgeTest() {
  console.log('=== RUNNING OPENAPI REST BRIDGE VERIFICATION SUITE ===');

  const testStatePath = path.join(__dirname, 'temp_openapi_test_state.json');
  fs.writeFileSync(testStatePath, JSON.stringify({
    id: 'test_doc_openapi',
    title: 'OpenAPI Test Document',
    revision: 1,
    revisionHash: 'hash_rev_1',
    dimensions: { width: 595, height: 842 },
    pages: [{
      id: 'p1',
      pageNumber: 1,
      rawHtml: '<h1>Original Title</h1><p>Test paragraph</p>',
      components: [],
      regions: []
    }],
    comments: [{
      id: 'comm_1',
      pageIndex: 0,
      userComment: 'Change heading to Hello World',
      authorized: true,
      resolved: false
    }]
  }));

  const tm = new TransactionManager(testStatePath);
  const gateway = new WebMcpGateway({
    transactionManager: tm,
    port: 54900,
    apiKey: 'test_secret_key_123',
    requireAuthLocal: false
  });

  const port = await gateway.listen(54900);
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Test GET /api/v1/openapi.json
    console.log('[Test 1] Testing GET /api/v1/openapi.json schema generation...');
    const schemaRes = await fetch(`${baseUrl}/api/v1/openapi.json`);
    if (schemaRes.status !== 200) throw new Error(`Expected 200, got ${schemaRes.status}`);
    const spec = await schemaRes.json();

    if (spec.openapi !== '3.1.0') throw new Error(`Invalid OpenAPI version: ${spec.openapi}`);
    const paths = Object.keys(spec.paths);
    console.log(`✓ OpenAPI 3.1 spec valid. Total REST endpoints: ${paths.length}`);
    if (paths.length !== 9) throw new Error(`Expected 9 tool endpoints, found ${paths.length}`);

    // 2. Test GET /api/v1/gemini-tools
    console.log('[Test 2] Testing GET /api/v1/gemini-tools schema generation...');
    const geminiRes = await fetch(`${baseUrl}/api/v1/gemini-tools`);
    if (geminiRes.status !== 200) throw new Error(`Expected 200, got ${geminiRes.status}`);
    const geminiData = await geminiRes.json();
    console.log(`✓ Gemini Declarations valid. Total function declarations: ${geminiData.functionDeclarations.length}`);

    // 3. Test REST Tool Execution: get_document_outline
    console.log('[Test 3] Testing REST Execution of get_document_outline...');
    const outlineRes = await fetch(`${baseUrl}/api/v1/tools/get_document_outline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (outlineRes.status !== 200) throw new Error(`Expected 200, got ${outlineRes.status}`);
    const outline = await outlineRes.json();
    if (!outline.success || !outline.result.revisionHash) throw new Error('Outline execution failed');
    console.log(`✓ REST outline received. Revision: ${outline.result.revision}, Total Pages: ${outline.result.totalPages}`);

    // 4. Test REST Tool Execution: update_page_content
    console.log('[Test 4] Testing REST Execution of update_page_content (Mutation)...');
    const updateRes = await fetch(`${baseUrl}/api/v1/tools/update_page_content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expectedRevisionHash: outline.result.revisionHash,
        pageNumber: 1,
        html: '<h1>Updated by REST Action</h1><p>OpenAI Custom GPT executed this.</p>'
      })
    });
    if (updateRes.status !== 200) throw new Error(`Expected 200, got ${updateRes.status}`);
    const updateResult = await updateRes.json();
    if (!updateResult.success || updateResult.result.newRevision !== 2) {
      throw new Error(`Unexpected update result: ${JSON.stringify(updateResult)}`);
    }
    console.log(`✓ REST mutation committed! New revision: ${updateResult.result.newRevision}`);

    // 5. Test Bearer Token Protection when requireAuthLocal is enabled
    console.log('[Test 5] Testing Bearer Token Authentication verification...');
    gateway.requireAuthLocal = true;

    // Unauthorized request
    const unauthRes = await fetch(`${baseUrl}/api/v1/tools/get_document_outline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (unauthRes.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${unauthRes.status}`);
    console.log('✓ Unauthorized request successfully rejected (HTTP 401).');

    // Authorized request with Bearer token
    const authRes = await fetch(`${baseUrl}/api/v1/tools/get_document_outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_secret_key_123'
      },
      body: JSON.stringify({})
    });
    if (authRes.status !== 200) throw new Error(`Expected 200, got ${authRes.status}`);
    console.log('✓ Authorized request with Bearer token accepted (HTTP 200).');

    console.log('\n>>> ALL 5 OPENAPI & REST BRIDGE TESTS PASSED 100% <<<\n');
  } finally {
    await gateway.close();
    try { fs.unlinkSync(testStatePath); } catch (_) {}
  }
}

runOpenApiBridgeTest().catch(err => {
  console.error('[OpenAPI Bridge Test Failed]:', err);
  process.exit(1);
});
