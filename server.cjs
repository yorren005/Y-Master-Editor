const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const PptxGenJS = require('pptxgenjs');

const PORT = 3300;
const WS_PORT = 48721;
const SRC_DIR = path.join(__dirname, 'src');
const PROJECTS_FILE = path.join(__dirname, 'projects_store.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

// WebSocket Bridge for MCP in browser mode
let wss = null;
let mcpClients = new Set();
let browserClients = new Set();

try {
  const wsServer = http.createServer();
  wss = new WebSocket.Server({ server: wsServer });

  wss.on('connection', (ws, req) => {
    const isBrowser = req.url === '/client';
    if (isBrowser) {
      browserClients.add(ws);
    } else {
      mcpClients.add(ws);
    }

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (isBrowser) {
          for (const mcp of mcpClients) {
            if (mcp.readyState === WebSocket.OPEN) mcp.send(JSON.stringify(data));
          }
        } else {
          for (const browser of browserClients) {
            if (browser.readyState === WebSocket.OPEN) browser.send(JSON.stringify(data));
          }
        }
      } catch (e) {
        console.error('[WS Bridge Error]', e);
      }
    });

    ws.on('close', () => {
      browserClients.delete(ws);
      mcpClients.delete(ws);
    });
  });

  wsServer.on('error', (err) => {
    if (err.code !== 'EADDRINUSE') console.error('[WS Server Error]', err);
  });

  wsServer.listen(WS_PORT, '127.0.0.1', () => {
    console.log(`[MCP WebSocket Bridge] Listening on ws://127.0.0.1:${WS_PORT}`);
  });
} catch (e) {
  console.error('[WS Init Error]', e);
}

// Generate PDF via Headless Electron
function generatePdfViaHeadless(html, pageSize = 'A4', orientation = 'portrait', customWidthInches, customHeightInches) {
  return new Promise((resolve, reject) => {
    const electronBinary = require(path.join(__dirname, 'node_modules', 'electron'));
    const tempWorker = path.join(__dirname, `temp_pdf_${Date.now()}.cjs`);

    let pageSizeOption = JSON.stringify(pageSize);
    if (customWidthInches && customHeightInches) {
      pageSizeOption = JSON.stringify({ width: customWidthInches, height: customHeightInches });
    }

    const code = `
const { app, BrowserWindow } = require('electron');

app.whenReady().then(async () => {
  try {
    const win = new BrowserWindow({ show: false, webPreferences: { webSecurity: false } });
    const fullHtml = ${JSON.stringify(html)};
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml));

    await win.webContents.executeJavaScript('document.fonts ? document.fonts.ready : Promise.resolve()');
    await new Promise(r => setTimeout(r, 400));

    const isLandscape = ${orientation === 'landscape'};
    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      landscape: isLandscape,
      pageSize: ${pageSizeOption},
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    process.stdout.write(pdfBuffer);
    win.close();
    app.quit();
  } catch (err) {
    process.stderr.write(err.message);
    app.exit(1);
  }
});
    `.trim();

    fs.writeFileSync(tempWorker, code, 'utf-8');

    const proc = spawn(electronBinary, [tempWorker], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const chunks = [];
    let errOutput = '';

    proc.stdout.on('data', (d) => chunks.push(d));
    proc.stderr.on('data', (d) => errOutput += d.toString());

    proc.on('close', (code) => {
      try { fs.unlinkSync(tempWorker); } catch (_) {}
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(errOutput || `Headless process exited with code ${code}`));
      }
    });
  });
}

// Generate PPTX via Headless Slide Capture & PptxGenJS
function generatePptxViaHeadless(slidesHtmlArray, widthPx = 1920, heightPx = 1080) {
  return new Promise(async (resolve, reject) => {
    try {
      const electronBinary = require(path.join(__dirname, 'node_modules', 'electron'));
      const tempWorker = path.join(__dirname, `temp_pptx_${Date.now()}.cjs`);

      const code = `
const { app, BrowserWindow } = require('electron');
const slides = ${JSON.stringify(slidesHtmlArray)};

app.whenReady().then(async () => {
  try {
    const win = new BrowserWindow({
      show: false,
      width: ${widthPx},
      height: ${heightPx},
      webPreferences: { webSecurity: false }
    });

    const base64Images = [];
    for (let i = 0; i < slides.length; i++) {
      await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(slides[i]));
      await win.webContents.executeJavaScript('document.fonts ? document.fonts.ready : Promise.resolve()');
      await new Promise(r => setTimeout(r, 450));
      const img = await win.webContents.capturePage();
      base64Images.push(img.toPNG().toString('base64'));
    }

    process.stdout.write(JSON.stringify(base64Images));
    win.close();
    app.quit();
  } catch (err) {
    process.stderr.write(err.message);
    app.exit(1);
  }
});
      `.trim();

      fs.writeFileSync(tempWorker, code, 'utf-8');

      const proc = spawn(electronBinary, [tempWorker], {
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 1024 * 1024 * 50
      });

      let jsonOut = '';
      let errOutput = '';

      proc.stdout.on('data', (d) => jsonOut += d.toString());
      proc.stderr.on('data', (d) => errOutput += d.toString());

      proc.on('close', async (code) => {
        try { fs.unlinkSync(tempWorker); } catch (_) {}
        if (code !== 0 || !jsonOut) {
          return reject(new Error(errOutput || 'Failed to capture presentation slides'));
        }

        try {
          const images = JSON.parse(jsonOut);
          const pptx = new PptxGenJS();
          
          // Layout sizing
          const aspect = widthPx / heightPx;
          if (Math.abs(aspect - (16 / 9)) < 0.05) {
            pptx.layout = 'LAYOUT_16x9';
          } else if (Math.abs(aspect - (4 / 3)) < 0.05) {
            pptx.layout = 'LAYOUT_4x3';
          } else {
            pptx.defineLayout({ name: 'CUSTOM', width: widthPx / 96, height: heightPx / 96 });
            pptx.layout = 'CUSTOM';
          }

          for (const b64 of images) {
            const slide = pptx.addSlide();
            slide.addImage({ data: 'image/png;base64,' + b64, x: 0, y: 0, w: '100%', h: '100%' });
          }

          const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });
          resolve(pptxBuffer);
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle PDF Export API
  if (req.url === '/api/export-pdf' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { fullHtml, pageSize, orientation, customWidthInches, customHeightInches } = JSON.parse(body);
        const pdfBuffer = await generatePdfViaHeadless(fullHtml, pageSize, orientation, customWidthInches, customHeightInches);

        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': pdfBuffer.length,
          'Content-Disposition': 'attachment; filename="document.pdf"'
        });
        res.end(pdfBuffer);
      } catch (err) {
        console.error('[PDF Export Error]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Handle PPTX Export API
  if (req.url === '/api/export-pptx' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { slidesHtmlArray, widthPx, heightPx } = JSON.parse(body);
        const pptxBuffer = await generatePptxViaHeadless(slidesHtmlArray, widthPx, heightPx);

        res.writeHead(200, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Length': pptxBuffer.length,
          'Content-Disposition': 'attachment; filename="presentation.pptx"'
        });
        res.end(pptxBuffer);
      } catch (err) {
        console.error('[PPTX Export Error]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Serve static files
  let safePath = req.url.split('?')[0];
  if (safePath === '/' || safePath === '') safePath = '/index.html';

  const filePath = path.join(SRC_DIR, safePath);

  if (!filePath.startsWith(SRC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`=======================================================`);
  console.log(`🚀 PDF & PPTX Canvas Studio Server running at:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(`   👉 http://127.0.0.1:${PORT}`);
  console.log(`=======================================================`);
});
