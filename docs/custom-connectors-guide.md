# Y Master Editor — Universal MCP Custom Connectors Guide

Connect any AI assistant or agent framework to your live Y Master Editor workspace via the Model Context Protocol (MCP) Link or REST OpenAPI Actions.

---

## 1. Connector URLs & Endpoints

When Y Master Editor or its MCP Gateway is running (default port `48722`, auto-negotiated on collision and recorded in `.mcp-port.json`):

| AI Provider / Client | Protocol / Format | Endpoint URL | Authentication |
| :--- | :--- | :--- | :--- |
| **Anthropic Claude Desktop** | MCP Stdio | `node electron/mcp-server.cjs` | Local IPC |
| **Claude Web / Remote Connector** | MCP Streamable HTTP | `http://127.0.0.1:48722/mcp` | Bearer Token / API Key |
| **Google Gemini API / SDK** | Gemini Function Calling | `http://127.0.0.1:48722/api/v1/gemini-tools` | Bearer Token / API Key |
| **OpenAI Custom GPTs** | OpenAPI 3.1.0 Actions | `http://127.0.0.1:48722/api/v1/openapi.json` | Bearer Token (`apiKey`) |
| **Cursor IDE** | MCP Streamable HTTP / Stdio | `http://127.0.0.1:48722/mcp` | Bearer Token / Local |
| **Windsurf IDE** | MCP Streamable HTTP / Stdio | `http://127.0.0.1:48722/mcp` | Bearer Token / Local |

---

## 2. Anthropic Claude Custom Connector

### Claude Desktop Configuration
Add the following to your Claude Desktop config file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "y-master-editor": {
      "command": "node",
      "args": [
        "y:/github repositories/Y-Master-Editor/electron/mcp-server.cjs"
      ],
      "env": {
        "MCP_API_KEY": "ymaster_mcp_default_token"
      }
    }
  }
}
```

### Remote / Web Claude MCP Connector (Streamable HTTP)
If connecting Claude via the MCP Link over HTTP:
- **Server URL**: `http://127.0.0.1:48722/mcp` (or your Cloudflare tunnel domain `https://<tunnel-id>.trycloudflare.com/mcp`)
- **Headers**:
  ```json
  {
    "Authorization": "Bearer ymaster_mcp_default_token"
  }
  ```

---

## 3. Google Gemini Custom Connector

Google Gemini natively supports function calling. The Y Master Editor MCP gateway exposes the exact `FunctionDeclaration` schema ready to ingest into the `@google/genai` or `google-generativeai` SDK.

### Programmatic Integration with `@google/genai` (Node.js / Python)
```javascript
const { GeminiMcpConnector } = require('./src/connectors/gemini-mcp-connector.cjs');
const { GoogleGenAI } = require('@google/genai');

const connector = new GeminiMcpConnector({
  baseUrl: 'http://127.0.0.1:48722',
  apiKey: process.env.MCP_API_KEY
});

// 1. Initialize and fetch declarations
await connector.initialize();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 2. Generate content with Y Master Editor tool declarations
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Inspect the document outline and tell me what pending changes exist.',
  config: {
    tools: connector.getGeminiToolsConfig()
  }
});

// 3. Handle model tool calls automatically
if (response.functionCalls && response.functionCalls.length > 0) {
  for (const call of response.functionCalls) {
    const { geminiPart } = await connector.executeFunctionCall(call, {}, 'mcp');
    console.log('Tool Result for Gemini:', geminiPart);
  }
}
```

---

## 4. OpenAI Custom GPT Connector (ChatGPT Actions)

You can create a custom GPT in ChatGPT that edits documents in your running local desktop app:

### Step 1: Start Web Tunnel (if connecting from ChatGPT Web)
Run `scripts/start-web-tunnel.bat` or `scripts/start-web-tunnel.ps1`.
This generates a secure HTTPS tunnel URL, e.g.:
`https://y-master-preview-xxxx.trycloudflare.com`

### Step 2: Configure Custom GPT Action
1. Open **ChatGPT** -> **Explore GPTs** -> **Create a GPT**.
2. Go to the **Configure** tab.
3. Under **Actions**, click **Create new action**.
4. In the **Schema** section, click **Import from URL** and enter:
   `https://<your-tunnel-url>/api/v1/openapi.json`
5. In the **Authentication** section:
   - **Authentication Type**: `API Key`
   - **Auth Type**: `Bearer`
   - **API Key**: Enter your token (`ymaster_mcp_default_token` or your configured token).
6. Click **Save**.

Your Custom GPT now has full access to all 9 document tools:
- `get_document_outline`
- `get_selection_context`
- `get_pending_instructions`
- `authorize_instruction`
- `propose_component_change`
- `propose_region_replacement`
- `update_page_content`
- `add_page`
- `rollback_transaction`

---

## 5. Cursor & Windsurf IDE Custom Connectors

### Cursor IDE Configuration
Create or edit `.cursor/mcp.json` in your project or root:
```json
{
  "mcpServers": {
    "y-master-editor": {
      "url": "http://127.0.0.1:48722/mcp",
      "headers": {
        "Authorization": "Bearer ymaster_mcp_default_token"
      }
    }
  }
}
```

### Windsurf IDE Configuration
Add to `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "y-master-editor": {
      "serverUrl": "http://127.0.0.1:48722/mcp",
      "headers": {
        "Authorization": "Bearer ymaster_mcp_default_token"
      }
    }
  }
}
```

---

## 6. Automated Verification

To run the automated E2E custom connectors test suite:
```powershell
node test/custom-connectors-e2e.cjs
```
This runs 5 test suites validating Claude, Gemini, OpenAI, and IDE clients running concurrently with 100% test pass rate.
