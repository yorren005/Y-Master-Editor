const { spawn } = require('child_process');
const path = require('path');

const mcpScript = path.join(__dirname, '..', 'electron', 'mcp-server.cjs');

console.log('🚀 Connecting to MCP Server to create sample project...');

const proc = spawn('node', [mcpScript], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';

function sendRpc(msgObj) {
  proc.stdin.write(JSON.stringify(msgObj) + '\n');
}

// Slide 1: Cover Slide
const slide1Html = `
<div class="h-full flex flex-col justify-between p-16 bg-[#1c221d] text-[#fbf9f5] font-sans selection:bg-[#8e511b] selection:text-white">
  <div>
    <div class="flex justify-between items-center border-b border-[#b6a48c]/20 pb-5">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-md bg-[#8e511b] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
          N
        </div>
        <span class="text-xs font-semibold text-[#b6a48c] uppercase tracking-widest">Nordic Architectural Monograph &bull; Vol. IV</span>
      </div>
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#2b352d] text-[#d39e6a] border border-[#b6a48c]/30">
        STRATEGIC BRIEF 2026
      </span>
    </div>

    <div class="mt-12 max-w-4xl">
      <p class="text-xs font-bold text-[#8e511b] uppercase tracking-widest mb-3">Architectural Philosophy</p>
      <h1 id="cover-title" class="text-5xl font-serif text-[#fbf9f5] leading-tight tracking-tight">
        Harmonizing Natural Landscapes &amp; Kinetic Living Interiors
      </h1>
      <p id="cover-subtitle" class="mt-6 text-[#b6a48c] leading-relaxed text-lg font-light max-w-3xl">
        An investigation into biophilic construction, continuous mass-timber frameworks, and regenerative Scandinavian building envelopes engineered for extreme climate stability.
      </p>
    </div>
  </div>

  <div class="border-t border-[#b6a48c]/20 pt-6 flex justify-between items-center text-xs text-[#8a6b4c]">
    <div class="flex items-center gap-6">
      <span>Studio Nordic &amp; Antigravity</span>
      <span class="text-[#b6a48c]/40">&bull;</span>
      <span>Published Autumn 2026</span>
      <span class="text-[#b6a48c]/40">&bull;</span>
      <span>Stockholm &amp; Oslo</span>
    </div>
    <span class="font-mono text-[#b6a48c]">Slide 01 / 03</span>
  </div>
</div>
`.trim();

// Slide 2: Structural Pillars Grid
const slide2Html = `
<div class="h-full flex flex-col justify-between p-16 bg-[#242c26] text-[#fbf9f5] font-sans">
  <div>
    <div class="flex justify-between items-end border-b border-[#b6a48c]/20 pb-4 mb-8">
      <div>
        <span class="text-xs font-semibold text-[#8e511b] uppercase tracking-widest">Section 01 &bull; Technical Systems</span>
        <h2 id="pillars-heading" class="text-3xl font-serif text-[#fbf9f5] mt-1">Core Regenerative Frameworks</h2>
      </div>
      <span class="text-xs text-[#b6a48c] font-light">Engineered for Nordic Climate Zones</span>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <!-- Card 1 -->
      <div id="card-mass-timber" class="p-8 rounded-lg bg-[#1c221d] border border-[#b6a48c]/20 flex flex-col justify-between">
        <div>
          <div class="w-8 h-8 rounded bg-[#423b28] text-[#d39e6a] flex items-center justify-center font-mono font-bold text-xs mb-5">
            01
          </div>
          <h3 class="text-xl font-serif text-[#fbf9f5] mb-3">Mass Timber Joinery</h3>
          <p class="text-xs text-[#b6a48c] leading-relaxed font-light">
            Zero-metal interlocking Scandinavian spruce columns delivering carbon-negative structural endurance and acoustic dampening.
          </p>
        </div>
        <div class="mt-8 pt-4 border-t border-[#b6a48c]/15 text-[11px] font-mono text-[#8a6b4c]">
          Embodied CO₂: -420 kg/m³
        </div>
      </div>

      <!-- Card 2 -->
      <div id="card-passive-solar" class="p-8 rounded-lg bg-[#2b352d] border border-[#8e511b]/40 shadow-sm flex flex-col justify-between">
        <div>
          <div class="w-8 h-8 rounded bg-[#8e511b] text-white flex items-center justify-center font-mono font-bold text-xs mb-5">
            02
          </div>
          <h3 class="text-xl font-serif text-[#fbf9f5] mb-3">Passive Solar Envelope</h3>
          <p class="text-xs text-[#b6a48c] leading-relaxed font-light">
            Triple-glazed argon cavities positioned along solar azimuths, paired with subterranean soapstone thermal batteries.
          </p>
        </div>
        <div class="mt-8 pt-4 border-t border-[#b6a48c]/15 text-[11px] font-mono text-[#d39e6a]">
          U-Value: 0.58 W/m²K
        </div>
      </div>

      <!-- Card 3 -->
      <div id="card-biophilic-flows" class="p-8 rounded-lg bg-[#1c221d] border border-[#b6a48c]/20 flex flex-col justify-between">
        <div>
          <div class="w-8 h-8 rounded bg-[#423b28] text-[#b6a48c] flex items-center justify-center font-mono font-bold text-xs mb-5">
            03
          </div>
          <h3 class="text-xl font-serif text-[#fbf9f5] mb-3">Microclimate Atriums</h3>
          <p class="text-xs text-[#b6a48c] leading-relaxed font-light">
            Interior botanical lungs providing natural particulate filtration, humidity buffering, and circadian daylight dispersal.
          </p>
        </div>
        <div class="mt-8 pt-4 border-t border-[#b6a48c]/15 text-[11px] font-mono text-[#8a6b4c]">
          Air Turnover: 100% Passive
        </div>
      </div>
    </div>
  </div>

  <div class="border-t border-[#b6a48c]/20 pt-4 flex justify-between items-center text-xs text-[#8a6b4c]">
    <span>Kinfolk Architectural &bull; Materials &amp; Physics</span>
    <span class="font-mono text-[#b6a48c]">Slide 02 / 03</span>
  </div>
</div>
`.trim();

// Slide 3: Executive Impact & Roadmap
const slide3Html = `
<div class="h-full flex flex-col justify-between p-16 bg-[#1c221d] text-[#fbf9f5] font-sans">
  <div>
    <div class="flex justify-between items-end border-b border-[#b6a48c]/20 pb-4 mb-8">
      <div>
        <span class="text-xs font-semibold text-[#8e511b] uppercase tracking-widest">Section 02 &bull; Measured Outcomes</span>
        <h2 class="text-3xl font-serif text-[#fbf9f5] mt-1">Lifecycle Impact &amp; Roadmap</h2>
      </div>
      <span class="text-xs text-[#b6a48c] font-light">Verified against BREEAM Outstanding</span>
    </div>

    <div class="grid grid-cols-2 gap-10">
      <!-- Left: Metrics Column -->
      <div class="space-y-6">
        <div class="p-6 rounded-lg bg-[#242c26] border border-[#b6a48c]/15 flex items-center justify-between">
          <div>
            <div class="text-4xl font-serif text-[#fbf9f5]">78.4%</div>
            <div class="text-xs text-[#b6a48c] mt-1 font-light">Embodied Carbon Reduction</div>
          </div>
          <span class="text-xs font-mono text-[#6ee7b7] bg-[#6ee7b7]/10 px-2 py-1 rounded">Target Surpassed</span>
        </div>

        <div class="p-6 rounded-lg bg-[#242c26] border border-[#b6a48c]/15 flex items-center justify-between">
          <div>
            <div class="text-4xl font-serif text-[#fbf9f5]">14,200 m²</div>
            <div class="text-xs text-[#b6a48c] mt-1 font-light">Reclaimed Northern Spruce Deployed</div>
          </div>
          <span class="text-xs font-mono text-[#d39e6a] bg-[#d39e6a]/10 px-2 py-1 rounded">100% Certified</span>
        </div>

        <div class="p-6 rounded-lg bg-[#242c26] border border-[#b6a48c]/15 flex items-center justify-between">
          <div>
            <div class="text-4xl font-serif text-[#fbf9f5]">Net Positive</div>
            <div class="text-xs text-[#b6a48c] mt-1 font-light">Annual Energy Production Index</div>
          </div>
          <span class="text-xs font-mono text-[#6ee7b7] bg-[#6ee7b7]/10 px-2 py-1 rounded">+12.8 MWh/yr</span>
        </div>
      </div>

      <!-- Right: Roadmap & Quote -->
      <div class="p-8 rounded-lg bg-[#2b352d]/60 border border-[#b6a48c]/20 flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-bold text-[#8e511b] uppercase tracking-wider block mb-2">Architectural Creed</span>
          <p class="text-lg font-serif text-[#fbf9f5] italic leading-relaxed">
            &ldquo;We do not merely construct shelters on the landscape; we sculpt the landscape into shelters that age gracefully with the forest.&rdquo;
          </p>
        </div>

        <div class="pt-6 border-t border-[#b6a48c]/20">
          <div class="text-xs font-semibold text-[#fbf9f5]">Elin Lindqvist</div>
          <div class="text-[11px] text-[#b6a48c] font-light">Lead Architectural Fellow &bull; Stockholm Institute</div>
        </div>
      </div>
    </div>
  </div>

  <div class="border-t border-[#b6a48c]/20 pt-4 flex justify-between items-center text-xs text-[#8a6b4c]">
    <span>Executive Summary &bull; Next Steps for Q1 2027</span>
    <span class="font-mono text-[#b6a48c]">Slide 03 / 03</span>
  </div>
</div>
`.trim();

proc.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    const msg = JSON.parse(line.trim());

    if (msg.id === 1) {
      console.log('✅ Handshake complete. Creating project via MCP...');
      sendRpc({ jsonrpc: '2.0', method: 'notifications/initialized' });

      // Step 2: Create Project
      sendRpc({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'create_project',
          arguments: {
            title: 'Nordic Architecture & Biophilic Design',
            pageSize: '16:9',
            orientation: 'landscape',
            initialHtml: slide1Html
          }
        }
      });
    } else if (msg.id === 2) {
      console.log('✅ Slide 1 (Cover) Project Created!');

      // Step 3: Add Slide 2
      sendRpc({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'add_page',
          arguments: {
            html: slide2Html
          }
        }
      });
    } else if (msg.id === 3) {
      console.log('✅ Slide 2 (Core Frameworks) Added!');

      // Step 4: Add Slide 3
      sendRpc({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'add_page',
          arguments: {
            html: slide3Html
          }
        }
      });
    } else if (msg.id === 4) {
      console.log('✅ Slide 3 (Impact & Roadmap) Added!');

      // Step 5: Add sample precision comment pins
      sendRpc({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'add_comment',
          arguments: {
            pageIndex: 0,
            selector: '#cover-subtitle',
            selectedText: 'An investigation into biophilic construction...',
            comment: 'Tighten description and cite client collaboration with Nordic Council of Architects',
            x: 28,
            y: 42
          }
        }
      });
    } else if (msg.id === 5) {
      console.log('✅ Sample Pin Comment 1 pinned on Slide 1!');

      sendRpc({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'add_comment',
          arguments: {
            pageIndex: 1,
            selector: '#card-passive-solar h3',
            selectedText: 'Passive Solar Envelope',
            comment: 'Enhance typography with bold travertine accent and add solar efficiency badge',
            x: 48,
            y: 35
          }
        }
      });
    } else if (msg.id === 6) {
      console.log('✅ Sample Pin Comment 2 pinned on Slide 2!');
      console.log('\n🎉 SAMPLE PROJECT CREATION COMPLETE!');
      console.log('The project "Nordic Architecture & Biophilic Design" is now live with 3 widescreen slides and precision AI comments.');

      setTimeout(() => {
        proc.kill();
        process.exit(0);
      }, 500);
    }
  }
});

// Step 1: Handshake
sendRpc({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'sample-project-creator', version: '1.0' }
  }
});
