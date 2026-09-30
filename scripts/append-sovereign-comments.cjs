const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const mcpScript = path.join(__dirname, '..', 'electron', 'mcp-server.cjs');

console.log('📌 Appending rich precision comments to "The Sovereign Man" manual...');

const commentsToAppend = [
  {
    pageIndex: 0,
    selector: '.text-4xl.font-serif',
    selectedText: 'The Sovereign Man: Principles of Internal Command & Gravitas',
    comment: 'Add an author attribution badge: "Transcribed from the Stoic Archives, 2026" with an Autumn Rust emblem',
    x: 35,
    y: 18
  },
  {
    pageIndex: 0,
    selector: 'Figure 1.1',
    selectedText: 'Figure 1.1 The Sovereign Coordinate Matrix',
    comment: 'Highlight Quadrant I with a bold Autumn Rust accent outline and glow to emphasize the target persona',
    x: 48,
    y: 38
  },
  {
    pageIndex: 0,
    selector: '.p-4.bg-[#f4f0e8]',
    selectedText: 'A powerful man is never loud; he is an anchor.',
    comment: 'Change quote border to deep Obsidian Moss and increase font-size to 14px for higher gravitas',
    x: 60,
    y: 26
  },
  {
    pageIndex: 1,
    selector: '04. VOCAL GRAVITY',
    selectedText: 'Vocal Gravity',
    comment: 'Add footnote detailing diaphragmatic breathing cadence (4s in, 6s out) for vocal resonance',
    x: 75,
    y: 32
  },
  {
    pageIndex: 1,
    selector: 'Figure 2.2',
    selectedText: 'The Sovereign De-escalation Protocol',
    comment: 'Add a 5th column for "Post-Action Strategic Review" at T + 60s to ensure zero lingering emotional residue',
    x: 52,
    y: 56
  },
  {
    pageIndex: 1,
    selector: 'I. Gaze Equilibrium',
    selectedText: 'Never break eye contact downwards',
    comment: 'Emphasize the 80/20 eye contact ratio with an inline bold travertine badge',
    x: 22,
    y: 78
  },
  {
    pageIndex: 2,
    selector: 'Figure 3.1',
    selectedText: 'Figure 3.1 The Concentric Circles of Sovereign Sovereignty',
    comment: 'Add visual percentage allocation tags: Inner Core (80% Focus), Middle Band (15%), Outer Void (5% Indifference)',
    x: 45,
    y: 28
  },
  {
    pageIndex: 2,
    selector: 'VI. Absolute Ownership of Chaos',
    selectedText: 'When a crisis strikes your team or family',
    comment: 'Add cross-reference citation to Marcus Aurelius and Extreme Ownership leadership doctrine',
    x: 72,
    y: 84
  }
];

// 1. Update document_state.json directly as well
const stateFile = path.join(__dirname, '..', 'document_state.json');
try {
  if (fs.existsSync(stateFile)) {
    const raw = fs.readFileSync(stateFile, 'utf-8');
    const docState = JSON.parse(raw);
    docState.comments = commentsToAppend.map((c, i) => ({
      id: `c_sov_${Date.now()}_${i + 1}`,
      pageIndex: c.pageIndex,
      selector: c.selector,
      selectedText: c.selectedText,
      elementHtml: `<span>${c.selectedText}</span>`,
      userComment: c.comment,
      x: c.x,
      y: c.y,
      resolved: false,
      createdAt: new Date().toISOString()
    }));
    fs.writeFileSync(stateFile, JSON.stringify(docState, null, 2), 'utf-8');
    console.log(`✅ Saved ${docState.comments.length} comments directly into document_state.json`);
  }
} catch (e) {
  console.error('Error updating state file:', e);
}

// 2. Connect via MCP stdio to send through WebSocket bridge to active app
const proc = spawn('node', [mcpScript], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';
let currentCommentIndex = 0;

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
      console.log('✅ Handshake complete. Appending comments one by one...');
      sendRpc({ jsonrpc: '2.0', method: 'notifications/initialized' });
      sendNextComment();
    } else if (msg.id >= 100) {
      const idx = msg.id - 100;
      console.log(`   Pinned comment ${idx + 1}/${commentsToAppend.length}: "${commentsToAppend[idx].comment.slice(0, 50)}..."`);
      sendNextComment();
    }
  }
});

function sendNextComment() {
  if (currentCommentIndex < commentsToAppend.length) {
    const c = commentsToAppend[currentCommentIndex];
    const rpcId = 100 + currentCommentIndex;
    currentCommentIndex++;

    sendRpc({
      jsonrpc: '2.0',
      id: rpcId,
      method: 'tools/call',
      params: {
        name: 'add_comment',
        arguments: {
          pageIndex: c.pageIndex,
          selector: c.selector,
          selectedText: c.selectedText,
          comment: c.comment,
          x: c.x,
          y: c.y
        }
      }
    });
  } else {
    console.log('\n🎉 ALL 8 COMMENTS APPENDED ACROSS ALL 3 PAGES!');
    setTimeout(() => {
      proc.kill();
      process.exit(0);
    }, 400);
  }
}

// Handshake
sendRpc({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'comment-appender', version: '1.0' }
  }
});
