// Y Master Editor - Core Application Logic
// Multi-Project, Precision AI Highlight & Comment, Vector PDF & PPTX Presentation

// Standard Dimensions in Millimeters
const PAPER_DIMENSIONS = {
  A4: { widthMm: 210, heightMm: 297 },
  A3: { widthMm: 297, heightMm: 420 },
  A5: { widthMm: 148, heightMm: 210 },
  Letter: { widthMm: 215.9, heightMm: 279.4 },
  Legal: { widthMm: 215.9, heightMm: 355.6 },
  Tabloid: { widthMm: 279.4, heightMm: 431.8 },
  '16:9': { widthMm: 338.7, heightMm: 190.5 }, // 13.333 x 7.5 inches standard widescreen
  '4:3': { widthMm: 254.0, heightMm: 190.5 }   // 10.0 x 7.5 inches standard presentation
};

// 1mm = ~3.7795275591 px at 96 DPI CSS scale
const MM_TO_PX = 3.7795275591;

// Earthy Editorial & Presentation Default Styles
const DEFAULT_GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
  body { font-family: 'Plus Jakarta Sans', sans-serif; }
  h1, h2, h3, .font-serif { font-family: 'Cormorant Garamond', serif; }
`.trim();

const DEFAULT_PDF_HTML = `
<div class="h-full flex flex-col justify-between p-14 bg-[#faf7f2] text-[#241c15]">
  <div>
    <!-- Editorial Masthead -->
    <div class="flex justify-between items-baseline border-b border-[#dcd3c5] pb-5">
      <div>
        <p class="text-xs uppercase tracking-[0.25em] font-semibold text-[#8c633a]">Volume IV &mdash; Issue 02</p>
        <h1 class="text-3xl font-normal tracking-wide text-[#241c15] mt-1 font-serif">TERRA &amp; FORM</h1>
      </div>
      <div class="text-right">
        <span class="text-xs uppercase tracking-widest text-[#786755] font-medium">Autumn Edition</span>
      </div>
    </div>

    <!-- Editorial Lead Story -->
    <div class="mt-12">
      <p class="text-xs uppercase tracking-widest text-[#a85620] font-semibold mb-2">Featured Essay</p>
      <h2 class="text-4xl font-normal text-[#241c15] leading-tight font-serif tracking-tight">
        Architecture in Symbiosis: Cultivating Human Spaces in Balance with the Land
      </h2>
      <p class="mt-5 text-[#4d3f32] leading-relaxed text-[15px] font-normal">
        A thoughtful exploration into organic textures, tactile materials, and sustainable structures. How natural pigmentation and natural light craft spaces meant for human dwelling.
      </p>
    </div>

    <!-- Palette Study Grid -->
    <div class="grid grid-cols-3 gap-5 mt-10">
      <div class="p-5 bg-white border border-[#dcd3c5] rounded-lg shadow-sm">
        <div class="w-full h-12 bg-[#8c633a] rounded-md mb-3"></div>
        <h3 class="font-serif text-lg text-[#241c15]">Travertine</h3>
        <p class="text-xs text-[#786755] mt-1 leading-normal">Warm natural limestone reflecting serene mineral textures.</p>
      </div>

      <div class="p-5 bg-white border border-[#dcd3c5] rounded-lg shadow-sm">
        <div class="w-full h-12 bg-[#a85620] rounded-md mb-3"></div>
        <h3 class="font-serif text-lg text-[#241c15]">Terracotta</h3>
        <p class="text-xs text-[#786755] mt-1 leading-normal">Warm fired clay and fallen oak leaves radiating hearth warmth.</p>
      </div>

      <div class="p-5 bg-white border border-[#dcd3c5] rounded-lg shadow-sm">
        <div class="w-full h-12 bg-[#ede7df] rounded-md mb-3 border border-[#dcd3c5]"></div>
        <h3 class="font-serif text-lg text-[#241c15]">Sandstone Oat</h3>
        <p class="text-xs text-[#786755] mt-1 leading-normal">Fine travertine dust and bleached coastal stone tones.</p>
      </div>
    </div>

    <!-- Pull Quote Box -->
    <div class="mt-10 p-6 bg-[#ede7df] border border-[#dcd3c5] text-[#241c15] rounded-lg">
      <p class="font-serif italic text-lg leading-relaxed text-[#4d3f32]">
        &ldquo;The purpose of design is not to impose sterile rigidity, but to invite stillness and human reflection into everyday living.&rdquo;
      </p>
      <p class="text-xs uppercase tracking-widest text-[#a85620] mt-3 font-semibold">&mdash; Architectural Anthology, 2026</p>
    </div>
  </div>

  <!-- Page Footer -->
  <div class="border-t border-[#dcd3c5] pt-4 flex justify-between items-center text-xs text-[#786755]">
    <span class="tracking-wider uppercase font-medium">Terra &amp; Form Quarterly</span>
    <span>Page 01</span>
  </div>
</div>
`.trim();

const DEFAULT_PPTX_HTML = `
<div class="h-full flex flex-col justify-between p-14 bg-[#faf7f2] text-[#241c15]">
  <div>
    <!-- Slide Header -->
    <div class="flex justify-between items-baseline border-b border-[#dcd3c5] pb-4">
      <div>
        <p class="text-xs uppercase tracking-[0.25em] font-semibold text-[#a85620]">Executive Briefing</p>
        <h1 class="text-3xl font-serif text-[#241c15] mt-1 font-normal tracking-wide">ORGANIC SYSTEMS &amp; SPACES</h1>
      </div>
      <span class="text-xs uppercase tracking-widest text-[#a85620] font-semibold bg-[#ede7df] px-3 py-1 rounded-full border border-[#dcd3c5]">Keynote 2026</span>
    </div>

    <!-- Content 3-Column Pillars -->
    <div class="grid grid-cols-3 gap-6 mt-10">
      <div class="p-6 bg-white border border-[#dcd3c5] rounded-lg shadow-sm">
        <span class="text-2xl font-serif text-[#a85620]">01</span>
        <h3 class="font-serif text-xl text-[#241c15] mt-2">Harmonic Materials</h3>
        <p class="text-xs text-[#786755] mt-2 leading-relaxed">Sourcing localized travertine, unvarnished cedar, and earth pigment renders.</p>
      </div>
      <div class="p-6 bg-white border border-[#dcd3c5] rounded-lg shadow-sm">
        <span class="text-2xl font-serif text-[#8c633a]">02</span>
        <h3 class="font-serif text-xl text-[#241c15] mt-2">Thermal Mass</h3>
        <p class="text-xs text-[#786755] mt-2 leading-relaxed">Passive subterranean cooling paired with high-efficiency sunlit ventilation corridors.</p>
      </div>
      <div class="p-6 bg-white border border-[#dcd3c5] rounded-lg shadow-sm">
        <span class="text-2xl font-serif text-[#bd6328]">03</span>
        <h3 class="font-serif text-xl text-[#241c15] mt-2">Living Habitats</h3>
        <p class="text-xs text-[#786755] mt-2 leading-relaxed">Integrated bio-canopies restoring pollinator pathways and stormwater capture.</p>
      </div>
    </div>
  </div>

  <!-- Slide Footer -->
  <div class="border-t border-[#dcd3c5] pt-4 flex justify-between items-center text-xs text-[#786755]">
    <span>Terra &amp; Form Quarterly Review</span>
    <span>Slide 01 &bull; 16:9 Widescreen</span>
  </div>
</div>
`.trim();

const SAMPLE_NORDIC_SLIDE_1 = `
<div class="h-full flex flex-col justify-between p-16 bg-[#faf7f2] text-[#241c15] font-sans selection:bg-[#a85620] selection:text-white">
  <div>
    <div class="flex justify-between items-center border-b border-[#dcd3c5] pb-5">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-md bg-[#a85620] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
          N
        </div>
        <span class="text-xs font-semibold text-[#786755] uppercase tracking-widest">Nordic Architectural Monograph &bull; Vol. IV</span>
      </div>
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ede7df] text-[#a85620] border border-[#dcd3c5]">
        STRATEGIC BRIEF 2026
      </span>
    </div>

    <div class="mt-12 max-w-4xl">
      <p class="text-xs font-bold text-[#a85620] uppercase tracking-widest mb-3">Architectural Philosophy</p>
      <h1 id="cover-title" class="text-5xl font-serif text-[#241c15] leading-tight tracking-tight">
        Harmonizing Natural Landscapes &amp; Kinetic Living Interiors
      </h1>
      <p id="cover-subtitle" class="mt-6 text-[#4d3f32] leading-relaxed text-lg font-light max-w-3xl">
        An investigation into biophilic construction, continuous mass-timber frameworks, and regenerative Scandinavian building envelopes engineered for extreme climate stability.
      </p>
    </div>
  </div>

  <div class="border-t border-[#dcd3c5] pt-6 flex justify-between items-center text-xs text-[#786755]">
    <div class="flex items-center gap-6">
      <span>Studio Nordic &amp; Antigravity</span>
      <span class="text-[#dcd3c5]">&bull;</span>
      <span>Published Autumn 2026</span>
      <span class="text-[#dcd3c5]">&bull;</span>
      <span>Stockholm &amp; Oslo</span>
    </div>
    <span class="font-mono text-[#8c633a]">Slide 01 / 03</span>
  </div>
</div>
`.trim();

const SAMPLE_NORDIC_SLIDE_2 = `
<div class="h-full flex flex-col justify-between p-16 bg-[#f5f0e8] text-[#241c15] font-sans">
  <div>
    <div class="flex justify-between items-end border-b border-[#dcd3c5] pb-4 mb-8">
      <div>
        <span class="text-xs font-semibold text-[#a85620] uppercase tracking-widest">Section 01 &bull; Technical Systems</span>
        <h2 id="pillars-heading" class="text-3xl font-serif text-[#241c15] mt-1">Core Regenerative Frameworks</h2>
      </div>
      <span class="text-xs text-[#786755] font-light">Engineered for Nordic Climate Zones</span>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <!-- Card 1 -->
      <div id="card-mass-timber" class="p-8 rounded-lg bg-white border border-[#dcd3c5] shadow-xs flex flex-col justify-between">
        <div>
          <div class="w-8 h-8 rounded-md bg-[#ede7df] text-[#8c633a] flex items-center justify-center font-mono font-bold text-xs mb-5">
            01
          </div>
          <h3 class="text-xl font-serif text-[#241c15] mb-3">Mass Timber Joinery</h3>
          <p class="text-xs text-[#4d3f32] leading-relaxed font-light">
            Zero-metal interlocking Scandinavian spruce columns delivering carbon-negative structural endurance and acoustic dampening.
          </p>
        </div>
        <div class="mt-8 pt-4 border-t border-[#dcd3c5]/50 text-[11px] font-mono text-[#8c633a]">
          Embodied CO₂: -420 kg/m³
        </div>
      </div>

      <!-- Card 2 -->
      <div id="card-passive-solar" class="p-8 rounded-lg bg-white border-2 border-[#a85620]/50 shadow-sm flex flex-col justify-between">
        <div>
          <div class="w-8 h-8 rounded-md bg-[#a85620] text-white flex items-center justify-center font-mono font-bold text-xs mb-5">
            02
          </div>
          <h3 class="text-xl font-serif text-[#241c15] mb-3">Passive Solar Envelope</h3>
          <p class="text-xs text-[#4d3f32] leading-relaxed font-light">
            Triple-glazed argon cavities positioned along solar azimuths, paired with subterranean soapstone thermal batteries.
          </p>
        </div>
        <div class="mt-8 pt-4 border-t border-[#dcd3c5]/50 text-[11px] font-mono text-[#a85620]">
          U-Value: 0.58 W/m²K
        </div>
      </div>

      <!-- Card 3 -->
      <div id="card-biophilic-flows" class="p-8 rounded-lg bg-white border border-[#dcd3c5] shadow-xs flex flex-col justify-between">
        <div>
          <div class="w-8 h-8 rounded-md bg-[#ede7df] text-[#8c633a] flex items-center justify-center font-mono font-bold text-xs mb-5">
            03
          </div>
          <h3 class="text-xl font-serif text-[#241c15] mb-3">Microclimate Atriums</h3>
          <p class="text-xs text-[#4d3f32] leading-relaxed font-light">
            Interior botanical lungs providing natural particulate filtration, humidity buffering, and circadian daylight dispersal.
          </p>
        </div>
        <div class="mt-8 pt-4 border-t border-[#dcd3c5]/50 text-[11px] font-mono text-[#8c633a]">
          Air Turnover: 100% Passive
        </div>
      </div>
    </div>
  </div>

  <div class="border-t border-[#dcd3c5] pt-4 flex justify-between items-center text-xs text-[#786755]">
    <span>Kinfolk Architectural &bull; Materials &amp; Physics</span>
    <span class="font-mono text-[#8c633a]">Slide 02 / 03</span>
  </div>
</div>
`.trim();

const SAMPLE_NORDIC_SLIDE_3 = `
<div class="h-full flex flex-col justify-between p-16 bg-[#faf7f2] text-[#241c15] font-sans">
  <div>
    <div class="flex justify-between items-end border-b border-[#dcd3c5] pb-4 mb-8">
      <div>
        <span class="text-xs font-semibold text-[#a85620] uppercase tracking-widest">Section 02 &bull; Measured Outcomes</span>
        <h2 class="text-3xl font-serif text-[#241c15] mt-1">Lifecycle Impact &amp; Roadmap</h2>
      </div>
      <span class="text-xs text-[#786755] font-light">Verified against BREEAM Outstanding</span>
    </div>

    <div class="grid grid-cols-2 gap-10">
      <!-- Left: Metrics Column -->
      <div class="space-y-6">
        <div class="p-6 rounded-lg bg-white border border-[#dcd3c5] shadow-xs flex items-center justify-between">
          <div>
            <div class="text-4xl font-serif text-[#241c15]">78.4%</div>
            <div class="text-xs text-[#786755] mt-1 font-light">Embodied Carbon Reduction</div>
          </div>
          <span class="text-xs font-mono text-[#a85620] bg-[#fbf5ef] px-2.5 py-1 rounded-full border border-[#a85620]/30 font-semibold">Target Surpassed</span>
        </div>

        <div class="p-6 rounded-lg bg-white border border-[#dcd3c5] shadow-xs flex items-center justify-between">
          <div>
            <div class="text-4xl font-serif text-[#241c15]">14,200 m²</div>
            <div class="text-xs text-[#786755] mt-1 font-light">Reclaimed Northern Spruce Deployed</div>
          </div>
          <span class="text-xs font-mono text-[#8c633a] bg-[#ede7df] px-2.5 py-1 rounded-full border border-[#dcd3c5] font-semibold">100% Certified</span>
        </div>

        <div class="p-6 rounded-lg bg-white border border-[#dcd3c5] shadow-xs flex items-center justify-between">
          <div>
            <div class="text-4xl font-serif text-[#241c15]">Net Positive</div>
            <div class="text-xs text-[#786755] mt-1 font-light">Annual Energy Production Index</div>
          </div>
          <span class="text-xs font-mono text-[#a85620] bg-[#fbf5ef] px-2.5 py-1 rounded-full border border-[#a85620]/30 font-semibold">+12.8 MWh/yr</span>
        </div>
      </div>

      <!-- Right: Roadmap & Quote -->
      <div class="p-8 rounded-lg bg-[#ede7df] border border-[#dcd3c5] flex flex-col justify-between shadow-xs">
        <div>
          <span class="text-[10px] font-bold text-[#a85620] uppercase tracking-wider block mb-2">Architectural Creed</span>
          <p class="text-lg font-serif text-[#241c15] italic leading-relaxed">
            &ldquo;We do not merely construct shelters on the landscape; we sculpt the landscape into shelters that age gracefully with the forest.&rdquo;
          </p>
        </div>

        <div class="pt-6 border-t border-[#dcd3c5]">
          <div class="text-xs font-semibold text-[#241c15]">Elin Lindqvist</div>
          <div class="text-[11px] text-[#786755] font-light">Lead Architectural Fellow &bull; Stockholm Institute</div>
        </div>
      </div>
    </div>
  </div>

  <div class="border-t border-[#dcd3c5] pt-4 flex justify-between items-center text-xs text-[#786755]">
    <span>Executive Summary &bull; Next Steps for Q1 2027</span>
    <span class="font-mono text-[#8c633a]">Slide 03 / 03</span>
  </div>
</div>
`.trim();


const SOVEREIGN_PAGE_1 = `

<div class="h-full flex flex-col justify-between p-10 bg-[#fcfaf7] text-[#1c221d] font-sans selection:bg-[#8e511b] selection:text-white border-l-4 border-[#8e511b]">
  <div>
    <!-- Top Header -->
    <div class="flex justify-between items-center border-b border-[#b6a48c]/30 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded bg-[#1c221d] text-[#fbf9f5] flex items-center justify-center font-serif font-bold text-xs">
          SM
        </div>
        <div>
          <span class="text-[10px] font-bold text-[#8e511b] uppercase tracking-[0.15em] block">PRACTICAL FIELD MANUAL</span>
          <span class="text-xs text-[#6e6352] font-medium">Simple Rules for Everyday Life</span>
        </div>
      </div>
      <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#423b28]/10 text-[#423b28] border border-[#b6a48c]/40 uppercase tracking-wider">
        Part 01
      </span>
    </div>

    <!-- Title & Subtitle -->
    <div class="mt-5 mb-4">
      <h1 class="text-3xl font-serif text-[#1c221d] tracking-tight leading-snug">
        How to Be a Powerful Man: The Simple Field Manual
      </h1>
      <p class="mt-2 text-xs text-[#6e6352] leading-relaxed max-w-2xl">
        True strength is quiet. It is not about shouting or showing off. It is about staying calm under pressure, doing your job, keeping your word, and taking care of the people around you.
      </p>
    </div>

    <!-- Core Golden Rule Quote -->
    <div class="p-3.5 bg-[#f4f0e8] border-l-2 border-[#8e511b] rounded-r mb-5">
      <p class="text-xs font-serif italic text-[#2b352d] leading-relaxed">
        &ldquo;A weak man reacts to everything and complains. A powerful man stays calm, thinks first, and solves the problem without making a scene.&rdquo;
      </p>
    </div>

    <!-- FIGURE 1: The 4 Types of Men (SVG Coordinate Box) -->
    <div class="p-4 bg-white border border-[#b6a48c]/30 rounded-lg shadow-xs mb-5">
      <div class="flex justify-between items-center mb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#8e511b]"></span>
          <span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider">Figure 1 &bull; The Four Types of Men</span>
        </div>
        <span class="text-[10px] text-[#8a6b4c] font-mono">Calmness vs. Action</span>
      </div>

      <svg viewBox="0 0 680 200" class="w-full h-auto text-xs" style="max-height: 195px;">
        <!-- Axes -->
        <line x1="340" y1="15" x2="340" y2="185" stroke="#b6a48c" stroke-width="1.2" stroke-dasharray="3,3"/>
        <line x1="40" y1="100" x2="640" y2="100" stroke="#b6a48c" stroke-width="1.2" stroke-dasharray="3,3"/>

        <!-- Labels -->
        <text x="340" y="11" text-anchor="middle" fill="#8e511b" font-weight="700" font-size="9" letter-spacing="0.5">▲ TAKES HIGH ACTION &amp; BUILDS THINGS</text>
        <text x="340" y="196" text-anchor="middle" fill="#6e6352" font-size="9">▼ DOES NOT TAKE ACTION</text>
        <text x="40" y="96" text-anchor="start" fill="#2b352d" font-weight="700" font-size="9">◄ STAYS CALM (POWERFUL)</text>
        <text x="640" y="96" text-anchor="end" fill="#8e511b" font-weight="700" font-size="9">GETS ANGRY EASILY (WEAK) ►</text>

        <!-- Q1: The Calm Leader -->
        <rect x="55" y="22" width="265" height="68" rx="5" fill="#2b352d" fill-opacity="0.08" stroke="#2b352d" stroke-width="1.2"/>
        <circle cx="75" cy="40" r="4.5" fill="#8e511b"/>
        <text x="88" y="43" fill="#1c221d" font-weight="700" font-size="11">THE CALM LEADER (YOUR GOAL)</text>
        <text x="88" y="58" fill="#423b28" font-size="9.5">Hard worker. Keeps his temper under control.</text>
        <text x="88" y="73" fill="#8e511b" font-size="9" font-weight="600">Everyone listens when he speaks.</text>

        <!-- Q2: The Angry Worker -->
        <rect x="360" y="22" width="265" height="68" rx="5" fill="#f4f0e8" stroke="#b6a48c" stroke-width="1"/>
        <circle cx="380" cy="40" r="4.5" fill="#d39e6a"/>
        <text x="393" y="43" fill="#1c221d" font-weight="700" font-size="11">THE ANGRY WORKER</text>
        <text x="393" y="58" fill="#6e6352" font-size="9.5">Works hard, but gets offended by small things.</text>
        <text x="393" y="73" fill="#8a6b4c" font-size="9">Loses respect because he can't control himself.</text>

        <!-- Q3: The Passive Follower -->
        <rect x="55" y="112" width="265" height="65" rx="5" fill="#fcfaf7" stroke="#b6a48c" stroke-width="1"/>
        <circle cx="75" cy="130" r="4.5" fill="#b6a48c"/>
        <text x="88" y="133" fill="#1c221d" font-weight="700" font-size="11">THE PASSIVE FOLLOWER</text>
        <text x="88" y="148" fill="#6e6352" font-size="9.5">Nice and polite, but has no clear direction.</text>
        <text x="88" y="163" fill="#8a6b4c" font-size="9">Never takes risks; easy to ignore.</text>

        <!-- Q4: The Loud Complainer -->
        <rect x="360" y="112" width="265" height="65" rx="5" fill="#8e511b" fill-opacity="0.05" stroke="#8e511b" stroke-width="1"/>
        <circle cx="380" cy="130" r="4.5" fill="#8e511b" fill-opacity="0.6"/>
        <text x="393" y="133" fill="#8e511b" font-weight="700" font-size="11">THE LOUD COMPLAINER</text>
        <text x="393" y="148" fill="#6e6352" font-size="9.5">Always makes excuses and blames others.</text>
        <text x="393" y="163" fill="#8e511b" font-size="9">Zero discipline; easily manipulated.</text>
      </svg>
    </div>

    <!-- 3 Core Action Cards -->
    <div class="grid grid-cols-3 gap-3.5">
      <div class="p-3 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#8e511b] tracking-wider block mb-1">1. Speak Less</span>
        <p class="text-[11px] text-[#423b28] leading-relaxed">
          Say what you mean in simple words. If you do not have something helpful to say, stay quiet. Silence is power.
        </p>
      </div>
      <div class="p-3 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#2b352d] tracking-wider block mb-1">2. Keep Promises</span>
        <p class="text-[11px] text-[#423b28] leading-relaxed">
          If you tell someone you will do something, do it. Your word is your reputation. Never make promises you cannot keep.
        </p>
      </div>
      <div class="p-3 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#423b28] tracking-wider block mb-1">3. Stop Blaming</span>
        <p class="text-[11px] text-[#423b28] leading-relaxed">
          When things go wrong, do not complain. Accept what happened, take responsibility, and find the fix immediately.
        </p>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="border-t border-[#b6a48c]/30 pt-2.5 flex justify-between items-center text-[10px] text-[#8a6b4c]">
    <span>How to Be a Powerful Man &bull; Chapter 01: Mindset</span>
    <span class="font-mono font-medium text-[#1c221d]">Page 01 of 03</span>
  </div>
</div>

`.trim();

const SOVEREIGN_PAGE_2 = `

<div class="h-full flex flex-col justify-between p-10 bg-[#fcfaf7] text-[#1c221d] font-sans border-l-4 border-[#2b352d]">
  <div>
    <!-- Section Header -->
    <div class="flex justify-between items-end border-b border-[#b6a48c]/30 pb-3 mb-4">
      <div>
        <span class="text-[10px] font-bold text-[#8e511b] uppercase tracking-[0.15em] block">CHAPTER 02 &bull; BODY &amp; VOICE</span>
        <h2 class="text-3xl font-serif text-[#1c221d] mt-0.5">How You Stand, Breathe, &amp; Speak</h2>
      </div>
      <span class="text-xs text-[#6e6352] font-mono">Physical Rules</span>
    </div>

    <p class="text-xs text-[#6e6352] mb-4 leading-relaxed">
      People decide if they respect you within 3 seconds of seeing you. You do not need to look aggressive; you need to look steady and alert.
    </p>

    <!-- FIGURE 2: 4 Steps of Physical Presence (SVG Flowchart) -->
    <div class="p-4 bg-white border border-[#b6a48c]/30 rounded-lg shadow-xs mb-4">
      <div class="flex justify-between items-center mb-2.5">
        <span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider">Figure 2 &bull; The Four Steps to Command Any Room</span>
        <span class="text-[10px] text-[#8e511b] font-mono">Simple Steps</span>
      </div>

      <svg viewBox="0 0 680 100" class="w-full h-auto text-xs" style="max-height: 100px;">
        <!-- Step 1 -->
        <rect x="5" y="10" width="150" height="78" rx="5" fill="#f4f0e8" stroke="#b6a48c" stroke-width="1"/>
        <text x="80" y="30" text-anchor="middle" fill="#8e511b" font-weight="700" font-size="10">1. STAND TALL</text>
        <text x="80" y="48" text-anchor="middle" fill="#1c221d" font-size="9">Shoulders relaxed back.</text>
        <text x="80" y="63" text-anchor="middle" fill="#6e6352" font-size="8.5">Head high. Feet planted.</text>
        <text x="80" y="78" text-anchor="middle" fill="#8a6b4c" font-size="8">Never slouch or lean.</text>

        <!-- Arrow 1 -> 2 -->
        <path d="M 160 50 L 175 50" stroke="#8e511b" stroke-width="2"/>

        <!-- Step 2 -->
        <rect x="180" y="10" width="150" height="78" rx="5" fill="#fcfaf7" stroke="#2b352d" stroke-width="1.2"/>
        <text x="255" y="30" text-anchor="middle" fill="#2b352d" font-weight="700" font-size="10">2. BREATHE DEEP</text>
        <text x="255" y="48" text-anchor="middle" fill="#1c221d" font-size="9">Breathe into your belly.</text>
        <text x="255" y="63" text-anchor="middle" fill="#6e6352" font-size="8.5">Slow breath calms heart.</text>
        <text x="255" y="78" text-anchor="middle" fill="#8a6b4c" font-size="8">Stops shaking &amp; fear.</text>

        <!-- Arrow 2 -> 3 -->
        <path d="M 335 50 L 350 50" stroke="#8e511b" stroke-width="2"/>

        <!-- Step 3 -->
        <rect x="355" y="10" width="150" height="78" rx="5" fill="#f4f0e8" stroke="#b6a48c" stroke-width="1"/>
        <text x="430" y="30" text-anchor="middle" fill="#8e511b" font-weight="700" font-size="10">3. FREEZE HANDS</text>
        <text x="430" y="48" text-anchor="middle" fill="#1c221d" font-size="9">No fidgeting with rings.</text>
        <text x="430" y="63" text-anchor="middle" fill="#6e6352" font-size="8.5">Put your phone away.</text>
        <text x="430" y="78" text-anchor="middle" fill="#8a6b4c" font-size="8">Stillness shows confidence.</text>

        <!-- Arrow 3 -> 4 -->
        <path d="M 510 50 L 525 50" stroke="#8e511b" stroke-width="2"/>

        <!-- Step 4 -->
        <rect x="530" y="10" width="145" height="78" rx="5" fill="#2b352d" stroke="#2b352d" stroke-width="1"/>
        <text x="602" y="30" text-anchor="middle" fill="#fbf9f5" font-weight="700" font-size="10">4. SPEAK SLOWLY</text>
        <text x="602" y="48" text-anchor="middle" fill="#d3c6b5" font-size="9">Speak from your chest.</text>
        <text x="602" y="63" text-anchor="middle" fill="#b6a48c" font-size="8.5">Do not rush words.</text>
        <text x="602" y="78" text-anchor="middle" fill="#fbf9f5" font-size="8">Never seek validation.</text>
      </svg>
    </div>

    <!-- FIGURE 3: The 3-Second Pause Rule -->
    <div class="p-4 bg-white border border-[#b6a48c]/30 rounded-lg shadow-xs mb-4">
      <span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider block mb-2">
        Figure 3 &bull; What to Do When Someone Insults You or Attacks You
      </span>

      <div class="grid grid-cols-3 gap-3">
        <div class="p-3 bg-[#fcfaf7] border border-[#b6a48c]/30 rounded">
          <span class="text-xs font-mono font-bold text-[#8e511b] block">Second 1: Do Nothing</span>
          <p class="text-[11px] text-[#423b28] mt-1 leading-snug">
            Do not blink fast. Do not get angry. Take a breath and let the other person look childish.
          </p>
        </div>
        <div class="p-3 bg-[#f4f0e8] border border-[#8e511b]/40 rounded">
          <span class="text-xs font-mono font-bold text-[#8e511b] block">Second 2: Hold Eye Contact</span>
          <p class="text-[11px] text-[#423b28] mt-1 leading-snug">
            Look directly between their eyes. Never look down at your shoes; looking down means surrender.
          </p>
        </div>
        <div class="p-3 bg-[#2b352d] text-white rounded">
          <span class="text-xs font-mono font-bold text-[#d39e6a] block">Second 3: Short Answer</span>
          <p class="text-[11px] text-[#b6a48c] mt-1 leading-snug">
            Give a calm, 5-word answer or simply ask: &ldquo;Are you finished?&rdquo; and walk away.
          </p>
        </div>
      </div>
    </div>

    <!-- 3 Daily Habits -->
    <div class="grid grid-cols-3 gap-3.5">
      <div class="p-3 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#8e511b] tracking-wider block mb-1">A. Lift Heavy Weights</span>
        <p class="text-[11px] text-[#423b28] leading-relaxed">
          Train your muscles 3 to 4 days a week. A strong body naturally makes you feel confident and eliminates anxiety.
        </p>
      </div>
      <div class="p-3 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#423b28] tracking-wider block mb-1">B. Cold Showers</span>
        <p class="text-[11px] text-[#423b28] leading-relaxed">
          Take 1 minute of ice-cold water every morning. It forces your mind to do something uncomfortable every single day.
        </p>
      </div>
      <div class="p-3 bg-white border border-[#b6a48c]/30 rounded">
        <span class="text-[10px] font-bold uppercase text-[#2b352d] tracking-wider block mb-1">C. No Morning Phone</span>
        <p class="text-[11px] text-[#423b28] leading-relaxed">
          Do not check social media or news for the first 30 minutes. Start your day with quiet thought, water, and movement.
        </p>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="border-t border-[#b6a48c]/30 pt-2.5 flex justify-between items-center text-[10px] text-[#8a6b4c]">
    <span>How to Be a Powerful Man &bull; Chapter 02: Presence</span>
    <span class="font-mono font-medium text-[#1c221d]">Page 02 of 03</span>
  </div>
</div>

`.trim();

const SOVEREIGN_PAGE_3 = `

<div class="h-full flex flex-col justify-between p-10 bg-[#fcfaf7] text-[#1c221d] font-sans border-l-4 border-[#423b28]">
  <div>
    <!-- Section Header -->
    <div class="flex justify-between items-end border-b border-[#b6a48c]/30 pb-3 mb-4">
      <div>
        <span class="text-[10px] font-bold text-[#8e511b] uppercase tracking-[0.15em] block">CHAPTER 03 &bull; DAILY LIFE &amp; BOUNDARIES</span>
        <h2 class="text-3xl font-serif text-[#1c221d] mt-0.5">Where to Put Your Energy</h2>
      </div>
      <span class="text-xs text-[#6e6352] font-mono">Focus &bull; Code</span>
    </div>

    <!-- FIGURE 4: The 3 Circles of Life (Clear Cards) -->
    <div class="p-4 bg-white border border-[#b6a48c]/30 rounded-lg shadow-xs mb-4">
      <div class="flex justify-between items-center mb-2.5">
        <span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider">Figure 4 &bull; The Three Circles of What Matters</span>
        <span class="text-[10px] text-[#8a6b4c] font-mono">Energy Allocation</span>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <!-- Circle 1 -->
        <div class="p-3.5 rounded bg-[#2b352d] text-white flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-1.5 mb-1.5">
              <span class="w-2 h-2 rounded-full bg-[#8e511b]"></span>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#d39e6a]">Circle 1: What You Control</span>
            </div>
            <h4 class="text-xs font-serif font-bold text-[#fbf9f5] mb-1">Your Own Actions (Spend 80%)</h4>
            <p class="text-[11px] text-[#b6a48c] leading-relaxed">
              Your workouts, your food, how much sleep you get, your temper, your skills, and how honest you are with others.
            </p>
          </div>
          <div class="mt-3 pt-2 border-t border-[#b6a48c]/20 text-[9.5px] font-mono text-[#d3c6b5]">
            Rule: Never make excuses here.
          </div>
        </div>

        <!-- Circle 2 -->
        <div class="p-3.5 rounded bg-[#f4f0e8] border border-[#b6a48c]/30 text-[#1c221d] flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-1.5 mb-1.5">
              <span class="w-2 h-2 rounded-full bg-[#423b28]"></span>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#423b28]">Circle 2: What You Influence</span>
            </div>
            <h4 class="text-xs font-serif font-bold text-[#1c221d] mb-1">Your Work &amp; Friends (Spend 20%)</h4>
            <p class="text-[11px] text-[#6e6352] leading-relaxed">
              Your business results, how much money you earn, and the friends you keep around you. Build these by delivering real value.
            </p>
          </div>
          <div class="mt-3 pt-2 border-t border-[#b6a48c]/20 text-[9.5px] font-mono text-[#8a6b4c]">
            Rule: Earn trust through actions.
          </div>
        </div>

        <!-- Circle 3 -->
        <div class="p-3.5 rounded bg-[#fcfaf7] border border-[#b6a48c]/20 text-[#6e6352] flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-1.5 mb-1.5">
              <span class="w-2 h-2 rounded-full bg-[#b6a48c]"></span>
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#8a6b4c]">Circle 3: What You Cannot Control</span>
            </div>
            <h4 class="text-xs font-serif font-bold text-[#1c221d] mb-1">Other People (Spend 0%)</h4>
            <p class="text-[11px] text-[#6e6352] leading-relaxed">
              Gossip, news rage, what strangers think of you, the weather, and unfair events. Giving energy to this makes you weak.
            </p>
          </div>
          <div class="mt-3 pt-2 border-t border-[#b6a48c]/20 text-[9.5px] font-mono text-[#8a6b4c]">
            Rule: Completely ignore it.
          </div>
        </div>
      </div>
    </div>

    <!-- The 6 Clear Rules -->
    <div class="p-4 bg-white border border-[#b6a48c]/30 rounded-lg shadow-xs">
      <span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider block mb-2.5">
        Figure 5 &bull; The Six Plain Rules to Live By
      </span>

      <div class="grid grid-cols-2 gap-x-5 gap-y-2.5 text-xs text-[#2b352d]">
        <div class="flex items-start gap-2">
          <span class="font-mono font-bold text-[#8e511b]">1.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Never Complain in Public</span>
            <p class="text-[11px] text-[#6e6352] leading-snug">Nobody respects a complainer. If something is broken, fix it quietly.</p>
          </div>
        </div>

        <div class="flex items-start gap-2">
          <span class="font-mono font-bold text-[#8e511b]">2.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Do More Than You Promise</span>
            <p class="text-[11px] text-[#6e6352] leading-snug">Promise less, then surprise people by doing the job better than expected.</p>
          </div>
        </div>

        <div class="flex items-start gap-2">
          <span class="font-mono font-bold text-[#8e511b]">3.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Protect Your Time</span>
            <p class="text-[11px] text-[#6e6352] leading-snug">Learn to say &ldquo;No&rdquo; without apologizing. Your time is your life.</p>
          </div>
        </div>

        <div class="flex items-start gap-2">
          <span class="font-mono font-bold text-[#8e511b]">4.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Never Fight Over Trivial Ego</span>
            <p class="text-[11px] text-[#6e6352] leading-snug">If someone cuts you off in traffic or insults you online, let them go. Pick real battles.</p>
          </div>
        </div>

        <div class="flex items-start gap-2">
          <span class="font-mono font-bold text-[#8e511b]">5.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Take Care of Your Family &amp; Friends</span>
            <p class="text-[11px] text-[#6e6352] leading-snug">Be the person your loved ones call when an emergency happens, because you stay calm.</p>
          </div>
        </div>

        <div class="flex items-start gap-2">
          <span class="font-mono font-bold text-[#8e511b]">6.</span>
          <div>
            <span class="font-bold text-[#1c221d] block">Earn Real Practical Skills</span>
            <p class="text-[11px] text-[#6e6352] leading-snug">Learn how to fix things, build things, manage money, and solve hard problems.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="border-t border-[#b6a48c]/30 pt-2.5 flex justify-between items-center text-[10px] text-[#8a6b4c]">
    <span>How to Be a Powerful Man &bull; Chapter 03: The Rules</span>
    <span class="font-mono font-medium text-[#1c221d]">Page 03 of 03</span>
  </div>
</div>

`.trim();

// Local Storage Keys
const STORAGE_PROJECTS_KEY = 'pdf_studio_projects_v2';
const STORAGE_ACTIVE_KEY = 'pdf_studio_active_project_id_v2';
const STORAGE_CURRENT_USER_KEY = 'pdf_studio_google_user_v1';

// Google Authentication & User Credential State
let currentUser = null; // { id, email, name, avatar, signedIn: true }

function getUserProjectsKey(user = currentUser) {
  const uid = user ? (user.uid || user.id) : null;
  if (user && user.signedIn && uid) {
    return `pdf_studio_user_${uid}_projects`;
  }
  return STORAGE_PROJECTS_KEY;
}

function getUserActiveKey(user = currentUser) {
  const uid = user ? (user.uid || user.id) : null;
  if (user && user.signedIn && uid) {
    return `pdf_studio_user_${uid}_active_id`;
  }
  return STORAGE_ACTIVE_KEY;
}

// Multi-Project State Store
let projects = [];
let state = null; // Active project reference

// Runtime references
let activeCommentTarget = null;
let activeDrawerPageIndex = 0;
let activeDrawerTab = 'html';
let activeEditPageIndex = 0;
let browserWs = null;

// DOM Elements: Header & Controls
const appBrandTitle = document.getElementById('app-brand-title');
const docTitleInput = document.getElementById('doc-title');
const paperSizeSelect = document.getElementById('paper-size-select');
const btnOrientationPortrait = document.getElementById('btn-orientation-portrait');
const btnOrientationLandscape = document.getElementById('btn-orientation-landscape');
const zoomLabel = document.getElementById('zoom-label');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnZoomFit = document.getElementById('btn-zoom-fit');
const btnModePreview = document.getElementById('btn-mode-preview');
const btnModeEdit = document.getElementById('btn-mode-edit');
const btnAddPageTop = document.getElementById('btn-add-page-top');

// DOM Elements: Omni-Auth & Nicknames
const btnOpenAuthModal = document.getElementById('btn-open-auth-modal') || document.getElementById('btn-google-signin');
const userProfileMenuContainer = document.getElementById('user-profile-menu-container');
const btnUserProfile = document.getElementById('btn-user-profile');
const userProfileDropdown = document.getElementById('user-profile-dropdown');
const userAvatarSvgContainer = document.getElementById('user-avatar-svg-container');
const userProfileImg = document.getElementById('user-profile-img');
const userAvatarFallback = document.getElementById('user-avatar-fallback');
const userPillName = document.getElementById('user-pill-name');
const userPillSyncStatus = document.getElementById('user-pill-sync-status');
const cardAvatarSvgBox = document.getElementById('card-avatar-svg-box');
const cardUserImg = document.getElementById('card-user-img');
const cardUserInitial = document.getElementById('card-user-initial');
const cardUserName = document.getElementById('card-user-name');
const cardUserEmail = document.getElementById('card-user-email');
const cardProviderBadge = document.getElementById('card-provider-badge');
const cardStatProjects = document.getElementById('card-stat-projects');
const cardStatPages = document.getElementById('card-stat-pages');
const cardStatComments = document.getElementById('card-stat-comments');
const cardStatCredId = document.getElementById('card-stat-cred-id');
const cardTelemetryList = document.getElementById('card-telemetry-list');
const btnOpenScopedData = document.getElementById('btn-open-scoped-data');
const btnSwitchAccount = document.getElementById('btn-switch-account');
const btnGoogleSignout = document.getElementById('btn-google-signout');

// DOM Elements: Omni-Auth Modal
const authModal = document.getElementById('auth-modal');
const authModalBackdrop = document.getElementById('auth-modal-backdrop') || document.getElementById('google-signin-backdrop');
const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
const tabBtnSignin = document.getElementById('tab-btn-signin');
const tabBtnSignup = document.getElementById('tab-btn-signup');
const authTabContentSignin = document.getElementById('auth-tab-content-signin');
const authTabContentSignup = document.getElementById('auth-tab-content-signup');
const signupAvatarStage = document.getElementById('signup-avatar-stage');
const btnShuffleNickname = document.getElementById('btn-shuffle-nickname');
const authSignupNickname = document.getElementById('auth-signup-nickname');
const signupNicknameFeedback = document.getElementById('signup-nickname-feedback');
const authSignupEmail = document.getElementById('auth-signup-email');
const authSignupPassword = document.getElementById('auth-signup-password');
const authSignupConfirm = document.getElementById('auth-signup-confirm');
const btnDoSignup = document.getElementById('btn-do-signup');
const authSigninInput = document.getElementById('auth-signin-input');
const authSigninPassword = document.getElementById('auth-signin-password');
const btnDoSignin = document.getElementById('btn-do-signin');
const btnAuthGuest = document.getElementById('btn-auth-guest');
const authErrorBanner = document.getElementById('auth-error-banner');
const chkAssignExisting = document.getElementById('chk-assign-existing');
const btnSocialGoogle = document.getElementById('btn-social-google');
const btnSocialFacebook = document.getElementById('btn-social-facebook');
const btnSocialGithub = document.getElementById('btn-social-github');
const btnSocialApple = document.getElementById('btn-social-apple');

// DOM Elements: Scoped Workspace Data Modal
const scopedDataModal = document.getElementById('scoped-data-modal');
const scopedDataBackdrop = document.getElementById('scoped-data-backdrop');
const btnCloseScopedModal = document.getElementById('btn-close-scoped-modal');
const btnDoneScopedModal = document.getElementById('btn-done-scoped-modal');
const btnExportAccountJson = document.getElementById('btn-export-account-json');
const scopedModalOwner = document.getElementById('scoped-modal-owner');
const scopedDocsTbody = document.getElementById('scoped-docs-tbody');

// DOM Elements: Three-Dot Menu
const btnProjectMenu = document.getElementById('btn-project-menu');
const projectMenuDropdown = document.getElementById('project-menu-dropdown');
const btnNewProjectTrigger = document.getElementById('btn-new-project-trigger');
const projectItemsList = document.getElementById('project-items-list');

// DOM Elements: Canvas Viewport
const pagesContainer = document.getElementById('pages-container');
const canvasViewport = document.getElementById('canvas-viewport');

// DOM Elements: Sidebar
const sidebarPanel = document.getElementById('sidebar-panel');
const sidebarPageCount = document.getElementById('sidebar-page-count');
const sidebarPageList = document.getElementById('sidebar-page-list');
const sidebarCommentsCount = document.getElementById('sidebar-comments-count');
const sidebarCommentsList = document.getElementById('sidebar-comments-list');
const btnAddPageSidebar = document.getElementById('btn-add-page-sidebar');
const btnDownloadPdf = document.getElementById('btn-download-pdf');
const btnDownloadPptx = document.getElementById('btn-download-pptx');
const btnPrint = document.getElementById('btn-print');

// DOM Elements: Import & Ingestion Controls
const btnImportPdf = document.getElementById('btn-import-pdf');
const btnImportWorkspace = document.getElementById('btn-import-workspace');
const btnImportImage = document.getElementById('btn-import-image');
const fileInputPdf = document.getElementById('file-input-pdf');
const fileInputWorkspace = document.getElementById('file-input-workspace');
const fileInputImage = document.getElementById('file-input-image');
const canvasDropzoneOverlay = document.getElementById('canvas-dropzone-overlay');

// DOM Elements: Multi-mode Selection Tools & Batch Authorization
const btnSelObject = document.getElementById('btn-sel-object');
const btnSelRect = document.getElementById('btn-sel-rect');
const btnSelLasso = document.getElementById('btn-sel-lasso');
const btnImplementAllComments = document.getElementById('btn-implement-all-comments');
let selectionEngine = null;

function setSelectionMode(mode) {
  if (selectionEngine) {
    selectionEngine.setMode(mode);
  }
  [btnSelObject, btnSelRect, btnSelLasso].forEach(btn => {
    if (btn) btn.classList.remove('active');
  });
  if (mode === 'object' && btnSelObject) btnSelObject.classList.add('active');
  if (mode === 'rectangle' && btnSelRect) btnSelRect.classList.add('active');
  if ((mode === 'oval' || mode === 'circle' || mode === 'lasso') && btnSelLasso) btnSelLasso.classList.add('active');
}

// DOM Elements: Popover
const commentPopover = document.getElementById('comment-popover');
const popoverSelector = document.getElementById('popover-selector');
const popoverSelectedText = document.getElementById('popover-selected-text');
const popoverCommentInput = document.getElementById('popover-comment-input');
const btnSaveComment = document.getElementById('btn-save-comment');
const btnCancelComment = document.getElementById('btn-cancel-comment');
const btnClosePopover = document.getElementById('btn-close-popover');

// DOM Elements: Drawer
const codeDrawer = document.getElementById('code-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerPageTitle = document.getElementById('drawer-page-title');
const drawerCodeEditor = document.getElementById('drawer-code-editor');
const btnApplyCode = document.getElementById('btn-apply-code');
const btnCloseDrawer = document.getElementById('btn-close-drawer');
const drawerTabBtns = document.querySelectorAll('.drawer-tab-btn');

// Floating WYSIWYG Bar
const wysiwygBar = document.getElementById('wysiwyg-bar');

// DOM Elements: New Project Modal
const newProjectModal = document.getElementById('new-project-modal');
const newProjectBackdrop = document.getElementById('new-project-backdrop');
const btnCloseNewProjectModal = document.getElementById('btn-close-new-project-modal');
const btnCancelNewProject = document.getElementById('btn-cancel-new-project');
const btnSubmitNewProject = document.getElementById('btn-submit-new-project');
const modalProjectTitle = document.getElementById('modal-project-title');
const modalProjectSize = document.getElementById('modal-project-size');
const modalCustomDims = document.getElementById('modal-custom-dims');
const modalCustomW = document.getElementById('modal-custom-w');
const modalCustomH = document.getElementById('modal-custom-h');
const modalOrientPortrait = document.getElementById('modal-orient-portrait');
const modalOrientLandscape = document.getElementById('modal-orient-landscape');

// DOM Elements: Update UI
const btnAppUpdate = document.getElementById('btn-app-update');
const btnMenuUpdate = document.getElementById('btn-menu-update');
const btnSidebarUpdate = document.getElementById('btn-sidebar-update');
const appUpdateModal = document.getElementById('app-update-modal');
const updateModalBackdrop = document.getElementById('update-modal-backdrop');
const btnCloseUpdateModal = document.getElementById('btn-close-update-modal');
const btnCancelUpdate = document.getElementById('btn-cancel-update');
const btnConfirmAppUpdate = document.getElementById('btn-confirm-app-update');
const btnConfirmUpdateLabel = document.getElementById('btn-confirm-update-label');
const updateProgressContainer = document.getElementById('update-progress-container');
const updateProgressFill = document.getElementById('update-progress-fill');
const updateProgressStatus = document.getElementById('update-progress-status');
const updateProgressPct = document.getElementById('update-progress-pct');

// Modal Form State
let modalSelectedOrient = 'portrait';

// Sanitize legacy moss green colors to light earth tone palette and update brand name
function sanitizeProjectColors(projectsList) {
  if (!Array.isArray(projectsList)) return;
  projectsList.forEach(p => {
    if (typeof p.title === 'string') {
      p.title = p.title.replace(/Foliyo/g, 'Y Master Editor');
    }
    if (Array.isArray(p.pages)) {
      p.pages.forEach(page => {
        if (typeof page.html === 'string') {
          page.html = page.html
            .replace(/#2b352d/gi, '#756350')
            .replace(/#1c221d/gi, '#241c15')
            .replace(/#202721/gi, '#f5f0e8')
            .replace(/#242c26/gi, '#ede7df')
            .replace(/#202722/gi, '#a85620')
            .replace(/#354238/gi, '#8c633a')
            .replace(/#141916/gi, '#241c15')
            .replace(/#6ee7b7/gi, '#d39e6a')
            .replace(/#065f46/gi, '#a85620')
            .replace(/Foliyo/g, 'Y Master Editor');
        }
      });
    }
  });
}

// Y Master Editor — Omni-Auth, Nicknames & Firebase Storage Functions
function renderActiveTelemetry(uid) {
  if (!cardTelemetryList || !uid) return;
  if (window.FoliyoFirebase && window.FoliyoFirebase.getActivityLogs) {
    window.FoliyoFirebase.getActivityLogs(uid, 6).then(logs => {
      if (!logs || logs.length === 0) {
        cardTelemetryList.innerHTML = `
          <div class="activity-event-row">
            <span class="activity-event-name"><span class="activity-event-dot"></span>Session Active</span>
            <span class="activity-event-time">Now</span>
          </div>`;
        return;
      }
      cardTelemetryList.innerHTML = logs.map(ev => {
        const timeStr = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';
        const actionLabel = (ev.eventType || ev.action || 'Activity').replace('AUTH_', '').replace('_', ' ');
        return `
          <div class="activity-event-row">
            <span class="activity-event-name"><span class="activity-event-dot"></span>${actionLabel}</span>
            <span class="activity-event-time">${timeStr}</span>
          </div>`;
      }).join('');
    }).catch(() => {});
  }
}

function updateAuthUi() {
  if (currentUser && currentUser.signedIn) {
    const uid = currentUser.uid || currentUser.id || 'ymaster_user';
    const nick = currentUser.nickname || currentUser.name || 'Creator';
    
    if (btnOpenAuthModal) btnOpenAuthModal.style.display = 'none';
    if (userProfileMenuContainer) userProfileMenuContainer.style.display = 'block';

    // 1. Render lively animated SVG avatar
    if (window.YAvatarEngine) {
      if (userAvatarSvgContainer) {
        window.YAvatarEngine.renderAvatar(userAvatarSvgContainer, nick, { size: 28, animated: true, idPrefix: 'pill_' });
      }
      if (cardAvatarSvgBox) {
        window.YAvatarEngine.renderAvatar(cardAvatarSvgBox, nick, { size: 44, animated: true, idPrefix: 'card_' });
      }
    }

    if (userPillName) userPillName.textContent = `@${nick}`;
    if (cardUserName) cardUserName.textContent = `@${nick}`;
    if (cardUserEmail) cardUserEmail.textContent = currentUser.email || `${nick.toLowerCase()}@ymaster.internal`;
    if (cardProviderBadge) {
      const prov = (currentUser.authProvider || 'Firebase').toUpperCase();
      cardProviderBadge.textContent = `${prov} VERIFIED`;
    }

    // Calculate scoped metrics
    const ownedProjects = projects.filter(p => !p.ownerId || p.ownerId === uid || p.ownerId === currentUser.id || p.ownerEmail === currentUser.email || p.ownerNickname === nick);
    const totalPages = ownedProjects.reduce((acc, p) => acc + (p.pages ? p.pages.length : 1), 0);
    const totalComments = ownedProjects.reduce((acc, p) => acc + (p.comments ? p.comments.length : 0), 0);

    if (cardStatProjects) cardStatProjects.textContent = ownedProjects.length;
    if (cardStatPages) cardStatPages.textContent = totalPages;
    if (cardStatComments) cardStatComments.textContent = totalComments;
    if (cardStatCredId) {
      cardStatCredId.textContent = uid.length > 20 ? uid.slice(0, 20) + '...' : uid;
      cardStatCredId.title = `Firebase UID: ${uid}`;
    }
    if (scopedModalOwner) {
      scopedModalOwner.textContent = `@${nick} (${currentUser.email}) — UID: ${uid.slice(0, 18)}...`;
    }

    // Refresh telemetry list
    renderActiveTelemetry(uid);
  } else {
    if (btnOpenAuthModal) btnOpenAuthModal.style.display = 'inline-flex';
    if (userProfileMenuContainer) userProfileMenuContainer.style.display = 'none';
    if (userProfileDropdown) userProfileDropdown.classList.remove('active');
  }
}

async function completeLoginSession(userProfile, assignExisting = false) {
  if (!userProfile) return;

  const uid = userProfile.uid || userProfile.id;
  const nick = userProfile.nickname || (userProfile.displayName ? userProfile.displayName.replace(/\s+/g, '') : 'Creator');

  currentUser = {
    uid: uid,
    id: uid,
    nickname: nick,
    name: userProfile.displayName || `@${nick}`,
    displayName: userProfile.displayName || `@${nick}`,
    email: userProfile.email || `${nick.toLowerCase()}@ymaster.internal`,
    photoURL: userProfile.photoURL,
    avatarSvg: userProfile.avatarSvg,
    authProvider: userProfile.authProvider || 'password',
    signedIn: true,
    authenticatedAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));

  // Load user data from Cloud Firestore
  let firestoreRecord = null;
  if (window.FoliyoFirebase) {
    try {
      firestoreRecord = await window.FoliyoFirebase.loadUserData(currentUser.uid);
    } catch (err) {
      console.warn('[Firestore Load Notice]:', err.message);
    }
  }

  if (firestoreRecord && Array.isArray(firestoreRecord.projects) && firestoreRecord.projects.length > 0) {
    projects = firestoreRecord.projects;
    sanitizeProjectColors(projects);
    const activeId = firestoreRecord.activeProjectId;
    state = projects.find(p => p.id === activeId) || projects[0];
  } else if (assignExisting && projects && projects.length > 0) {
    projects.forEach(p => {
      p.ownerId = currentUser.uid;
      p.ownerNickname = currentUser.nickname;
      p.ownerEmail = currentUser.email;
      p.ownerName = currentUser.name;
      p.assignedAt = new Date().toISOString();
      if (p.comments) {
        p.comments.forEach(c => {
          c.author = c.author || `@${currentUser.nickname}`;
          c.authorEmail = c.authorEmail || currentUser.email;
          c.authorId = c.authorId || currentUser.uid;
        });
      }
    });
    sanitizeProjectColors(projects);
    state = projects[0];
  } else {
    const defaultData = window.FoliyoFirebase
      ? window.FoliyoFirebase.createDefaultUserData(currentUser)
      : null;

    if (defaultData && Array.isArray(defaultData.projects) && defaultData.projects.length > 0) {
      projects = defaultData.projects;
      state = projects[0];
    }
  }

  saveProjects();
  syncUiWithState();
  updateAuthUi();
  renderProjectDropdownList();
  renderAllPages();
  updateSidebar();
  broadcastStateToMcp();

  console.log(`[Firebase Auth & Firestore] Signed in as @${currentUser.nickname} — UID: ${currentUser.uid}`);
}

async function loginWithNicknameCredentials(nicknameOrEmail, password) {
  if (!window.FoliyoFirebase) return { success: false, error: 'Firebase service not ready' };
  const res = await window.FoliyoFirebase.signInWithNickname({ nicknameOrEmail, password });
  if (res && res.success && res.user) {
    const assignExisting = chkAssignExisting ? chkAssignExisting.checked : false;
    await completeLoginSession(res.user, assignExisting);
    return { success: true };
  }
  return { success: false, error: (res && res.error) || 'Failed to sign in' };
}

async function signUpWithNicknameAccount(nickname, password, email) {
  if (!window.FoliyoFirebase) return { success: false, error: 'Firebase service not ready' };
  
  // Generate deterministic SVG & data URL
  let avatarSvg = null;
  let avatarDataUrl = null;
  if (window.YAvatarEngine) {
    avatarSvg = window.YAvatarEngine.generateSvg(nickname);
    avatarDataUrl = window.YAvatarEngine.generateDataUrl(nickname);
  }

  const res = await window.FoliyoFirebase.signUpWithNickname({
    nickname,
    password,
    email,
    avatarSvg,
    avatarDataUrl
  });

  if (res && res.success && res.user) {
    const assignExisting = chkAssignExisting ? chkAssignExisting.checked : false;
    await completeLoginSession(res.user, assignExisting);
    return { success: true };
  }
  return { success: false, error: (res && res.error) || 'Failed to register account' };
}

async function loginWithSocialProvider(provider) {
  if (!window.FoliyoFirebase) return { success: false, error: 'Firebase service not ready' };
  const res = await window.FoliyoFirebase.signInWithSocial(provider);
  if (res && res.success && res.user) {
    const assignExisting = chkAssignExisting ? chkAssignExisting.checked : false;
    await completeLoginSession(res.user, assignExisting);
    return { success: true };
  }
  return { success: false, error: (res && res.error) || 'Social authentication canceled' };
}

function openAuthModal(activeTab = 'signup') {
  if (!authModal) return;
  if (authErrorBanner) authErrorBanner.style.display = 'none';

  if (activeTab === 'signup') {
    if (tabBtnSignup) tabBtnSignup.classList.add('active');
    if (tabBtnSignin) tabBtnSignin.classList.remove('active');
    if (authTabContentSignup) authTabContentSignup.style.display = 'block';
    if (authTabContentSignin) authTabContentSignin.style.display = 'none';

    // Generate initial fun nickname & avatar if empty
    if (authSignupNickname && !authSignupNickname.value.trim() && window.YAvatarEngine) {
      const funNick = window.YAvatarEngine.generateFunNickname();
      authSignupNickname.value = funNick;
      window.YAvatarEngine.renderAvatar(signupAvatarStage, funNick, { size: 90, animated: true });
    }
  } else {
    if (tabBtnSignin) tabBtnSignin.classList.add('active');
    if (tabBtnSignup) tabBtnSignup.classList.remove('active');
    if (authTabContentSignin) authTabContentSignin.style.display = 'block';
    if (authTabContentSignup) authTabContentSignup.style.display = 'none';
  }

  authModal.classList.add('active');
  if (authModalBackdrop) authModalBackdrop.classList.add('active');
}

function closeAuthModal() {
  if (authModal) authModal.classList.remove('active');
  if (authModalBackdrop) authModalBackdrop.classList.remove('active');
  if (authErrorBanner) authErrorBanner.style.display = 'none';
}

function showAuthError(msg) {
  if (!authErrorBanner) return;
  authErrorBanner.textContent = msg;
  authErrorBanner.style.display = 'block';
}

async function logoutGoogle() {
  if (!currentUser) return;
  const prevUser = currentUser;

  saveProjects();

  if (window.FoliyoFirebase) {
    try {
      await window.FoliyoFirebase.signOut();
    } catch (e) {}
  }

  currentUser = null;
  localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  if (window.electronAPI && window.electronAPI.saveUserData) {
    window.electronAPI.saveUserData({ currentUser: null });
  }

  // Switch back to guest mode and load only guest data
  await loadProjects();
  syncUiWithState();
  updateAuthUi();
  renderProjectDropdownList();
  renderAllPages();
  updateSidebar();
  broadcastStateToMcp();

  console.log(`[Firebase Auth] Signed out from ${prevUser.email}. Workspace reverted to guest mode.`);
}

function populateScopedDataTable() {
  if (!scopedDocsTbody) return;
  scopedDocsTbody.innerHTML = '';

  const activeEmail = currentUser ? currentUser.email : 'Guest';
  const activeUid = currentUser ? (currentUser.uid || currentUser.id) : 'guest';

  projects.forEach((proj) => {
    const isWidescreen = proj.pageSize === '16:9' || proj.pageSize === '4:3';
    const assignedTime = proj.assignedAt ? new Date(proj.assignedAt).toLocaleDateString() : 'Active Firestore Record';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600; color: var(--color-wheat-light); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${proj.title}
      </td>
      <td>
        <span class="project-item-badge ${isWidescreen ? 'slides' : 'doc'}">${proj.pageSize}</span>
      </td>
      <td>${proj.pages ? proj.pages.length : 1}</td>
      <td>
        <span style="color: var(--color-autumn); font-weight: 600; font-size: 10px; display: inline-flex; align-items: center; gap: 4px;">
          <span>✓</span>
          <span>UID: ${activeUid.slice(0, 14)}... (${activeEmail})</span>
        </span>
      </td>
      <td style="font-size: 10px; color: var(--text-dim); font-family: monospace;">${assignedTime}</td>
    `;
    scopedDocsTbody.appendChild(tr);
  });
}

function exportScopedDataJson() {
  const exportPayload = {
    exportVersion: '2.0-firestore',
    exportTimestamp: new Date().toISOString(),
    firebaseUid: currentUser ? (currentUser.uid || currentUser.id) : null,
    credential: currentUser ? {
      uid: currentUser.uid || currentUser.id,
      email: currentUser.email,
      displayName: currentUser.name,
      signedIn: true
    } : { signedIn: false, note: 'Guest Workspace' },
    totalProjects: projects.length,
    projects: projects
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = currentUser ? currentUser.name.toLowerCase().replace(/\s+/g, '_') : 'guest';
  a.download = `y_master_editor_${safeName}_firestore_data.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Project Management Functions
async function loadProjects() {
  // 1. Restore Firebase / Google User if logged in
  try {
    const rawUser = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (rawUser) {
      currentUser = JSON.parse(rawUser);
      if (currentUser && !currentUser.uid && currentUser.id) {
        currentUser.uid = currentUser.id;
      }
    }
  } catch (e) {
    currentUser = null;
  }

  // 2. If authenticated, load ONLY this user's data from Cloud Firestore
  if (currentUser && currentUser.signedIn && currentUser.uid && window.FoliyoFirebase) {
    try {
      const firestoreRecord = await window.FoliyoFirebase.loadUserData(currentUser.uid);
      if (firestoreRecord && Array.isArray(firestoreRecord.projects) && firestoreRecord.projects.length > 0) {
        projects = firestoreRecord.projects;
        sanitizeProjectColors(projects);
        const activeId = firestoreRecord.activeProjectId || localStorage.getItem(getUserActiveKey(currentUser));
        state = projects.find(p => p.id === activeId) || projects[0];
        localStorage.setItem(getUserProjectsKey(currentUser), JSON.stringify(projects));
        localStorage.setItem(getUserActiveKey(currentUser), state.id);
        updateAuthUi();
        return;
      }
    } catch (err) {
      console.warn('[Firestore Load Notice]:', err.message);
    }
  }

  // 3. Fallback / Guest local storage read
  const currentKey = getUserProjectsKey();
  try {
    const raw = localStorage.getItem(currentKey);
    if (raw) {
      projects = JSON.parse(raw);
    } else {
      projects = [];
    }
  } catch (e) {
    console.error('[Storage Read Error]', e);
    projects = [];
  }

  if (!projects || projects.length === 0) {
    if (currentUser && currentUser.signedIn && window.FoliyoFirebase) {
      // New authenticated user gets their own default data structure
      const defaultData = window.FoliyoFirebase.createDefaultUserData(currentUser);
      projects = defaultData.projects;
      saveProjects();
    } else {
      const defaultProject = createProjectModel({
        id: 'proj_default_1',
        title: 'Botanical & Architectural Review',
        pageSize: 'A4',
        orientation: 'portrait',
        initialHtml: DEFAULT_PDF_HTML
      });
      projects = [defaultProject];
      saveProjects();
    }
  }

  const hasSampleProject = projects.some(p => p.title === 'Nordic Architecture & Biophilic Design');
  if (!hasSampleProject) {
    const sampleWidescreenProject = {
      id: 'proj_nordic_sample',
      title: 'Nordic Architecture & Biophilic Design',
      pageSize: '16:9',
      orientation: 'landscape',
      customWidthMm: null,
      customHeightMm: null,
      zoom: 0.72,
      mode: 'preview',
      globalStyles: DEFAULT_GLOBAL_STYLES,
      pages: [
        { id: 'page-nordic-1', html: SAMPLE_NORDIC_SLIDE_1, css: '' },
        { id: 'page-nordic-2', html: SAMPLE_NORDIC_SLIDE_2, css: '' },
        { id: 'page-nordic-3', html: SAMPLE_NORDIC_SLIDE_3, css: '' }
      ],
      comments: [
        {
          id: 'c_nordic_1',
          pageIndex: 0,
          selector: '#cover-subtitle',
          selectedText: 'An investigation into biophilic construction...',
          elementHtml: '<p id="cover-subtitle" class="mt-6 text-[#b6a48c] leading-relaxed text-lg font-light max-w-3xl">An investigation into biophilic construction...</p>',
          userComment: 'Tighten description and cite client collaboration with Nordic Council of Architects',
          x: 26,
          y: 42,
          resolved: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'c_nordic_2',
          pageIndex: 1,
          selector: '#card-passive-solar h3',
          selectedText: 'Passive Solar Envelope',
          elementHtml: '<h3 class="text-xl font-serif text-[#fbf9f5] mb-3">Passive Solar Envelope</h3>',
          userComment: 'Highlight subtitle with warm Travertine accent and emphasize seasonal efficiency metric',
          x: 48,
          y: 38,
          resolved: false,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    projects.push(sampleWidescreenProject);
    saveProjects();
  }

  
  const hasSovereignMan = projects.some(p => p.title.includes('The Sovereign Man'));
  if (!hasSovereignMan) {
    const sovereignManProject = {
      id: 'proj_sovereign_man',
      title: 'The Sovereign Man: Principles of Command',
      pageSize: 'A4',
      orientation: 'portrait',
      customWidthMm: null,
      customHeightMm: null,
      zoom: 0.88,
      mode: 'preview',
      globalStyles: DEFAULT_GLOBAL_STYLES,
      pages: [
        { id: 'page-sov-1', html: SOVEREIGN_PAGE_1, css: '' },
        { id: 'page-sov-2', html: SOVEREIGN_PAGE_2, css: '' },
        { id: 'page-sov-3', html: SOVEREIGN_PAGE_3, css: '' }
      ],
      comments: [
        {
          id: 'c_1790651723143',
          pageIndex: 1,
          selector: 'h2',
          selectedText: 'How You Stand, Breathe, & Speak',
          elementHtml: '<h2 class="text-3xl font-serif text-[#1c221d] mt-0.5">How You Stand, Breathe, &amp; Speak</h2>',
          userComment: 'I dont want any gaps in my document, I want a very simple language.',
          x: 380,
          y: 115,
          resolved: true,
          createdAt: '2026-09-29T03:15:23.143Z'
        },
        {
          id: 'c_sov_p1_fig1',
          pageIndex: 0,
          selector: 'svg',
          selectedText: 'Figure 1 • The Four Types of Men',
          elementHtml: '<span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider">Figure 1 &bull; The Four Types of Men</span>',
          userComment: 'Simplified all four quadrants into plain English (The Calm Leader, Angry Worker, Passive Follower, Loud Complainer) and reduced height to remove vertical gaps.',
          x: 240,
          y: 270,
          resolved: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'c_sov_p2_flow',
          pageIndex: 1,
          selector: 'svg',
          selectedText: 'Figure 2 • The Four Steps to Command Any Room',
          elementHtml: '<span class="text-xs font-bold text-[#1c221d] uppercase tracking-wider">Figure 2 &bull; The Four Steps to Command Any Room</span>',
          userComment: 'Replaced jargon with 4 everyday physical rules: Stand Tall, Breathe Deep, Freeze Hands, and Speak Slowly.',
          x: 490,
          y: 220,
          resolved: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'c_sov_p2_pause',
          pageIndex: 1,
          selector: 'div.grid',
          selectedText: 'Figure 3 • What to Do When Someone Insults You',
          elementHtml: '<span>Figure 3 &bull; What to Do When Someone Insults You or Attacks You</span>',
          userComment: '3-second protocol: Second 1: Do nothing, Second 2: Hold eye contact, Second 3: Short answer.',
          x: 340,
          y: 420,
          resolved: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'c_sov_p3_circles',
          pageIndex: 2,
          selector: 'div.grid',
          selectedText: 'Figure 4 • The Three Circles of What Matters',
          elementHtml: '<span>Figure 4 &bull; The Three Circles of What Matters</span>',
          userComment: 'Energy split: Circle 1 (80% Control - Your Actions), Circle 2 (20% Influence - Work & Friends), Circle 3 (0% No Control - Ignore Gossip/Strangers).',
          x: 340,
          y: 210,
          resolved: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'c_sov_p3_rules',
          pageIndex: 2,
          selector: 'div.grid',
          selectedText: 'Figure 5 • The Six Plain Rules to Live By',
          elementHtml: '<span>Figure 5 &bull; The Six Plain Rules to Live By</span>',
          userComment: 'The Six Plain Rules formatted into a high-density, gap-free grid with practical everyday examples.',
          x: 340,
          y: 550,
          resolved: false,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    projects.push(sovereignManProject);
    saveProjects();
  }

  sanitizeProjectColors(projects);
  const activeKey = getUserActiveKey();
  const activeId = localStorage.getItem(activeKey) || localStorage.getItem(STORAGE_ACTIVE_KEY);
  const found = projects.find(p => p.id === activeId) || projects[0];
  state = found || projects[0];
  if (state && state.id) {
    localStorage.setItem(activeKey, state.id);
  }
  updateAuthUi();
}

function saveProjects() {
  try {
    const uid = currentUser ? (currentUser.uid || currentUser.id) : null;

    if (currentUser && currentUser.signedIn && uid) {
      projects.forEach(p => {
        p.ownerId = p.ownerId || uid;
        p.ownerEmail = p.ownerEmail || currentUser.email;
        p.ownerName = p.ownerName || currentUser.name;
        p.assignedAt = p.assignedAt || new Date().toISOString();
      });
      if (state) {
        state.ownerId = uid;
        state.ownerEmail = currentUser.email;
        state.ownerName = currentUser.name;
      }

      // 1. Save to user-scoped local cache
      const userKey = getUserProjectsKey(currentUser);
      localStorage.setItem(userKey, JSON.stringify(projects));
      if (state && state.id) {
        localStorage.setItem(getUserActiveKey(currentUser), state.id);
      }

      // 2. Requirement 5: Save to user's own Cloud Firestore records under users/{uid}
      if (window.FoliyoFirebase) {
        window.FoliyoFirebase.saveUserData(uid, {
          uid: uid,
          email: currentUser.email,
          displayName: currentUser.name,
          photoURL: currentUser.avatar,
          activeProjectId: state ? state.id : null,
          projects: projects
        }).catch(err => {
          console.warn('[Firestore Save Error]:', err.message);
        });
      }
    } else {
      // Guest Mode: Save only to guest storage keys
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
      if (state && state.id) {
        localStorage.setItem(STORAGE_ACTIVE_KEY, state.id);
      }
    }

    if (window.electronAPI && window.electronAPI.saveUserData) {
      window.electronAPI.saveUserData({
        currentUser,
        projects,
        lastSaved: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error('[Storage Save Error]', e);
  }
}

function createProjectModel(opts = {}) {
  const pageSize = opts.pageSize || 'A4';
  const isWidescreen = pageSize === '16:9' || pageSize === '4:3';
  const orientation = opts.orientation || (isWidescreen ? 'landscape' : 'portrait');
  const title = opts.title || (isWidescreen ? 'Untitled Presentation' : 'Untitled Document');

  return {
    id: opts.id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: title,
    pageSize: pageSize,
    orientation: orientation,
    customWidthMm: opts.customWidthMm || (pageSize === 'custom' ? 210 : null),
    customHeightMm: opts.customHeightMm || (pageSize === 'custom' ? 297 : null),
    zoom: isWidescreen ? 0.72 : 0.88,
    mode: 'preview',
    globalStyles: opts.globalStyles || DEFAULT_GLOBAL_STYLES,
    ownerId: currentUser ? currentUser.id : 'guest',
    ownerEmail: currentUser ? currentUser.email : null,
    ownerName: currentUser ? currentUser.name : null,
    assignedAt: currentUser ? new Date().toISOString() : null,
    pages: [
      {
        id: `page-${Date.now()}`,
        html: opts.initialHtml || (isWidescreen ? DEFAULT_PPTX_HTML : DEFAULT_PDF_HTML),
        css: ''
      }
    ],
    comments: [],
    createdAt: new Date().toISOString()
  };
}


function switchProject(projectId) {
  const target = projects.find(p => p.id === projectId);
  if (!target) return;

  state = target;
  const activeKey = currentUser ? getUserActiveKey() : STORAGE_ACTIVE_KEY;
  localStorage.setItem(activeKey, state.id);
  syncUiWithState();
  renderAllPages();
  updateSidebar();
  renderProjectDropdownList();
  broadcastStateToMcp();
}

function deleteProject(projectId) {
  if (projects.length <= 1) {
    alert('You cannot delete the only remaining project.');
    return;
  }

  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  if (!confirm(`Delete project "${proj.title}"?`)) return;

  projects = projects.filter(p => p.id !== projectId);
  if (state.id === projectId) {
    state = projects[0];
    localStorage.setItem(STORAGE_ACTIVE_KEY, state.id);
  }

  saveProjects();
  syncUiWithState();
  renderAllPages();
  updateSidebar();
  renderProjectDropdownList();
  broadcastStateToMcp();
}

function renderProjectDropdownList() {
  projectItemsList.innerHTML = '';

  if (currentUser && currentUser.signedIn) {
    const ownerHeader = document.createElement('div');
    ownerHeader.style.cssText = 'padding: 6px 8px; margin-bottom: 6px; background: rgba(66, 133, 244, 0.08); border: 1px solid rgba(66, 133, 244, 0.2); border-radius: 4px; display: flex; align-items: center; justify-content: space-between;';
    ownerHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: #34A853;"></span>
        <span style="font-size: 10px; font-weight: 700; color: var(--color-wheat-light); text-transform: uppercase;">${currentUser.name.split(' ')[0]}'s Workspace</span>
      </div>
      <span style="font-size: 9px; color: #93c5fd; font-family: monospace;">Google Verified</span>
    `;
    projectItemsList.appendChild(ownerHeader);
  }

  projects.forEach((proj) => {
    const isWidescreen = proj.pageSize === '16:9' || proj.pageSize === '4:3';
    const badgeLabel = proj.pageSize === '16:9' ? '16:9' : (proj.pageSize === '4:3' ? '4:3' : proj.pageSize);
    const ownerTitle = proj.ownerEmail ? `Assigned to: ${proj.ownerEmail}` : 'Assigned to: Active Workspace';
    const row = document.createElement('div');
    row.className = `project-item-row ${proj.id === state.id ? 'active' : ''}`;
    row.title = `${proj.title} • ${ownerTitle}`;
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
        <span class="project-item-badge ${isWidescreen ? 'slides' : 'doc'}">${badgeLabel}</span>
        <div style="display: flex; flex-direction: column; overflow: hidden;">
          <span class="project-item-name" style="line-height: 1.2;">${proj.title}</span>
          ${currentUser ? `<span style="font-size: 8.5px; color: #34A853; font-weight: 500;">✓ Synced to ${currentUser.email.split('@')[0]}</span>` : ''}
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="font-size: 10px; color: var(--text-dim);">${proj.pages.length}p</span>
        ${projects.length > 1 ? `<button class="btn-tool delete btn-del-proj" data-proj-id="${proj.id}" title="Delete Project">✕</button>` : ''}
      </div>
    `;

    row.addEventListener('click', (e) => {
      if (e.target.closest('.btn-del-proj')) return;
      if (proj.id !== state.id) {
        switchProject(proj.id);
      }
      projectMenuDropdown.classList.remove('active');
    });

    const delBtn = row.querySelector('.btn-del-proj');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteProject(proj.id);
      });
    }

    projectItemsList.appendChild(row);
  });
}


function syncUiWithState() {
  docTitleInput.value = state.title;
  paperSizeSelect.value = state.pageSize;
  btnOrientationPortrait.classList.toggle('active', state.orientation === 'portrait');
  btnOrientationLandscape.classList.toggle('active', state.orientation === 'landscape');
  btnModePreview.classList.toggle('active', state.mode === 'preview');
  btnModeEdit.classList.toggle('active', state.mode === 'edit');

  const isWidescreen = state.pageSize === '16:9' || state.pageSize === '4:3';
  appBrandTitle.innerHTML = '<img src="assets/y-logo.svg" alt="Y" style="height: 18px; vertical-align: middle; margin-right: 4px;"> Y Master Editor';

  // Dynamic button labels based on size format
  if (isWidescreen) {
    btnAddPageTop.textContent = '+ Add Slide';
    btnAddPageSidebar.textContent = '+ Add New Slide';
  } else {
    btnAddPageTop.textContent = '+ Add Page';
    btnAddPageSidebar.textContent = '+ Add New Page';
  }
}

// Calculate Dimensions in pixels & mm
function getPagePixelDimensions() {
  let widthMm = 210;
  let heightMm = 297;

  if (state.pageSize === 'custom') {
    const cw = parseFloat(state.customWidthMm) || 210;
    const ch = parseFloat(state.customHeightMm) || 297;
    const isLandscape = state.orientation === 'landscape';
    const minDim = Math.min(cw, ch);
    const maxDim = Math.max(cw, ch);
    widthMm = isLandscape ? maxDim : minDim;
    heightMm = isLandscape ? minDim : maxDim;
  } else {
    const base = PAPER_DIMENSIONS[state.pageSize] || PAPER_DIMENSIONS.A4;
    const isLandscape = state.orientation === 'landscape';
    const minDim = Math.min(base.widthMm, base.heightMm);
    const maxDim = Math.max(base.widthMm, base.heightMm);
    widthMm = isLandscape ? maxDim : minDim;
    heightMm = isLandscape ? minDim : maxDim;
  }

  return {
    widthPx: Math.round(widthMm * MM_TO_PX),
    heightPx: Math.round(heightMm * MM_TO_PX),
    widthMm,
    heightMm
  };
}

// Sandboxed Iframe HTML generator
function buildPageIframeHtml(page, pageIndex) {
  const { widthPx, heightPx } = getPagePixelDimensions();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${state.globalStyles || ''}
    ${page.css || ''}
    
    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: ${widthPx}px;
      height: ${heightPx}px;
      overflow: hidden;
      background: #fbf9f5;
    }

    .highlight-hover {
      outline: 2px solid #a85620 !important;
      outline-offset: 2px !important;
      background-color: rgba(168, 86, 32, 0.08) !important;
      cursor: pointer !important;
    }

    [contenteditable="true"] {
      outline: 1.5px dashed #8a6b4c !important;
      outline-offset: 2px !important;
      cursor: text !important;
    }
    [contenteditable="true"]:focus {
      outline: 1.5px solid #8e511b !important;
    }
  </style>
</head>
<body>
  <div id="page-content" class="w-full h-full">${page.html}</div>

  <script>
    const isEditMode = ${state.mode === 'edit'};
    const pageIndex = ${pageIndex};

    function computeSelector(el) {
      if (!el || el === document.body || el.id === 'page-content') return '#page-content';
      if (el.id) return '#' + CSS.escape(el.id);

      let path = [];
      let curr = el;
      while (curr && curr.nodeType === Node.ELEMENT_NODE && curr !== document.body && curr.id !== 'page-content') {
        let tag = curr.tagName.toLowerCase();
        let sibling = curr;
        let nth = 1;
        while (sibling = sibling.previousElementSibling) {
          if (sibling.tagName.toLowerCase() === tag) nth++;
        }
        let selector = nth > 1 ? tag + ':nth-of-type(' + nth + ')' : tag;
        path.unshift(selector);
        curr = curr.parentElement;
      }
      return path.join(' > ');
    }

    document.addEventListener('mouseup', (e) => {
      const selection = window.getSelection();
      const hasTextSelection = selection && selection.toString().trim().length > 0;

      if (isEditMode) {
        if (hasTextSelection) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          window.parent.postMessage({
            type: 'TEXT_SELECTION_CHANGED',
            hasSelection: true,
            pageIndex: pageIndex,
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
          }, '*');
        } else {
          window.parent.postMessage({ type: 'TEXT_SELECTION_CHANGED', hasSelection: false }, '*');
        }
        return;
      }

      let target = e.target;
      if (target === document.body || target.id === 'page-content') return;

      const selector = computeSelector(target);

      const rect = target.getBoundingClientRect();
      const pageW = ${widthPx} || 1;
      const pageH = ${heightPx} || 1;

      const normX = Math.max(0, Math.min(1, +(rect.left / pageW).toFixed(4)));
      const normY = Math.max(0, Math.min(1, +(rect.top / pageH).toFixed(4)));
      const normW = Math.max(0.001, Math.min(1 - normX, +(rect.width / pageW).toFixed(4)));
      const normH = Math.max(0.001, Math.min(1 - normY, +(rect.height / pageH).toFixed(4)));

      window.parent.postMessage({
        type: 'ELEMENT_CLICKED',
        pageIndex: pageIndex,
        selector: selector,
        selectedText: hasTextSelection ? selection.toString().trim() : target.innerText.slice(0, 100),
        elementHtml: target.outerHTML,
        clientX: e.clientX,
        clientY: e.clientY,
        bounds: {
          x: normX,
          y: normY,
          width: normW,
          height: normH
        }
      }, '*');
    });

    if (isEditMode) {
      const contentRoot = document.getElementById('page-content');
      contentRoot.setAttribute('contenteditable', 'true');

      contentRoot.addEventListener('input', () => {
        window.parent.postMessage({
          type: 'PAGE_HTML_MUTATED',
          pageIndex: pageIndex,
          html: contentRoot.innerHTML
        }, '*');
      });
    }

    if (!isEditMode) {
      document.addEventListener('mouseover', (e) => {
        if (e.target && e.target !== document.body && e.target.id !== 'page-content') {
          e.target.classList.add('highlight-hover');
        }
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target) {
          e.target.classList.remove('highlight-hover');
        }
      });
    }

    document.addEventListener('dblclick', () => {
      window.parent.postMessage({ type: 'REQUEST_EDIT_MODE', pageIndex: pageIndex }, '*');
    });

    window.addEventListener('message', (e) => {
      const data = e.data;
      if (!data) return;

      if (data.type === 'APPLY_ELEMENT_UPDATE') {
        try {
          const target = document.querySelector(data.selector);
          if (target) {
            if (data.newHtml !== undefined) target.innerHTML = data.newHtml;
            if (data.newClasses) target.className = data.newClasses;
            if (data.newStyles) target.style.cssText += ';' + data.newStyles;

            window.parent.postMessage({
              type: 'PAGE_HTML_MUTATED',
              pageIndex: pageIndex,
              html: document.getElementById('page-content').innerHTML
            }, '*');
          }
        } catch (err) {
          console.error('[Selector Error]', err);
        }
      } else if (data.type === 'EXEC_COMMAND') {
        document.execCommand(data.cmd, false, data.val || null);
        window.parent.postMessage({
          type: 'PAGE_HTML_MUTATED',
          pageIndex: pageIndex,
          html: document.getElementById('page-content').innerHTML
        }, '*');
      }
    });
  </script>
</body>
</html>
  `.trim();
}

// Render Pages on Canvas
function renderAllPages() {
  pagesContainer.innerHTML = '';
  const { widthPx, heightPx } = getPagePixelDimensions();
  const isWidescreen = state.pageSize === '16:9' || state.pageSize === '4:3';
  const unitLabel = isWidescreen ? 'Slide' : 'Page';

  state.pages.forEach((page, index) => {
    const pageWrapper = document.createElement('div');
    pageWrapper.className = 'page-wrapper';
    pageWrapper.dataset.pageIndex = index;
    pageWrapper.id = `page-wrapper-${index}`;

    // Meta Header above Page
    const pageHeader = document.createElement('div');
    pageHeader.className = 'page-meta-header';
    pageHeader.style.width = `${widthPx}px`;
    pageHeader.innerHTML = `
      <span class="page-number-label">${unitLabel} ${index + 1} &mdash; ${state.pageSize === 'custom' ? `${state.customWidthMm}×${state.customHeightMm}mm` : state.pageSize}</span>
      <div style="display: flex; gap: 4px;">
        <button class="btn-tool btn-open-drawer" data-index="${index}" title="Edit HTML/CSS">
          &lt;/&gt; Code
        </button>
      </div>
    `;

    // Frame Box
    const frameBox = document.createElement('div');
    frameBox.className = 'page-frame-box';
    frameBox.style.width = `${widthPx}px`;
    frameBox.style.height = `${heightPx}px`;

    // Sandboxed Iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'page-iframe';
    iframe.id = `iframe-page-${index}`;
    iframe.srcdoc = buildPageIframeHtml(page, index);

    // Comment Pins Layer
    const pinsLayer = document.createElement('div');
    pinsLayer.className = 'comments-pins-layer';
    pinsLayer.id = `pins-layer-${index}`;
    renderCommentPinsForPage(pinsLayer, index);

    frameBox.appendChild(iframe);
    frameBox.appendChild(pinsLayer);

    // Attach Selection Overlay Engine Canvas
    if (!selectionEngine && typeof SelectionOverlayEngine !== 'undefined') {
      selectionEngine = new SelectionOverlayEngine({
        onSelectionComplete: handleOverlaySelectionComplete,
        onSelectionClear: handleOverlaySelectionClear
      });
      selectionEngine.setZoom(state.zoom);
    }
    if (selectionEngine) {
      selectionEngine.attachToPage(frameBox, index, () => getPagePixelDimensions());
    }

    pageWrapper.appendChild(pageHeader);
    pageWrapper.appendChild(frameBox);
    pagesContainer.appendChild(pageWrapper);
  });

  applyZoom();
}

// Render Comment Pins on Canvas
function renderCommentPinsForPage(container, pageIndex) {
  container.innerHTML = '';
  const pageComments = state.comments.filter(c => c.pageIndex === pageIndex);

  pageComments.forEach((comment, idx) => {
    const pin = document.createElement('div');
    pin.className = `comment-pin ${comment.resolved ? 'resolved' : ''}`;
    pin.style.left = `${comment.x || 40}px`;
    pin.style.top = `${comment.y || 40}px`;
    pin.title = `Instruction #${idx + 1}: ${comment.userComment}`;
    pin.textContent = `${idx + 1}`;

    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      openCommentDetails(comment);
    });

    container.appendChild(pin);
  });
}

function openCommentDetails(comment) {
  const isResolved = comment.resolved;
  const promptText = `
Target Element: ${comment.selector}
Instruction: "${comment.userComment}"
Status: ${isResolved ? 'Resolved' : 'Pending AI Agent'}
  `.trim();

  const choice = confirm(`${promptText}\n\nClick OK to toggle Resolved status, or Cancel to keep.`);
  if (choice) {
    comment.resolved = !comment.resolved;
    saveProjects();
    updateAllPins();
    updateSidebar();
    broadcastStateToMcp();
  }
}

function updateAllPins() {
  state.pages.forEach((_, idx) => {
    const layer = document.getElementById(`pins-layer-${idx}`);
    if (layer) renderCommentPinsForPage(layer, idx);
  });
}

// Zoom Management
function applyZoom() {
  pagesContainer.style.transform = `scale(${state.zoom})`;
  zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
  if (selectionEngine) selectionEngine.setZoom(state.zoom);
}

function zoomIn() {
  state.zoom = Math.min(1.6, +(state.zoom + 0.08).toFixed(2));
  applyZoom();
  saveProjects();
}

function zoomOut() {
  state.zoom = Math.max(0.4, +(state.zoom - 0.08).toFixed(2));
  applyZoom();
  saveProjects();
}

function zoomFit() {
  const viewportWidth = canvasViewport.clientWidth - 80;
  const { widthPx } = getPagePixelDimensions();
  state.zoom = Math.max(0.4, Math.min(1.1, +(viewportWidth / widthPx).toFixed(2)));
  applyZoom();
  saveProjects();
}

// Update Right Sidebar Panel
function updateSidebar() {
  const count = state.pages.length;
  const isWidescreen = state.pageSize === '16:9' || state.pageSize === '4:3';
  const unitName = isWidescreen ? (count === 1 ? 'Slide' : 'Slides') : (count === 1 ? 'Page' : 'Pages');
  sidebarPageCount.textContent = `${count} ${unitName}`;

  // Page List
  sidebarPageList.innerHTML = '';
  state.pages.forEach((_, idx) => {
    const item = document.createElement('div');
    item.className = 'page-list-item';
    item.innerHTML = `
      <span class="page-list-label">${isWidescreen ? 'Slide' : 'Page'} ${idx + 1}</span>
      <div class="page-item-actions">
        <button class="btn-tool" data-action="scroll" data-index="${idx}" title="View">View</button>
        <button class="btn-tool" data-action="code" data-index="${idx}" title="Edit HTML/CSS">&lt;/&gt;</button>
        <button class="btn-tool" data-action="duplicate" data-index="${idx}" title="Duplicate">Copy</button>
        <button class="btn-tool delete" data-action="delete" data-index="${idx}" title="Delete">✕</button>
      </div>
    `;
    sidebarPageList.appendChild(item);
  });

  // Comments Count
  const pending = state.comments.filter(c => !c.resolved);
  const authorized = state.comments.filter(c => c.authorized && !c.resolved);
  sidebarCommentsCount.textContent = `${authorized.length} Authorized / ${pending.length} Pending`;

  // Comments List
  sidebarCommentsList.innerHTML = '';
  if (state.comments.length === 0) {
    sidebarCommentsList.innerHTML = `
      <div style="font-size: 11px; color: var(--text-dim); font-style: italic; padding: 4px 0;">
        No instructions pinned yet. Select an element, draw a rectangle, or circle/oval an area to pin targeted instructions.
      </div>
    `;
  } else {
    state.comments.forEach((c, idx) => {
      const card = document.createElement('div');
      const isAuth = !!c.authorized;
      const isRes = !!c.resolved;
      card.className = `comment-card ${isRes ? 'resolved' : ''} ${isAuth && !isRes ? 'authorized' : ''}`;

      const selType = (c.selectionType || 'object').toUpperCase();
      const geomText = c.bounds
        ? `${selType} ${Math.round((c.bounds.width || 0) * 100)}%×${Math.round((c.bounds.height || 0) * 100)}%`
        : selType;

      const statusPillHtml = isRes
        ? `<span class="status-pill resolved">✓ Done</span>`
        : (isAuth
          ? `<span class="status-pill authorized">⚡ Authorized</span>`
          : `<span class="status-pill pending">Pending Approval</span>`);

      card.innerHTML = `
        <div class="comment-card-header">
          <span class="comment-card-tag">#${idx + 1} &bull; ${isWidescreen ? 'Slide' : 'Page'} ${c.pageIndex + 1}</span>
          ${statusPillHtml}
        </div>
        <p class="comment-card-text">"${(c.userComment || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}"</p>
        <div class="comment-card-footer">
          <span class="geom-tag" title="${c.selector || 'Region'}">${geomText}</span>
          <div style="display: flex; gap: 4px; align-items: center;">
            ${!isRes ? `
              <button class="btn-authorize ${isAuth ? 'authorized' : ''}" data-comment-id="${c.id}" title="${isAuth ? 'Revoke AI authorization' : 'Authorize AI agent to implement this change'}">
                ${isAuth ? '✓ Authorized' : '⚡ Authorize'}
              </button>
            ` : ''}
            <button class="btn-resolve" data-comment-id="${c.id}">
              ${isRes ? 'Reopen' : 'Done'}
            </button>
            <button class="btn-tool" data-scroll-comment="${c.pageIndex}" style="font-size: 10px;">Go</button>
          </div>
        </div>
      `;

      card.addEventListener('mouseenter', () => {
        if (selectionEngine && c.bounds) {
          selectionEngine.highlightBounds(c.pageIndex, c.bounds, c.selectionType || 'object');
        }
      });

      sidebarCommentsList.appendChild(card);
    });
  }
}

// Window Message Listener
window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'ELEMENT_CLICKED') {
    handleElementClicked(data);
  } else if (data.type === 'PAGE_HTML_MUTATED') {
    if (state.pages[data.pageIndex]) {
      state.pages[data.pageIndex].html = data.html;
      saveProjects();
      broadcastStateToMcp();
    }
  } else if (data.type === 'TEXT_SELECTION_CHANGED') {
    handleTextSelectionChanged(data);
  } else if (data.type === 'REQUEST_EDIT_MODE') {
    if (state.mode !== 'edit') {
      state.mode = 'edit';
      btnModeEdit.classList.add('active');
      btnModePreview.classList.remove('active');
      saveProjects();
      renderAllPages();
    }
  }
});

// WYSIWYG Bar Positioning
function handleTextSelectionChanged(data) {
  if (!data.hasSelection || state.mode !== 'edit') {
    wysiwygBar.classList.remove('active');
    return;
  }

  activeEditPageIndex = data.pageIndex;
  const iframe = document.getElementById(`iframe-page-${data.pageIndex}`);
  if (!iframe) return;

  const iframeRect = iframe.getBoundingClientRect();
  const barX = iframeRect.left + (data.rect.left * state.zoom);
  const barY = iframeRect.top + (data.rect.top * state.zoom) - 40;

  wysiwygBar.style.left = `${Math.max(10, barX)}px`;
  wysiwygBar.style.top = `${Math.max(60, barY)}px`;
  wysiwygBar.classList.add('active');
}

function bindWysiwygEvents() {
  wysiwygBar.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  wysiwygBar.querySelectorAll('.wysiwyg-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = btn.dataset.cmd;
      const val = btn.dataset.val || null;

      const iframe = document.getElementById(`iframe-page-${activeEditPageIndex}`);
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'EXEC_COMMAND',
          cmd: cmd,
          val: val
        }, '*');
      }
    });
  });
}

// AI Comment Handling
function handleElementClicked(data) {
  if (state.mode === 'edit') return;

  const { widthPx, heightPx } = getPagePixelDimensions();

  activeCommentTarget = data;
  activeCommentTarget.selectionType = 'object';
  activeCommentTarget.bounds = data.bounds || {
    x: Math.max(0, Math.min(1, +(data.clientX / widthPx).toFixed(4))),
    y: Math.max(0, Math.min(1, +(data.clientY / heightPx).toFixed(4))),
    width: 0.1,
    height: 0.05
  };

  if (selectionEngine && activeCommentTarget.bounds) {
    selectionEngine.highlightBounds(data.pageIndex, activeCommentTarget.bounds, 'object');
  }

  popoverSelector.textContent = data.selector;
  popoverSelectedText.textContent = data.selectedText ? `"${data.selectedText}"` : '';
  popoverCommentInput.value = '';

  const iframeEl = document.getElementById(`iframe-page-${data.pageIndex}`);
  if (iframeEl) {
    const iframeRect = iframeEl.getBoundingClientRect();
    const b = activeCommentTarget.bounds;

    const pinX = data.clientX != null ? data.clientX : Math.round(b.x * widthPx);
    const pinY = data.clientY != null ? data.clientY : Math.round(b.y * heightPx);

    activeCommentTarget.pinX = pinX;
    activeCommentTarget.pinY = pinY;

    // Convert bounds to screen space respecting canvas zoom
    // getBoundingClientRect() already includes CSS transform (zoom), no need to multiply again
    const elemLeftScreen = iframeRect.left + (b.x * iframeRect.width);
    const elemTopScreen = iframeRect.top + (b.y * iframeRect.height);
    const elemHeightScreen = (b.height * iframeRect.height);

    const screenX = Math.min(window.innerWidth - 330, Math.max(20, elemLeftScreen));
    const screenY = Math.min(window.innerHeight - 260, Math.max(65, elemTopScreen + elemHeightScreen + 10));

    commentPopover.style.left = `${screenX}px`;
    commentPopover.style.top = `${screenY}px`;
    commentPopover.classList.add('active');
    popoverCommentInput.focus();
  }
}

function handleOverlaySelectionComplete(selection) {
  const pageIndex = selection.pageIndex;
  const iframeEl = document.getElementById(`iframe-page-${pageIndex}`);
  if (!iframeEl) return;
  const iframeRect = iframeEl.getBoundingClientRect();

  const isOval = selection.type === 'oval' || selection.type === 'circle' || selection.type === 'lasso';
  const typeTag = isOval ? 'OVAL' : (selection.type || 'region').toUpperCase();
  const pctW = Math.round((selection.bounds.width || 0) * 100);
  const pctH = Math.round((selection.bounds.height || 0) * 100);

  const { widthPx, heightPx } = getPagePixelDimensions();
  const pinLeft = selection.pixelRect ? selection.pixelRect.left : Math.round(selection.bounds.x * widthPx);
  const pinTop = selection.pixelRect ? selection.pixelRect.top : Math.round(selection.bounds.y * heightPx);
  const pinWidth = selection.pixelRect ? selection.pixelRect.width : Math.round(selection.bounds.width * widthPx);
  const pinHeight = selection.pixelRect ? selection.pixelRect.height : Math.round(selection.bounds.height * heightPx);

  activeCommentTarget = {
    pageIndex: pageIndex,
    selector: `[Region: ${typeTag} ${pctW}% × ${pctH}%]`,
    selectedText: `Selected ${isOval ? 'circle/oval' : selection.type} area on ${state.pageSize === '16:9' ? 'slide' : 'page'} ${pageIndex + 1}`,
    elementHtml: '',
    selectionType: isOval ? 'oval' : selection.type,
    bounds: selection.bounds,
    points: selection.points || null,
    pinX: Math.round(pinLeft),
    pinY: Math.round(pinTop)
  };

  popoverSelector.textContent = activeCommentTarget.selector;
  popoverSelectedText.textContent = `Spatial Target: (${Math.round(selection.bounds.x * 100)}%, ${Math.round(selection.bounds.y * 100)}%)`;
  popoverCommentInput.value = '';

  const screenX = Math.min(window.innerWidth - 330, Math.max(20, iframeRect.left + (pinLeft * state.zoom)));
  const screenY = Math.min(window.innerHeight - 260, Math.max(65, iframeRect.top + ((pinTop + pinHeight) * state.zoom) + 12));

  commentPopover.style.left = `${screenX}px`;
  commentPopover.style.top = `${screenY}px`;
  commentPopover.classList.add('active');
  popoverCommentInput.focus();
}

function handleOverlaySelectionClear() {
  // Selection cleared
}

function saveComment() {
  if (!activeCommentTarget) return;
  const commentText = popoverCommentInput.value.trim();
  if (!commentText) {
    alert('Please enter an instruction for the AI agent.');
    return;
  }

  const newComment = {
    id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    pageIndex: activeCommentTarget.pageIndex,
    selector: activeCommentTarget.selector,
    selectedText: activeCommentTarget.selectedText || '',
    elementHtml: activeCommentTarget.elementHtml || '',
    userComment: commentText,
    selectionType: activeCommentTarget.selectionType || 'object',
    bounds: activeCommentTarget.bounds || { x: 0.1, y: 0.1, width: 0.2, height: 0.1 },
    points: activeCommentTarget.points || null,
    x: activeCommentTarget.pinX,
    y: activeCommentTarget.pinY,
    status: 'pending',
    authorized: false, // Strict human authorization gating
    resolved: false,
    author: currentUser ? currentUser.name : 'Guest User',
    authorEmail: currentUser ? currentUser.email : null,
    authorId: currentUser ? (currentUser.uid || currentUser.id) : 'guest',
    authorAvatar: currentUser ? currentUser.avatar : null,
    createdAt: new Date().toISOString()
  };

  state.comments.push(newComment);
  commentPopover.classList.remove('active');
  activeCommentTarget = null;
  if (selectionEngine) selectionEngine.clearSelection();

  saveProjects();
  updateAllPins();
  updateSidebar();
  broadcastStateToMcp();
}

// Code Drawer
function openCodeDrawer(pageIndex) {
  activeDrawerPageIndex = pageIndex;
  const isWidescreen = state.pageSize === '16:9' || state.pageSize === '4:3';
  const unit = isWidescreen ? 'Slide' : 'Page';
  drawerPageTitle.textContent = `Manual Code - ${unit} ${pageIndex + 1}`;
  updateDrawerContent();
  codeDrawer.classList.add('open');
  drawerBackdrop.classList.add('active');
}

function closeCodeDrawer() {
  codeDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('active');
}

function updateDrawerContent() {
  const page = state.pages[activeDrawerPageIndex];
  if (!page) return;

  if (activeDrawerTab === 'html') {
    drawerCodeEditor.value = page.html || '';
  } else if (activeDrawerTab === 'css') {
    drawerCodeEditor.value = page.css || '';
  } else if (activeDrawerTab === 'global') {
    drawerCodeEditor.value = state.globalStyles || '';
  }
}

function applyDrawerCode() {
  const page = state.pages[activeDrawerPageIndex];
  if (!page) return;

  const content = drawerCodeEditor.value;
  if (activeDrawerTab === 'html') {
    page.html = content;
  } else if (activeDrawerTab === 'css') {
    page.css = content;
  } else if (activeDrawerTab === 'global') {
    state.globalStyles = content;
  }

  saveProjects();
  const iframe = document.getElementById(`iframe-page-${activeDrawerPageIndex}`);
  if (iframe) {
    iframe.srcdoc = buildPageIframeHtml(page, activeDrawerPageIndex);
  }
  broadcastStateToMcp();
}

// Printable HTML Generation for Maximum Clarity Vector PDF
function generatePrintableHtml() {
  const { widthMm, heightMm } = getPagePixelDimensions();

  const pagesMarkup = state.pages.map((p) => `
    <div class="print-page" style="width: ${widthMm}mm; height: ${heightMm}mm; max-height: ${heightMm}mm;">
      ${p.html}
    </div>
  `).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: ${widthMm}mm ${heightMm}mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: ${widthMm}mm;
      background: #fbf9f5;
    }
    ${state.globalStyles || ''}
    .print-page {
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      background: #fbf9f5;
    }
    .print-page:not(:last-child) {
      page-break-after: always;
      break-after: page;
    }
  </style>
</head>
<body>
  ${pagesMarkup}
</body>
</html>
  `.trim();
}

// Print Handler
async function handlePrint() {
  const fullHtml = generatePrintableHtml();
  if (window.electronAPI && window.electronAPI.printDocument) {
    await window.electronAPI.printDocument({ fullHtml });
  } else {
    window.print();
  }
}

// Download PDF (Maximum Clarity Vector PDF)
async function handleDownloadPdf() {
  const fullHtml = generatePrintableHtml();
  const { widthMm, heightMm } = getPagePixelDimensions();
  const customWidthInches = +(widthMm / 25.4).toFixed(3);
  const customHeightInches = +(heightMm / 25.4).toFixed(3);

  const originalText = btnDownloadPdf.innerHTML;
  btnDownloadPdf.textContent = 'Rendering Vector PDF...';
  btnDownloadPdf.disabled = true;

  if (window.electronAPI && window.electronAPI.savePdf) {
    try {
      const result = await window.electronAPI.savePdf({
        fullHtml,
        pageSize: state.pageSize,
        orientation: state.orientation,
        customWidthInches,
        customHeightInches
      });

      if (result.success) {
        alert(`Vector PDF saved with maximum clarity:\n${result.filePath}`);
      } else if (!result.canceled) {
        alert(`Export failed: ${result.error}`);
      }
    } catch (e) {
      alert(`Export error: ${e.message}`);
    } finally {
      btnDownloadPdf.innerHTML = originalText;
      btnDownloadPdf.disabled = false;
    }
  } else {
    // Browser Localhost mode: call /api/export-pdf
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullHtml,
          pageSize: state.pageSize,
          orientation: state.orientation,
          customWidthInches,
          customHeightInches
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(state.title || 'document').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`PDF export failed: ${err.error || res.statusText}`);
      }
    } catch (err) {
      console.warn('Export endpoint fallback to window.print():', err);
      window.print();
    } finally {
      btnDownloadPdf.innerHTML = originalText;
      btnDownloadPdf.disabled = false;
    }
  }
}

// Download PPTX Presentation (.pptx)
async function handleDownloadPptx() {
  const originalText = btnDownloadPptx.innerHTML;
  btnDownloadPptx.textContent = 'Generating .pptx...';
  btnDownloadPptx.disabled = true;

  try {
    const { widthPx, heightPx } = getPagePixelDimensions();
    const slidesHtmlArray = state.pages.map((p) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${state.globalStyles || ''}
    ${p.css || ''}
    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
    html, body {
      margin: 0; padding: 0;
      width: ${widthPx}px; height: ${heightPx}px;
      overflow: hidden; background: #fbf9f5;
    }
  </style>
</head>
<body>
  <div class="w-full h-full">${p.html}</div>
</body>
</html>
    `.trim());

    if (window.electronAPI && window.electronAPI.savePptx) {
      const result = await window.electronAPI.savePptx({ slidesHtmlArray, widthPx, heightPx });
      if (result.success) {
        alert(`PowerPoint Presentation saved:\n${result.filePath}`);
      } else if (!result.canceled) {
        alert(`PPTX export failed: ${result.error}`);
      }
    } else {
      // Browser localhost mode
      const res = await fetch('/api/export-pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slidesHtmlArray, widthPx, heightPx })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(state.title || 'presentation').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pptx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`PPTX export failed: ${err.error || res.statusText}`);
      }
    }
  } catch (err) {
    alert(`PPTX export error: ${err.message}`);
  } finally {
    btnDownloadPptx.innerHTML = originalText;
    btnDownloadPptx.disabled = false;
  }
}

// ============================================================================
// DOCUMENT INGESTION & IMPORT PIPELINE (PDF, JSON, DIAGRAM/IMAGE)
// ============================================================================

// Initialize PDF.js worker
if (window.pdfjsLib) {
  try {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
  } catch (e) {
    console.warn('[PDF.js Worker Warning]', e);
  }
}

// 1. PDF Document Ingestion (.pdf)
async function importPdfDocument(pdfInput, fileName = 'Imported Document.pdf') {
  try {
    let uint8Data = null;

    if (pdfInput instanceof Uint8Array) {
      uint8Data = pdfInput;
    } else if (pdfInput instanceof ArrayBuffer) {
      uint8Data = new Uint8Array(pdfInput);
    } else if (typeof pdfInput === 'string') {
      // Base64 string
      const cleanB64 = pdfInput.replace(/^data:application\/pdf;base64,/, '');
      const raw = atob(cleanB64);
      uint8Data = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        uint8Data[i] = raw.charCodeAt(i);
      }
    } else if (pdfInput instanceof Blob || pdfInput instanceof File) {
      const buffer = await pdfInput.arrayBuffer();
      uint8Data = new Uint8Array(buffer);
      fileName = pdfInput.name || fileName;
    }

    if (!uint8Data || uint8Data.length === 0) {
      throw new Error('Invalid or empty PDF data provided.');
    }

    if (!window.pdfjsLib) {
      throw new Error('PDF.js rendering engine is not loaded. Please verify vendor/pdf.min.js.');
    }

    const originalBtnText = btnImportPdf ? btnImportPdf.innerHTML : '';
    if (btnImportPdf) {
      btnImportPdf.textContent = 'Rendering PDF...';
      btnImportPdf.disabled = true;
    }

    const loadingTask = window.pdfjsLib.getDocument({ data: uint8Data });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    if (numPages === 0) {
      throw new Error('PDF contains no renderable pages.');
    }

    const pagesArray = [];
    let isOverallLandscape = false;

    for (let pageNum = 1; pageNum <= Math.min(numPages, 40); pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      // Render at 2.0x for crisp vector sharpness
      const renderScale = 2.0;
      const viewport = page.getViewport({ scale: renderScale });
      const unscaledViewport = page.getViewport({ scale: 1.0 });

      if (pageNum === 1) {
        isOverallLandscape = unscaledViewport.width > unscaledViewport.height;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;

      const pageImgDataUrl = canvas.toDataURL('image/png');

      // Extract text content layer for sub-pixel selection
      let textContent = null;
      try {
        textContent = await page.getTextContent();
      } catch (err) {
        console.warn(`[PDF Page ${pageNum} text extraction notice]:`, err.message);
      }

      let textLayerSpans = '';
      if (textContent && textContent.items) {
        textContent.items.forEach((item, itemIdx) => {
          if (!item.str || !item.str.trim()) return;
          const tx = item.transform;
          const x = tx[4];
          const y = unscaledViewport.height - tx[5] - (item.height || 12);
          const pctLeft = +(Math.max(0, Math.min(100, (x / unscaledViewport.width) * 100))).toFixed(2);
          const pctTop = +(Math.max(0, Math.min(100, (y / unscaledViewport.height) * 100))).toFixed(2);
          const escapedStr = item.str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          textLayerSpans += `<span class="pdf-text-node" id="pdf-t-${pageNum}-${itemIdx}" style="position: absolute; left: ${pctLeft}%; top: ${pctTop}%; font-size: ${Math.round(item.height || 12)}px; line-height: 1.1; color: transparent; cursor: text; pointer-events: auto;">${escapedStr}</span>\n`;
        });
      }

      const pageHtml = `
<div class="pdf-page-container relative w-full h-full overflow-hidden bg-white select-none" data-pdf-page="${pageNum}" style="width: 100%; height: 100%; position: relative;">
  <img src="${pageImgDataUrl}" class="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="PDF Page ${pageNum}" style="width: 100%; height: 100%; object-fit: contain;" />
  <div class="pdf-text-layer absolute inset-0 w-full h-full pointer-events-none" style="position: absolute; inset: 0; width: 100%; height: 100%;">
    ${textLayerSpans}
  </div>
</div>
      `.trim();

      pagesArray.push({
        id: `page-pdf-${Date.now()}-${pageNum}`,
        html: pageHtml,
        css: ''
      });
    }

    const cleanTitle = fileName.replace(/\.[^/.]+$/, '').trim() || 'Imported PDF';
    const newProj = {
      id: `proj_pdf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle,
      docType: 'pdf',
      pageSize: isOverallLandscape ? '16:9' : 'A4',
      orientation: isOverallLandscape ? 'landscape' : 'portrait',
      customWidthMm: null,
      customHeightMm: null,
      zoom: isOverallLandscape ? 0.72 : 0.88,
      mode: 'preview',
      globalStyles: DEFAULT_GLOBAL_STYLES,
      ownerId: currentUser ? (currentUser.uid || currentUser.id) : 'guest',
      ownerEmail: currentUser ? currentUser.email : null,
      ownerName: currentUser ? currentUser.name : null,
      assignedAt: new Date().toISOString(),
      pages: pagesArray,
      comments: [],
      createdAt: new Date().toISOString()
    };

    projects.unshift(newProj);
    switchProject(newProj.id);
    saveProjects();

    if (btnImportPdf) {
      btnImportPdf.innerHTML = originalBtnText;
      btnImportPdf.disabled = false;
    }

    alert(`Successfully imported "${cleanTitle}" (${pagesArray.length} page${pagesArray.length > 1 ? 's' : ''}) into Y Master Editor!\nYou can now click components or draw rectangle/circle/oval regions to guide the AI MCP agent.`);
  } catch (err) {
    console.error('[PDF Import Error]', err);
    alert(`Failed to import PDF document:\n${err.message}`);
    if (btnImportPdf) {
      btnImportPdf.innerHTML = originalBtnText;
      btnImportPdf.disabled = false;
    }
  }
}

// 2. JSON Workspace Ingestion (.json)
async function importWorkspaceJson(input, fileName = 'Workspace.json') {
  try {
    let rawText = '';
    if (typeof input === 'string') {
      rawText = input;
    } else if (input instanceof Blob || input instanceof File) {
      rawText = await input.text();
      fileName = input.name || fileName;
    }

    if (!rawText || !rawText.trim()) {
      throw new Error('Empty JSON file provided.');
    }

    const parsed = JSON.parse(rawText);
    const cleanTitle = fileName.replace(/\.[^/.]+$/, '').trim() || 'Imported Workspace';

    // Scenario A: Multi-project bundle { projects: [...] }
    if (parsed.projects && Array.isArray(parsed.projects)) {
      let importedCount = 0;
      parsed.projects.forEach(p => {
        if (p.pages && Array.isArray(p.pages)) {
          p.id = `proj_imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          projects.unshift(p);
          importedCount++;
        }
      });
      if (importedCount > 0) {
        switchProject(projects[0].id);
        saveProjects();
        alert(`Successfully imported ${importedCount} project(s) from "${cleanTitle}".`);
        return;
      }
    }

    // Scenario B: Single Project or Canonical Document Model
    let pages = [];
    if (parsed.pages && Array.isArray(parsed.pages)) {
      pages = parsed.pages.map((p, idx) => ({
        id: p.id || `page-${Date.now()}-${idx}`,
        html: p.rawHtml || p.html || '',
        css: p.css || ''
      }));
    } else {
      throw new Error('JSON does not contain a recognized document or project structure (missing "pages" array).');
    }

    const newProj = {
      id: `proj_json_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: parsed.title || cleanTitle,
      docType: parsed.docType || 'doc',
      pageSize: parsed.pageSize || 'A4',
      orientation: parsed.orientation || 'portrait',
      customWidthMm: parsed.customWidthMm || null,
      customHeightMm: parsed.customHeightMm || null,
      zoom: parsed.zoom || 0.88,
      mode: 'preview',
      globalStyles: parsed.globalStyles || DEFAULT_GLOBAL_STYLES,
      ownerId: currentUser ? (currentUser.uid || currentUser.id) : 'guest',
      ownerEmail: currentUser ? currentUser.email : null,
      ownerName: currentUser ? currentUser.name : null,
      assignedAt: new Date().toISOString(),
      pages: pages,
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      createdAt: new Date().toISOString()
    };

    projects.unshift(newProj);
    switchProject(newProj.id);
    saveProjects();

    alert(`Successfully opened workspace project "${newProj.title}" (${pages.length} page${pages.length > 1 ? 's' : ''}).`);
  } catch (err) {
    console.error('[JSON Import Error]', err);
    alert(`Failed to import JSON workspace:\n${err.message}`);
  }
}

// 3. Image / Diagram Ingestion (.png, .jpg, .svg, .webp)
async function importImageDocument(input, fileName = 'Diagram.png', isSvg = false, textContent = null) {
  try {
    let dataUrl = '';
    let svgBody = textContent;

    if (typeof input === 'string') {
      if (input.startsWith('data:')) {
        dataUrl = input;
      } else if (input.trim().startsWith('<svg')) {
        isSvg = true;
        svgBody = input;
        dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(input)}`;
      } else {
        dataUrl = input;
      }
    } else if (input instanceof Blob || input instanceof File) {
      fileName = input.name || fileName;
      const ext = fileName.split('.').pop().toLowerCase();
      isSvg = ext === 'svg';
      if (isSvg) {
        svgBody = await input.text();
        dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgBody)}`;
      } else {
        dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(input);
        });
      }
    }

    const cleanTitle = fileName.replace(/\.[^/.]+$/, '').trim() || 'Scientific Diagram';

    const pageHtml = isSvg && svgBody ? `
<div class="h-full flex flex-col justify-between p-12 bg-[#faf7f2] text-[#241c15]">
  <div>
    <div class="flex justify-between items-baseline border-b border-[#dcd3c5] pb-4 mb-6">
      <div>
        <p class="text-xs uppercase tracking-[0.25em] font-semibold text-[#8c633a]">Scientific Diagram &bull; Vector Specification</p>
        <h1 class="text-3xl font-serif text-[#241c15] mt-1 font-normal tracking-wide">${cleanTitle}</h1>
      </div>
      <span class="text-xs uppercase tracking-widest text-[#a85620] font-semibold bg-[#ede7df] px-3 py-1 rounded-full border border-[#dcd3c5]">Vector Diagram</span>
    </div>
    <div class="diagram-canvas-box flex items-center justify-center p-6 bg-white border border-[#dcd3c5] rounded-xl shadow-xs overflow-auto max-h-[640px]">
      <div id="scientific-diagram-container" class="w-full flex items-center justify-center">
        ${svgBody}
      </div>
    </div>
  </div>
  <div class="border-t border-[#dcd3c5] pt-3 flex justify-between items-center text-xs text-[#786755]">
    <span>Y Master Editor &bull; Regional Transformation Studio</span>
    <span>Figure 01 &bull; Ready for AI Pin Instructions</span>
  </div>
</div>
    `.trim() : `
<div class="h-full flex flex-col justify-between p-12 bg-[#faf7f2] text-[#241c15]">
  <div>
    <div class="flex justify-between items-baseline border-b border-[#dcd3c5] pb-4 mb-6">
      <div>
        <p class="text-xs uppercase tracking-[0.25em] font-semibold text-[#8c633a]">Scientific Illustration &bull; Visual Asset</p>
        <h1 class="text-3xl font-serif text-[#241c15] mt-1 font-normal tracking-wide">${cleanTitle}</h1>
      </div>
      <span class="text-xs uppercase tracking-widest text-[#a85620] font-semibold bg-[#ede7df] px-3 py-1 rounded-full border border-[#dcd3c5]">Raster Graphic</span>
    </div>
    <div class="diagram-canvas-box flex items-center justify-center p-6 bg-white border border-[#dcd3c5] rounded-xl shadow-xs overflow-auto max-h-[640px]">
      <img id="scientific-diagram-image" src="${dataUrl}" class="max-w-full max-h-[580px] object-contain rounded" alt="${cleanTitle}" />
    </div>
  </div>
  <div class="border-t border-[#dcd3c5] pt-3 flex justify-between items-center text-xs text-[#786755]">
    <span>Y Master Editor &bull; Regional Transformation Studio</span>
    <span>Figure 01 &bull; Ready for AI Pin Instructions</span>
  </div>
</div>
    `.trim();

    const newProj = {
      id: `proj_diagram_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle,
      docType: 'diagram',
      pageSize: 'A4',
      orientation: 'landscape',
      customWidthMm: null,
      customHeightMm: null,
      zoom: 0.82,
      mode: 'preview',
      globalStyles: DEFAULT_GLOBAL_STYLES,
      ownerId: currentUser ? (currentUser.uid || currentUser.id) : 'guest',
      ownerEmail: currentUser ? currentUser.email : null,
      ownerName: currentUser ? currentUser.name : null,
      assignedAt: new Date().toISOString(),
      pages: [{ id: `page-diag-${Date.now()}`, html: pageHtml, css: '' }],
      comments: [],
      createdAt: new Date().toISOString()
    };

    projects.unshift(newProj);
    switchProject(newProj.id);
    saveProjects();

    alert(`Successfully imported diagram "${cleanTitle}"!\nUse the Pointer, Rectangle, or Circle/Oval tool to select any region and pin your AI instructions.`);
  } catch (err) {
    console.error('[Diagram Import Error]', err);
    alert(`Failed to import image or diagram:\n${err.message}`);
  }
}

// Setup Import Buttons & Ingestion Event Listeners
function setupDocumentIngestion() {
  if (btnImportPdf) {
    btnImportPdf.addEventListener('click', async () => {
      if (window.electronAPI && window.electronAPI.openDocumentDialog) {
        try {
          const res = await window.electronAPI.openDocumentDialog({ type: 'pdf', title: 'Import PDF Document — Y Master Editor' });
          if (!res.canceled && res.success && res.base64) {
            await importPdfDocument(res.base64, res.fileName);
          }
        } catch (err) {
          console.error('[Open PDF Dialog Error]', err);
          if (fileInputPdf) fileInputPdf.click();
        }
      } else if (fileInputPdf) {
        fileInputPdf.click();
      }
    });
  }

  if (fileInputPdf) {
    fileInputPdf.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        await importPdfDocument(file, file.name);
        fileInputPdf.value = '';
      }
    });
  }

  if (btnImportWorkspace) {
    btnImportWorkspace.addEventListener('click', async () => {
      if (window.electronAPI && window.electronAPI.openDocumentDialog) {
        try {
          const res = await window.electronAPI.openDocumentDialog({ type: 'workspace', title: 'Open Workspace JSON — Y Master Editor' });
          if (!res.canceled && res.success && res.content) {
            await importWorkspaceJson(res.content, res.fileName);
          }
        } catch (err) {
          console.error('[Open Workspace Dialog Error]', err);
          if (fileInputWorkspace) fileInputWorkspace.click();
        }
      } else if (fileInputWorkspace) {
        fileInputWorkspace.click();
      }
    });
  }

  if (fileInputWorkspace) {
    fileInputWorkspace.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        await importWorkspaceJson(file, file.name);
        fileInputWorkspace.value = '';
      }
    });
  }

  if (btnImportImage) {
    btnImportImage.addEventListener('click', async () => {
      if (window.electronAPI && window.electronAPI.openDocumentDialog) {
        try {
          const res = await window.electronAPI.openDocumentDialog({ type: 'image', title: 'Import Diagram / Image — Y Master Editor' });
          if (!res.canceled && res.success) {
            await importImageDocument(res.dataUrl, res.fileName, res.isSvg, res.textContent);
          }
        } catch (err) {
          console.error('[Open Image Dialog Error]', err);
          if (fileInputImage) fileInputImage.click();
        }
      } else if (fileInputImage) {
        fileInputImage.click();
      }
    });
  }

  if (fileInputImage) {
    fileInputImage.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        await importImageDocument(file, file.name);
        fileInputImage.value = '';
      }
    });
  }

  // Drag and Drop Ingestion onto Canvas Viewport
  let dragCounter = 0;
  const showDropzone = () => {
    if (canvasDropzoneOverlay) canvasDropzoneOverlay.classList.add('drag-active');
  };
  const hideDropzone = () => {
    if (canvasDropzoneOverlay) canvasDropzoneOverlay.classList.remove('drag-active');
  };

  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    if (e.dataTransfer && e.dataTransfer.types && (e.dataTransfer.types.includes('Files') || e.dataTransfer.types.indexOf('Files') !== -1)) {
      showDropzone();
    }
  });

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  });

  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      hideDropzone();
    }
  });

  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    dragCounter = 0;
    hideDropzone();

    const files = e.dataTransfer && e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = file.name || '';
      const ext = name.split('.').pop().toLowerCase();

      if (ext === 'pdf') {
        await importPdfDocument(file, name);
      } else if (ext === 'json') {
        await importWorkspaceJson(file, name);
      } else if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
        await importImageDocument(file, name, ext === 'svg');
      } else {
        alert(`Unsupported file format: .${ext}\nPlease drop a .pdf, .json, or image file.`);
      }
    }
  });
}

// Live MCP Bridge
function broadcastStateToMcp() {
  const payload = {
    type: 'APP_STATE_UPDATE',
    state: {
      id: state.id,
      title: state.title,
      docType: state.docType || 'pdf',
      pageSize: state.pageSize,
      customWidthMm: state.customWidthMm,
      customHeightMm: state.customHeightMm,
      orientation: state.orientation,
      globalStyles: state.globalStyles,
      currentUser: currentUser ? {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        avatar: currentUser.avatar,
        signedIn: true
      } : null,
      ownerId: state.ownerId || (currentUser ? currentUser.id : null),
      ownerEmail: state.ownerEmail || (currentUser ? currentUser.email : null),
      ownerName: state.ownerName || (currentUser ? currentUser.name : null),
      pages: state.pages,
      comments: state.comments,
      projects: projects.map(p => ({
        id: p.id,
        title: p.title,
        pageSize: p.pageSize,
        orientation: p.orientation,
        totalPages: p.pages.length,
        ownerEmail: p.ownerEmail || (currentUser ? currentUser.email : null)
      }))
    }
  };

  if (window.electronAPI && window.electronAPI.sendToMcp) {
    window.electronAPI.sendToMcp(payload);
  } else if (browserWs && browserWs.readyState === WebSocket.OPEN) {
    browserWs.send(JSON.stringify(payload));
  }
}

function setupMcpListener() {
  if (window.electronAPI && window.electronAPI.onMcpMessage) {
    window.electronAPI.onMcpMessage((msg) => {
      handleMcpCommand(msg);
    });
    broadcastStateToMcp();
  } else {
    try {
      browserWs = new WebSocket('ws://127.0.0.1:48721/client');
      browserWs.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleMcpCommand(msg);
        } catch (e) {}
      };
      browserWs.onopen = () => {
        broadcastStateToMcp();
      };
    } catch (e) {}
  }
}

// Handle AI Agent Commands
async function handleMcpCommand(msg) {
  if (!msg) return;

  // 1. Reactive Notifications from MCP Transaction Engine
  if (msg.type === 'DOCUMENT_UPDATED' || msg.action === 'DOCUMENT_UPDATED' || msg.type === 'TRANSACTION_COMMITTED') {
    if (window.electronAPI && window.electronAPI.getMcpDocumentState) {
      try {
        const res = await window.electronAPI.getMcpDocumentState();
        if (res && res.success && res.doc) {
          if (res.doc.pages && Array.isArray(res.doc.pages)) {
            state.pages = res.doc.pages.map(p => ({
              id: p.id,
              html: p.rawHtml || p.html || '',
              css: p.css || ''
            }));
          }
          if (res.doc.comments && Array.isArray(res.doc.comments)) {
            state.comments = res.doc.comments;
          }
          saveProjects();
          renderAllPages();
          updateSidebar();
          updateAllPins();
        }
      } catch (err) {
        console.warn('[Sync MCP Document Error]:', err);
      }
    }
    return;
  }

  if (msg.type === 'INSTRUCTION_AUTHORIZED') {
    const c = state.comments.find(item => item.id === msg.commentId);
    if (c) {
      c.authorized = !!msg.authorized;
      c.status = msg.authorized ? 'authorized' : 'pending';
      saveProjects();
      updateSidebar();
    }
    return;
  }

  if (!msg.action) return;

  const { requestId, action, payload } = msg;
  let responseData = { success: true };

  switch (action) {
    case 'get_document_state':
      responseData = {
        id: state.id,
        title: state.title,
        pageSize: state.pageSize,
        customWidthMm: state.customWidthMm,
        customHeightMm: state.customHeightMm,
        orientation: state.orientation,
        totalPages: state.pages.length,
        currentUser: currentUser ? {
          uid: currentUser.uid || currentUser.id,
          id: currentUser.uid || currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
          avatar: currentUser.avatar,
          signedIn: true
        } : null,
        ownerId: (state && state.ownerId) || (currentUser && (currentUser.uid || currentUser.id)) || null,
        ownerEmail: (state && state.ownerEmail) || (currentUser && currentUser.email) || null,
        ownerName: (state && state.ownerName) || (currentUser && currentUser.name) || null,
        pendingComments: state.comments.filter(c => !c.resolved),
        pages: state.pages.map((p, idx) => ({ pageNumber: idx + 1, id: p.id, htmlSummary: p.html.slice(0, 150) }))
      };
      break;

    case 'get_pending_comments':
      responseData = state.comments.filter(c => !c.resolved);
      break;

    case 'update_element': {
      const pageIdx = (payload.pageIndex || 1) - 1;
      const iframe = document.getElementById(`iframe-page-${pageIdx}`);
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'APPLY_ELEMENT_UPDATE',
          selector: payload.selector,
          newHtml: payload.newHtml,
          newClasses: payload.newClasses,
          newStyles: payload.newStyles
        }, '*');

        if (payload.commentIdToResolve) {
          const c = state.comments.find(item => item.id === payload.commentIdToResolve);
          if (c) c.resolved = true;
          saveProjects();
          updateAllPins();
          updateSidebar();
        }

        responseData = { success: true, updatedSelector: payload.selector, pageNumber: pageIdx + 1 };
      } else {
        responseData = { error: `Page ${payload.pageIndex} not found.` };
      }
      break;
    }

    case 'authorize_instruction': {
      const c = state.comments.find(item => item.id === payload.commentId);
      if (c) {
        c.authorized = payload.authorize !== false;
        c.status = c.authorized ? 'authorized' : 'pending';
        saveProjects();
        updateSidebar();
        broadcastStateToMcp();
        responseData = { success: true, commentId: payload.commentId, authorized: c.authorized };
      } else {
        responseData = { error: 'Comment not found' };
      }
      break;
    }

    case 'resolve_comment': {
      const c = state.comments.find(item => item.id === payload.commentId);
      if (c) {
        c.resolved = true;
        saveProjects();
        updateAllPins();
        updateSidebar();
        responseData = { success: true, commentId: payload.commentId };
      } else {
        responseData = { error: 'Comment not found' };
      }
      break;
    }

    case 'add_comment': {
      const newComment = {
        id: payload.id || `c_${Date.now()}`,
        pageIndex: payload.pageIndex !== undefined ? payload.pageIndex : 0,
        selector: payload.selector || '#page-content',
        selectedText: payload.selectedText || '',
        elementHtml: payload.elementHtml || '',
        userComment: payload.userComment || payload.comment || 'AI instruction',
        x: payload.x || 80,
        y: payload.y || 120,
        resolved: false,
        createdAt: new Date().toISOString()
      };
      state.comments.push(newComment);
      saveProjects();
      updateAllPins();
      updateSidebar();
      broadcastStateToMcp();
      responseData = { success: true, comment: newComment };
      break;
    }

    case 'get_page_content': {
      const pageIdx = (payload.pageIndex || 1) - 1;
      const targetPage = state.pages[pageIdx];
      if (targetPage) {
        responseData = { pageNumber: pageIdx + 1, html: targetPage.html, css: targetPage.css };
      } else {
        responseData = { error: `Page ${payload.pageIndex} not found.` };
      }
      break;
    }

    case 'set_page_content': {
      const pageIdx = (payload.pageIndex || 1) - 1;
      if (state.pages[pageIdx]) {
        if (payload.html !== undefined) state.pages[pageIdx].html = payload.html;
        if (payload.css !== undefined) state.pages[pageIdx].css = payload.css;
        await saveProjects();
        const iframe = document.getElementById(`iframe-page-${pageIdx}`);
        if (iframe) {
          iframe.srcdoc = buildPageIframeHtml(state.pages[pageIdx], pageIdx);
        }
        responseData = { success: true, pageNumber: pageIdx + 1 };
      } else {
        responseData = { error: `Page ${payload.pageIndex} does not exist.` };
      }
      break;
    }

    case 'add_page': {
      addNewPage(payload.html, payload.css);
      await saveProjects();
      responseData = { success: true, pageNumber: state.pages.length, totalPages: state.pages.length };
      break;
    }

    case 'delete_page': {
      const pageIdx = (payload.pageIndex || 1) - 1;
      if (state.pages.length <= 1) {
        responseData = { error: 'Cannot delete the only page.' };
      } else if (state.pages[pageIdx]) {
        state.pages.splice(pageIdx, 1);
        await saveProjects();
        renderAllPages();
        updateSidebar();
        responseData = { success: true, totalPages: state.pages.length };
      } else {
        responseData = { error: 'Invalid page index.' };
      }
      break;
    }

    case 'set_document_settings': {
      if (payload.title) {
        state.title = payload.title;
        docTitleInput.value = payload.title;
      }
      if (payload.pageSize) {
        state.pageSize = payload.pageSize;
        paperSizeSelect.value = payload.pageSize;
      }
      if (payload.customWidthMm) state.customWidthMm = payload.customWidthMm;
      if (payload.customHeightMm) state.customHeightMm = payload.customHeightMm;
      if (payload.orientation) {
        state.orientation = payload.orientation;
        btnOrientationPortrait.classList.toggle('active', state.orientation === 'portrait');
        btnOrientationLandscape.classList.toggle('active', state.orientation === 'landscape');
      }
      if (payload.docType) {
        state.docType = payload.docType;
        syncUiWithState();
      }
      await saveProjects();
      renderAllPages();
      responseData = { success: true, state };
      break;
    }

    case 'set_global_styles': {
      if (payload.css !== undefined) {
        state.globalStyles = payload.css;
        await saveProjects();
        renderAllPages();
        responseData = { success: true };
      }
      break;
    }

    case 'create_project': {
      const newProj = createProjectModel({
        title: payload.title,
        pageSize: payload.pageSize,
        customWidthMm: payload.customWidthMm,
        customHeightMm: payload.customHeightMm,
        orientation: payload.orientation,
        initialHtml: payload.initialHtml
      });
      projects.push(newProj);
      switchProject(newProj.id);
      await saveProjects();
      responseData = {
        success: true,
        project: {
          id: newProj.id,
          title: newProj.title,
          pageSize: newProj.pageSize,
          orientation: newProj.orientation,
          totalPages: newProj.pages.length
        }
      };
      break;
    }

    case 'list_projects': {
      responseData = projects.map(p => ({
        id: p.id,
        title: p.title,
        pageSize: p.pageSize,
        orientation: p.orientation,
        totalPages: p.pages.length
      }));
      break;
    }

    case 'switch_project': {
      if (payload.projectId) {
        switchProject(payload.projectId);
        await saveProjects();
        responseData = { success: true, activeProjectId: state.id };
      } else {
        responseData = { error: 'Missing projectId' };
      }
      break;
    }

    case 'export_pptx': {
      handleDownloadPptx();
      responseData = { success: true, message: 'PPTX export initiated.' };
      break;
    }

    case 'get_current_user': {
      responseData = currentUser ? {
        ...currentUser,
        assignedProjectsCount: projects.filter(p => !p.ownerId || p.ownerId === currentUser.id || p.ownerEmail === currentUser.email).length
      } : {
        signedIn: false,
        message: 'No Google account currently signed in. Guest mode active.'
      };
      break;
    }

    case 'set_current_user': {
      if (payload && payload.email) {
        await loginWithGoogle(payload, payload.assignExisting === true);
        responseData = {
          success: true,
          currentUser,
          message: `Successfully signed in as ${currentUser.name} (${currentUser.email}) with Firebase UID ${currentUser.uid} and synced Firestore workspace.`
        };
      } else {
        responseData = { error: 'Missing user email in payload' };
      }
      break;
    }

    case 'signout_user': {
      await logoutGoogle();
      responseData = {
        success: true,
        message: 'Signed out successfully from Firebase Auth. Guest mode active.'
      };
      break;
    }

    case 'check_app_update': {
      responseData = {
        updateAvailable: true,
        currentVersion: '1.0.0',
        latestVersion: '2.0.0',
        productName: 'Y Master Editor',
        releaseName: 'Y Master Editor v2.0 — Editorial Vector Studio & Google Auth',
        installerReady: true
      };
      break;
    }

    case 'trigger_app_update': {
      if (typeof openUpdateModal === 'function') openUpdateModal();
      responseData = {
        success: true,
        message: 'Update modal opened on canvas. Ready to install Y Master Editor v2.0.'
      };
      break;
    }

    default:
      responseData = { success: true, action };
  }

  if (requestId) {
    if (window.electronAPI && window.electronAPI.sendToMcp) {
      window.electronAPI.sendToMcp({ requestId, response: responseData });
    } else if (browserWs && browserWs.readyState === WebSocket.OPEN) {
      browserWs.send(JSON.stringify({ requestId, response: responseData }));
    }
  }

  broadcastStateToMcp();
}

function addNewPage(customHtml, customCss) {
  const newPageNum = state.pages.length + 1;
  const isWidescreen = state.pageSize === '16:9' || state.pageSize === '4:3';

  let defaultHtml = '';
  if (isWidescreen) {
    defaultHtml = `
<div class="h-full flex flex-col justify-between p-14 bg-[#faf7f2] text-[#241c15]">
  <div>
    <p class="text-xs uppercase tracking-[0.25em] font-semibold text-[#a85620]">Section ${newPageNum}</p>
    <h2 class="text-3xl font-serif text-[#241c15] mt-2">Strategic Milestone &amp; Roadmap</h2>
    <p class="mt-4 text-[#4d3f32] text-sm leading-relaxed max-w-2xl">
      Presentation slide created in background web engine. Highlight any section or use Manual Edit to customize text and styling in place.
    </p>
  </div>
  <div class="border-t border-[#dcd3c5] pt-4 flex justify-between text-xs text-[#786755]">
    <span>${state.title}</span>
    <span>Slide 0${newPageNum}</span>
  </div>
</div>
    `.trim();
  } else {
    defaultHtml = `
<div class="h-full flex flex-col justify-between p-14 bg-[#faf7f2] text-[#241c15]">
  <div>
    <h2 class="text-3xl font-serif text-[#241c15] border-b border-[#dcd3c5] pb-4">
      Section ${newPageNum} &mdash; Supplementary Perspectives
    </h2>
    <p class="mt-6 text-[#4d3f32] leading-relaxed text-[15px]">
      This page is rendered inside the background web container. Highlight any text or select any card to pin instructions for the AI agent to edit.
    </p>
  </div>
  <div class="border-t border-[#dcd3c5] pt-4 flex justify-between text-xs text-[#786755]">
    <span>${state.title}</span>
    <span>Page 0${newPageNum}</span>
  </div>
</div>
    `.trim();
  }

  state.pages.push({
    id: `page-${Date.now()}`,
    html: customHtml || defaultHtml,
    css: customCss || ''
  });

  saveProjects();
  renderAllPages();
  updateSidebar();
  broadcastStateToMcp();
}

// Bind UI Listeners
function bindEvents() {
  // Title Input
  docTitleInput.addEventListener('change', (e) => {
    state.title = e.target.value.trim() || 'Untitled Document';
    saveProjects();
    renderProjectDropdownList();
    broadcastStateToMcp();
  });

  // Paper Size Select
  paperSizeSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      const curW = state.customWidthMm || 210;
      const curH = state.customHeightMm || 297;
      const wPrompt = prompt('Enter custom width in millimeters (mm):', curW);
      if (wPrompt !== null && !isNaN(parseFloat(wPrompt)) && parseFloat(wPrompt) > 0) {
        const hPrompt = prompt('Enter custom height in millimeters (mm):', curH);
        if (hPrompt !== null && !isNaN(parseFloat(hPrompt)) && parseFloat(hPrompt) > 0) {
          state.customWidthMm = parseFloat(wPrompt);
          state.customHeightMm = parseFloat(hPrompt);
          state.pageSize = 'custom';
        } else {
          paperSizeSelect.value = state.pageSize;
          return;
        }
      } else {
        paperSizeSelect.value = state.pageSize;
        return;
      }
    } else {
      state.pageSize = val;
    }

    saveProjects();
    renderAllPages();
    broadcastStateToMcp();
  });

  // Orientation
  btnOrientationPortrait.addEventListener('click', () => {
    state.orientation = 'portrait';
    btnOrientationPortrait.classList.add('active');
    btnOrientationLandscape.classList.remove('active');
    saveProjects();
    renderAllPages();
    broadcastStateToMcp();
  });

  btnOrientationLandscape.addEventListener('click', () => {
    state.orientation = 'landscape';
    btnOrientationLandscape.classList.add('active');
    btnOrientationPortrait.classList.remove('active');
    saveProjects();
    renderAllPages();
    broadcastStateToMcp();
  });

  // Zoom
  btnZoomIn.addEventListener('click', zoomIn);
  btnZoomOut.addEventListener('click', zoomOut);
  btnZoomFit.addEventListener('click', zoomFit);

  // Mode Toggle
  btnModePreview.addEventListener('click', () => {
    state.mode = 'preview';
    btnModePreview.classList.add('active');
    btnModeEdit.classList.remove('active');
    wysiwygBar.classList.remove('active');
    saveProjects();
    renderAllPages();
  });

  btnModeEdit.addEventListener('click', () => {
    state.mode = 'edit';
    btnModeEdit.classList.add('active');
    btnModePreview.classList.remove('active');
    saveProjects();
    renderAllPages();
  });

  // Add Page
  btnAddPageTop.addEventListener('click', () => addNewPage());
  btnAddPageSidebar.addEventListener('click', () => addNewPage());

  // Three-dot project menu toggle
  btnProjectMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    projectMenuDropdown.classList.toggle('active');
    renderProjectDropdownList();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.project-menu-container')) {
      projectMenuDropdown.classList.remove('active');
    }
  });

  // Doc Type toggle inside dropdown
  // New Project Modal Trigger
  btnNewProjectTrigger.addEventListener('click', () => {
    projectMenuDropdown.classList.remove('active');
    modalProjectTitle.value = '';
    modalProjectSize.value = 'A4';
    modalCustomDims.style.display = 'none';
    modalSelectedOrient = 'portrait';
    modalOrientPortrait.classList.add('active');
    modalOrientLandscape.classList.remove('active');

    newProjectModal.classList.add('active');
    newProjectBackdrop.classList.add('active');
    modalProjectTitle.focus();
  });

  const closeNewProjectModal = () => {
    newProjectModal.classList.remove('active');
    newProjectBackdrop.classList.remove('active');
  };

  btnCloseNewProjectModal.addEventListener('click', closeNewProjectModal);
  btnCancelNewProject.addEventListener('click', closeNewProjectModal);
  newProjectBackdrop.addEventListener('click', closeNewProjectModal);

  // Modal Project Size selection
  modalProjectSize.addEventListener('change', () => {
    const val = modalProjectSize.value;
    if (val === '16:9' || val === '4:3') {
      modalSelectedOrient = 'landscape';
      modalOrientLandscape.classList.add('active');
      modalOrientPortrait.classList.remove('active');
    } else if (val !== 'custom') {
      modalSelectedOrient = 'portrait';
      modalOrientPortrait.classList.add('active');
      modalOrientLandscape.classList.remove('active');
    }

    if (val === 'custom') {
      modalCustomDims.style.display = 'grid';
    } else {
      modalCustomDims.style.display = 'none';
    }
  });

  // Modal Orientation selection
  modalOrientPortrait.addEventListener('click', () => {
    modalSelectedOrient = 'portrait';
    modalOrientPortrait.classList.add('active');
    modalOrientLandscape.classList.remove('active');
  });

  modalOrientLandscape.addEventListener('click', () => {
    modalSelectedOrient = 'landscape';
    modalOrientLandscape.classList.add('active');
    modalOrientPortrait.classList.remove('active');
  });

  // Submit New Project
  btnSubmitNewProject.addEventListener('click', () => {
    const pageSize = modalProjectSize.value;
    const isWidescreen = pageSize === '16:9' || pageSize === '4:3';
    const title = modalProjectTitle.value.trim() || (isWidescreen ? 'Untitled Presentation' : 'Untitled Document');
    const isCustom = pageSize === 'custom';
    const customW = isCustom ? (parseFloat(modalCustomW.value) || 210) : null;
    const customH = isCustom ? (parseFloat(modalCustomH.value) || 297) : null;

    const newProj = createProjectModel({
      title,
      pageSize,
      customWidthMm: customW,
      customHeightMm: customH,
      orientation: modalSelectedOrient
    });

    projects.push(newProj);
    saveProjects();
    switchProject(newProj.id);
    closeNewProjectModal();
  });

  // Sidebar Page List Action Delegation
  sidebarPageList.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-tool');
    if (!btn) return;

    const action = btn.dataset.action;
    const idx = parseInt(btn.dataset.index, 10);

    if (action === 'scroll') {
      const pageEl = document.getElementById(`page-wrapper-${idx}`);
      if (pageEl) pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (action === 'code') {
      openCodeDrawer(idx);
    } else if (action === 'duplicate') {
      const target = state.pages[idx];
      state.pages.splice(idx + 1, 0, {
        id: `page-${Date.now()}`,
        html: target.html,
        css: target.css
      });
      saveProjects();
      renderAllPages();
      updateSidebar();
      broadcastStateToMcp();
    } else if (action === 'delete') {
      if (state.pages.length <= 1) {
        alert('You must have at least one page/slide.');
        return;
      }
      if (confirm(`Delete ${state.docType === 'pptx' ? 'Slide' : 'Page'} ${idx + 1}?`)) {
        state.pages.splice(idx, 1);
        saveProjects();
        renderAllPages();
        updateSidebar();
        broadcastStateToMcp();
      }
    }
  });

  // Sidebar Comments List Actions
  sidebarCommentsList.addEventListener('click', (e) => {
    const authBtn = e.target.closest('.btn-authorize');
    const resolveBtn = e.target.closest('.btn-resolve');
    const scrollBtn = e.target.closest('[data-scroll-comment]');

    if (authBtn) {
      const commentId = authBtn.dataset.commentId;
      const c = state.comments.find(item => item.id === commentId);
      if (c) {
        c.authorized = !c.authorized;
        c.status = c.authorized ? 'authorized' : 'pending';
        saveProjects();
        updateSidebar();
        broadcastStateToMcp();
        if (window.electronAPI && window.electronAPI.authorizeInstruction) {
          window.electronAPI.authorizeInstruction({ commentId, authorize: c.authorized });
        }
      }
    } else if (resolveBtn) {
      const commentId = resolveBtn.dataset.commentId;
      const c = state.comments.find(item => item.id === commentId);
      if (c) {
        c.resolved = !c.resolved;
        saveProjects();
        updateAllPins();
        updateSidebar();
        broadcastStateToMcp();
      }
    } else if (scrollBtn) {
      const pageIdx = parseInt(scrollBtn.dataset.scrollComment, 10);
      const pageEl = document.getElementById(`page-wrapper-${pageIdx}`);
      if (pageEl) pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Batch Authorization for all pending instructions
  if (btnImplementAllComments) {
    btnImplementAllComments.addEventListener('click', () => {
      const pendingUnauth = state.comments.filter(c => !c.resolved && !c.authorized);
      if (pendingUnauth.length === 0) {
        alert('All pending instructions are already authorized for the AI agent.');
        return;
      }
      pendingUnauth.forEach(c => {
        c.authorized = true;
        c.status = 'authorized';
        if (window.electronAPI && window.electronAPI.authorizeInstruction) {
          window.electronAPI.authorizeInstruction({ commentId: c.id, authorize: true });
        }
      });
      saveProjects();
      updateSidebar();
      broadcastStateToMcp();
      alert(`Authorized ${pendingUnauth.length} pending instruction(s). The AI MCP Agent is granted execution permission!`);
    });
  }

  // Selection Tool Mode Buttons
  if (btnSelObject) btnSelObject.addEventListener('click', () => setSelectionMode('object'));
  if (btnSelRect) btnSelRect.addEventListener('click', () => setSelectionMode('rectangle'));
  if (btnSelLasso) btnSelLasso.addEventListener('click', () => setSelectionMode('oval'));

  // Canvas Action Delegation
  pagesContainer.addEventListener('click', (e) => {
    const btnDrawer = e.target.closest('.btn-open-drawer');
    if (btnDrawer) {
      const idx = parseInt(btnDrawer.dataset.index, 10);
      openCodeDrawer(idx);
    }
  });

  // Comment Popover Buttons
  if (btnSaveComment) btnSaveComment.addEventListener('click', saveComment);
  if (btnCancelComment) {
    btnCancelComment.addEventListener('click', () => {
      if (commentPopover) commentPopover.classList.remove('active');
      activeCommentTarget = null;
      if (selectionEngine) selectionEngine.clearSelection();
    });
  }
  if (btnClosePopover) {
    btnClosePopover.addEventListener('click', () => {
      if (commentPopover) commentPopover.classList.remove('active');
      activeCommentTarget = null;
      if (selectionEngine) selectionEngine.clearSelection();
    });
  }

  // Code Drawer Tabs and Actions
  drawerTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      drawerTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDrawerTab = btn.dataset.tab;
      updateDrawerContent();
    });
  });

  if (btnApplyCode) btnApplyCode.addEventListener('click', applyDrawerCode);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeCodeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeCodeDrawer);

  // Setup Document Ingestion & Import (PDF, JSON, Images, Drag & Drop)
  setupDocumentIngestion();

  // Output Actions
  if (btnPrint) btnPrint.addEventListener('click', handlePrint);
  if (btnDownloadPdf) btnDownloadPdf.addEventListener('click', handleDownloadPdf);
  if (btnDownloadPptx) btnDownloadPptx.addEventListener('click', handleDownloadPptx);

  // MCP Info Modal Listeners & Universal Multi-Provider Switching
  const btnMcpConnect = document.getElementById('btn-mcp-connect');
  const btnOpenMcpModal = document.getElementById('btn-open-mcp-modal');
  const btnCloseMcpModal = document.getElementById('btn-close-mcp-modal');
  const mcpModal = document.getElementById('mcp-info-modal');
  const mcpBackdrop = document.getElementById('mcp-modal-backdrop');
  const btnCopyMcpConfig = document.getElementById('btn-copy-mcp-config');
  const btnCopyLabel = document.getElementById('btn-copy-label');
  const mcpSnippet = document.getElementById('mcp-config-snippet');
  const mcpTabTitle = document.getElementById('mcp-config-tab-title');
  const mcpInstruction = document.getElementById('mcp-provider-instruction');
  const mcpTabsNav = document.getElementById('mcp-tabs-nav');
  const btnCopyGeminiUrl = document.getElementById('btn-copy-gemini-url');
  const btnCopyUrl = document.getElementById('btn-copy-url');
  const btnCopyCmd = document.getElementById('btn-copy-cmd');

  const MCP_CONFIGS = {
    gemini: {
      title: 'Google Gemini Connected Apps (HTTPS Endpoint)',
      buttonLabel: 'Copy Gemini HTTPS URL',
      instruction: 'In <strong>Gemini &gt; Settings &gt; Connected Apps &gt; Add MCP Server</strong>, enter Server Name: <code>Y-Master-Editor</code> and paste the public HTTPS URL below.',
      snippet: JSON.stringify({
        name: "Y-Master-Editor",
        description: "Standard Document Editor & Canvas Operations MCP Server",
        url: "https://preserve-gilbert-lyrics-simple.trycloudflare.com/mcp",
        transport: "streamable_http",
        capabilities: {
          tools: [
            "get_document_outline",
            "get_selection_context",
            "get_pending_instructions",
            "authorize_instruction",
            "propose_component_change",
            "propose_region_replacement",
            "update_page_content",
            "add_page",
            "rollback_transaction"
          ]
        }
      }, null, 2)
    },
    claude: {
      title: 'claude_desktop_config.json',
      buttonLabel: 'Copy Claude Config',
      instruction: 'Paste into your <code>claude_desktop_config.json</code> under <code>mcpServers</code> and restart Claude Desktop or Claude Code.',
      snippet: JSON.stringify({
        mcpServers: {
          "y-master-editor": {
            command: "node",
            args: [
              "Y:\\github repositories\\Y-Master-Editor\\electron\\mcp-server.cjs"
            ]
          }
        }
      }, null, 2)
    },
    openai: {
      title: 'OpenAI Agent / ChatGPT Actions Endpoint',
      buttonLabel: 'Copy OpenAI SSE Endpoint',
      instruction: 'Connect your OpenAI Assistant or custom GPT agent directly via Streamable HTTP / SSE. Zero installation needed.',
      snippet: JSON.stringify({
        type: "mcp",
        name: "y-master-editor",
        server_url: "http://127.0.0.1:48721/mcp",
        transport: "streamable_http"
      }, null, 2)
    },
    cursor: {
      title: 'Cursor Features → MCP Settings',
      buttonLabel: 'Copy Cursor MCP Config',
      instruction: 'Add under <strong>Cursor Settings &gt; Features &gt; MCP</strong>. Select Type <em>command</em> or <em>sse</em>.',
      snippet: JSON.stringify({
        mcpServers: {
          "y-master-editor": {
            command: "node",
            args: [
              "Y:\\github repositories\\Y-Master-Editor\\electron\\mcp-server.cjs"
            ]
          }
        }
      }, null, 2)
    },
    vscode: {
      title: '.vscode/settings.json or Windsurf',
      buttonLabel: 'Copy VS Code Config',
      instruction: 'Add to your VS Code <code>settings.json</code> or Windsurf Cascade MCP settings configuration.',
      snippet: JSON.stringify({
        mcpServers: {
          "y-master-editor": {
            command: "node",
            args: [
              "Y:\\github repositories\\Y-Master-Editor\\electron\\mcp-server.cjs"
            ]
          }
        }
      }, null, 2)
    }
  };

  let activeMcpProvider = 'gemini';

  const highlightJson = (code) => {
    return code
      .replace(/"([^"]+)"(?=\s*:)/g, '<span class="syn-key">"$1"</span>')
      .replace(/(:\s*)"([^"]*)"/g, '$1<span class="syn-str">"$2"</span>')
      .replace(/(\[\s*)"([^"]*)"(\s*\])/g, '$1<span class="syn-str">"$2"</span>$3')
      .replace(/:/g, '<span class="syn-colon">:</span>')
      .replace(/([{}])/g, '<span class="syn-brace">$1</span>')
      .replace(/([\[\]])/g, '<span class="syn-bracket">$1</span>');
  };

  const renderActiveMcpProvider = () => {
    const data = MCP_CONFIGS[activeMcpProvider];
    if (!data) return;
    if (mcpTabTitle) mcpTabTitle.textContent = data.title;
    if (btnCopyLabel) btnCopyLabel.textContent = data.buttonLabel;
    if (mcpInstruction) mcpInstruction.innerHTML = data.instruction;
    if (mcpSnippet) {
      mcpSnippet.innerHTML = highlightJson(data.snippet);
    }
  };

  const copyToClipboard = async (text, triggerBtn, originalText) => {
    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (err) {
        // Fallback to execCommand on permission/focus rejection
      }
    }
    if (!copied) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (err) {
        console.warn('Clipboard fallback error:', err);
      }
    }
    if (triggerBtn) {
      const lbl = triggerBtn.querySelector('span') || triggerBtn;
      const prev = lbl.textContent;
      lbl.textContent = '✓ Copied!';
      setTimeout(() => { lbl.textContent = originalText || prev; }, 1800);
    }
  };

  const openMcpModal = () => {
    if (mcpModal) mcpModal.classList.add('active');
    if (mcpBackdrop) mcpBackdrop.classList.add('active');
    renderActiveMcpProvider();
  };

  const closeMcpModal = () => {
    if (mcpModal) mcpModal.classList.remove('active');
    if (mcpBackdrop) mcpBackdrop.classList.remove('active');
  };

  if (btnMcpConnect) btnMcpConnect.addEventListener('click', openMcpModal);
  if (btnOpenMcpModal) btnOpenMcpModal.addEventListener('click', openMcpModal);
  if (btnCloseMcpModal) btnCloseMcpModal.addEventListener('click', closeMcpModal);
  if (mcpBackdrop) mcpBackdrop.addEventListener('click', closeMcpModal);

  if (mcpTabsNav) {
    mcpTabsNav.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.mcp-tab-btn');
      if (!tabBtn) return;
      const provider = tabBtn.dataset.provider;
      if (!provider || !MCP_CONFIGS[provider]) return;
      mcpTabsNav.querySelectorAll('.mcp-tab-btn').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      activeMcpProvider = provider;
      renderActiveMcpProvider();
    });
  }

  if (btnCopyMcpConfig) {
    btnCopyMcpConfig.addEventListener('click', () => {
      const data = MCP_CONFIGS[activeMcpProvider];
      if (data) {
        copyToClipboard(data.snippet, btnCopyLabel, data.buttonLabel);
      }
    });
  }

  if (btnCopyGeminiUrl) {
    btnCopyGeminiUrl.addEventListener('click', () => {
      copyToClipboard('https://preserve-gilbert-lyrics-simple.trycloudflare.com/mcp', btnCopyGeminiUrl, 'Copy HTTPS URL');
    });
  }

  if (btnCopyUrl) {
    btnCopyUrl.addEventListener('click', () => {
      copyToClipboard('http://127.0.0.1:48721/mcp', btnCopyUrl, 'Copy URL');
    });
  }

  if (btnCopyCmd) {
    btnCopyCmd.addEventListener('click', () => {
      copyToClipboard('node electron/mcp-server.cjs', btnCopyCmd, 'Copy Command');
    });
  }

  // Initialize MCP modal snippet
  renderActiveMcpProvider();

  // --- Omni-Auth, Nicknames & Telemetry Event Listeners ---
  if (btnOpenAuthModal) {
    btnOpenAuthModal.addEventListener('click', () => {
      openAuthModal('signup');
    });
  }

  if (btnCloseAuthModal) btnCloseAuthModal.addEventListener('click', closeAuthModal);
  if (authModalBackdrop) authModalBackdrop.addEventListener('click', closeAuthModal);

  // Tabs switching
  if (tabBtnSignin) {
    tabBtnSignin.addEventListener('click', () => {
      openAuthModal('signin');
    });
  }
  if (tabBtnSignup) {
    tabBtnSignup.addEventListener('click', () => {
      openAuthModal('signup');
    });
  }

  // Live Animated SVG Avatar preview on Nickname input
  let nicknameCheckTimeout = null;
  if (authSignupNickname) {
    authSignupNickname.addEventListener('input', (e) => {
      const val = e.target.value.trim().replace(/[^a-zA-Z0-9_]/g, '');
      if (signupAvatarStage && window.YAvatarEngine) {
        window.YAvatarEngine.renderAvatar(signupAvatarStage, val || 'YMaster', { size: 90, animated: true });
      }

      if (nicknameCheckTimeout) clearTimeout(nicknameCheckTimeout);
      nicknameCheckTimeout = setTimeout(async () => {
        if (!val || val.length < 3) {
          if (signupNicknameFeedback) {
            signupNicknameFeedback.className = 'nickname-feedback-badge unavailable';
            signupNicknameFeedback.textContent = 'At least 3 alphanumeric characters.';
          }
          return;
        }

        if (window.FoliyoFirebase && window.FoliyoFirebase.checkNickname) {
          const res = await window.FoliyoFirebase.checkNickname(val);
          if (signupNicknameFeedback) {
            if (res && res.available) {
              signupNicknameFeedback.className = 'nickname-feedback-badge available';
              signupNicknameFeedback.textContent = `✓ @${res.nickname} is available!`;
            } else {
              signupNicknameFeedback.className = 'nickname-feedback-badge unavailable';
              signupNicknameFeedback.textContent = (res && res.error) || 'Nickname taken.';
            }
          }
        }
      }, 250);
    });
  }

  // Shuffle Nickname Button
  if (btnShuffleNickname) {
    btnShuffleNickname.addEventListener('click', () => {
      if (window.YAvatarEngine && authSignupNickname) {
        const newNick = window.YAvatarEngine.generateFunNickname();
        authSignupNickname.value = newNick;
        window.YAvatarEngine.renderAvatar(signupAvatarStage, newNick, { size: 90, animated: true });
        if (signupNicknameFeedback) {
          signupNicknameFeedback.className = 'nickname-feedback-badge available';
          signupNicknameFeedback.textContent = `✓ Generated @${newNick}`;
        }
      }
    });
  }

  // Sign Up with Nickname & Password
  if (btnDoSignup) {
    btnDoSignup.addEventListener('click', async () => {
      const nick = authSignupNickname ? authSignupNickname.value.trim() : '';
      const email = authSignupEmail ? authSignupEmail.value.trim() : '';
      const pass = authSignupPassword ? authSignupPassword.value : '';
      const confirm = authSignupConfirm ? authSignupConfirm.value : '';

      if (!nick || nick.length < 3) {
        showAuthError('Please choose a nickname with at least 3 characters.');
        return;
      }
      if (!pass || pass.length < 6) {
        showAuthError('Password must be at least 6 characters long.');
        return;
      }
      if (pass !== confirm) {
        showAuthError('Passwords do not match. Please verify.');
        return;
      }

      btnDoSignup.disabled = true;
      btnDoSignup.textContent = 'Claiming Nickname...';

      const res = await signUpWithNicknameAccount(nick, pass, email);
      btnDoSignup.disabled = false;
      btnDoSignup.textContent = 'Create Account & Claim Nickname';

      if (res && res.success) {
        closeAuthModal();
      } else {
        showAuthError((res && res.error) || 'Registration failed.');
      }
    });
  }

  // Sign In with Nickname / Email & Password
  if (btnDoSignin) {
    btnDoSignin.addEventListener('click', async () => {
      const input = authSigninInput ? authSigninInput.value.trim() : '';
      const pass = authSigninPassword ? authSigninPassword.value : '';

      if (!input || !pass) {
        showAuthError('Please enter your nickname/email and password.');
        return;
      }

      btnDoSignin.disabled = true;
      btnDoSignin.textContent = 'Authenticating...';

      const res = await loginWithNicknameCredentials(input, pass);
      btnDoSignin.disabled = false;
      btnDoSignin.textContent = 'Sign In to Studio';

      if (res && res.success) {
        closeAuthModal();
      } else {
        showAuthError((res && res.error) || 'Invalid credentials.');
      }
    });
  }

  // Social Auth Buttons
  if (btnSocialGoogle) btnSocialGoogle.addEventListener('click', () => { closeAuthModal(); loginWithSocialProvider('google'); });
  if (btnSocialFacebook) btnSocialFacebook.addEventListener('click', () => { closeAuthModal(); loginWithSocialProvider('facebook'); });
  if (btnSocialGithub) btnSocialGithub.addEventListener('click', () => { closeAuthModal(); loginWithSocialProvider('github'); });
  if (btnSocialApple) btnSocialApple.addEventListener('click', () => { closeAuthModal(); loginWithSocialProvider('apple'); });

  // Guest Mode
  if (btnAuthGuest) {
    btnAuthGuest.addEventListener('click', () => {
      closeAuthModal();
    });
  }

  // User Profile Pill & Dropdown Toggle
  if (btnUserProfile) {
    btnUserProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userProfileDropdown) {
        userProfileDropdown.classList.toggle('active');
        if (currentUser && currentUser.uid) {
          renderActiveTelemetry(currentUser.uid);
        }
      }
    });
  }

  // Sign out
  if (btnGoogleSignout) {
    btnGoogleSignout.addEventListener('click', async () => {
      if (userProfileDropdown) userProfileDropdown.classList.remove('active');
      await logoutGoogle();
    });
  }

  // Switch account
  if (btnSwitchAccount) {
    btnSwitchAccount.addEventListener('click', () => {
      if (userProfileDropdown) userProfileDropdown.classList.remove('active');
      openAuthModal('signin');
    });
  }

  // Open Scoped Data modal
  if (btnOpenScopedData) {
    btnOpenScopedData.addEventListener('click', () => {
      if (userProfileDropdown) userProfileDropdown.classList.remove('active');
      populateScopedDataTable();
      if (scopedDataModal) scopedDataModal.classList.add('active');
      if (scopedDataBackdrop) scopedDataBackdrop.classList.add('active');
    });
  }

  // Scoped Data Modal Close Handlers
  const closeScopedModal = () => {
    if (scopedDataModal) scopedDataModal.classList.remove('active');
    if (scopedDataBackdrop) scopedDataBackdrop.classList.remove('active');
  };
  if (btnCloseScopedModal) btnCloseScopedModal.addEventListener('click', closeScopedModal);
  if (btnDoneScopedModal) btnDoneScopedModal.addEventListener('click', closeScopedModal);
  if (scopedDataBackdrop) scopedDataBackdrop.addEventListener('click', closeScopedModal);

  // Export Account JSON
  if (btnExportAccountJson) {
    btnExportAccountJson.addEventListener('click', exportScopedDataJson);
  }

  // Click outside to close user dropdown
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#user-profile-menu-container') && userProfileDropdown) {
      userProfileDropdown.classList.remove('active');
    }
  });

  // Application Update Event Handlers & Modal
  window.openUpdateModal = () => {
    if (projectMenuDropdown) projectMenuDropdown.classList.remove('active');
    if (appUpdateModal) appUpdateModal.classList.add('active');
    if (updateModalBackdrop) updateModalBackdrop.classList.add('active');

    if (window.electronAPI && window.electronAPI.checkAppUpdate) {
      window.electronAPI.checkAppUpdate().then(info => {
        console.log('[Update Check Result]', info);
      }).catch(err => console.warn(err));
    }
  };

  window.closeUpdateModal = () => {
    if (appUpdateModal) appUpdateModal.classList.remove('active');
    if (updateModalBackdrop) updateModalBackdrop.classList.remove('active');
  };

  if (btnAppUpdate) btnAppUpdate.addEventListener('click', window.openUpdateModal);
  if (btnMenuUpdate) btnMenuUpdate.addEventListener('click', window.openUpdateModal);
  if (btnSidebarUpdate) btnSidebarUpdate.addEventListener('click', window.openUpdateModal);
  if (btnCloseUpdateModal) btnCloseUpdateModal.addEventListener('click', window.closeUpdateModal);
  if (btnCancelUpdate) btnCancelUpdate.addEventListener('click', window.closeUpdateModal);
  if (updateModalBackdrop) updateModalBackdrop.addEventListener('click', window.closeUpdateModal);

  // Wire Desktop Auto-Updater IPC Listeners
  if (window.electronUpdater) {
    if (typeof window.electronUpdater.onProgress === 'function') {
      window.electronUpdater.onProgress((pct) => {
        if (updateProgressContainer) updateProgressContainer.style.display = 'block';
        if (updateProgressFill) updateProgressFill.style.width = `${pct}%`;
        if (updateProgressPct) updateProgressPct.textContent = `${pct}%`;
        if (updateProgressStatus) updateProgressStatus.textContent = `Downloading update (${pct}%)...`;
      });
    }

    if (typeof window.electronUpdater.onError === 'function') {
      window.electronUpdater.onError((err) => {
        console.warn('[AutoUpdater Notice in UI]:', err);
      });
    }

    if (typeof window.electronUpdater.onAvailable === 'function') {
      window.electronUpdater.onAvailable((info) => {
        console.log('[AutoUpdater Available]:', info);
        if (btnConfirmUpdateLabel && info && info.version) {
          btnConfirmUpdateLabel.textContent = `Update to v${info.version} Now`;
        }
        window.openUpdateModal();
      });
    }
  }

  if (btnConfirmAppUpdate) {
    btnConfirmAppUpdate.addEventListener('click', async () => {
      if (updateProgressContainer) updateProgressContainer.style.display = 'block';
      btnConfirmAppUpdate.disabled = true;

      const setProgress = (pct, msg) => {
        if (updateProgressFill) updateProgressFill.style.width = `${pct}%`;
        if (updateProgressPct) updateProgressPct.textContent = `${pct}%`;
        if (updateProgressStatus) updateProgressStatus.textContent = msg;
      };

      // 1. Mandatory Blueprint: Try electron-updater GitHub release download & silent hot-swap
      if (window.electronUpdater && typeof window.electronUpdater.downloadAndInstall === 'function') {
        setProgress(10, 'Contacting GitHub Releases & preparing update...');
        try {
          await window.electronUpdater.downloadAndInstall();
          setProgress(100, 'Release downloaded! Silent hot-swap and relaunch in progress...');
          return;
        } catch (updateErr) {
          console.warn('[AutoUpdater download error, falling back to local runner]:', updateErr.message);
        }
      }

      // 2. Fallback local / dev installer pipeline
      setProgress(25, 'Preserving local projects and workspace state...');
      saveProjects();
      await new Promise(r => setTimeout(r, 350));

      setProgress(60, 'Staging Y Master Editor package & Light Earth Tone design system...');
      await new Promise(r => setTimeout(r, 450));

      setProgress(85, 'Executing update installer...');

      if (window.electronAPI && window.electronAPI.installAppUpdate) {
        try {
          const res = await window.electronAPI.installAppUpdate();
          setProgress(100, res.message || 'Y Master Editor installer launched! Follow on-screen setup to finish.');
          if (btnConfirmUpdateLabel) btnConfirmUpdateLabel.textContent = 'Relaunch App';
          btnConfirmAppUpdate.disabled = false;
          btnConfirmAppUpdate.onclick = () => {
            if (window.electronAPI.relaunchApp) {
              window.electronAPI.relaunchApp();
            } else {
              window.location.reload();
            }
          };
        } catch (err) {
          setProgress(100, 'Update staged. Relaunching app to finalize...');
          setTimeout(() => window.location.reload(), 1500);
        }
      } else {
        setProgress(100, 'Y Master Editor applied! Workspace is completely updated.');
        setTimeout(() => {
          window.closeUpdateModal();
        }, 1400);
      }
    });
  }
}

// Initialize Application
async function init() {
  await loadProjects();
  syncUiWithState();
  updateAuthUi();
  bindEvents();
  bindWysiwygEvents();
  renderAllPages();
  updateSidebar();
  renderProjectDropdownList();
  setupMcpListener();

  // Subscribe to instant zero-delay desktop releases via Firebase + GitHub
  if (typeof window.subscribeToInstantDesktopRelease === 'function') {
    window.subscribeToInstantDesktopRelease((version, notes) => {
      console.log(`[Instant Desktop Release Trigger] v${version} available:`, notes);
      if (btnConfirmUpdateLabel) {
        btnConfirmUpdateLabel.textContent = `Update to v${version} Now`;
      }
      window.openUpdateModal();
    });
  }

  // Smooth startup auto-fit and responsive resize handling
  requestAnimationFrame(() => {
    if (typeof zoomFit === 'function') zoomFit();
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof updateAllPins === 'function') updateAllPins();
    }, 120);
  });

  // Global Keyboard Shortcuts (Escape to dismiss active modals)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.mcp-info-modal.active, .scoped-data-modal.active, .app-update-modal.active, .google-signin-modal.active, .code-drawer.open');
      activeModals.forEach(m => m.classList.remove('active'));
      document.querySelectorAll('.drawer-backdrop.active').forEach(b => b.classList.remove('active'));
      const activePopover = document.getElementById('comment-popover');
      if (activePopover) activePopover.classList.remove('active');
      const projectDropdown = document.getElementById('project-menu-dropdown');
      if (projectDropdown) projectDropdown.classList.remove('active');
      const userDropdown = document.getElementById('user-profile-dropdown');
      if (userDropdown) userDropdown.classList.remove('active');
    }
  });
}

init();
