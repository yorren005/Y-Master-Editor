/**
 * test/custom-connectors-e2e.cjs
 * Comprehensive End-to-End Test Suite for Universal MCP Custom Connectors
 * 
 * Tests Live MCP Connection via MCP Link across:
 * 1. Anthropic Claude (Streamable HTTP MCP Client)
 * 2. Google Gemini (Function Calling Declarations & Execution Bridge)
 * 3. OpenAI ChatGPT (Custom GPT Actions & OpenAPI 3.1 Spec)
 * 4. Cursor / Windsurf / IDE Custom Connector
 * 5. Multi-AI Concurrent Collaboration Workflow
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const { WebMcpGateway } = require('../electron/web-mcp-gateway.cjs');
const { TransactionManager } = require('../src/engine/transaction-manager.cjs');
const { ClaudeMcpConnector } = require('../src/connectors/claude-mcp-connector.cjs');
const { GeminiMcpConnector } = require('../src/connectors/gemini-mcp-connector.cjs');
const { OpenAiCustomGptConnector } = require('../src/connectors/openai-custom-gpt-connector.cjs');
const { IdeMcpConnector } = require('../src/connectors/ide-mcp-connector.cjs');

async function runCustomConnectorsTestSuite() {
  console.log('================================================================');
  console.log('>>> RUNNING UNIVERSAL CUSTOM CONNECTORS E2E VERIFICATION <<<');
  console.log('================================================================');

  const testStatePath = path.join(__dirname, 'temp_connectors_e2e_state.json');
  const API_KEY = 'secret_mcp_token_enterprise_2026';
  const BASE_PORT = 54930;

  // 1. Prepare Initial Document State
  const initialDoc = {
    id: 'doc_connectors_e2e_001',
    title: 'Enterprise AI Ecosystem Architecture 2026',
    docType: 'presentation',
    pageSize: '16:9',
    dimensions: { widthMm: 297, heightMm: 167.06, unit: 'mm' },
    pages: [
      {
        pageNumber: 1,
        id: 'slide-1',
        rawHtml: '<div id="slide-1" class="slide"><h1 id="title-heading">Enterprise AI Ecosystem</h1><p id="subtitle">Seamless Multi-Agent Document Automation</p></div>',
        css: '.slide { font-family: sans-serif; padding: 40px; background: #0f172a; color: #f8fafc; }',
        components: [
          {
            id: 'title-heading',
            type: 'text',
            bounds: { x: 0.1, y: 0.2, width: 0.8, height: 0.2 },
            content: 'Enterprise AI Ecosystem',
            style: { fontSize: '36px', fontWeight: 'bold', color: '#60a5fa' }
          }
        ],
        regions: []
      },
      {
        pageNumber: 2,
        id: 'slide-2',
        rawHtml: '<div id="slide-2" class="slide"><h2>Provider Compatibility Matrix</h2><ul><li>Anthropic Claude</li><li>Google Gemini</li><li>OpenAI Custom GPT</li><li>Cursor / Windsurf</li></ul></div>',
        css: '',
        components: [],
        regions: []
      }
    ],
    comments: [
      {
        id: 'instr_ai_strategy_01',
        pageIndex: 0,
        selector: '#title-heading',
        selectedText: 'Enterprise AI Ecosystem',
        userComment: 'Authorize Gemini & OpenAI to append real-time telemetry slide',
        selectionType: 'element',
        authorized: false,
        status: 'pending',
        resolved: false,
        author: 'Chief AI Architect',
        createdAt: new Date().toISOString()
      }
    ]
  };

  fs.writeFileSync(testStatePath, JSON.stringify(initialDoc, null, 2), 'utf-8');

  // 2. Start Gateway with Local Auth Enforcement
  console.log('\n[Gateway Setup] Starting WebMcpGateway on port ' + BASE_PORT + ' with Bearer Auth enabled...');
  const tm = new TransactionManager(testStatePath);
  const gateway = new WebMcpGateway({
    transactionManager: tm,
    port: BASE_PORT,
    apiKey: API_KEY,
    requireAuthLocal: true
  });

  const actualPort = await gateway.listen(BASE_PORT);
  const baseUrl = `http://127.0.0.1:${actualPort}`;
  const mcpLink = `${baseUrl}/mcp`;
  console.log(`✓ WebMcpGateway active at ${mcpLink}`);
  console.log(`✓ OpenAPI Spec at ${baseUrl}/api/v1/openapi.json`);
  console.log(`✓ Gemini Declarations at ${baseUrl}/api/v1/gemini-tools`);

  try {
    // =========================================================================
    // SECTION 1: ANTHROPIC CLAUDE CUSTOM CONNECTOR
    // =========================================================================
    console.log('\n----------------------------------------------------------------');
    console.log('🤖 [TEST 1] Anthropic Claude Custom Connector (Streamable HTTP /mcp)');
    console.log('----------------------------------------------------------------');

    // 1.1 Negative Test: Unauthenticated connection rejected
    console.log('1.1 Testing Authentication Guard (Missing Token)...');
    const unauthClient = new ClaudeMcpConnector({
      baseUrl,
      apiKey: null, // missing
      clientName: 'claude-unauth'
    });

    let authFailedAsExpected = false;
    try {
      await unauthClient.connect();
    } catch (err) {
      authFailedAsExpected = true;
      console.log(`✓ Unauthenticated request rejected as expected: ${err.message}`);
    }
    assert.strictEqual(authFailedAsExpected, true, 'Gateway must reject unauthenticated requests');

    // 1.2 Positive Test: Handshake with Valid Bearer API Key
    console.log('\n1.2 Initializing Claude Connector with Bearer Token Handshake...');
    const claude = new ClaudeMcpConnector({
      baseUrl,
      apiKey: API_KEY,
      clientName: 'claude-desktop-custom-connector',
      clientVersion: '3.5.0'
    });

    const initResult = await claude.connect();
    assert.strictEqual(initResult.connected, true, 'Claude must successfully connect');
    assert(claude.sessionId, 'Claude connector must store session ID');
    console.log(`✓ Connected! Session ID: ${claude.sessionId}`);
    console.log(`✓ Server Info: ${initResult.serverInfo.name} v${initResult.serverInfo.version}`);

    // 1.3 Tool Discovery via tools/list
    console.log('\n1.3 Discovering available tools via tools/list...');
    const tools = await claude.listTools();
    console.log(`✓ Claude discovered ${tools.length} available MCP tools:`);
    tools.forEach((t, i) => console.log(`   ${i + 1}. [${t.name}] - ${t.description.slice(0, 50)}...`));
    assert.strictEqual(tools.length, 9, 'Must expose all 9 core document tools');

    // 1.4 Tool Execution: get_document_outline
    console.log('\n1.4 Executing get_document_outline...');
    const outlineRes = await claude.callTool('get_document_outline', {});
    assert.strictEqual(outlineRes.isError, false, 'get_document_outline should not error');
    assert.strictEqual(outlineRes.data.revision, 1, 'Initial revision must be 1');
    assert.strictEqual(outlineRes.data.totalPages, 2, 'Total pages must be 2');
    assert(outlineRes.data.revisionHash, 'Revision hash must be present');
    const rev1Hash = outlineRes.data.revisionHash;
    console.log(`✓ Outline received: Revision ${outlineRes.data.revision} (Hash: ${rev1Hash.slice(0, 12)}...), Total Pages: ${outlineRes.data.totalPages}`);

    // 1.5 Tool Execution: get_pending_instructions
    console.log('\n1.5 Executing get_pending_instructions...');
    const pendingRes = await claude.callTool('get_pending_instructions', { authorizedOnly: false });
    assert.strictEqual(pendingRes.isError, false);
    assert.strictEqual(pendingRes.data.instructionsCount, 1);
    assert.strictEqual(pendingRes.data.instructions[0].id, 'instr_ai_strategy_01');
    assert.strictEqual(pendingRes.data.instructions[0].authorized, false);
    console.log(`✓ Pending instruction found: "${pendingRes.data.instructions[0].userInstruction}" (Authorized: false)`);

    // 1.6 Verify SSE stream connectivity
    console.log('\n1.6 Verifying SSE stream subscription on GET /mcp...');
    const sseInfo = await claude.listenNotifications();
    assert.strictEqual(sseInfo.connected, true);
    assert.strictEqual(sseInfo.status, 200);
    console.log(`✓ SSE Stream online (Status: ${sseInfo.status}, Content-Type: ${sseInfo.contentType})`);

    // =========================================================================
    // SECTION 2: GOOGLE GEMINI CUSTOM CONNECTOR
    // =========================================================================
    console.log('\n----------------------------------------------------------------');
    console.log('💎 [TEST 2] Google Gemini Custom Connector (Declarations & Tool Calling)');
    console.log('----------------------------------------------------------------');

    const gemini = new GeminiMcpConnector({
      baseUrl,
      apiKey: API_KEY,
      defaultExecutionMode: 'mcp'
    });

    // 2.1 Schema Ingestion & Validation
    console.log('2.1 Ingesting Gemini Function Declarations from /api/v1/gemini-tools...');
    const geminiInit = await gemini.initialize();
    assert.strictEqual(geminiInit.initialized, true);
    assert.strictEqual(geminiInit.toolCount, 9);
    console.log(`✓ Ingested ${geminiInit.toolCount} Gemini function declarations.`);

    const geminiSdkConfig = gemini.getGeminiToolsConfig();
    assert(geminiSdkConfig[0].functionDeclarations.length === 9);
    const outlineDecl = geminiSdkConfig[0].functionDeclarations.find(d => d.name === 'get_document_outline');
    assert(outlineDecl, 'get_document_outline declaration must exist');
    console.log(`✓ Validated Gemini SDK tool config format (Declarations count: ${geminiSdkConfig[0].functionDeclarations.length})`);

    // 2.2 Simulating Gemini Tool Calling via Native MCP Link
    console.log('\n2.2 Executing simulated Gemini tool call [get_selection_context] via MCP link...');
    const geminiCall1 = {
      name: 'get_selection_context',
      args: { pageNumber: 1, selector: '#title-heading' }
    };
    const turn1 = await gemini.simulateGeminiTurn(geminiCall1, 'mcp');
    assert.strictEqual(turn1.role, 'tool');
    assert.strictEqual(turn1.parts[0].functionResponse.name, 'get_selection_context');
    const content = turn1.parts[0].functionResponse.response.content;
    assert.strictEqual(content.pageNumber, 1);
    assert.strictEqual(content.components[0].id, 'title-heading');
    console.log(`✓ Gemini functionResponse generated successfully: Found component "${content.components[0].content}"`);

    // 2.3 Simulating Gemini Mutation: add_page via MCP Link
    console.log('\n2.3 Simulating Gemini mutation [add_page] via MCP link...');
    const currentOutline = await claude.callTool('get_document_outline', {});
    const geminiCallAddPage = {
      name: 'add_page',
      args: {
        expectedRevisionHash: currentOutline.data.revisionHash,
        html: '<div id="slide-3" class="slide"><h2>Gemini AI Analytics Dashboard</h2><div class="metric">Tokens/sec: 14,200</div></div>',
        css: '.metric { font-size: 28px; color: #10b981; font-weight: bold; }'
      }
    };

    const addPageTurn = await gemini.simulateGeminiTurn(geminiCallAddPage, 'mcp');
    assert.strictEqual(addPageTurn.result.success, true);
    assert.strictEqual(addPageTurn.result.data.newRevision, 2);
    console.log(`✓ Gemini committed new page! New Revision: ${addPageTurn.result.data.newRevision} (Hash: ${addPageTurn.result.data.newRevisionHash.slice(0, 12)}...)`);

    // 2.4 Simulating Gemini Execution via REST Bridge
    console.log('\n2.4 Simulating Gemini tool execution via REST Bridge mode...');
    const geminiRestCall = {
      name: 'get_document_outline',
      args: {}
    };
    const restTurn = await gemini.simulateGeminiTurn(geminiRestCall, 'rest');
    assert.strictEqual(restTurn.result.success, true);
    assert.strictEqual(restTurn.result.data.totalPages, 3);
    console.log(`✓ REST Bridge executed for Gemini: Total Pages confirmed at ${restTurn.result.data.totalPages}`);

    // =========================================================================
    // SECTION 3: OPENAI CUSTOM GPT CONNECTOR
    // =========================================================================
    console.log('\n----------------------------------------------------------------');
    console.log('⚡ [TEST 3] OpenAI Custom GPT Actions Connector (OpenAPI 3.1 & REST Bridge)');
    console.log('----------------------------------------------------------------');

    const openai = new OpenAiCustomGptConnector({
      baseUrl,
      apiKey: API_KEY
    });

    // 3.1 Load & Validate OpenAPI 3.1 Specification
    console.log('3.1 Ingesting OpenAPI 3.1 spec from /api/v1/openapi.json...');
    const specInfo = await openai.loadOpenApiSpec();
    assert.strictEqual(specInfo.operationCount, 9);
    assert(specInfo.securitySchemes.bearerAuth, 'Must define bearerAuth security scheme');
    console.log(`✓ OpenAPI 3.1 spec valid: ${specInfo.title} v${specInfo.version}`);
    console.log(`✓ Available Custom GPT Actions (${specInfo.operationCount}):`, specInfo.operations.join(', '));

    // 3.2 Negative Test: Unauthorized REST Action
    console.log('\n3.2 Testing Unauthorized Custom GPT Action invocation...');
    const unauthOpenai = new OpenAiCustomGptConnector({ baseUrl, apiKey: 'wrong_key' });
    const unauthActionRes = await unauthOpenai.executeAction('authorize_instruction', {
      commentId: 'instr_ai_strategy_01',
      authorize: true
    });
    assert.strictEqual(unauthActionRes.success, false);
    assert.strictEqual(unauthActionRes.status, 403);
    console.log(`✓ Unauthorized action rejected with HTTP ${unauthActionRes.status} as expected.`);

    // 3.3 Positive Test: Custom GPT Action execution - authorize_instruction
    console.log('\n3.3 Executing Custom GPT Action: authorize_instruction with valid Bearer token...');
    const authActionRes = await openai.executeAction('authorize_instruction', {
      commentId: 'instr_ai_strategy_01',
      authorize: true
    });
    assert.strictEqual(authActionRes.success, true);
    assert.strictEqual(authActionRes.result.authorized, true);
    console.log(`✓ Action executed! Instruction "${authActionRes.result.commentId}" authorized: ${authActionRes.result.authorized}`);

    // 3.4 Custom GPT Action execution - update_page_content
    console.log('\n3.4 Executing Custom GPT Action: update_page_content (Slide 3 Polish)...');
    const outlineBeforeUpdate = await tm.getDocument();
    const updateRes = await openai.executeAction('update_page_content', {
      expectedRevisionHash: outlineBeforeUpdate.revisionHash,
      pageNumber: 3,
      html: '<div id="slide-3" class="slide"><h2>Enterprise AI Analytics Matrix</h2><div class="metric">Tokens/sec: 18,500 (+30% Optimized by OpenAI)</div></div>'
    });
    assert.strictEqual(updateRes.success, true);
    assert.strictEqual(updateRes.result.newRevision, 3);
    console.log(`✓ Custom GPT Action committed update! Revision: ${updateRes.result.newRevision}`);

    // =========================================================================
    // SECTION 4: CURSOR & WINDSURF IDE CUSTOM CONNECTOR
    // =========================================================================
    console.log('\n----------------------------------------------------------------');
    console.log('💻 [TEST 4] Cursor / Windsurf IDE Custom Connector');
    console.log('----------------------------------------------------------------');

    const cursorIde = new IdeMcpConnector({
      baseUrl,
      apiKey: API_KEY,
      ideType: 'cursor'
    });

    console.log('4.1 Connecting Cursor IDE connector to MCP link...');
    await cursorIde.connect();
    console.log('✓ Cursor IDE connected via Streamable HTTP session.');

    console.log('4.2 Executing rapid concurrent queries (Outline + Selection)...');
    const [cursorOutline, cursorSelection] = await Promise.all([
      cursorIde.getDocumentOutline(),
      cursorIde.getSelectionContext(1, '#title-heading')
    ]);

    assert.strictEqual(cursorOutline.isError, false);
    assert.strictEqual(cursorSelection.isError, false);
    assert.strictEqual(cursorOutline.data.revision, 3);
    assert.strictEqual(cursorOutline.data.totalPages, 3);
    console.log(`✓ Concurrent queries succeeded: Revision ${cursorOutline.data.revision}, Total Pages: ${cursorOutline.data.totalPages}`);

    // =========================================================================
    // SECTION 5: CROSS-AI LIVE COLLABORATION WORKFLOW
    // =========================================================================
    console.log('\n----------------------------------------------------------------');
    console.log('🌐 [TEST 5] Live Cross-AI Co-Authoring Workflow');
    console.log('(Claude + Gemini + OpenAI + Cursor Interacting on the Same MCP Link)');
    console.log('----------------------------------------------------------------');

    console.log('Step 5.1: Claude reads current state and revision hash...');
    const claudeAudit = await claude.callTool('get_document_outline', {});
    const activeHash = claudeAudit.data.revisionHash;
    console.log(`  Claude observes Revision: ${claudeAudit.data.revision}, Hash: ${activeHash.slice(0, 12)}...`);

    console.log('\nStep 5.2: Gemini proposes component refinement on Slide 1...');
    const geminiRefine = await gemini.executeFunctionCall({
      name: 'propose_component_change',
      args: {
        expectedRevisionHash: activeHash,
        pageNumber: 1,
        componentId: 'title-heading',
        type: 'text',
        content: 'Enterprise Multi-AI Ecosystem (Verified Live)',
        style: { fontSize: '40px', color: '#38bdf8' }
      }
    }, {}, 'mcp');
    assert.strictEqual(geminiRefine.executionResult.success, true);
    const rev4Hash = geminiRefine.executionResult.data.newRevisionHash;
    console.log(`  Gemini applied component change: New Revision ${geminiRefine.executionResult.data.newRevision} (Hash: ${rev4Hash.slice(0, 12)}...)`);

    console.log('\nStep 5.3: OpenAI Custom GPT triggers rollback of revision 4 to test reversibility...');
    const openaiRollback = await openai.executeAction('rollback_transaction', {
      transactionId: geminiRefine.executionResult.data.transactionId
    });
    assert.strictEqual(openaiRollback.success, true);
    console.log(`  OpenAI executed rollback! Reverted to Revision ${openaiRollback.result.newRevision}`);

    console.log('\nStep 5.4: Cursor IDE audits final document integrity & content reversion...');
    const finalOutline = await cursorIde.getDocumentOutline();
    assert.strictEqual(finalOutline.isError, false);
    assert.strictEqual(finalOutline.data.revision, 4); // snapshot at rev 3 + 1 = rev 4
    assert.strictEqual(finalOutline.data.totalPages, 3);

    // Verify component content actually reverted back to pre-Gemini state
    const restoredComponent = await cursorIde.getSelectionContext(1, '#title-heading');
    assert.strictEqual(restoredComponent.data.components[0].content, 'Enterprise AI Ecosystem');
    console.log(`  Cursor verified final state: Revision ${finalOutline.data.revision}, Total Pages: ${finalOutline.data.totalPages}`);
    console.log(`  ✓ Verified rollback restoration: Component content restored to "${restoredComponent.data.components[0].content}"`);

    // Teardown
    console.log('\n[Teardown] Gracefully disconnecting all custom connectors...');
    await claude.disconnect();
    await gemini.close();
    await cursorIde.disconnect();
    console.log('✓ All client sessions closed.');

    console.log('\n================================================================');
    console.log('🎉 ALL 5 CUSTOM CONNECTOR TEST SUITES PASSED WITH 100% SUCCESS!');
    console.log('================================================================\n');

  } finally {
    await gateway.close();
    try { fs.unlinkSync(testStatePath); } catch (_) {}
  }
}

runCustomConnectorsTestSuite().catch((err) => {
  console.error('\n❌ Custom Connectors Test Suite Failed:', err);
  process.exit(1);
});
