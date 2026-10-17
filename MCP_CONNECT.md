# Y Master Editor — Universal MCP Connection Guide

> **One app, every AI provider.** Copy-paste the config for your provider and connect instantly.

---

## 🌐 How It Works

When Y Master Editor is running, it exposes **two** MCP interfaces:

| Interface | URL / Method | When Available |
|-----------|-------------|----------------|
| **Embedded HTTP** (via Electron) | `http://localhost:48721/mcp` | When the app is open |
| **Standalone HTTP** (via mcp-server.cjs) | `http://localhost:48722/mcp` | When launched separately |
| **Stdio** (standard pipe) | `node electron/mcp-server.cjs` | Spawned by the AI tool |

---

## ⚡ Quick Copy-Paste Configs

### 1. Claude Desktop / Claude Code
Paste into **Settings → Developer → MCP Servers** (or `claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "y-master-editor": {
      "command": "node",
      "args": ["Y:\\github repositories\\Y-Master-Editor\\electron\\mcp-server.cjs"]
    }
  }
}
```

### 2. Cursor / Windsurf / VS Code (Copilot)
Paste into `.cursor/mcp.json`, `.windsurf/mcp.json`, or `.vscode/mcp.json`:
```json
{
  "mcpServers": {
    "y-master-editor": {
      "command": "node",
      "args": ["Y:\\github repositories\\Y-Master-Editor\\electron\\mcp-server.cjs"]
    }
  }
}
```

### 3. Antigravity / Gemini Code Assist
Already configured in `~/.gemini/config/mcp_config.json`. Or paste:
```json
{
  "mcpServers": {
    "y-master-editor": {
      "command": "node",
      "args": ["Y:\\github repositories\\Y-Master-Editor\\electron\\mcp-server.cjs"]
    }
  }
}
```

### 4. Any HTTP MCP Client (Streamable HTTP)
For any tool that supports MCP over HTTP — just paste the URL:
```
http://localhost:48722/mcp
```
Or as JSON config:
```json
{
  "mcpServers": {
    "y-master-editor": {
      "url": "http://localhost:48722/mcp"
    }
  }
}
```

### 5. OpenAI Custom GPTs (Actions)
In the GPT Builder, import this OpenAPI schema URL:
```
http://localhost:48722/api/v1/openapi.json
```
> Requires ngrok or Cloudflare Tunnel to expose locally.

### 6. Google Gemini (Function Calling)
Fetch tool declarations from:
```
http://localhost:48722/api/v1/gemini-tools
```

### 7. Direct REST API (cURL / Postman / Any Language)
```bash
# List available tools
curl http://localhost:48722/api/v1/openapi.json

# Get document outline
curl -X POST http://localhost:48722/api/v1/tools/get_document_outline \
  -H "Content-Type: application/json" \
  -d '{}'

# Health check
curl http://localhost:48722/health
```

---

## 🔐 Authentication

| Context | Auth Required? |
|---------|---------------|
| Local (127.0.0.1) | **No** — loopback is trusted |
| Remote / Tunneled | **Yes** — Bearer token or Firebase JWT |

For remote access, set a custom API key:
```bash
MCP_API_KEY=your_secret_key node electron/mcp-server.cjs
```
Then include in requests:
```
Authorization: Bearer your_secret_key
```

---

## 🚀 Start the Standalone Server

```bash
# Default: Stdio + HTTP on port 48722
node electron/mcp-server.cjs

# HTTP-only mode (no stdio)
MCP_TRANSPORT=http node electron/mcp-server.cjs

# Custom port
MCP_HTTP_PORT=9000 node electron/mcp-server.cjs
```

---

## 📋 Available Tools

| Tool | Description |
|------|-------------|
| `get_document_outline` | Get full document structure |
| `get_selection_context` | Read page content |
| `get_pending_instructions` | List authorized comments |
| `authorize_instruction` | Approve a comment for AI editing |
| `propose_component_change` | Modify page HTML/CSS |
| `propose_region_replacement` | Replace a region with new content |
| `update_page_content` | Full page content update |
| `add_page` | Add new page to document |
| `rollback_transaction` | Undo last change |
