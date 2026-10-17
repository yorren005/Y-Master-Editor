/**
 * src/connectors/claude-mcp-connector.cjs
 * Anthropic Claude Custom Connector Client for Y Master Editor
 * 
 * Implements Model Context Protocol (MCP) Streamable HTTP Specification:
 * - Protocol Handshake (initialize / notifications/initialized)
 * - Session Management (mcp-session-id lifecycle)
 * - Dual Content-Type Negotiation (JSON & text/event-stream SSE)
 * - Tool Discovery & Execution for Claude Desktop, Claude Code & Claude Web
 */

class ClaudeMcpConnector {
  /**
   * @param {Object} [options]
   * @param {string} [options.baseUrl] e.g. "http://127.0.0.1:55100"
   * @param {string} [options.apiKey] Bearer API token
   * @param {string} [options.clientName='claude-desktop-connector']
   * @param {string} [options.clientVersion='1.0.0']
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl ? options.baseUrl.replace(/\/$/, '') : 'http://127.0.0.1:48722';
    this.apiKey = options.apiKey || null;
    this.clientName = options.clientName || 'claude-custom-connector';
    this.clientVersion = options.clientVersion || '1.0.0';
    this.sessionId = null;
    this.protocolVersion = '2024-11-05';
    this.serverCapabilities = null;
    this.serverInfo = null;
    this.nextRequestId = 1;
    this.sseAbortController = null;
  }

  getHeaders(includeSession = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    if (includeSession && this.sessionId) {
      headers['mcp-session-id'] = this.sessionId;
    }
    return headers;
  }

  parseResponseText(contentType, text) {
    if (contentType && contentType.includes('text/event-stream')) {
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr) {
            try { return JSON.parse(jsonStr); } catch (_) {}
          }
        }
      }
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Failed to parse MCP response (${contentType}): ${text.slice(0, 200)}`);
    }
  }

  /**
   * Connect to the MCP Server:
   * 1. Send 'initialize' request
   * 2. Capture 'mcp-session-id' header
   * 3. Send 'notifications/initialized' notification
   */
  async connect(customUrl = null) {
    if (customUrl) {
      this.baseUrl = customUrl.replace(/\/mcp\/?$/, '').replace(/\/$/, '');
    }
    const mcpEndpoint = `${this.baseUrl}/mcp`;

    // Step 1: Initialize
    const initPayload = {
      jsonrpc: '2.0',
      id: this.nextRequestId++,
      method: 'initialize',
      params: {
        protocolVersion: this.protocolVersion,
        capabilities: {
          tools: { listChanged: true },
          resources: { subscribe: true }
        },
        clientInfo: {
          name: this.clientName,
          version: this.clientVersion
        }
      }
    };

    const res = await fetch(mcpEndpoint, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(initPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Claude Connector Handshake Failed (HTTP ${res.status}): ${errText}`);
    }

    // Capture Session ID
    const sessionId = res.headers.get('mcp-session-id');
    if (!sessionId) {
      throw new Error(`Claude Connector: Server did not return mcp-session-id header`);
    }
    this.sessionId = sessionId;

    const resText = await res.text();
    const contentType = res.headers.get('content-type') || '';
    const initResponse = this.parseResponseText(contentType, resText);

    if (initResponse.error) {
      throw new Error(`Claude Connector Handshake RPC Error: ${JSON.stringify(initResponse.error)}`);
    }

    this.serverCapabilities = initResponse.result?.capabilities || {};
    this.serverInfo = initResponse.result?.serverInfo || {};

    // Step 2: Send initialized notification
    await this.sendNotification('notifications/initialized', {});

    return {
      connected: true,
      sessionId: this.sessionId,
      serverInfo: this.serverInfo,
      capabilities: this.serverCapabilities
    };
  }

  /**
   * Sends a JSON-RPC notification (no response expected)
   */
  async sendNotification(method, params = {}) {
    if (!this.sessionId) throw new Error('Not connected. Call connect() first.');
    const mcpEndpoint = `${this.baseUrl}/mcp`;

    const res = await fetch(mcpEndpoint, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params
      })
    });

    return res.ok;
  }

  /**
   * List available tools from the MCP server
   */
  async listTools() {
    if (!this.sessionId) throw new Error('Not connected. Call connect() first.');
    const mcpEndpoint = `${this.baseUrl}/mcp`;

    const reqId = this.nextRequestId++;
    const res = await fetch(mcpEndpoint, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: reqId,
        method: 'tools/list',
        params: {}
      })
    });

    if (!res.ok) {
      throw new Error(`tools/list failed with HTTP ${res.status}: ${await res.text()}`);
    }

    const contentType = res.headers.get('content-type') || '';
    const data = this.parseResponseText(contentType, await res.text());

    if (data.error) {
      throw new Error(`tools/list RPC error: ${JSON.stringify(data.error)}`);
    }

    return data.result?.tools || [];
  }

  /**
   * Execute a tool using Claude's MCP tools/call format
   * @param {string} toolName
   * @param {Object} toolArguments
   */
  async callTool(toolName, toolArguments = {}) {
    if (!this.sessionId) throw new Error('Not connected. Call connect() first.');
    const mcpEndpoint = `${this.baseUrl}/mcp`;

    const reqId = this.nextRequestId++;
    const res = await fetch(mcpEndpoint, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: reqId,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: toolArguments
        }
      })
    });

    if (!res.ok) {
      throw new Error(`tools/call '${toolName}' failed with HTTP ${res.status}: ${await res.text()}`);
    }

    const contentType = res.headers.get('content-type') || '';
    const data = this.parseResponseText(contentType, await res.text());

    if (data.error) {
      throw new Error(`tools/call '${toolName}' RPC error: ${JSON.stringify(data.error)}`);
    }

    // Claude MCP result schema: { content: [{ type: 'text', text: '...' }], isError?: boolean }
    const result = data.result;
    let parsedContent = null;
    if (result?.content?.[0]?.text) {
      try {
        parsedContent = JSON.parse(result.content[0].text);
      } catch (_) {
        parsedContent = result.content[0].text;
      }
    }

    return {
      raw: result,
      isError: !!result?.isError,
      data: parsedContent
    };
  }

  /**
   * Establish SSE connection on GET /mcp for real-time document events
   */
  async listenNotifications(onEvent) {
    if (!this.sessionId) throw new Error('Not connected. Call connect() first.');
    this.sseAbortController = new AbortController();

    const mcpEndpoint = `${this.baseUrl}/mcp`;
    const res = await fetch(mcpEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'mcp-session-id': this.sessionId,
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
      },
      signal: this.sseAbortController.signal
    });

    if (!res.ok) {
      throw new Error(`Failed to subscribe SSE on GET /mcp: HTTP ${res.status}`);
    }

    return {
      connected: true,
      status: res.status,
      contentType: res.headers.get('content-type')
    };
  }

  /**
   * Terminate session gracefully
   */
  async disconnect() {
    if (this.sseAbortController) {
      this.sseAbortController.abort();
      this.sseAbortController = null;
    }
    if (!this.sessionId) return;

    try {
      await fetch(`${this.baseUrl}/mcp`, {
        method: 'DELETE',
        headers: this.getHeaders(true)
      });
    } catch (_) {}

    this.sessionId = null;
  }
}

module.exports = {
  ClaudeMcpConnector
};
