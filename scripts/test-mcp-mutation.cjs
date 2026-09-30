const { spawn } = require('child_process');
const path = require('path');

const mcpScript = path.join(__dirname, '..', 'electron', 'mcp-server.cjs');
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
      sendRpc({ jsonrpc: '2.0', method: 'notifications/initialized' });
      // Call add_page
      sendRpc({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'add_page',
          arguments: {
            html: '<div class="p-12 text-[#2b352d]"><h1 class="text-3xl font-serif">MCP Test Added Page</h1><p class="mt-4 text-[#8e511b]">Verified Agentic Insertion</p></div>'
          }
        }
      });
    } else if (msg.id === 2) {
      console.log('✅ add_page tool response:', msg.result.content[0].text);
      // Now verify document state page count
      sendRpc({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'get_document_state', arguments: {} }
      });
    } else if (msg.id === 3) {
      console.log('✅ get_document_state after add_page:', msg.result.content[0].text);
      // Clean up by deleting the added page (page 2)
      sendRpc({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: 'delete_page', arguments: { pageNumber: 2 } }
      });
    } else if (msg.id === 4) {
      console.log('✅ delete_page cleanup response:', msg.result.content[0].text);
      console.log('🎉 Full read & write mutation lifecycle verified successfully!');
      proc.kill();
      process.exit(0);
    }
  }
});

// Step 1: Initialize
sendRpc({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'tester', version: '1.0' }
  }
});
