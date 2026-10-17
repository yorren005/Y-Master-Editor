/**
 * src/connectors/index.cjs
 * Unified Entrypoint & Factory for Custom MCP Connectors:
 * - Anthropic Claude (Streamable HTTP MCP Link)
 * - Google Gemini (Declarations & Function Calling Bridge)
 * - OpenAI (Custom GPT Actions & OpenAPI 3.1)
 * - Cursor / Windsurf (IDE MCP Connector)
 */

const { ClaudeMcpConnector } = require('./claude-mcp-connector.cjs');
const { GeminiMcpConnector } = require('./gemini-mcp-connector.cjs');
const { OpenAiCustomGptConnector } = require('./openai-custom-gpt-connector.cjs');
const { IdeMcpConnector } = require('./ide-mcp-connector.cjs');

/**
 * Factory to create a connector for any AI provider
 * @param {('claude'|'gemini'|'openai'|'cursor'|'windsurf')} provider
 * @param {Object} options
 */
function createConnector(provider, options = {}) {
  const norm = (provider || '').toLowerCase();
  switch (norm) {
    case 'claude':
    case 'anthropic':
      return new ClaudeMcpConnector(options);

    case 'gemini':
    case 'google':
      return new GeminiMcpConnector(options);

    case 'openai':
    case 'chatgpt':
    case 'gpt':
      return new OpenAiCustomGptConnector(options);

    case 'cursor':
      return new IdeMcpConnector({ ...options, ideType: 'cursor' });

    case 'windsurf':
      return new IdeMcpConnector({ ...options, ideType: 'windsurf' });

    default:
      return new ClaudeMcpConnector(options);
  }
}

module.exports = {
  ClaudeMcpConnector,
  GeminiMcpConnector,
  OpenAiCustomGptConnector,
  IdeMcpConnector,
  createConnector
};
