/**
 * examples/connectors/gemini_tool_call_sample.cjs
 * Example Google Gemini custom connector script for Y Master Editor
 */

const { GeminiMcpConnector } = require('../../src/connectors/gemini-mcp-connector.cjs');

async function main() {
  const connector = new GeminiMcpConnector({
    baseUrl: 'http://127.0.0.1:48722',
    apiKey: process.env.MCP_API_KEY || 'ymaster_mcp_default_token',
    defaultExecutionMode: 'mcp'
  });

  console.log('Connecting Gemini Custom Connector...');
  const init = await connector.initialize();
  console.log(`Connected! Tools available: ${init.toolCount}`);

  // 1. Get Gemini SDK tool configuration
  const toolsConfig = connector.getGeminiToolsConfig();
  console.log('Gemini Tools Config ready for client.models.generateContent:', JSON.stringify(toolsConfig, null, 2));

  // 2. Simulate Gemini LLM executing a function call
  console.log('\nExecuting simulated Gemini function call: get_document_outline...');
  const { geminiPart, executionResult } = await connector.executeFunctionCall({
    name: 'get_document_outline',
    args: {}
  });

  console.log('\nFunctionResponse Part to return to Gemini conversation:');
  console.log(JSON.stringify(geminiPart, null, 2));

  console.log('\nExecution Result:');
  console.log(executionResult);

  await connector.close();
}

main().catch(console.error);
