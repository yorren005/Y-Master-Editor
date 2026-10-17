# scripts/start-web-tunnel.ps1
# 1-Click Secure Web Exposure Tunnel for Y Master Editor MCP Gateway

param(
    [string]$TunnelProvider = "auto",
    [int]$Port = 0
)

$ErrorActionPreference = "Continue"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Y MASTER EDITOR -- UNIVERSAL WEB MCP GATEWAY EXPOSURE TUNNEL    " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Determine Port from .mcp-port.json
$PortFile = Join-Path $PSScriptRoot "..\.mcp-port.json"
if ($Port -eq 0 -and (Test-Path $PortFile)) {
    try {
        $portData = Get-Content $PortFile -Raw | ConvertFrom-Json
        $Port = [int]$portData.port
        Write-Host "[Gateway Discovery] Found active MCP Gateway on port: $Port" -ForegroundColor Green
    } catch {
        $Port = 48722
    }
} elseif ($Port -eq 0) {
    $Port = 48722
}

Write-Host "[Local Target] Routing traffic to http://127.0.0.1:$Port/mcp" -ForegroundColor Gray

# 2. Check for Cloudflare Tunnel (cloudflared)
$localCf = Join-Path $PSScriptRoot "..\bin\cloudflared.exe"
$hasCloudflare = (Test-Path $localCf) -or ((Get-Command cloudflared -ErrorAction SilentlyContinue) -ne $null)
$cfBinary = if (Test-Path $localCf) { $localCf } else { "cloudflared" }
$hasNgrok = (Get-Command ngrok -ErrorAction SilentlyContinue) -ne $null

if ($hasCloudflare -and ($TunnelProvider -eq "auto" -or $TunnelProvider -eq "cloudflare")) {
    Write-Host "`n[Tunnel] Starting Cloudflare Quick Tunnel (Zero-config SSL)..." -ForegroundColor Green
    Write-Host "[Notice] A public https://*.trycloudflare.com URL will be generated below." -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
    & $cfBinary tunnel --url "http://127.0.0.1:$Port"
} elseif ($hasNgrok -and ($TunnelProvider -eq "auto" -or $TunnelProvider -eq "ngrok")) {
    Write-Host "`n[Tunnel] Starting ngrok Tunnel..." -ForegroundColor Green
    & ngrok http $Port
} else {
    Write-Host "`n[Information] No cloudflared or ngrok CLI detected in PATH." -ForegroundColor Yellow
    Write-Host "You can easily install or run either of these zero-config tools:" -ForegroundColor White
    Write-Host "  Option A (Recommended): winget install Cloudflare.cloudflared" -ForegroundColor Cyan
    Write-Host "         Then re-run: .\scripts\start-web-tunnel.bat" -ForegroundColor Gray
    Write-Host "  Option B: winget install ngrok.ngrok" -ForegroundColor Cyan
    Write-Host "`n[Local Access] In the meantime, your MCP server is already reachable on LAN and Localhost:" -ForegroundColor Green
    Write-Host "  * Streamable HTTP: http://127.0.0.1:$Port/mcp" -ForegroundColor Cyan
    Write-Host "  * OpenAI OpenAPI:  http://127.0.0.1:$Port/api/v1/openapi.json" -ForegroundColor Cyan
    Write-Host "  * Gemini Schema:   http://127.0.0.1:$Port/api/v1/gemini-tools" -ForegroundColor Cyan
    Write-Host "`n=================================================================" -ForegroundColor Cyan
    Write-Host "PROVIDER CONFIGURATION CHEAT SHEET:" -ForegroundColor Yellow
    Write-Host "=================================================================" -ForegroundColor Cyan
    
    $configSnippet = @"
[1] CURSOR IDE (.cursor/mcp.json):
{
  "mcpServers": {
    "y-master-editor": {
      "url": "http://127.0.0.1:$Port/mcp"
    }
  }
}

[2] WINDSURF (~/.codeium/windsurf/mcp_config.json):
{
  "mcpServers": {
    "y-master-editor": {
      "url": "http://127.0.0.1:$Port/mcp"
    }
  }
}

[3] CLAUDE DESKTOP (%APPDATA%\Claude\claude_desktop_config.json):
{
  "mcpServers": {
    "y-master-editor": {
      "url": "http://127.0.0.1:$Port/mcp"
    }
  }
}

[4] OPENAI CHATGPT CUSTOM GPTS (Actions):
  Schema URL: http://127.0.0.1:$Port/api/v1/openapi.json
  (Or your public Cloudflare/ngrok HTTPS URL)
"@
    Write-Host $configSnippet -ForegroundColor White
}
