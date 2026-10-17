/**
 * src/connectors/openai-custom-gpt-connector.cjs
 * OpenAI ChatGPT Custom GPT Action & Agents SDK Connector for Y Master Editor
 * 
 * Supports:
 * - OpenAPI 3.1.0 specification ingestion (/api/v1/openapi.json)
 * - Bearer Token Authentication
 * - ChatGPT Action simulation (HTTP POST to /api/v1/tools/:operationId)
 * - OpenAI Agents SDK MCP Streamable HTTP fallback
 */

const { ClaudeMcpConnector } = require('./claude-mcp-connector.cjs');

class OpenAiCustomGptConnector {
  /**
   * @param {Object} [options]
   * @param {string} [options.baseUrl] e.g. "http://127.0.0.1:48722"
   * @param {string} [options.apiKey] Bearer API token
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl ? options.baseUrl.replace(/\/$/, '') : 'http://127.0.0.1:48722';
    this.apiKey = options.apiKey || null;
    this.openApiSpec = null;
    this.operations = new Map(); // operationId -> { path, method, schema }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  /**
   * Ingest OpenAPI spec as ChatGPT does when configuring a Custom GPT Action
   */
  async loadOpenApiSpec() {
    const specUrl = `${this.baseUrl}/api/v1/openapi.json`;
    const res = await fetch(specUrl);
    if (!res.ok) {
      throw new Error(`Failed to load OpenAPI spec from ${specUrl}: HTTP ${res.status}`);
    }
    const spec = await res.json();
    this.openApiSpec = spec;

    // Index all available operations
    this.operations.clear();
    for (const [pathStr, pathItem] of Object.entries(spec.paths || {})) {
      for (const [method, op] of Object.entries(pathItem)) {
        if (op.operationId) {
          this.operations.set(op.operationId, {
            operationId: op.operationId,
            path: pathStr,
            method: method.toUpperCase(),
            summary: op.summary,
            description: op.description,
            requestSchema: op.requestBody?.content?.['application/json']?.schema
          });
        }
      }
    }

    return {
      title: spec.info?.title,
      version: spec.info?.version,
      operationCount: this.operations.size,
      operations: Array.from(this.operations.keys()),
      securitySchemes: spec.components?.securitySchemes
    };
  }

  /**
   * Executes a Custom GPT Action (REST Tool Execution Bridge)
   * @param {string} operationId
   * @param {Object} parameters
   */
  async executeAction(operationId, parameters = {}) {
    if (!this.operations.has(operationId)) {
      // Refresh spec if not cached
      await this.loadOpenApiSpec();
      if (!this.operations.has(operationId)) {
        throw new Error(`OpenAI Custom GPT Action '${operationId}' not found in OpenAPI spec`);
      }
    }

    const op = this.operations.get(operationId);
    const targetUrl = `${this.baseUrl}${op.path}`;

    const res = await fetch(targetUrl, {
      method: op.method,
      headers: this.getHeaders(),
      body: JSON.stringify(parameters)
    });

    const resJson = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        status: res.status,
        success: false,
        error: resJson?.error || `HTTP ${res.status}: ${res.statusText}`,
        operationId
      };
    }

    return {
      status: res.status,
      success: resJson?.success ?? true,
      result: resJson?.result ?? resJson,
      operationId
    };
  }

  /**
   * Connect via OpenAI Agents SDK Streamable HTTP MCP Link
   */
  createAgentsSdkMcpClient() {
    return new ClaudeMcpConnector({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      clientName: 'openai-agents-sdk-connector',
      clientVersion: '1.0.0'
    });
  }
}

module.exports = {
  OpenAiCustomGptConnector
};
