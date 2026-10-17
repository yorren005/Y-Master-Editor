/**
 * src/connectors/gemini-mcp-connector.cjs
 * Google Gemini Custom Connector & Function Calling Bridge for Y Master Editor
 * 
 * Supports:
 * - Google GenAI SDK (@google/genai & google-generativeai) Schema Formats
 * - Gemini Live / Flash / Pro Function Declaration Ingestion
 * - Bi-directional Tool Execution:
 *     a) Native MCP Link (Streamable HTTP /mcp)
 *     b) REST Action Bridge (/api/v1/tools/:toolName)
 * - Automatic conversion from Gemini functionCall to functionResponse parts
 */

const { ClaudeMcpConnector } = require('./claude-mcp-connector.cjs');

class GeminiMcpConnector {
  /**
   * @param {Object} [options]
   * @param {string} [options.baseUrl] e.g. "http://127.0.0.1:48722"
   * @param {string} [options.apiKey] Bearer auth token for protected servers
   * @param {('mcp'|'rest')} [options.defaultExecutionMode='mcp']
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl ? options.baseUrl.replace(/\/$/, '') : 'http://127.0.0.1:48722';
    this.apiKey = options.apiKey || null;
    this.defaultExecutionMode = options.defaultExecutionMode || 'mcp';

    this.mcpClient = new ClaudeMcpConnector({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      clientName: 'google-gemini-mcp-connector',
      clientVersion: '1.0.0'
    });

    this.declarations = [];
    this.isConnected = false;
  }

  getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  /**
   * Initializes the connector:
   * 1. Fetches Gemini function declarations from /api/v1/gemini-tools
   * 2. Establishes MCP streamable session for fast execution
   */
  async initialize() {
    // 1. Fetch Gemini function declarations
    const specUrl = `${this.baseUrl}/api/v1/gemini-tools`;
    const res = await fetch(specUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch Gemini declarations: HTTP ${res.status}`);
    }
    const data = await res.json();
    this.declarations = data.functionDeclarations || [];

    // 2. Establish MCP session if execution mode involves MCP
    try {
      await this.mcpClient.connect();
      this.isConnected = true;
    } catch (err) {
      // Non-fatal if server only supports REST, but report
      this.isConnected = false;
    }

    return {
      initialized: true,
      mcpConnected: this.isConnected,
      toolCount: this.declarations.length,
      tools: this.declarations.map(d => d.name)
    };
  }

  /**
   * Returns Gemini SDK tools configuration object
   * Suitable for passing to Google GenAI SDK:
   * client.models.generateContent({
   *   model: 'gemini-2.5-flash',
   *   contents: [...],
   *   config: { tools: connector.getGeminiToolsConfig() }
   * })
   */
  getGeminiToolsConfig() {
    return [
      {
        functionDeclarations: this.declarations.map(d => ({
          name: d.name,
          description: d.description,
          parameters: d.parameters
        }))
      }
    ];
  }

  /**
   * Execute a Gemini function call.
   * Accepts both Gemini SDK functionCall object or (name, args)
   * @param {Object|string} callOrName { name: string, args: Object } or string
   * @param {Object} [argsObj]
   * @param {('mcp'|'rest')} [mode]
   */
  async executeFunctionCall(callOrName, argsObj = {}, mode = null) {
    const callName = typeof callOrName === 'string' ? callOrName : callOrName.name;
    const callArgs = typeof callOrName === 'string' ? argsObj : (callOrName.args || {});
    const executionMode = mode || this.defaultExecutionMode;

    let executionResult = null;

    if (executionMode === 'mcp') {
      if (!this.isConnected) {
        await this.mcpClient.connect();
        this.isConnected = true;
      }
      const mcpResult = await this.mcpClient.callTool(callName, callArgs);
      executionResult = {
        success: !mcpResult.isError,
        data: mcpResult.data,
        isError: mcpResult.isError
      };
    } else {
      // REST mode via /api/v1/tools/:toolName
      const restUrl = `${this.baseUrl}/api/v1/tools/${callName}`;
      const res = await fetch(restUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(callArgs)
      });
      const json = await res.json();
      executionResult = {
        success: res.ok && json.success,
        data: json.result || json.error,
        isError: !res.ok || !json.success
      };
    }

    // Format Gemini standard FunctionResponse part:
    // https://ai.google.dev/gemini-api/docs/function-calling
    const geminiPart = {
      functionResponse: {
        name: callName,
        response: {
          name: callName,
          content: executionResult.data,
          success: executionResult.success
        }
      }
    };

    return {
      geminiPart,
      executionResult
    };
  }

  /**
   * Helper to simulate a multi-turn Gemini Tool Call execution turn
   */
  async simulateGeminiTurn(functionCall, mode = 'mcp') {
    const { geminiPart, executionResult } = await this.executeFunctionCall(functionCall, {}, mode);
    return {
      role: 'tool', // or 'function' in legacy Gemini SDK
      parts: [geminiPart],
      result: executionResult
    };
  }

  async close() {
    if (this.isConnected) {
      await this.mcpClient.disconnect();
      this.isConnected = false;
    }
  }
}

module.exports = {
  GeminiMcpConnector
};
