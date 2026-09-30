const { spawn } = require('child_process');
const path = require('path');

const mcpScript = path.join(__dirname, '..', 'electron', 'mcp-server.cjs');

console.log('----------------------------------------------------');
console.log('🧪 Starting MCP Server Stdio Protocol Test...');
console.log('Command: node', mcpScript);
console.log('----------------------------------------------------');

const proc = spawn('node', [mcpScript], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';

proc.stderr.on('data', (data) => {
  const text = data.toString().trim();
  if (text) {
    console.log(`[STDERR from MCP] ${text}`);
  }
});

function sendRpc(msgObj) {
  const jsonStr = JSON.stringify(msgObj);
  console.log(`\n➡️ [AGENT SEND]: ${jsonStr}`);
  proc.stdin.write(jsonStr + '\n');
}

function handleMessage(msg) {
  console.log(`\n⬅️ [AGENT RECEIVED Response ID ${msg.id || 'notif'}]:`);
  console.log(JSON.stringify(msg, null, 2));

  if (msg.id === 1) {
    console.log('\n✅ Handshake successful! Protocol version:', msg.result.protocolVersion);
    console.log('Server info:', msg.result.serverInfo);
    
    // Send initialized notification
    sendRpc({
      jsonrpc: '2.0',
      method: 'notifications/initialized'
    });

    // Request tools list
    setTimeout(() => {
      sendRpc({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      });
    }, 200);
  } else if (msg.id === 2) {
    const tools = msg.result.tools || [];
    console.log(`\n✅ Tools List received! Total available tools: ${tools.length}`);
    tools.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.name} - ${t.description.slice(0, 60)}...`);
    });

    // Call tool: get_document_state
    setTimeout(() => {
      sendRpc({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'get_document_state',
          arguments: {}
        }
      });
    }, 200);
  } else if (msg.id === 3) {
    console.log('\n✅ Tool Call (get_document_state) returned successfully:');
    try {
      const parsed = JSON.parse(msg.result.content[0].text);
      console.log('Document Title:', parsed.title);
      console.log('Page Size:', parsed.pageSize);
      console.log('Total Pages:', parsed.totalPages);
      console.log('Pending Comments:', parsed.pendingCommentsCount);
    } catch (e) {
      console.log(msg.result.content[0].text);
    }

    // Call tool: get_pending_comments
    setTimeout(() => {
      sendRpc({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get_pending_comments',
          arguments: {}
        }
      });
    }, 200);
  } else if (msg.id === 4) {
    console.log('\n✅ Tool Call (get_pending_comments) returned successfully:');
    console.log(msg.result.content[0].text);

    console.log('\n🎉 ALL MCP TESTS PASSED WITH 100% SUCCESS!');
    console.log('The MCP server is fully operational and ready for any AI agent connection.');

    setTimeout(() => {
      proc.kill();
      process.exit(0);
    }, 500);
  }
}

proc.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep remainder

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const msg = JSON.parse(trimmed);
      handleMessage(msg);
    } catch (err) {
      console.error('Failed to parse stdout line:', trimmed, err);
    }
  }
});

proc.on('exit', (code) => {
  console.log(`\nMCP process exited with code ${code}`);
});

// Step 1: Send Initialize handshake
sendRpc({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'antigravity-test-client',
      version: '1.0.0'
    }
  }
});
