/**
 * src/connectors/ide-mcp-connector.cjs
 * Cursor, Windsurf & Universal AI IDE Custom Connector for Y Master Editor
 * 
 * Implements:
 * - Persistent Streamable HTTP MCP Link Connection
 * - Automatic Session Recovery & Reconnection
 * - Concurrent In-Flight Tool Call Queuing
 * - Atomic Revision Hash Verification
 */

const { ClaudeMcpConnector } = require('./claude-mcp-connector.cjs');

class IdeMcpConnector {
  /**
   * @param {Object} [options]
   * @param {string} [options.baseUrl] e.g. "http://127.0.0.1:48722"
   * @param {string} [options.apiKey]
   * @param {('cursor'|'windsurf'|'vscode')} [options.ideType='cursor']
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://127.0.0.1:48722';
    this.apiKey = options.apiKey || null;
    this.ideType = options.ideType || 'cursor';

    this.client = new ClaudeMcpConnector({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      clientName: `${this.ideType}-ide-connector`,
      clientVersion: '2.0.0'
    });
  }

  async connect() {
    return await this.client.connect();
  }

  async getDocumentOutline() {
    return await this.client.callTool('get_document_outline', {});
  }

  async getSelectionContext(pageNumber, selector) {
    return await this.client.callTool('get_selection_context', { pageNumber, selector });
  }

  async applyPageUpdate(expectedRevisionHash, pageNumber, html, css = '') {
    return await this.client.callTool('update_page_content', {
      expectedRevisionHash,
      pageNumber,
      html,
      css
    });
  }

  async rollback(transactionId = null) {
    return await this.client.callTool('rollback_transaction', { transactionId });
  }

  async disconnect() {
    return await this.client.disconnect();
  }
}

module.exports = {
  IdeMcpConnector
};
