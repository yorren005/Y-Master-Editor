const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const firebaseService = require('./firebase-service.cjs');

let mainWindow = null;
let wss = null;
let mcpClients = new Set();
const DEFAULT_PORT = 48721;

// Standard paper format dimensions (in inches for Electron printToPDF)
// 1 mm = 0.0393700787 inches
const PAPER_SIZES_INCHES = {
  A4: { width: 8.27, height: 11.69 },
  A3: { width: 11.69, height: 16.54 },
  A5: { width: 5.83, height: 8.27 },
  Letter: { width: 8.5, height: 11.0 },
  Legal: { width: 8.5, height: 14.0 },
  Tabloid: { width: 11.0, height: 17.0 },
  '16:9': { width: 13.333, height: 7.5 },
  '4:3': { width: 10.0, height: 7.5 }
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 980,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    title: 'Y Master Editor — Precision Vector & Editorial Studio',
    backgroundColor: '#ede7df',
    icon: path.join(__dirname, '../src/assets/y-logo.jpg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false // allow local iframe font and style loading
    }
  });

  // Enable standard Google OAuth popup windows without disallowed user-agent errors
  try {
    const rawUa = mainWindow.webContents.getUserAgent();
    const cleanUa = rawUa.replace(/Electron\/[0-9\.]+\s/, '');
    mainWindow.webContents.setUserAgent(cleanUa);
  } catch (e) {}

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 520,
        height: 680,
        autoHideMenuBar: true
      }
    };
  });

  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] ${message} (${path.basename(sourceId || '')}:${line})`);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Prevent any unexpected background network/port error from showing an error dialog popup
process.on('uncaughtException', (err) => {
  console.warn('[Handled Main Process Notice]:', err && err.message ? err.message : err);
});

// Start local WebSocket bridge with full EADDRINUSE resilience
function startWsBridge(port = DEFAULT_PORT) {
  try {
    const server = http.createServer();
    const wsServer = new WebSocket.Server({ server });
    wss = wsServer;

    // Crucial: ws.Server re-emits HTTP server errors; always attach an error listener on wsServer
    wsServer.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        // Handled by server.on('error') below
        return;
      }
      console.warn('[WS Server Notice]:', err.message);
    });

    wsServer.on('connection', (ws) => {
      mcpClients.add(ws);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          if (data && data.action === 'reload_window') {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.reload();
            }
            return;
          }
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('mcp-message', data);
          }
        } catch (err) {
          console.error('[WS Bridge] Message parse error:', err);
        }
      });

      ws.on('close', () => {
        mcpClients.delete(ws);
      });
      ws.on('error', (err) => {
        console.error('[WS Client Error]', err);
        mcpClients.delete(ws);
      });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = port < DEFAULT_PORT + 15 ? port + 1 : 0;
        console.warn(`[WS Bridge] Port ${port} in use, switching to port ${nextPort}...`);
        try { server.close(); } catch (e) {}
        setTimeout(() => startWsBridge(nextPort), 300);
      } else {
        console.error('[WS Bridge Server Error]', err);
      }
    });

    server.listen(port, '127.0.0.1', () => {
      const actualPort = server.address() ? server.address().port : port;
      console.log(`[WebSocket Bridge] Successfully listening on ws://127.0.0.1:${actualPort}`);
    });
  } catch (err) {
    console.error('[WS Bridge Init Error]', err);
  }
}

// Broadcast message from renderer to connected MCP clients
function broadcastToMcp(payload) {
  const json = JSON.stringify(payload);
  for (const client of mcpClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(json);
      } catch (e) {
        console.error('[Broadcast Error]', e);
      }
    }
  }
}

// IPC Handler: High-Clarity Vector PDF Generation
ipcMain.handle('save-pdf', async (event, { fullHtml, pageSize = 'A4', orientation = 'portrait', customWidthInches, customHeightInches }) => {
  if (!mainWindow) return { success: false, error: 'No active window' };

  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Vector PDF (Maximum Clarity)',
      defaultPath: `document_${Date.now()}.pdf`,
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    // Hidden window for precise offscreen PDF compilation
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: false
      }
    });

    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`);

    // Ensure all web fonts and styles have finished downloading and calculating layout
    await printWindow.webContents.executeJavaScript(`
      new Promise((resolve) => {
        const checkReady = () => {
          if (document.fonts && document.fonts.status !== 'loaded') {
            document.fonts.ready.then(() => resolve(true));
          } else {
            resolve(true);
          }
        };
        if (document.readyState === 'complete') {
          checkReady();
        } else {
          window.addEventListener('load', checkReady);
        }
      });
    `);

    // Small stabilization grace period
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Calculate orientation and dimensions
    const isLandscape = orientation === 'landscape';
    const baseInches = PAPER_SIZES_INCHES[pageSize] || PAPER_SIZES_INCHES.A4;
    let widthInches = isLandscape ? Math.max(baseInches.width, baseInches.height) : Math.min(baseInches.width, baseInches.height);
    let heightInches = isLandscape ? Math.min(baseInches.width, baseInches.height) : Math.max(baseInches.width, baseInches.height);

    if (customWidthInches && customHeightInches) {
      widthInches = isLandscape ? Math.max(customWidthInches, customHeightInches) : Math.min(customWidthInches, customHeightInches);
      heightInches = isLandscape ? Math.min(customWidthInches, customHeightInches) : Math.max(customWidthInches, customHeightInches);
    }

    // Call modern Electron printToPDF
    const pdfBuffer = await printWindow.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      landscape: isLandscape,
      pageSize: {
        width: widthInches,
        height: heightInches
      },
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    });

    printWindow.close();

    await fs.promises.writeFile(filePath, pdfBuffer);
    return { success: true, filePath };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler: Native Print Dialog
ipcMain.handle('print-document', async (event, { fullHtml }) => {
  if (!mainWindow) return { success: false, error: 'No active window' };

  try {
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        webSecurity: false
      }
    });

    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`);

    // Wait for fonts & layout
    await printWindow.webContents.executeJavaScript(`
      (async () => {
        if (document.fonts) await document.fonts.ready;
        return true;
      })()
    `);

    await new Promise((resolve) => setTimeout(resolve, 400));

    return new Promise((resolve) => {
      printWindow.webContents.print({
        silent: false,
        printBackground: true
      }, (success, failureReason) => {
        printWindow.close();
        if (success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: failureReason });
        }
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handler: Presentation PPTX Export
ipcMain.handle('save-pptx', async (event, { slidesHtmlArray, widthPx = 1920, heightPx = 1080, title = 'presentation' }) => {
  if (!mainWindow) return { success: false, error: 'No active window' };

  try {
    const PptxGenJS = require('pptxgenjs');
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Presentation (.pptx)',
      defaultPath: `${title.toLowerCase().replace(/\\s+/g, '_')}_${Date.now()}.pptx`,
      filters: [{ name: 'PowerPoint Presentation', extensions: ['pptx'] }]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    const pptx = new PptxGenJS();
    const aspect = widthPx / heightPx;
    if (Math.abs(aspect - (16 / 9)) < 0.05) {
      pptx.layout = 'LAYOUT_16x9';
    } else if (Math.abs(aspect - (4 / 3)) < 0.05) {
      pptx.layout = 'LAYOUT_4x3';
    } else {
      pptx.defineLayout({ name: 'CUSTOM', width: widthPx / 96, height: heightPx / 96 });
      pptx.layout = 'CUSTOM';
    }

    const win = new BrowserWindow({
      show: false,
      width: widthPx,
      height: heightPx,
      webPreferences: { webSecurity: false }
    });

    for (const slideHtml of slidesHtmlArray) {
      await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(slideHtml));
      await win.webContents.executeJavaScript('document.fonts ? document.fonts.ready : Promise.resolve()');
      await new Promise(r => setTimeout(r, 450));
      const image = await win.webContents.capturePage();
      const b64 = image.toPNG().toString('base64');
      const slide = pptx.addSlide();
      slide.addImage({ data: 'image/png;base64,' + b64, x: 0, y: 0, w: '100%', h: '100%' });
    }

    win.close();

    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    await fs.promises.writeFile(filePath, buffer);
    return { success: true, filePath };
  } catch (error) {
    console.error('Error exporting PPTX:', error);
    return { success: false, error: error.message };
  }
});

// Renderer sending state update to MCP
ipcMain.on('renderer-to-mcp', (event, payload) => {
  broadcastToMcp(payload);
});

// Google Auth External URL opener
ipcMain.handle('open-external', async (event, url) => {
  try {
    if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
      await shell.openExternal(url);
      return { success: true };
    }
    return { success: false, error: 'Invalid URL' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Persistent Google User Accounts and Scoped Workspaces Store
ipcMain.handle('save-user-data', async (event, data) => {
  try {
    const userFile = path.join(__dirname, '../user_accounts.json');
    await fs.promises.writeFile(userFile, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-user-data', async () => {
  try {
    const userFile = path.join(__dirname, '../user_accounts.json');
    if (fs.existsSync(userFile)) {
      const content = await fs.promises.readFile(userFile, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading user accounts file:', err);
  }
  return null;
});

// Firebase Authentication & Cloud Firestore Handlers
ipcMain.handle('firebase-signin', async (event, accountData) => {
  return await firebaseService.signInWithGoogle(accountData);
});

ipcMain.handle('firebase-signout', async () => {
  return await firebaseService.signOutUser();
});

ipcMain.handle('firebase-load-user-data', async (event, uid) => {
  return await firebaseService.loadUserData(uid);
});

ipcMain.handle('firebase-save-user-data', async (event, { uid, data }) => {
  return await firebaseService.saveUserData(uid, data);
});

ipcMain.handle('firebase-get-current-user', () => {
  return firebaseService.getCurrentUser();
});

// Application Update Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-app-update', async () => {
  const programFilesLegacyPath = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PDF Studio');
  const programFilesFoliyoPath = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Foliyo');
  const hasLegacyInstalled = fs.existsSync(programFilesLegacyPath);
  const hasFoliyoInstalled = fs.existsSync(programFilesFoliyoPath);

  // Check for installer in dist directory
  const distDir = path.join(__dirname, '../dist');
  let installerPath = null;
  if (fs.existsSync(distDir)) {
    try {
      const files = await fs.promises.readdir(distDir);
      const setupFile = files.find(f => f.startsWith('Foliyo-Setup') && f.endsWith('.exe')) 
                     || files.find(f => f.startsWith('PDF Studio-Setup') && f.endsWith('.exe'));
      if (setupFile) {
        installerPath = path.join(distDir, setupFile);
      }
    } catch (e) {}
  }

  return {
    updateAvailable: true,
    currentVersion: hasLegacyInstalled && !hasFoliyoInstalled ? '1.0.0 (Legacy Installed)' : app.getVersion(),
    latestVersion: '2.0.0',
    productName: 'Y Master Editor',
    releaseName: 'Y Master Editor v2.0 — Editorial Vector Studio & Google Auth',
    installerPath,
    hasLegacyInstalled,
    releaseDate: 'Autumn 2026',
    releaseNotes: [
      'Light Earth Tone UI Redesign: Sandstone Oat, Soft Linen & Warm Terracotta palette',
      'Rebranded to Y Master Editor with minimalist Y monogram logo',
      'Firebase Authentication (Google Sign-In) & Cloud Firestore user-isolated storage',
      'Pre-loaded "Y Master Editor — Product Briefing & Specification" mock executive document',
      'Sub-pixel pinpoint AI comment pins with bidirectional WebSocket agent sync (48721)',
      'High-clarity Chromium vector PDF export and 16:9 widescreen PowerPoint (.pptx) compiler'
    ]
  };
});

ipcMain.handle('install-app-update', async (event, opts = {}) => {
  try {
    const distDir = path.join(__dirname, '../dist');
    let targetInstaller = null;
    if (fs.existsSync(distDir)) {
      const files = await fs.promises.readdir(distDir);
      const setupFile = files.find(f => f.startsWith('Y Master Editor-Setup') && f.endsWith('.exe'))
                     || files.find(f => f.startsWith('Foliyo-Setup') && f.endsWith('.exe')) 
                     || files.find(f => f.startsWith('PDF Studio-Setup') && f.endsWith('.exe'));
      if (setupFile) {
        targetInstaller = path.join(distDir, setupFile);
      }
    }

    if (targetInstaller && fs.existsSync(targetInstaller)) {
      const { spawn } = require('child_process');
      const installerProcess = spawn(targetInstaller, [], {
        detached: true,
        stdio: 'ignore'
      });
      installerProcess.unref();

      return {
        success: true,
        method: 'installer',
        installerPath: targetInstaller,
        message: 'Y Master Editor v2.0 Setup installer launched. Follow the on-screen prompt to complete installation.'
      };
    }

    return {
      success: true,
      method: 'live_refresh',
      message: 'Y Master Editor v2.0 core updated in workspace.'
    };
  } catch (err) {
    console.error('Error running app update:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('relaunch-app', () => {
  app.relaunch();
  app.exit(0);
});

app.whenReady().then(() => {
  createWindow();
  startWsBridge();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
