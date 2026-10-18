/**
 * electron/tunnel-manager.cjs
 * Failproof Native Tunnel Manager for Y Master Editor
 * Automatically provisions, monitors, and auto-reconnects Cloudflare HTTPS Quick Tunnels
 * for seamless Claude Custom Connector and remote agent integration.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { EventEmitter } = require('events');

class TunnelManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.localPort = options.localPort || 48721;
    this.binPath = options.binPath || path.join(__dirname, '..', 'bin', 'cloudflared.exe');
    this.tunnelProcess = null;
    this.publicUrl = null;
    this.status = 'stopped'; // 'stopped' | 'starting' | 'online' | 'reconnecting'
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 20;
    this.healthCheckTimer = null;
    this.tunnelFilePath = path.join(__dirname, '..', '.mcp-tunnel.json');
    this.isStopping = false;
  }

  /**
   * Start the Cloudflare HTTPS Tunnel
   * @param {number} [localPort]
   * @returns {Promise<string>} Resolves with the public HTTPS URL
   */
  start(localPort = this.localPort) {
    this.localPort = localPort;
    this.isStopping = false;

    if (this.tunnelProcess) {
      this.stop();
    }

    this.status = 'starting';
    this.emit('status', { status: this.status, publicUrl: null });

    return new Promise((resolve, reject) => {
      let resolved = false;
      const timeoutTimer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.status = 'error';
          this.emit('status', { status: this.status, error: 'Tunnel start timeout (30s)' });
          reject(new Error('Tunnel start timeout (30s)'));
        }
      }, 30000);

      // Verify executable exists
      if (!fs.existsSync(this.binPath)) {
        clearTimeout(timeoutTimer);
        const err = new Error(`cloudflared binary not found at: ${this.binPath}`);
        this.status = 'error';
        this.emit('status', { status: this.status, error: err.message });
        return reject(err);
      }

      console.error(`[TunnelManager] Spawning Cloudflare tunnel for http://127.0.0.1:${this.localPort}`);

      const args = ['tunnel', '--url', `http://127.0.0.1:${this.localPort}`];
      this.tunnelProcess = spawn(this.binPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });

      const urlRegex = /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/;

      const handleOutput = (chunk) => {
        const text = chunk.toString();
        const match = text.match(urlRegex);

        if (match && !resolved) {
          resolved = true;
          clearTimeout(timeoutTimer);
          this.publicUrl = match[0];
          this.status = 'online';
          this.reconnectAttempts = 0;

          // Save state to .mcp-tunnel.json for UI & scripts
          this.saveTunnelState();

          console.error(`[TunnelManager] 🚀 Live Public HTTPS Tunnel: ${this.publicUrl}`);
          this.emit('status', {
            status: this.status,
            publicUrl: this.publicUrl,
            localPort: this.localPort
          });
          this.emit('url', this.publicUrl);

          this.startHealthCheck();
          resolve(this.publicUrl);
        }

        // Detect server side revocation or tunnel closure
        if (text.includes('Unauthorized: Tunnel not found') || text.includes('tunnel error')) {
          console.warn('[TunnelManager Warning]: Cloudflare session expired, scheduling recovery...');
          if (this.status === 'online') {
            this.handleTunnelDrop();
          }
        }
      };

      this.tunnelProcess.stdout.on('data', handleOutput);
      this.tunnelProcess.stderr.on('data', handleOutput);

      this.tunnelProcess.on('error', (err) => {
        console.error('[TunnelManager Process Error]:', err.message);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutTimer);
          this.status = 'error';
          this.emit('status', { status: this.status, error: err.message });
          reject(err);
        }
        this.handleTunnelDrop();
      });

      this.tunnelProcess.on('exit', (code, signal) => {
        console.warn(`[TunnelManager] Process exited with code ${code} (${signal})`);
        this.tunnelProcess = null;
        if (!this.isStopping) {
          this.handleTunnelDrop();
        }
      });
    });
  }

  handleTunnelDrop() {
    if (this.isStopping) return;
    this.stopHealthCheck();
    this.publicUrl = null;
    this.status = 'reconnecting';
    this.emit('status', { status: this.status, publicUrl: null });

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[TunnelManager] Max reconnect attempts reached. Waiting for manual restart.');
      this.status = 'error';
      this.emit('status', { status: this.status, error: 'Max reconnect attempts exceeded' });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(2000 * Math.pow(1.3, this.reconnectAttempts), 15000);
    console.log(`[TunnelManager] Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${this.reconnectAttempts})...`);

    setTimeout(() => {
      if (!this.isStopping) {
        this.start().catch((err) => {
          console.error('[TunnelManager Reconnect Error]:', err.message);
        });
      }
    }, delay);
  }

  startHealthCheck() {
    this.stopHealthCheck();
    this.healthCheckTimer = setInterval(async () => {
      if (!this.publicUrl || this.status !== 'online') return;
      try {
        const checkUrl = `${this.publicUrl}/health`;
        const res = await new Promise((resolve, reject) => {
          const req = https.get(checkUrl, { timeout: 8000 }, (res) => {
            resolve(res);
          });
          req.on('error', reject);
          req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        });

        if (res.statusCode === 200) {
          // Healthy
        } else {
          console.warn(`[TunnelManager HealthCheck] Status ${res.statusCode}, triggering refresh`);
          this.handleTunnelDrop();
        }
      } catch (err) {
        console.warn('[TunnelManager HealthCheck Notice]:', err.message);
        // Retry once before declaring dropped
      }
    }, 30000);

    if (this.healthCheckTimer.unref) this.healthCheckTimer.unref();
  }

  stopHealthCheck() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  saveTunnelState() {
    try {
      const data = {
        publicUrl: this.publicUrl,
        mcpUrl: `${this.publicUrl}/mcp`,
        sseUrl: `${this.publicUrl}/sse`,
        openapiUrl: `${this.publicUrl}/api/v1/openapi.json`,
        status: this.status,
        localPort: this.localPort,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.tunnelFilePath, JSON.stringify(data, null, 2));
    } catch (_) {}
  }

  stop() {
    this.isStopping = true;
    this.stopHealthCheck();
    if (this.tunnelProcess) {
      try {
        const proc = this.tunnelProcess;
        this.tunnelProcess = null;
        if (proc.stdout) proc.stdout.destroy();
        if (proc.stderr) proc.stderr.destroy();
        proc.kill();
      } catch (_) {}
    }
    this.publicUrl = null;
    this.status = 'stopped';
    try {
      if (fs.existsSync(this.tunnelFilePath)) {
        fs.unlinkSync(this.tunnelFilePath);
      }
    } catch (_) {}
    this.emit('status', { status: this.status, publicUrl: null });
  }

  getInfo() {
    return {
      status: this.status,
      publicUrl: this.publicUrl,
      mcpUrl: this.publicUrl ? `${this.publicUrl}/mcp` : null,
      sseUrl: this.publicUrl ? `${this.publicUrl}/sse` : null,
      localPort: this.localPort
    };
  }
}

module.exports = { TunnelManager };

if (require.main === module) {
  const tm = new TunnelManager({ localPort: 48721 });
  tm.start().then((url) => {
    console.log('Tunnel running at:', url);
  }).catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
  });
}
