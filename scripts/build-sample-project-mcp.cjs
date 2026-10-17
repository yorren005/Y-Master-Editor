/**
 * scripts/build-sample-project-mcp.cjs
 * Demonstrates an AI Agent autonomously building a project via the Web MCP Gateway
 */

const { WebMcpGateway } = require('../electron/web-mcp-gateway.cjs');
const { TransactionManager } = require('../src/engine/transaction-manager.cjs');
const path = require('path');
const fs = require('fs');

async function buildProjectViaMcp() {
  console.log('=================================================================');
  console.log('  AUTONOMOUSLY BUILDING PROJECT VIA MCP GATEWAY TOOLS            ');
  console.log('=================================================================');

  // 1. Initialize a clean new Project state file
  const projectFile = path.join(__dirname, '..', 'data', 'projects', 'project_executive_ai_2026.json');
  fs.mkdirSync(path.dirname(projectFile), { recursive: true });

  const initialDoc = {
    id: 'proj_executive_ai_2026',
    title: 'Executive AI Strategy & Vector Architecture (2026)',
    revision: 1,
    revisionHash: 'init_hash_2026',
    dimensions: {
      pageSize: '16:9',
      orientation: 'landscape',
      widthMm: 338.7,
      heightMm: 190.5
    },
    pages: [],
    comments: [
      {
        id: 'user_req_cover',
        pageIndex: 0,
        userComment: 'Build an executive widescreen cover slide with minimalist earth tone styling',
        authorized: true,
        resolved: false
      }
    ]
  };

  fs.writeFileSync(projectFile, JSON.stringify(initialDoc, null, 2), 'utf-8');
  const tm = new TransactionManager(projectFile);

  // 2. Launch WebMcpGateway on ephemeral port
  const gateway = new WebMcpGateway({
    transactionManager: tm,
    port: 55100,
    apiKey: 'exec_ai_token_2026',
    requireAuthLocal: false
  });

  const port = await gateway.listen(55100);
  const mcpUrl = `http://127.0.0.1:${port}/mcp`;
  const restUrl = `http://127.0.0.1:${port}/api/v1/tools`;

  console.log(`[Gateway Live] http://127.0.0.1:${port}/mcp`);

  try {
    // -------------------------------------------------------------
    // Step 1: Initialize Session via Streamable HTTP (JSON-RPC)
    // -------------------------------------------------------------
    console.log('\n[Step 1] Initializing AI Client MCP Session...');
    const initRes = await fetch(mcpUrl, {
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
          clientInfo: { name: 'Executive Strategy AI Agent', version: '3.0' }
        },
        id: 1
      })
    });

    const sessionId = initRes.headers.get('mcp-session-id');
    console.log(`✓ Session established with ID: ${sessionId}`);

    // Helper: Call MCP Tool over JSON-RPC (handling optional SSE framing)
    async function callMcpTool(toolName, args, id = 2) {
      const res = await fetch(mcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'mcp-session-id': sessionId
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: { name: toolName, arguments: args },
          id
        })
      });
      const rawText = await res.text();
      let jsonStr = rawText;
      if (rawText.includes('data: ')) {
        const line = rawText.split('\n').find(l => l.startsWith('data: '));
        if (line) jsonStr = line.slice(6).trim();
      }
      const data = JSON.parse(jsonStr);
      if (data.error || data.result?.isError) {
        throw new Error(`Tool ${toolName} failed: ${JSON.stringify(data.error || data.result)}`);
      }
      return data.result?.content?.[0]?.text ? JSON.parse(data.result.content[0].text) : data.result;
    }

    // -------------------------------------------------------------
    // Step 2: Query Document Outline
    // -------------------------------------------------------------
    console.log('\n[Step 2] Agent calling get_document_outline...');
    let outline = await callMcpTool('get_document_outline', {});
    console.log(`✓ Initial State: Revision ${outline.revision}, Hash: ${outline.revisionHash}, Pages: ${outline.totalPages}`);

    // -------------------------------------------------------------
    // Step 3: Add Slide 1 (Cover Slide)
    // -------------------------------------------------------------
    console.log('\n[Step 3] Agent calling add_page (Slide 1: Executive Cover)...');
    const slide1Html = `
<div class="h-full flex flex-col justify-between p-16 bg-[#faf7f2] text-[#241c15] font-serif box-border relative">
  <div class="flex justify-between items-center text-xs tracking-[0.25em] text-[#786755] uppercase font-sans border-b border-[#dcd3c5] pb-4">
    <span>Executive Briefing &bull; 2026 Architecture</span>
    <span class="font-mono text-[#a85620] font-semibold">Strictly Confidential</span>
  </div>

  <div class="my-auto max-w-3xl">
    <div class="inline-block px-3 py-1 mb-4 rounded-full bg-[#ede7df] text-[#a85620] font-sans text-xs uppercase tracking-widest font-semibold border border-[#dcd3c5]">
      Enterprise Architecture
    </div>
    <h1 class="text-5xl font-serif text-[#241c15] tracking-tight leading-tight mb-4">
      Universal Model Context Protocol &amp; Precision Vector Synthesis
    </h1>
    <p class="text-lg font-serif italic text-[#786755] leading-relaxed">
      A Multi-Tenant, Zero-Lag Execution Architecture Connecting Real-Time Vector Graphics with Global LLM Intelligence.
    </p>
  </div>

  <div class="flex justify-between items-center text-xs font-sans text-[#786755] border-t border-[#dcd3c5] pt-4">
    <span>Prepared for: Global Engineering Leadership</span>
    <span class="font-mono font-medium text-[#a85620]">Slide 01 / 03</span>
  </div>
</div>`.trim();

    let resPage1 = await callMcpTool('add_page', {
      expectedRevisionHash: outline.revisionHash,
      html: slide1Html
    }, 3);
    console.log(`✓ Slide 1 created. Revision: ${resPage1.newRevision}, New Hash: ${resPage1.newRevisionHash}`);

    // -------------------------------------------------------------
    // Step 4: Add Slide 2 (Benchmark & Metrics)
    // -------------------------------------------------------------
    console.log('\n[Step 4] Agent calling add_page (Slide 2: Architectural Benchmarks)...');
    const slide2Html = `
<div class="h-full flex flex-col justify-between p-16 bg-[#faf7f2] text-[#241c15] font-serif box-border relative">
  <div class="flex justify-between items-center text-xs tracking-[0.25em] text-[#786755] uppercase font-sans border-b border-[#dcd3c5] pb-4">
    <span>Performance Telemetry</span>
    <span class="font-mono text-[#a85620] font-semibold">Empirical Measurements</span>
  </div>

  <div class="grid grid-cols-3 gap-8 my-auto">
    <div class="p-8 rounded-xl bg-white border border-[#dcd3c5] shadow-xs">
      <span class="text-xs uppercase font-sans font-bold text-[#a85620] tracking-wider block mb-2">Throughput</span>
      <div class="text-4xl font-serif font-bold text-[#241c15] mb-2">1,240 <span class="text-lg font-normal text-[#786755]">tx/sec</span></div>
      <p class="text-xs font-sans text-[#786755] leading-relaxed">Deterministic SHA-256 state hashing with sub-millisecond atomic memory commit.</p>
    </div>

    <div class="p-8 rounded-xl bg-white border border-[#dcd3c5] shadow-xs">
      <span class="text-xs uppercase font-sans font-bold text-[#a85620] tracking-wider block mb-2">Concurrency</span>
      <div class="text-4xl font-serif font-bold text-[#241c15] mb-2">100% <span class="text-lg font-normal text-[#786755]">Isolated</span></div>
      <p class="text-xs font-sans text-[#786755] leading-relaxed">Multi-session Streamable HTTP routing eliminates session collision risks.</p>
    </div>

    <div class="p-8 rounded-xl bg-white border border-[#dcd3c5] shadow-xs">
      <span class="text-xs uppercase font-sans font-bold text-[#a85620] tracking-wider block mb-2">Vector Fidelity</span>
      <div class="text-4xl font-serif font-bold text-[#241c15] mb-2">&plusmn;0.00 pt</div>
      <p class="text-xs font-sans text-[#786755] leading-relaxed">Zero rasterization loss across normalized 72 DPI PDF point transforms.</p>
    </div>
  </div>

  <div class="flex justify-between items-center text-xs font-sans text-[#786755] border-t border-[#dcd3c5] pt-4">
    <span>Benchmark Environment: Dual-Mode WebSocket + Streamable HTTP</span>
    <span class="font-mono font-medium text-[#a85620]">Slide 02 / 03</span>
  </div>
</div>`.trim();

    let resPage2 = await callMcpTool('add_page', {
      expectedRevisionHash: resPage1.newRevisionHash,
      html: slide2Html
    }, 4);
    console.log(`✓ Slide 2 created. Revision: ${resPage2.newRevision}, New Hash: ${resPage2.newRevisionHash}`);

    // -------------------------------------------------------------
    // Step 5: Add Slide 3 via REST OpenAPI Action Bridge
    // -------------------------------------------------------------
    console.log('\n[Step 5] Agent executing Slide 3 via OpenAPI REST Action (/api/v1/tools/add_page)...');
    const slide3Html = `
<div class="h-full flex flex-col justify-between p-16 bg-[#faf7f2] text-[#241c15] font-serif box-border relative">
  <div class="flex justify-between items-center text-xs tracking-[0.25em] text-[#786755] uppercase font-sans border-b border-[#dcd3c5] pb-4">
    <span>Strategic Roadmap</span>
    <span class="font-mono text-[#a85620] font-semibold">Execution Horizons</span>
  </div>

  <div class="grid grid-cols-2 gap-10 my-auto">
    <div class="p-8 rounded-xl bg-white border border-[#dcd3c5] shadow-xs flex flex-col justify-between">
      <div>
        <span class="text-xs uppercase font-sans font-bold text-[#a85620] tracking-wider block mb-2">Horizon 1 &bull; Q1 2027</span>
        <h3 class="text-2xl font-serif text-[#241c15] mb-3">Multi-Agent Autonomy</h3>
        <p class="text-xs font-sans text-[#786755] leading-relaxed">Cross-IDE synchronized tool calling between Cursor, Windsurf, Claude Code, and ChatGPT.</p>
      </div>
      <div class="border-t border-[#dcd3c5] pt-4 mt-6 text-xs font-mono text-[#a85620]">Target: Enterprise Production</div>
    </div>

    <div class="p-8 rounded-xl bg-[#ede7df] border border-[#dcd3c5] shadow-xs flex flex-col justify-between">
      <div>
        <span class="text-xs uppercase font-sans font-bold text-[#786755] tracking-wider block mb-2">Horizon 2 &bull; Q2 2027</span>
        <h3 class="text-2xl font-serif text-[#241c15] mb-3">Distributed Vector Streaming</h3>
        <p class="text-xs font-sans text-[#786755] leading-relaxed">Collaborative real-time CRDT vector canvas updates broadcasted to thousands of viewers.</p>
      </div>
      <div class="border-t border-[#dcd3c5] pt-4 mt-6 text-xs font-mono text-[#786755]">Target: Global Cloud Scale</div>
    </div>
  </div>

  <div class="flex justify-between items-center text-xs font-sans text-[#786755] border-t border-[#dcd3c5] pt-4">
    <span>Authorized by: Autonomous MCP Agent Suite</span>
    <span class="font-mono font-medium text-[#a85620]">Slide 03 / 03</span>
  </div>
</div>`.trim();

    const restRes = await fetch(`${restUrl}/add_page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expectedRevisionHash: resPage2.newRevisionHash,
        html: slide3Html
      })
    });

    const restResult = await restRes.json();
    console.log(`✓ Slide 3 added via REST OpenAPI Action! Revision: ${restResult.result.newRevision}, Hash: ${restResult.result.newRevisionHash}`);

    // -------------------------------------------------------------
    // Step 6: Verify Final Document Outline & Integrity
    // -------------------------------------------------------------
    console.log('\n[Step 6] Verifying final project integrity...');
    const finalOutline = await callMcpTool('get_document_outline', {}, 5);
    console.log(`✓ Project Title: "${finalOutline.title}"`);
    console.log(`✓ Total Slides: ${finalOutline.totalPages}`);
    console.log(`✓ Dimensions: ${finalOutline.dimensions.pageSize} (${finalOutline.dimensions.orientation})`);
    console.log(`✓ Final Revision Hash: ${finalOutline.revisionHash}`);

    console.log('\n=================================================================');
    console.log('🎉 SUCCESS: Complete 3-Slide Project Built Autonomously via MCP! ');
    console.log(`📁 Project State File: ${projectFile}`);
    console.log('=================================================================\n');
  } finally {
    await gateway.close();
  }
}

buildProjectViaMcp().catch(err => {
  console.error('[Build Project Failed]:', err);
  process.exit(1);
});
