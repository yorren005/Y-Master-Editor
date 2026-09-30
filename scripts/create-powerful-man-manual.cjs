const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const mcpScript = path.join(__dirname, '..', 'electron', 'mcp-server.cjs');

console.log('📖 Generating "The Sovereign Man" Field Manual with SVG figures and diagrams...');

const proc = spawn('node', [mcpScript], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';

function sendRpc(msgObj) {
  proc.stdin.write(JSON.stringify(msgObj) + '\n');
}

// ==========================================
// PAGE 1: Masthead & The Sovereign Matrix
// ==========================================
const page1Html = `
<div class="h-full flex flex-col justify-between p-12 bg-[#fcfaf7] text-[#1c221d] font-sans selection:bg-[#8e511b] selection:text-white border-l-4 border-[#8e511b]">
  <div>
    <!-- Top Monograph Header -->
    <div class="flex justify-between items-center border-b border-[#b6a48c]/30 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded bg-[#1c221d] text-[#fbf9f5] flex items-center justify-center font-serif font-bold text-sm shadow-sm">
          SM
        </div>
        <div>
          <span class="text-[10px] font-bold text-[#8e511b] uppercase tracking-[0.2em] block">DOCTRINE &bull; CODE 01-SOV</span>
          <span class="text-xs text-[#6e6352] font-medium">Applied Human Mastery Series</span>
        </div>
      </div>
      <div class="text-right">
        <span class="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#423b28]/10 text-[#423b28] border border-[#b6a48c]/40 uppercase tracking-widest">
          Field Manual
        </span>
      </div>
    </div>

    <!-- Title Block -->
    <div class="mt-8 mb-6">
      <h1 class="text-4xl font-serif text-[#1c221d] tracking-tight leading-tight">
        The Sovereign Man: Principles of Internal Command &amp; Gravitas
      </h1>
      <p class="mt-3 text-sm text-[#6e6352] font-light leading-relaxed max-w-2xl">
        A structured tactical manual on cultivating emotional non-reactivity, physical presence, strategic silence, and decisive execution in an era of hyper-distraction.
      </p>
    </div>

    <!-- Highlight Quote Banner -->
    <div class="p-4 bg-[#f4f0e8] border-l-2 border-[#8e511b] rounded-r-md mb-6">
      <p class="text-xs font-serif italic text-[#2b352d] leading-relaxed">
        &ldquo;A powerful man is never loud; he is an anchor. When chaos overwhelms the perimeter, his stillness establishes the frame and restores order.&rdquo;
      </p>
    </div>

    <!-- FIGURE 1: The Sovereign Coordinate Matrix (SVG) -->
    <div class="p-5 bg-white border border-[#b6a48c]/30 rounded-lg shadow-sm">
      <div class="flex justify-between items-center mb-3">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#8e511b]"></span>
          <span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider">Figure 1.1 &bull; The Sovereign Coordinate Matrix</span>
        </div>
        <span class="text-[10px] text-[#8a6b4c] font-mono">Axis: Reactivity vs. Competence</span>
      </div>

      <svg viewBox="0 0 700 240" class="w-full h-auto text-xs" style="max-height: 220px;">
        <!-- Axes -->
        <line x1="350" y1="20" x2="350" y2="220" stroke="#b6a48c" stroke-width="1.5" stroke-dasharray="4,4"/>
        <line x1="50" y1="120" x2="650" y2="120" stroke="#b6a48c" stroke-width="1.5" stroke-dasharray="4,4"/>

        <!-- Axis Labels -->
        <text x="350" y="14" text-anchor="middle" fill="#8e511b" font-weight="700" font-size="10" letter-spacing="1">▲ HIGH STRATEGIC LEVERAGE</text>
        <text x="350" y="235" text-anchor="middle" fill="#6e6352" font-size="9">▼ LOW COMPETENCE</text>
        <text x="50" y="115" text-anchor="start" fill="#2b352d" font-weight="700" font-size="10">◄ LOW REACTIVITY (SOVEREIGN)</text>
        <text x="650" y="115" text-anchor="end" fill="#8e511b" font-weight="700" font-size="10">HIGH REACTIVITY (FRAGILE) ►</text>

        <!-- Quadrant I (Top Left): The Sovereign Master -->
        <rect x="70" y="30" width="260" height="75" rx="6" fill="#2b352d" fill-opacity="0.06" stroke="#2b352d" stroke-width="1.5"/>
        <circle cx="90" cy="50" r="5" fill="#8e511b"/>
        <text x="105" y="53" fill="#1c221d" font-weight="700" font-size="12">THE SOVEREIGN LEADER</text>
        <text x="105" y="70" fill="#6e6352" font-size="10">Unshakable poise, supreme competence.</text>
        <text x="105" y="86" fill="#8e511b" font-size="9" font-weight="600">Commands silence &bull; High leverage</text>

        <!-- Quadrant II (Top Right): The Volatile Operator -->
        <rect x="370" y="30" width="260" height="75" rx="6" fill="#f4f0e8" stroke="#b6a48c" stroke-width="1"/>
        <circle cx="390" cy="50" r="5" fill="#d39e6a"/>
        <text x="405" y="53" fill="#1c221d" font-weight="700" font-size="12">THE VOLATILE OPERATOR</text>
        <text x="405" y="70" fill="#6e6352" font-size="10">High skill, easily provoked by slights.</text>
        <text x="405" y="86" fill="#8a6b4c" font-size="9">Vulnerable to ego traps &bull; Leaks power</text>

        <!-- Quadrant III (Bottom Left): The Passive Stoic -->
        <rect x="70" y="135" width="260" height="70" rx="6" fill="#f4f0e8" stroke="#b6a48c" stroke-width="1"/>
        <circle cx="90" cy="155" r="5" fill="#b6a48c"/>
        <text x="105" y="158" fill="#1c221d" font-weight="700" font-size="12">THE PASSIVE OBSERVER</text>
        <text x="105" y="174" fill="#6e6352" font-size="10">Calm but lacks agency or drive.</text>
        <text x="105" y="190" fill="#8a6b4c" font-size="9">Harmless &bull; Overlooked in conflict</text>

        <!-- Quadrant IV (Bottom Right): The Reactive Victim -->
        <rect x="370" y="135" width="260" height="70" rx="6" fill="#8e511b" fill-opacity="0.05" stroke="#8e511b" stroke-width="1" stroke-dasharray="2,2"/>
        <circle cx="390" cy="155" r="5" fill="#8e511b" fill-opacity="0.5"/>
        <text x="405" y="158" fill="#8e511b" font-weight="700" font-size="12">THE CHAOTIC REACTIVE</text>
        <text x="405" y="174" fill="#6e6352" font-size="10">Loud, insecure, desperate for approval.</text>
        <text x="405" y="190" fill="#8e511b" font-size="9">Zero discipline &bull; Fully manipulated</text>
      </svg>
    </div>

    <!-- Comparative Contrast Grid -->
    <div class="grid grid-cols-2 gap-4 mt-6">
      <div class="p-3.5 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#8e511b] tracking-wider block mb-1">Axiom I: Verbal Economy</span>
        <p class="text-xs text-[#423b28] leading-relaxed">
          Weakness over-explains and seeks consensus. Strength speaks in declarative, deliberate sentences and is completely comfortable with pauses.
        </p>
      </div>
      <div class="p-3.5 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#2b352d] tracking-wider block mb-1">Axiom II: The Internal Locus</span>
        <p class="text-xs text-[#423b28] leading-relaxed">
          Never blame external storms. The sovereign man accepts total accountability for his territory, his state of mind, and his strategic countermeasures.
        </p>
      </div>
    </div>
  </div>

  <!-- Page Footer -->
  <div class="border-t border-[#b6a48c]/30 pt-3 flex justify-between items-center text-[11px] text-[#8a6b4c]">
    <span>The Sovereign Man &bull; Part I: Core Matrix</span>
    <span class="font-mono font-medium text-[#1c221d]">Page 01 / 03</span>
  </div>
</div>
`.trim();

// ==========================================
// PAGE 2: Physiology & Postural Vector
// ==========================================
const page2Html = `
<div class="h-full flex flex-col justify-between p-12 bg-[#fcfaf7] text-[#1c221d] font-sans border-l-4 border-[#2b352d]">
  <div>
    <!-- Section Header -->
    <div class="flex justify-between items-end border-b border-[#b6a48c]/30 pb-3 mb-6">
      <div>
        <span class="text-[10px] font-bold text-[#8e511b] uppercase tracking-[0.2em] block">PART II &bull; BIOMECHANICS &amp; SOMATIC COMMAND</span>
        <h2 class="text-3xl font-serif text-[#1c221d] mt-1">The Physiology of Presence</h2>
      </div>
      <span class="text-xs text-[#6e6352] font-mono">Endocrine &bull; Posture &bull; Voice</span>
    </div>

    <!-- FIGURE 2: The Bioenergetic Feedback Loop (SVG Flowchart) -->
    <div class="p-5 bg-white border border-[#b6a48c]/30 rounded-lg shadow-sm mb-6">
      <div class="flex justify-between items-center mb-3">
        <span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider">Figure 2.1 &bull; The Somatic Feedback Loop of Gravitas</span>
        <span class="text-[10px] text-[#8e511b] font-mono">Parasympathetic Regulation</span>
      </div>

      <svg viewBox="0 0 700 130" class="w-full h-auto text-xs" style="max-height: 125px;">
        <!-- Flow Boxes -->
        <!-- Step 1 -->
        <rect x="10" y="20" width="140" height="85" rx="5" fill="#f4f0e8" stroke="#b6a48c" stroke-width="1.2"/>
        <text x="80" y="42" text-anchor="middle" fill="#8e511b" font-weight="700" font-size="10">01. POSTURAL ROOT</text>
        <text x="80" y="62" text-anchor="middle" fill="#1c221d" font-size="9">Cervical elongation</text>
        <text x="80" y="78" text-anchor="middle" fill="#6e6352" font-size="9">Depressed scapulae</text>
        <text x="80" y="94" text-anchor="middle" fill="#8a6b4c" font-size="8">Grounding force</text>

        <!-- Arrow 1 -> 2 -->
        <path d="M 155 62 L 180 62" stroke="#8e511b" stroke-width="2" marker-end="url(#arrowhead)"/>

        <!-- Step 2 -->
        <rect x="185" y="20" width="145" height="85" rx="5" fill="#fcfaf7" stroke="#2b352d" stroke-width="1.2"/>
        <text x="257" y="42" text-anchor="middle" fill="#2b352d" font-weight="700" font-size="10">02. DIAPHRAGMATIC</text>
        <text x="257" y="62" text-anchor="middle" fill="#1c221d" font-size="9">4s inhale / 6s exhale</text>
        <text x="257" y="78" text-anchor="middle" fill="#6e6352" font-size="9">Vagal nerve tone</text>
        <text x="257" y="94" text-anchor="middle" fill="#8a6b4c" font-size="8">Heart-rate slowdown</text>

        <!-- Arrow 2 -> 3 -->
        <path d="M 335 62 L 360 62" stroke="#8e511b" stroke-width="2"/>

        <!-- Step 3 -->
        <rect x="365" y="20" width="145" height="85" rx="5" fill="#f4f0e8" stroke="#b6a48c" stroke-width="1.2"/>
        <text x="437" y="42" text-anchor="middle" fill="#8e511b" font-weight="700" font-size="10">03. BIOCHEMICAL</text>
        <text x="437" y="62" text-anchor="middle" fill="#1c221d" font-size="9">Cortisol reduction</text>
        <text x="437" y="78" text-anchor="middle" fill="#6e6352" font-size="9">Prefrontal clarity</text>
        <text x="437" y="94" text-anchor="middle" fill="#8a6b4c" font-size="8">Dopaminergic baseline</text>

        <!-- Arrow 3 -> 4 -->
        <path d="M 515 62 L 540 62" stroke="#8e511b" stroke-width="2"/>

        <!-- Step 4 -->
        <rect x="545" y="20" width="145" height="85" rx="5" fill="#2b352d" stroke="#2b352d" stroke-width="1.2"/>
        <text x="617" y="42" text-anchor="middle" fill="#fbf9f5" font-weight="700" font-size="10">04. VOCAL GRAVITY</text>
        <text x="617" y="62" text-anchor="middle" fill="#d3c6b5" font-size="9">Low chest resonance</text>
        <text x="617" y="78" text-anchor="middle" fill="#b6a48c" font-size="9">Downward intonation</text>
        <text x="617" y="94" text-anchor="middle" fill="#fbf9f5" font-size="8">Natural command</text>
      </svg>
    </div>

    <!-- FIGURE 3: The 3-Second Sovereign Pause Architecture -->
    <div class="p-5 bg-white border border-[#b6a48c]/30 rounded-lg shadow-sm mb-6">
      <span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider block mb-3">
        Figure 2.2 &bull; The Sovereign De-escalation Protocol (When Provoked or Challenged)
      </span>

      <div class="grid grid-cols-4 gap-3">
        <div class="p-3 bg-[#fcfaf7] border border-[#b6a48c]/30 rounded text-center">
          <span class="text-xs font-mono font-bold text-[#8e511b] block">T + 0.0s</span>
          <span class="text-xs font-bold text-[#1c221d] block mt-1">Stimulus Received</span>
          <p class="text-[10px] text-[#6e6352] mt-1">Disrespect, insult, or acute crisis hits.</p>
        </div>
        <div class="p-3 bg-[#f4f0e8] border border-[#8e511b]/40 rounded text-center shadow-xs">
          <span class="text-xs font-mono font-bold text-[#8e511b] block">T + 1.0s</span>
          <span class="text-xs font-bold text-[#8e511b] block mt-1">Somatic Stillness</span>
          <p class="text-[10px] text-[#423b28] mt-1">Freeze fidgeting. Zero facial flinch.</p>
        </div>
        <div class="p-3 bg-[#fcfaf7] border border-[#b6a48c]/30 rounded text-center">
          <span class="text-xs font-mono font-bold text-[#2b352d] block">T + 2.0s</span>
          <span class="text-xs font-bold text-[#2b352d] block mt-1">Motive Decouple</span>
          <p class="text-[10px] text-[#6e6352] mt-1">Identify opponent insecurity &amp; bait.</p>
        </div>
        <div class="p-3 bg-[#2b352d] text-white rounded text-center">
          <span class="text-xs font-mono font-bold text-[#d39e6a] block">T + 3.0s</span>
          <span class="text-xs font-bold text-[#fbf9f5] block mt-1">Sovereign Delivery</span>
          <p class="text-[10px] text-[#b6a48c] mt-1">Slow, measured, conclusive response.</p>
        </div>
      </div>
    </div>

    <!-- Physical Ground Rules -->
    <div class="grid grid-cols-3 gap-4">
      <div class="p-4 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#8e511b] tracking-wider block mb-1">I. Gaze Equilibrium</span>
        <p class="text-xs text-[#423b28] leading-relaxed">
          Never break eye contact downwards; looking down signals subservience. Hold contact until the exchange concludes, then look away horizontally.
        </p>
      </div>
      <div class="p-4 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#423b28] tracking-wider block mb-1">II. Spatial Stillness</span>
        <p class="text-xs text-[#423b28] leading-relaxed">
          Nervous men touch their face, shift their weight, and fidget with rings or phones. A powerful man claims his chair like a carved granite monolith.
        </p>
      </div>
      <div class="p-4 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#2b352d] tracking-wider block mb-1">III. Ending Pitch</span>
        <p class="text-xs text-[#423b28] leading-relaxed">
          End statements on an auditory cadence of downward pitch. Upward inflections frame declarative assertions as questions pleading for permission.
        </p>
      </div>
    </div>
  </div>

  <!-- Page Footer -->
  <div class="border-t border-[#b6a48c]/30 pt-3 flex justify-between items-center text-[11px] text-[#8a6b4c]">
    <span>The Sovereign Man &bull; Part II: Physiology &amp; Command</span>
    <span class="font-mono font-medium text-[#1c221d]">Page 02 / 03</span>
  </div>
</div>
`.trim();

// ==========================================
// PAGE 3: Strategic Moats & The Iron Rules
// ==========================================
const page3Html = `
<div class="h-full flex flex-col justify-between p-12 bg-[#fcfaf7] text-[#1c221d] font-sans border-l-4 border-[#423b28]">
  <div>
    <!-- Section Header -->
    <div class="flex justify-between items-end border-b border-[#b6a48c]/30 pb-3 mb-6">
      <div>
        <span class="text-[10px] font-bold text-[#8e511b] uppercase tracking-[0.2em] block">PART III &bull; STRATEGIC ARCHITECTURE &amp; CODES</span>
        <h2 class="text-3xl font-serif text-[#1c221d] mt-1">Tactical Moats &amp; Daily Protocols</h2>
      </div>
      <span class="text-xs text-[#6e6352] font-mono">Execution &bull; Moats &bull; Code</span>
    </div>

    <!-- FIGURE 4: The 3 Concentric Moats of Personal Sovereignty (SVG Diagram) -->
    <div class="p-5 bg-white border border-[#b6a48c]/30 rounded-lg shadow-sm mb-6">
      <div class="flex justify-between items-center mb-3">
        <span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider">Figure 3.1 &bull; The Concentric Circles of Sovereign Sovereignty</span>
        <span class="text-[10px] text-[#8a6b4c] font-mono">Locus of Focus</span>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <!-- Circle 1 -->
        <div class="p-4 rounded-lg bg-[#2b352d] text-white flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#8e511b]"></span>
              <span class="text-xs font-bold uppercase tracking-wider text-[#d39e6a]">Inner Core: 100% Will</span>
            </div>
            <h4 class="text-sm font-serif font-bold text-[#fbf9f5] mb-2">The Sovereign Domain</h4>
            <p class="text-[11px] text-[#b6a48c] leading-relaxed">
              Your physical exertion, emotional discipline, integrity of promises, diet, sleep, and mastery of speech. Where 90% of your energy belongs.
            </p>
          </div>
          <div class="mt-4 pt-2 border-t border-[#b6a48c]/20 text-[10px] font-mono text-[#d3c6b5]">
            Target: Flawless Discipline
          </div>
        </div>

        <!-- Circle 2 -->
        <div class="p-4 rounded-lg bg-[#f4f0e8] border border-[#b6a48c]/30 text-[#1c221d] flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#423b28]"></span>
              <span class="text-xs font-bold uppercase tracking-wider text-[#423b28]">Middle Band: Leverage</span>
            </div>
            <h4 class="text-sm font-serif font-bold text-[#1c221d] mb-2">The Influence Zone</h4>
            <p class="text-[11px] text-[#6e6352] leading-relaxed">
              Your reputation, financial capital, tactical alliances, negotiation frame, and market indispensability. Built through consistent demonstration.
            </p>
          </div>
          <div class="mt-4 pt-2 border-t border-[#b6a48c]/20 text-[10px] font-mono text-[#8a6b4c]">
            Target: Strategic Position
          </div>
        </div>

        <!-- Circle 3 -->
        <div class="p-4 rounded-lg bg-[#fcfaf7] border border-[#b6a48c]/20 text-[#6e6352] flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#b6a48c]"></span>
              <span class="text-xs font-bold uppercase tracking-wider text-[#8a6b4c]">Outer Void: Zero Care</span>
            </div>
            <h4 class="text-sm font-serif font-bold text-[#1c221d] mb-2">The Indifference Zone</h4>
            <p class="text-[11px] text-[#6e6352] leading-relaxed">
              Public chatter, critics who risk nothing, cultural fads, unfair circumstance, and bad weather. Deserves absolute zero emotional expenditure.
            </p>
          </div>
          <div class="mt-4 pt-2 border-t border-[#b6a48c]/20 text-[10px] font-mono text-[#8a6b4c]">
            Target: Total Non-Attachment
          </div>
        </div>
      </div>
    </div>

    <!-- The 6 Iron Commandments -->
    <div class="p-5 bg-white border border-[#b6a48c]/30 rounded-lg shadow-sm">
      <span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider block mb-3">
        Figure 3.2 &bull; The Six Inviolable Decrees of the Sovereign Code
      </span>

      <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-xs text-[#2b352d]">
        <div class="flex items-start gap-2.5">
          <span class="font-mono font-bold text-[#8e511b]">I.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Never Complain in Public</span>
            <p class="text-[11px] text-[#6e6352] leading-tight">Complaining broadcasts helplessness and advertises your weaknesses to predatory competitors.</p>
          </div>
        </div>

        <div class="flex items-start gap-2.5">
          <span class="font-mono font-bold text-[#8e511b]">II.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Under-Promise; Over-Execute</span>
            <p class="text-[11px] text-[#6e6352] leading-tight">Let your deeds speak with volcanic force while your advance claims remain whisper-quiet.</p>
          </div>
        </div>

        <div class="flex items-start gap-2.5">
          <span class="font-mono font-bold text-[#8e511b]">III.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Cultivate Comfort in Pure Silence</span>
            <p class="text-[11px] text-[#6e6352] leading-tight">Weakness rushes to fill quiet air. The powerful man lets silence breathe until others reveal their hand.</p>
          </div>
        </div>

        <div class="flex items-start gap-2.5">
          <span class="font-mono font-bold text-[#8e511b]">IV.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Heavy Physical Resistance</span>
            <p class="text-[11px] text-[#6e6352] leading-tight">A mind cannot inhabit true gravitas if the flesh is weak, frail, soft, and unaccustomed to strain.</p>
          </div>
        </div>

        <div class="flex items-start gap-2.5">
          <span class="font-mono font-bold text-[#8e511b]">V.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Guard Your Calendar with Aggression</span>
            <p class="text-[11px] text-[#6e6352] leading-tight">If you do not prioritize your time, others will happily spend it solving their own emergencies.</p>
          </div>
        </div>

        <div class="flex items-start gap-2.5">
          <span class="font-mono font-bold text-[#8e511b]">VI.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Absolute Ownership of Chaos</span>
            <p class="text-[11px] text-[#6e6352] leading-tight">When a crisis strikes your team or family, claim the fault first and lead the evacuation without drama.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Page Footer -->
  <div class="border-t border-[#b6a48c]/30 pt-3 flex justify-between items-center text-[11px] text-[#8a6b4c]">
    <span>The Sovereign Man &bull; Part III: Strategic Moats &amp; Codes</span>
    <span class="font-mono font-medium text-[#1c221d]">Page 03 / 03</span>
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
      console.log('✅ Handshake complete. Spawning "The Sovereign Man" project via MCP...');
      sendRpc({ jsonrpc: '2.0', method: 'notifications/initialized' });

      // Step 2: Create Project with Page 1
      sendRpc({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'create_project',
          arguments: {
            title: 'The Sovereign Man: Principles of Command',
            pageSize: 'A4',
            orientation: 'portrait',
            initialHtml: page1Html
          }
        }
      });
    } else if (msg.id === 2) {
      console.log('✅ Page 1 (The Sovereign Coordinate Matrix) Created!');

      // Step 3: Add Page 2
      sendRpc({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'add_page',
          arguments: {
            html: page2Html
          }
        }
      });
    } else if (msg.id === 3) {
      console.log('✅ Page 2 (Physiology of Presence & Somatic Loop) Added!');

      // Step 4: Add Page 3
      sendRpc({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'add_page',
          arguments: {
            html: page3Html
          }
        }
      });
    } else if (msg.id === 4) {
      console.log('✅ Page 3 (Strategic Moats & The Inviolable Code) Added!');

      // Step 5: Add sample precision pins
      sendRpc({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'add_comment',
          arguments: {
            pageIndex: 0,
            selector: '#figure-matrix',
            selectedText: 'Figure 1.1 The Sovereign Coordinate Matrix',
            comment: 'Highlight Quadrant I with a bold Autumn Rust accent outline',
            x: 48,
            y: 36
          }
        }
      });
    } else if (msg.id === 5) {
      console.log('✅ Sample Pin Comment 1 pinned on Page 1!');

      sendRpc({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'add_comment',
          arguments: {
            pageIndex: 1,
            selector: 'Figure 2.1 The Somatic Feedback Loop',
            selectedText: 'Vocal Gravity',
            comment: 'Add footnote detailing diaphragmatic breathing cadence (4s in, 6s out) for vocal resonance',
            x: 75,
            y: 42
          }
        }
      });
    } else if (msg.id === 6) {
      console.log('✅ Sample Pin Comment 2 pinned on Page 2!');
      console.log('\n🎉 THE SOVEREIGN MAN MANUAL HAS BEEN GENERATED WITH 100% SUCCESS!');

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
    clientInfo: { name: 'sovereign-manual-generator', version: '1.0' }
  }
});
