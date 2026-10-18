# Claude Custom Connector & Desktop MCP Architecture Research & Fix Log

**Date:** 2026-10-18  
**Status:** PASS (100% Verified across all 6 suites)  
**Target Environments:** Claude Custom Connector (claude.ai / Remote), Claude Desktop App (Local SSE / Stdio), Google Gemini Connected Apps, Cursor & Windsurf  
**Repository:** [https://github.com/yorren005/Y-Master-Editor](https://github.com/yorren005/Y-Master-Editor)

---

## 1. Pinpointed Major Flaws in Previous Implementation

Through deep inspection of the source code, network logs, and runtime behavior, the following **5 major root-cause flaws** were identified:

### Flaw 1: Missing Standard Server-Sent Events (SSE) Protocol Handshake
* **The Problem:** Claude Custom Connector (via `claude.ai`) and Claude Desktop SSE transport initiate connections by sending an HTTP `GET` request expecting an SSE event stream (`Content-Type: text/event-stream`). The server must emit an `event: endpoint` containing the target URL path for subsequent JSON-RPC POST messages (e.g., `data: /messages?sessionId=...`).
* **Previous Failure:** The previous gateway only implemented Streamable HTTP on `/mcp`. It had no `/sse` or `/messages` endpoints at all. When Claude connected to `/sse` or sent an uninitialized `GET /mcp`, the gateway responded with `404 Not Found` ("Session not found. Send an initialize request first.").

### Flaw 2: Aggressive 401 Unauthorized Authentication Gate Blocking Anthropic Cloud Brokers
* **The Problem:** In `electron/web-mcp-gateway.cjs`, the authentication middleware only exempted loopback IPs (`127.0.0.1`, `localhost`). All external requests were checked for a static Bearer key or Firebase JWT. If absent, it immediately aborted with `401 Unauthorized: Missing API Key or Bearer Token`.
* **Previous Failure:** When Claude Custom Connector connects, Anthropic's cloud infrastructure probes the public HTTPS endpoint with "No sign in" selected. Because Anthropic's requests originate from public cloud IP ranges without an Authorization header, the server blocked the connection immediately with HTTP 401 before any MCP protocol handshake could execute.

### Flaw 3: Dead & Ephemeral Quick Tunnel with Hardcoded Static URLs
* **The Problem:** The Cloudflare tunnel was previously launched as a free quick tunnel (`bin/cloudflared.exe tunnel --url http://127.0.0.1:48721`). Free Cloudflare quick tunnels on `trycloudflare.com` are temporary sessions that expire and are revoked by Cloudflare after idle time or disconnects (`Unauthorized: Tunnel not found`).
* **Previous Failure:** The previous tunnel session expired, causing all external requests to fail with `getaddrinfo ENOTFOUND`. Worse, the frontend UI and documentation had hardcoded `https://preserve-gilbert-lyrics-simple.trycloudflare.com/mcp`, leaving the app pointing to a permanently dead URL.

### Flaw 4: Express Body Consumption Deadlock on POST /messages
* **The Problem:** `@modelcontextprotocol/sdk`'s `SSEServerTransport.handlePostMessage(req, res)` relies on reading the request body. In Express applications where `app.use(express.json())` has already consumed the incoming request stream, attempting to re-read the raw stream hangs indefinitely.
* **Previous Failure:** Calling `transport.handlePostMessage(req, res)` without passing the pre-parsed `req.body` caused requests to stall or crash.

### Flaw 5: Claude Desktop Hardcoded Absolute Windows Path Anti-Pattern
* **The Problem:** The local Claude configuration snippet instructed users to execute `node "Y:\\github repositories\\Y-Master-Editor\\electron\\mcp-server.cjs"`.
* **Previous Failure:** If the app is run from any other drive letter, folder, or installed as a packaged desktop app, Claude Desktop fails with "cannot find module".

---

## 2. Research Grounding: Industry Best Practices for Desktop MCP Servers

Based on technical blogs, Anthropic's official documentation (*Get started with custom connectors using remote MCP*), and the `@modelcontextprotocol/sdk` reference implementations:

1. **Dual Transport Architecture:**
   * A resilient desktop MCP gateway should support **both** legacy/universal Server-Sent Events (`/sse` + `/messages`) for Claude Custom Connectors and modern Streamable HTTP (`/mcp`) for Google Gemini and Cursor.
2. **SSE Streaming Headers:**
   * Handshakes must include `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive`, and `X-Accel-Buffering: no` to prevent edge proxies (Cloudflare, Nginx) from buffering events.
3. **Out-of-the-Box Zero-Friction Auth:**
   * Claude Custom Connectors expect seamless connection when users select "No sign in". Document safety is guaranteed not by coarse HTTP 401 blocks, but by the **transaction engine's human-in-the-loop authorization invariant** (`authorize_instruction`), which blocks mutations until the human user explicitly approves them.
4. **Self-Healing Tunnel Manager:**
   * Desktop applications exposing local servers over the internet require an internal process supervisor (`TunnelManager`) that automatically starts `cloudflared`, parses the dynamic URL, saves the state to `.mcp-tunnel.json`, performs periodic health checks, and auto-reconnects with backoff if Cloudflare drops the session.
5. **Local Zero-Config SSE for Claude Desktop:**
   * Instead of fragile file paths, Claude Desktop can connect via `url: "http://127.0.0.1:48721/sse"` directly, eliminating node and filesystem dependencies.

---

## 3. Implemented Architecture & Solutions

### A. Reconstructed `electron/web-mcp-gateway.cjs`
* Implemented standard `SSEServerTransport` on `GET /sse` and `POST /messages`.
* Implemented `req.body` passthrough on `handlePostMessage(req, res, req.body)`.
* Added graceful fallback on `GET /mcp` for clients pointing directly to `/mcp` via SSE.
* Added Accept header normalization on `POST /mcp` to prevent HTTP 406.
* Updated authentication middleware: default permissive mode for zero-friction connection with optional enforcement via `MCP_REQUIRE_AUTH=true`.
* Added diagnostic landing page on `GET /` with live tool listing.

### B. Created Native `electron/tunnel-manager.cjs`
* Spawns `bin/cloudflared.exe tunnel --url http://127.0.0.1:<port>`.
* Dynamically extracts the active `https://<subdomain>.trycloudflare.com` URL.
* Persists live endpoints to `.mcp-tunnel.json`.
* Periodically tests endpoint health (`GET /health`) every 30 seconds.
* Automatically triggers reconnection with backoff upon disconnects or session revoking.

### C. Updated Desktop App Main & Preload Process
* `electron/main.cjs`:
  - Automatically initializes and manages `activeTunnel` alongside `activeGateway`.
  - Added IPC handlers `mcp:get-status` and `mcp:restart-tunnel`.
  - Added clean process shutdown hook on `will-quit`.
* `electron/preload.cjs`:
  - Exposed `getMcpStatus()`, `restartMcpTunnel()`, and `onMcpTunnelStatus()` to renderer.

### D. Upgraded In-App MCP Modal UI (`src/index.html` & `src/main.js`)
* Added dedicated **Claude Custom Connector** tab with live public HTTPS SSE URL.
* Added **Claude Desktop (Local SSE)** tab with zero-path configuration.
* Added live status pills showing local port and public tunnel status.
* Added one-click "Refresh Tunnel" button (`#btn-restart-tunnel`).
* Dynamically updates all code blocks and copy buttons with the actual, live tunnel URL.

---

## 4. Test Verification Suite (`npm test`)

All 6 test suites passed with **100% success**:

```text
1. Engine Verification Tests (7 tests): PASSED
2. PDF Adapter Verification Suite (5 tests): PASSED
3. Comprehensive E2E MCP Document Workspace Test (11 invariants): PASSED
4. Document Ingestion & Import Pipeline Verification (4 tests): PASSED
5. Firebase Omni-Auth & Telemetry Logging: PASSED
6. Claude Custom Connector & SSE MCP Verification (8 steps): PASSED
```

---

## 5. How to Connect Seamlessly to Claude

### Option 1: Claude Custom Connector (claude.ai / Web / Remote)
1. Open **Claude.ai** $\rightarrow$ Click **Customize** / **Settings** $\rightarrow$ **Connectors** $\rightarrow$ **Add custom connector**.
2. Enter Name: `Y-Master-Editor`.
3. In URL, paste your live public HTTPS SSE URL (e.g. `https://<live-tunnel>.trycloudflare.com/sse`).
4. Under Authentication, select **"No sign in"**.
5. Click **Connect** $\rightarrow$ Claude will immediately discover all 9 tools!

### Option 2: Claude Desktop App (Local Integration)
Open `%APPDATA%\Claude\claude_desktop_config.json` and paste:
```json
{
  "mcpServers": {
    "y-master-editor": {
      "url": "http://127.0.0.1:48721/sse"
    }
  }
}
```
Restart Claude Desktop — zero path or Node installation headaches!
