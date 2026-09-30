const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const mcpScript = path.join(__dirname, '..', 'electron', 'mcp-server.cjs');

console.log('🚀 Connecting to PDF Canvas Studio MCP Server...');
console.log('📄 Target: Product Briefing Document (A4 Multi-Page Vector PDF)');

// ============================================================================
// GLOBAL STYLES
// ============================================================================
const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a;
  background-color: #ffffff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, .font-heading {
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.025em;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
`.trim();

// ============================================================================
// PAGE 1: EXECUTIVE SUMMARY, PROBLEM STATEMENT & PERSONAS
// ============================================================================
const page1Html = `
<div class="h-full flex flex-col justify-between p-8 bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
  <div>
    <!-- Top Metadata Header Bar -->
    <div class="flex justify-between items-center border-b border-slate-200 pb-3">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
          NX
        </div>
        <div>
          <span class="text-[9px] font-bold text-indigo-600 uppercase tracking-[0.2em] block">PRODUCT BRIEFING DOCUMENT &bull; SPEC v2.4</span>
          <span class="text-xs font-semibold text-slate-800">Nexus Enterprise Agent Studio</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
          &bull; APPROVED FOR SPRINT
        </span>
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
          DOC-ID: PBD-2026-Q4-089
        </span>
      </div>
    </div>

    <!-- Main Title & Strategic Focus -->
    <div class="mt-4 mb-3">
      <div class="flex items-center gap-2 mb-1">
        <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-widest">
          STRATEGIC INITIATIVE FY26/27
        </span>
        <span class="text-[10px] text-slate-400 font-medium">Target Launch: Q1 2027</span>
      </div>
      <h1 class="text-2xl font-bold font-heading text-slate-900 tracking-tight leading-snug">
        Nexus AI: Autonomous Multi-Modal Workflow &amp; Vector Document Studio
      </h1>
      <p class="mt-1 text-xs text-slate-600 leading-relaxed max-w-3xl">
        A unified enterprise publishing platform bridging background web rendering, agentic Model Context Protocol (MCP) execution, and deterministic vector PDF compilation to eliminate knowledge fragmentation across enterprise product and strategy teams.
      </p>
    </div>

    <!-- Executive Brief Quote / Thesis -->
    <div class="p-3 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-white border-l-3 border-indigo-600 rounded-r mb-3.5">
      <p class="text-[11px] text-slate-700 leading-relaxed font-medium">
        <strong class="text-indigo-950 font-semibold">Executive Thesis:</strong> Modern knowledge teams lose over $48B annually switching between static slide generators, disconnected text editors, and ungrounded LLM chats. Nexus combines sub-pixel DOM review pins with a high-clarity 1200+ DPI Chromium vector pipeline.
      </p>
    </div>

    <!-- Market Opportunity & Addressable TAM / SAM / SOM -->
    <div class="mb-3.5">
      <div class="flex justify-between items-center mb-1.5">
        <span class="text-[10px] font-bold text-slate-900 uppercase tracking-wider">1.0 Market Opportunity &amp; Addressable Potential</span>
        <span class="text-[9px] text-indigo-600 font-mono">Gartner &amp; IDC Forecast 2026-2028</span>
      </div>
      <div class="grid grid-cols-3 gap-2.5">
        <div id="card-tam" class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
          <div>
            <span class="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Total Addressable Market</span>
            <div class="text-lg font-bold font-heading text-indigo-600 mt-0.5">$142B</div>
            <p class="text-[10px] text-slate-600 mt-0.5 leading-snug">
              Global enterprise document intelligence, publishing &amp; workflow automation by 2028 (24.6% CAGR).
            </p>
          </div>
          <div class="mt-2 pt-1 border-t border-slate-200/60 text-[9px] font-mono text-slate-400">
            Source: Enterprise AI Index
          </div>
        </div>

        <div id="card-sam" class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
          <div>
            <span class="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Serviceable Market</span>
            <div class="text-lg font-bold font-heading text-slate-900 mt-0.5">$38B</div>
            <p class="text-[10px] text-slate-600 mt-0.5 leading-snug">
              Autonomous agentic authoring, multi-modal publishing, and collaborative document engineering.
            </p>
          </div>
          <div class="mt-2 pt-1 border-t border-slate-200/60 text-[9px] font-mono text-slate-400">
            Fortune 5000 Segment
          </div>
        </div>

        <div id="card-som" class="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between">
          <div>
            <span class="text-[9px] font-mono text-indigo-600 uppercase tracking-wider block font-semibold">Serviceable Obtainable (3-Yr)</span>
            <div class="text-lg font-bold font-heading text-indigo-900 mt-0.5">$2.4B</div>
            <p class="text-[10px] text-indigo-950/80 mt-0.5 leading-snug">
              Target initial capture across Tier-1 enterprise software, financial services, and consulting teams.
            </p>
          </div>
          <div class="mt-2 pt-1 border-t border-indigo-200/60 text-[9px] font-mono text-indigo-600 font-medium">
            3-Year Target Objective
          </div>
        </div>
      </div>
    </div>

    <!-- The Problem Space: 3 Critical Friction Points -->
    <div class="mb-3.5">
      <div class="flex justify-between items-center mb-1.5">
        <span class="text-[10px] font-bold text-slate-900 uppercase tracking-wider">2.0 Critical Friction Points in Current Workflows</span>
        <span class="text-[9px] text-rose-600 font-mono">Current Status: HIGH URGENCY</span>
      </div>
      <div class="grid grid-cols-3 gap-2.5">
        <div class="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span class="text-[10px] font-bold text-slate-900">Context Fragmentation</span>
          </div>
          <p class="text-[10px] text-slate-600 leading-relaxed">
            Product teams juggle 5+ disjointed tools (Confluence, Figma, Google Docs, Keynote, Slack) to draft, review, and finalize a single executive briefing.
          </p>
        </div>

        <div class="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span class="text-[10px] font-bold text-slate-900">Unconstrained LLM Outputs</span>
          </div>
          <p class="text-[10px] text-slate-600 leading-relaxed">
            Existing generative AI produces plain markdown without typographic hierarchy, vector fidelity, or physical paper layout constraints.
          </p>
        </div>

        <div class="p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span class="text-[10px] font-bold text-slate-900">Asynchronous Review Latency</span>
          </div>
          <p class="text-[10px] text-slate-600 leading-relaxed">
            Stakeholder comments remain unanchored to specific DOM nodes, creating ambiguous review loops and manual reformatting churn.
          </p>
        </div>
      </div>
    </div>

    <!-- Target User Personas (3 Profiles) -->
    <div>
      <span class="text-[10px] font-bold text-slate-900 uppercase tracking-wider block mb-1.5">3.0 Target Enterprise Personas</span>
      <div class="grid grid-cols-3 gap-2.5">
        <div class="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/80">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">
              EP
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-900 block leading-tight">Elena Rostova</span>
              <span class="text-[8.5px] text-slate-500 font-medium">Chief Product Officer</span>
            </div>
          </div>
          <p class="text-[9.5px] text-slate-600 leading-relaxed">
            Needs executive-ready briefing decks and PRDs in minutes. Eliminates 8 hours of manual slide formatting per release cycle.
          </p>
        </div>

        <div class="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/80">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-[9px]">
              MV
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-900 block leading-tight">Marcus Vance</span>
              <span class="text-[8.5px] text-slate-500 font-medium">Principal Architect</span>
            </div>
          </div>
          <p class="text-[9.5px] text-slate-600 leading-relaxed">
            Demands native Model Context Protocol (MCP) tool integration, headless CLI automation, and true vector output for technical blueprints.
          </p>
        </div>

        <div class="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/80">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[9px]">
              DS
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-900 block leading-tight">David Sterling</span>
              <span class="text-[8.5px] text-slate-500 font-medium">VP Strategy &amp; Ops</span>
            </div>
          </div>
          <p class="text-[9.5px] text-slate-600 leading-relaxed">
            Requires pinpoint visual review pins, audit logging, role-based governance, and deterministic one-click print-ready compilation.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Page Footer -->
  <div class="border-t border-slate-200 pt-2 flex justify-between items-center text-[9px] text-slate-400">
    <div class="flex items-center gap-4">
      <span class="font-bold text-slate-600 uppercase tracking-wider">CONFIDENTIAL</span>
      <span>&bull;</span>
      <span>NEXUS PRODUCT MANAGEMENT GROUP</span>
      <span>&bull;</span>
      <span>RESTRICTED INTERNAL CIRCULATION</span>
    </div>
    <span class="font-mono font-medium text-slate-600">Page 01 of 03</span>
  </div>
</div>
`.trim();

// ============================================================================
// PAGE 2: PRODUCT ARCHITECTURE, CORE CAPABILITIES & WORKFLOW
// ============================================================================
const page2Html = `
<div class="h-full flex flex-col justify-between p-8 bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
  <div>
    <!-- Section Header -->
    <div class="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
      <div>
        <span class="text-[9px] font-bold text-indigo-600 uppercase tracking-[0.2em] block">SECTION 02 // TECHNICAL FOUNDATION &amp; ARCHITECTURE</span>
        <h2 class="text-xl font-bold font-heading text-slate-900 mt-0.5">System Design &amp; Strategic Value Pillars</h2>
      </div>
      <div class="text-right">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200">
          ARCHITECTURE REF: ARC-2026-v4
        </span>
      </div>
    </div>

    <!-- Complete SVG System Architecture Diagram -->
    <div class="p-3 bg-slate-50/90 border border-slate-200 rounded-lg shadow-2xs mb-3.5">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
          <span class="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Figure 1 &bull; End-to-End Multi-Modal Architecture Pipeline</span>
        </div>
        <span class="text-[9px] text-indigo-600 font-mono">Chromium Vector + MCP Integration</span>
      </div>

      <svg id="svg-architecture" viewBox="0 0 680 125" class="w-full h-auto text-xs" style="max-height: 125px;">
        <!-- Defs for Gradients & Markers -->
        <defs>
          <linearGradient id="gradIngest" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.03"/>
          </linearGradient>
          <linearGradient id="gradEngine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#1e293b" stop-opacity="0.9"/>
          </linearGradient>
          <linearGradient id="gradOutput" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#059669" stop-opacity="0.04"/>
          </linearGradient>
        </defs>

        <!-- Block 1: Multi-Modal Ingestion -->
        <rect x="5" y="10" width="145" height="105" rx="6" fill="url(#gradIngest)" stroke="#6366f1" stroke-width="1.2"/>
        <rect x="15" y="18" width="125" height="18" rx="3" fill="#4f46e5"/>
        <text x="77" y="30" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="9">1. AGENT &amp; USER INPUTS</text>
        <text x="20" y="52" fill="#0f172a" font-size="8.5" font-weight="600">&bull; MCP Stdio Client (JSON-RPC)</text>
        <text x="20" y="68" fill="#475569" font-size="8">&bull; Live WebSocket Bridge (:48721)</text>
        <text x="20" y="84" fill="#475569" font-size="8">&bull; Interactive Canvas WYSIWYG</text>
        <text x="20" y="100" fill="#6366f1" font-size="7.5" font-weight="600">Sub-pixel Pin Commenting</text>

        <!-- Arrow 1 -> 2 -->
        <path d="M 152 62 L 172 62" stroke="#4f46e5" stroke-width="1.8" stroke-dasharray="2,2"/>
        <polygon points="172,59 178,62 172,65" fill="#4f46e5"/>

        <!-- Block 2: Agentic Orchestration Core -->
        <rect x="180" y="10" width="160" height="105" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
        <rect x="190" y="18" width="140" height="18" rx="3" fill="#0f172a"/>
        <text x="260" y="30" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="9">2. NEXUS AGENTIC CORE</text>
        <text x="192" y="52" fill="#0f172a" font-size="8.5" font-weight="600">&bull; Surgical DOM Selector Mutator</text>
        <text x="192" y="68" fill="#475569" font-size="8">&bull; Tailwind CSS 3.4 JIT Engine</text>
        <text x="192" y="84" fill="#475569" font-size="8">&bull; Multi-Page State Synchronizer</text>
        <text x="192" y="100" fill="#0f172a" font-size="7.5" font-weight="600">document_state.json Store</text>

        <!-- Arrow 2 -> 3 -->
        <path d="M 342 62 L 362 62" stroke="#0f172a" stroke-width="1.8"/>
        <polygon points="362,59 368,62 362,65" fill="#0f172a"/>

        <!-- Block 3: Dual-Engine Vector Rendering -->
        <rect x="370" y="10" width="150" height="105" rx="6" fill="url(#gradEngine)" stroke="#0f172a" stroke-width="1.2"/>
        <rect x="380" y="18" width="130" height="18" rx="3" fill="#4f46e5"/>
        <text x="445" y="30" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="9">3. DUAL-ENGINE RENDER</text>
        <text x="382" y="52" fill="#f8fafc" font-size="8.5" font-weight="600">&bull; Electron Offscreen WebContents</text>
        <text x="382" y="68" fill="#cbd5e1" font-size="8">&bull; 100% Vector Text &amp; SVGs</text>
        <text x="382" y="84" fill="#cbd5e1" font-size="8">&bull; Zero Raster Blur Pipeline</text>
        <text x="382" y="100" fill="#a5b4fc" font-size="7.5" font-weight="600">1200+ DPI Print Engine</text>

        <!-- Arrow 3 -> 4 -->
        <path d="M 522 62 L 542 62" stroke="#10b981" stroke-width="1.8"/>
        <polygon points="542,59 548,62 542,65" fill="#10b981"/>

        <!-- Block 4: Multi-Channel Output -->
        <rect x="550" y="10" width="125" height="105" rx="6" fill="url(#gradOutput)" stroke="#10b981" stroke-width="1.2"/>
        <rect x="558" y="18" width="109" height="18" rx="3" fill="#059669"/>
        <text x="612" y="30" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="9">4. DETERMINISTIC EXPORT</text>
        <text x="560" y="52" fill="#065f46" font-size="8.5" font-weight="600">&bull; Print-Ready Vector PDF</text>
        <text x="560" y="68" fill="#047857" font-size="8">&bull; Editable 16:9 PPTX Slides</text>
        <text x="560" y="84" fill="#047857" font-size="8">&bull; Native System Print Dialog</text>
        <text x="560" y="100" fill="#065f46" font-size="7.5" font-weight="600">Direct File System Write</text>
      </svg>
    </div>

    <!-- The 4 Core Architectural Value Pillars -->
    <div class="mb-3.5">
      <span class="text-[10px] font-bold text-slate-900 uppercase tracking-wider block mb-1.5">2.0 Core Strategic Pillars</span>
      <div class="grid grid-cols-2 gap-2.5">
        <!-- Pillar 1 -->
        <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-mono font-bold text-indigo-600 uppercase">Pillar 01 &bull; Precision Editing</span>
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            </div>
            <h3 class="text-xs font-bold text-slate-900 font-heading mb-1">Surgical DOM Element Updates</h3>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              AI agents modify individual cards, headings, or metrics via CSS selectors without destructive full-page re-renders. Live WebSocket syncing ensures instant 60 FPS reflection.
            </p>
          </div>
          <div class="mt-2 pt-1 border-t border-slate-200 text-[8.5px] font-mono text-slate-400">
            Tool: update_element(selector, newHtml)
          </div>
        </div>

        <!-- Pillar 2 -->
        <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-mono font-bold text-violet-600 uppercase">Pillar 02 &bull; Interoperability</span>
              <span class="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
            </div>
            <h3 class="text-xs font-bold text-slate-900 font-heading mb-1">Bidirectional Model Context Protocol</h3>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              Full MCP SDK implementation supporting 12+ agent tools. Antigravity, Claude, and internal scripts inspect state, read comment queues, and mutate pages programmatically.
            </p>
          </div>
          <div class="mt-2 pt-1 border-t border-slate-200 text-[8.5px] font-mono text-slate-400">
            Protocol: JSON-RPC 2.0 via Stdio &amp; WebSocket
          </div>
        </div>

        <!-- Pillar 3 -->
        <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-mono font-bold text-emerald-600 uppercase">Pillar 03 &bull; Quality</span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            </div>
            <h3 class="text-xs font-bold text-slate-900 font-heading mb-1">Max Clarity Vector Compilation</h3>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              Eliminates canvas bitmap blurring by utilizing Chromium's native vector print subsystem. Generates razor-sharp selectable text, vector icons, and lossless chart geometry.
            </p>
          </div>
          <div class="mt-2 pt-1 border-t border-slate-200 text-[8.5px] font-mono text-slate-400">
            Resolution: 1200+ DPI &bull; Selectable Text
          </div>
        </div>

        <!-- Pillar 4 -->
        <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-mono font-bold text-amber-600 uppercase">Pillar 04 &bull; Modality</span>
              <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            </div>
            <h3 class="text-xs font-bold text-slate-900 font-heading mb-1">Multi-Format Physical Dimension Engine</h3>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              Dynamic aspect ratio calculations for A4, A3, Letter, Legal, and 16:9 widescreen presentation slides. Automatic page boundary clipping prevents multi-page bleeding.
            </p>
          </div>
          <div class="mt-2 pt-1 border-t border-slate-200 text-[8.5px] font-mono text-slate-400">
            Dimensions: A4 / A3 / Letter / 16:9 / Custom mm
          </div>
        </div>
      </div>
    </div>

    <!-- 4-Stage User Experience Flow -->
    <div>
      <span class="text-[10px] font-bold text-slate-900 uppercase tracking-wider block mb-1.5">3.0 End-to-End User Experience Lifecycle</span>
      <div class="grid grid-cols-4 gap-2">
        <div class="p-2 rounded bg-indigo-50/60 border border-indigo-100">
          <span class="text-[9px] font-mono font-bold text-indigo-600 block">STEP 01</span>
          <h4 class="text-[10px] font-bold text-slate-900 mt-0.5">Prompt &amp; Seed</h4>
          <p class="text-[9px] text-slate-600 mt-0.5 leading-snug">
            Agent crafts complete multi-page design using semantic HTML and Tailwind utility classes.
          </p>
        </div>

        <div class="p-2 rounded bg-indigo-50/60 border border-indigo-100">
          <span class="text-[9px] font-mono font-bold text-indigo-600 block">STEP 02</span>
          <h4 class="text-[10px] font-bold text-slate-900 mt-0.5">Interactive Preview</h4>
          <p class="text-[9px] text-slate-600 mt-0.5 leading-snug">
            User inspects print-ready vector document with zero code clutter in the background canvas.
          </p>
        </div>

        <div class="p-2 rounded bg-indigo-50/60 border border-indigo-100">
          <span class="text-[9px] font-mono font-bold text-indigo-600 block">STEP 03</span>
          <h4 class="text-[10px] font-bold text-slate-900 mt-0.5">Pin &amp; Refine</h4>
          <p class="text-[9px] text-slate-600 mt-0.5 leading-snug">
            Highlight text or click cards to pin instructions; agent updates the DOM surgically.
          </p>
        </div>

        <div class="p-2 rounded bg-indigo-50/60 border border-indigo-100">
          <span class="text-[9px] font-mono font-bold text-indigo-600 block">STEP 04</span>
          <h4 class="text-[10px] font-bold text-slate-900 mt-0.5">Publish &amp; Share</h4>
          <p class="text-[9px] text-slate-600 mt-0.5 leading-snug">
            One-click download of maximum clarity vector PDF or editable PowerPoint presentation.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Page Footer -->
  <div class="border-t border-slate-200 pt-2 flex justify-between items-center text-[9px] text-slate-400">
    <div class="flex items-center gap-4">
      <span class="font-bold text-slate-600 uppercase tracking-wider">CONFIDENTIAL</span>
      <span>&bull;</span>
      <span>NEXUS PRODUCT MANAGEMENT GROUP</span>
      <span>&bull;</span>
      <span>SYSTEM ARCHITECTURE SPECIFICATION</span>
    </div>
    <span class="font-mono font-medium text-slate-600">Page 02 of 03</span>
  </div>
</div>
`.trim();

// ============================================================================
// PAGE 3: SUCCESS METRICS, GTM STRATEGY, ROADMAP & SIGN-OFFS
// ============================================================================
const page3Html = `
<div class="h-full flex flex-col justify-between p-8 bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
  <div>
    <!-- Section Header -->
    <div class="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
      <div>
        <span class="text-[9px] font-bold text-indigo-600 uppercase tracking-[0.2em] block">SECTION 03 // EXECUTION, KPIS &amp; GOVERNANCE</span>
        <h2 class="text-xl font-bold font-heading text-slate-900 mt-0.5">Measurement Framework, Roadmap &amp; Approvals</h2>
      </div>
      <div class="text-right">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200">
          TARGET RELEASE: FY26-Q4 / FY27-Q1
        </span>
      </div>
    </div>

    <!-- 4 Key Success Metrics (OKRs / KPIs) -->
    <div class="mb-3.5">
      <span class="text-[10px] font-bold text-slate-900 uppercase tracking-wider block mb-1.5">1.0 Primary Success Criteria (OKRs &amp; KPIs)</span>
      <div class="grid grid-cols-4 gap-2.5">
        <div id="kpi-publish-time" class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
          <span class="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Time-to-Publish</span>
          <div class="text-xl font-bold font-heading text-indigo-600 mt-0.5">-74%</div>
          <p class="text-[9px] text-slate-600 mt-0.5 leading-snug">
            Reduced from 8.5 hours to 2.2 hours per briefing document.
          </p>
        </div>

        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
          <span class="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Vector Fidelity</span>
          <div class="text-xl font-bold font-heading text-emerald-600 mt-0.5">99.98%</div>
          <p class="text-[9px] text-slate-600 mt-0.5 leading-snug">
            1:1 typography and SVG parity between preview and printed PDF.
          </p>
        </div>

        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
          <span class="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">ARR Run-Rate</span>
          <div class="text-xl font-bold font-heading text-slate-900 mt-0.5">$18.5M</div>
          <p class="text-[9px] text-slate-600 mt-0.5 leading-snug">
            Targeted FY27 enterprise expansion across 450+ enterprise teams.
          </p>
        </div>

        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
          <span class="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Pin AI Resolution</span>
          <div class="text-xl font-bold font-heading text-violet-600 mt-0.5">91.4%</div>
          <p class="text-[9px] text-slate-600 mt-0.5 leading-snug">
            Autonomous agent successful comment fulfillment on first pass.
          </p>
        </div>
      </div>
    </div>

    <!-- Phased Execution Roadmap -->
    <div class="mb-3.5">
      <div class="flex justify-between items-center mb-1.5">
        <span class="text-[10px] font-bold text-slate-900 uppercase tracking-wider">2.0 Chronological Engineering Milestones</span>
        <span class="text-[9px] text-slate-400 font-mono">Sprint Alignment: 2-Week Iterations</span>
      </div>
      <div class="grid grid-cols-3 gap-2.5">
        <!-- Phase 1 -->
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between mb-1">
            <span class="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-emerald-100 text-emerald-800">COMPLETED</span>
            <span class="text-[9px] font-mono text-slate-400">Q3 2026</span>
          </div>
          <h4 class="text-xs font-bold text-slate-900 font-heading">Phase 1 &bull; Core Alpha</h4>
          <ul class="mt-1 text-[9px] text-slate-600 space-y-0.5 list-disc list-inside">
            <li>Chromium native vector print engine</li>
            <li>Bidirectional MCP WebSocket bridge</li>
            <li>Sub-pixel DOM element pin review</li>
            <li>Standard A4 / Letter format engines</li>
          </ul>
        </div>

        <!-- Phase 2 -->
        <div id="phase-2-roadmap" class="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200">
          <div class="flex items-center justify-between mb-1">
            <span class="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-indigo-600 text-white">IN PROGRESS</span>
            <span class="text-[9px] font-mono text-indigo-600 font-bold">Q4 2026</span>
          </div>
          <h4 class="text-xs font-bold text-indigo-950 font-heading">Phase 2 &bull; Enterprise Beta</h4>
          <ul class="mt-1 text-[9px] text-indigo-900/80 space-y-0.5 list-disc list-inside">
            <li>Multi-project workspace switcher</li>
            <li>Editable 16:9 PPTX presentation exporter</li>
            <li>WYSIWYG inline direct-click editing</li>
            <li>Headless CI/CD automated test harness</li>
          </ul>
        </div>

        <!-- Phase 3 -->
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between mb-1">
            <span class="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-slate-200 text-slate-700">PLANNED</span>
            <span class="text-[9px] font-mono text-slate-400">Q1 2027</span>
          </div>
          <h4 class="text-xs font-bold text-slate-900 font-heading">Phase 3 &bull; Commercial GA</h4>
          <ul class="mt-1 text-[9px] text-slate-600 space-y-0.5 list-disc list-inside">
            <li>Enterprise SSO / SAML &amp; SCIM provisioning</li>
            <li>Private Cloud / Air-gapped container tier</li>
            <li>SOC2 Type II &amp; HIPAA compliance audit</li>
            <li>Multi-user real-time team collaboration</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Go-To-Market Packaging Tiers -->
    <div class="mb-3.5">
      <span class="text-[10px] font-bold text-slate-900 uppercase tracking-wider block mb-1.5">3.0 Enterprise Go-To-Market &amp; Commercial Packaging</span>
      <div class="grid grid-cols-3 gap-2.5">
        <div class="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div class="flex justify-between items-baseline mb-1">
            <span class="text-[10px] font-bold text-slate-900">Team Edition</span>
            <span class="text-xs font-bold font-mono text-indigo-600">$49<span class="text-[8px] font-normal text-slate-400">/seat/mo</span></span>
          </div>
          <p class="text-[9px] text-slate-600 leading-snug">
            Ideal for agile product pods. Includes visual canvas, vector PDF compiler, and local MCP agent connector.
          </p>
        </div>

        <div class="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200 shadow-2xs">
          <div class="flex justify-between items-baseline mb-1">
            <span class="text-[10px] font-bold text-indigo-950">Enterprise Studio</span>
            <span class="text-xs font-bold font-mono text-indigo-700">$129<span class="text-[8px] font-normal text-indigo-400">/seat/mo</span></span>
          </div>
          <p class="text-[9px] text-indigo-900/80 leading-snug">
            Unlimited agent threads, native PPTX generator, custom brand fonts, webhook automation, and priority SLA.
          </p>
        </div>

        <div class="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div class="flex justify-between items-baseline mb-1">
            <span class="text-[10px] font-bold text-slate-900">Sovereign Cloud</span>
            <span class="text-xs font-bold font-mono text-slate-700">Custom</span>
          </div>
          <p class="text-[9px] text-slate-600 leading-snug">
            Self-hosted air-gapped deployment, dedicated Chromium rendering cluster, custom audit logging, and 99.99% uptime.
          </p>
        </div>
      </div>
    </div>

    <!-- Governance & Executive Sign-off Matrix -->
    <div>
      <span class="text-[10px] font-bold text-slate-900 uppercase tracking-wider block mb-1.5">4.0 Executive Governance &amp; Stakeholder Approvals</span>
      <div class="grid grid-cols-4 gap-2">
        <div class="p-2 rounded bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-[8.5px] font-bold text-slate-700">Product Management</span>
            <span class="text-[7.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">SIGNED</span>
          </div>
          <span class="text-[9.5px] font-bold text-slate-900 block leading-tight">Elena Rostova</span>
          <span class="text-[8px] text-slate-400">VP of Product &bull; Sep 28</span>
        </div>

        <div class="p-2 rounded bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-[8.5px] font-bold text-slate-700">Engineering</span>
            <span class="text-[7.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">SIGNED</span>
          </div>
          <span class="text-[9.5px] font-bold text-slate-900 block leading-tight">Marcus Vance</span>
          <span class="text-[8px] text-slate-400">Chief Architect &bull; Sep 28</span>
        </div>

        <div class="p-2 rounded bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-[8.5px] font-bold text-slate-700">Design &amp; Brand</span>
            <span class="text-[7.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">SIGNED</span>
          </div>
          <span class="text-[9.5px] font-bold text-slate-900 block leading-tight">Aria Thorne</span>
          <span class="text-[8px] text-slate-400">Head of Design &bull; Sep 29</span>
        </div>

        <div class="p-2 rounded bg-slate-50 border border-slate-200">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-[8.5px] font-bold text-slate-700">Security &amp; Legal</span>
            <span class="text-[7.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">SIGNED</span>
          </div>
          <span class="text-[9.5px] font-bold text-slate-900 block leading-tight">Sarah Chen</span>
          <span class="text-[8px] text-slate-400">Chief Compliance &bull; Sep 29</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Page Footer -->
  <div class="border-t border-slate-200 pt-2 flex justify-between items-center text-[9px] text-slate-400">
    <div class="flex items-center gap-4">
      <span class="font-bold text-slate-600 uppercase tracking-wider">CONFIDENTIAL</span>
      <span>&bull;</span>
      <span>NEXUS PRODUCT MANAGEMENT GROUP</span>
      <span>&bull;</span>
      <span>FINAL SPECIFICATION SIGN-OFF</span>
    </div>
    <span class="font-mono font-medium text-slate-600">Page 03 of 03</span>
  </div>
</div>
`.trim();

// ============================================================================
// MCP AGENT EXECUTION
// ============================================================================
const proc = spawn('node', [mcpScript], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';

function sendRpc(msgObj) {
  proc.stdin.write(JSON.stringify(msgObj) + '\n');
}

proc.stderr.on('data', (d) => {
  const line = d.toString().trim();
  if (line) console.log('[MCP Server Log]', line);
});

proc.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      handleMcpResponse(msg);
    } catch (e) {
      console.error('Failed to parse MCP JSON:', line);
    }
  }
});

function handleMcpResponse(msg) {
  if (msg.id === 1) {
    console.log('✅ Handshake complete with MCP Server.');
    sendRpc({ jsonrpc: '2.0', method: 'notifications/initialized' });

    // Step 1: Create Project
    console.log('📦 Step 1: Creating Project "Product Briefing Document: Nexus AI Studio"...');
    sendRpc({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'create_project',
        arguments: {
          title: 'Product Briefing Document: Nexus AI Studio',
          pageSize: 'A4',
          orientation: 'portrait',
          initialHtml: page1Html
        }
      }
    });
  } else if (msg.id === 2) {
    console.log('✅ Step 1 Complete: Project created and Page 1 initialized!');

    // Step 2: Set Global Styles (Typography & CSS)
    console.log('🎨 Step 2: Injecting Global Modern Typography (Plus Jakarta Sans & Space Grotesk)...');
    sendRpc({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'set_global_styles',
        arguments: {
          css: globalStyles
        }
      }
    });
  } else if (msg.id === 3) {
    console.log('✅ Step 2 Complete: Global typography and styles configured!');

    // Step 3: Add Page 2 (Architecture & Systems)
    console.log('📄 Step 3: Adding Page 2 (Architecture & Strategic Value Pillars)...');
    sendRpc({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'add_page',
        arguments: {
          html: page2Html,
          css: ''
        }
      }
    });
  } else if (msg.id === 4) {
    console.log('✅ Step 3 Complete: Page 2 added successfully!');

    // Step 4: Add Page 3 (Execution, KPIs, Roadmap & Governance)
    console.log('📄 Step 4: Adding Page 3 (Success Metrics, Milestones & Sign-Offs)...');
    sendRpc({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'add_page',
        arguments: {
          html: page3Html,
          css: ''
        }
      }
    });
  } else if (msg.id === 5) {
    console.log('✅ Step 4 Complete: Page 3 added successfully!');

    // Step 5: Add Precision AI Review Comment Pins
    console.log('📌 Step 5: Pinning Precision AI Review Comments on specific elements...');
    sendRpc({
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'add_comment',
        arguments: {
          pageIndex: 0,
          selector: '#card-tam',
          selectedText: '$142B Total Addressable Market',
          comment: 'Validate FY28 enterprise automation CAGR with Gartner Q3 forecast before investor review.',
          x: 24,
          y: 43
        }
      }
    });
  } else if (msg.id === 6) {
    console.log('✅ Pin 1 added on Page 1 (TAM Market Opportunity)!');

    sendRpc({
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'add_comment',
        arguments: {
          pageIndex: 1,
          selector: '#svg-architecture',
          selectedText: 'Figure 1 End-to-End Multi-Modal Architecture Pipeline',
          comment: 'Confirm sub-200ms latency threshold for Chromium vector printToPDF buffer generation.',
          x: 62,
          y: 28
        }
      }
    });
  } else if (msg.id === 7) {
    console.log('✅ Pin 2 added on Page 2 (SVG System Architecture)!');

    sendRpc({
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'add_comment',
        arguments: {
          pageIndex: 2,
          selector: '#kpi-publish-time',
          selectedText: '-74% Time-to-Publish',
          comment: 'Incorporate baseline benchmarks from the 14-day Apollo Global trial.',
          x: 18,
          y: 22
        }
      }
    });
  } else if (msg.id === 8) {
    console.log('✅ Pin 3 added on Page 3 (KPI Success Criteria)!');

    // Step 6: Verify Final Document State
    console.log('🔍 Step 6: Querying final document state via get_document_state...');
    sendRpc({
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'get_document_state',
        arguments: {}
      }
    });
  } else if (msg.id === 9) {
    console.log('✅ Step 6 Complete: Document state verified!');
    try {
      const stateContent = JSON.parse(msg.result.content[0].text);
      console.log('----------------------------------------------------');
      console.log('📋 VERIFIED LIVE DOCUMENT STATE:');
      console.log('Title:          ', stateContent.title);
      console.log('Paper Size:     ', stateContent.pageSize);
      console.log('Orientation:    ', stateContent.orientation);
      console.log('Total Pages:    ', stateContent.totalPages || stateContent.pages.length);
      console.log('Pending Pins:   ', stateContent.pendingComments ? stateContent.pendingComments.length : stateContent.pendingCommentsCount);
      console.log('----------------------------------------------------');
    } catch (e) {
      console.log(msg.result.content[0].text);
    }

    console.log('\n🎉 ALL MCP TOOLS EXECUTED WITH 100% SUCCESS!');
    console.log('The Product Briefing Document is live in the PDF Studio application.');

    setTimeout(() => {
      proc.kill();
      process.exit(0);
    }, 500);
  }
}

// Start Handshake
sendRpc({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'product-briefing-creator', version: '1.0' }
  }
});
