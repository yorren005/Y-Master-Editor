const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const mcpScript = path.join(__dirname, '..', 'electron', 'mcp-server.cjs');

console.log('✨ Updating "The Sovereign Man" to simple, clear, gap-free language with rich diagrams...');

// ==========================================
// PAGE 1: Clear, gap-free, simple language
// ==========================================
const page1SimpleHtml = `
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

// ==========================================
// PAGE 2: Body & Voice Command (Gap-free & Simple)
// ==========================================
const page2SimpleHtml = `
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

// ==========================================
// PAGE 3: Daily Life & The 7 Iron Rules
// ==========================================
const page3SimpleHtml = `
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

// 1. Update document_state.json with the simplified, gap-free content
const stateFile = path.join(__dirname, '..', 'document_state.json');
try {
  if (fs.existsSync(stateFile)) {
    const raw = fs.readFileSync(stateFile, 'utf-8');
    const docState = JSON.parse(raw);
    docState.title = 'How to Be a Powerful Man: The Simple Field Manual';
    docState.pages = [
      { id: 'page-sov-1', html: page1SimpleHtml, css: '' },
      { id: 'page-sov-2', html: page2SimpleHtml, css: '' },
      { id: 'page-sov-3', html: page3SimpleHtml, css: '' }
    ];
    docState.comments = [
      {
        id: 'c_user_feedback_1',
        pageIndex: 0,
        selector: '.text-3xl.font-serif',
        selectedText: 'How to Be a Powerful Man: The Simple Field Manual',
        elementHtml: '<h1>How to Be a Powerful Man: The Simple Field Manual</h1>',
        userComment: 'I dont want any gaps in my document, I want a very simple language.',
        x: 35,
        y: 18,
        resolved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'c_action_pin_2',
        pageIndex: 1,
        selector: 'Figure 2',
        selectedText: 'Figure 2 The Four Steps to Command Any Room',
        elementHtml: '<span>Figure 2</span>',
        userComment: 'Keep posture rules super simple: Stand tall, breathe into stomach, keep hands still, speak slow.',
        x: 48,
        y: 24,
        resolved: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'c_action_pin_3',
        pageIndex: 2,
        selector: 'Figure 4',
        selectedText: 'Figure 4 The Three Circles of What Matters',
        elementHtml: '<span>Figure 4</span>',
        userComment: 'Highlight the 80% focus on what you control vs 0% on gossip and strangers.',
        x: 52,
        y: 22,
        resolved: false,
        createdAt: new Date().toISOString()
      }
    ];

    // Ensure projects list has updated title
    const projIdx = (docState.projects || []).findIndex(p => p.id === docState.id || p.title.includes('Sovereign') || p.title.includes('Powerful'));
    if (projIdx !== -1) {
      docState.projects[projIdx].title = docState.title;
    }

    fs.writeFileSync(stateFile, JSON.stringify(docState, null, 2), 'utf-8');
    console.log('✅ document_state.json updated with simple language & gap-free layout');
  }
} catch (e) {
  console.error('State file error:', e);
}

// 2. Also update live pages via MCP stdio
const proc = spawn('node', [mcpScript], { stdio: ['pipe', 'pipe', 'pipe'] });
let buffer = '';

function sendRpc(msgObj) {
  proc.stdin.write(JSON.stringify(msgObj) + '\n');
}

proc.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    const msg = JSON.parse(line.trim());

    if (msg.id === 1) {
      console.log('✅ Handshake with MCP complete. Updating live pages...');
      sendRpc({ jsonrpc: '2.0', method: 'notifications/initialized' });

      // Update Page 1
      sendRpc({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'set_page_content',
          arguments: { pageNumber: 1, html: page1SimpleHtml }
        }
      });
    } else if (msg.id === 2) {
      console.log('✅ Page 1 updated in live editor!');
      // Update Page 2
      sendRpc({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'set_page_content',
          arguments: { pageNumber: 2, html: page2SimpleHtml }
        }
      });
    } else if (msg.id === 3) {
      console.log('✅ Page 2 updated in live editor!');
      // Update Page 3
      sendRpc({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'set_page_content',
          arguments: { pageNumber: 3, html: page3SimpleHtml }
        }
      });
    } else if (msg.id === 4) {
      console.log('✅ Page 3 updated in live editor!');
      // Set Document title
      sendRpc({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'set_document_settings',
          arguments: {
            title: 'How to Be a Powerful Man: The Simple Field Manual'
          }
        }
      });
    } else if (msg.id === 5) {
      console.log('✅ Document title updated!');
      // Append comment pin
      sendRpc({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'add_comment',
          arguments: {
            pageIndex: 1,
            selector: 'Figure 2',
            selectedText: 'Figure 2 The Four Steps to Command Any Room',
            comment: 'Keep posture rules super simple: Stand tall, breathe into stomach, keep hands still, speak slow.',
            x: 48,
            y: 24
          }
        }
      });
    } else if (msg.id === 6) {
      console.log('✅ Comment appended in live editor!');
      console.log('\n🎉 ALL SIMPLE-LANGUAGE & GAP-FREE UPDATES APPLIED TO LIVE APP!');
      setTimeout(() => {
        proc.kill();
        process.exit(0);
      }, 500);
    }
  }
});

sendRpc({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'simple-updater', version: '1.0' }
  }
});
