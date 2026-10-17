const { ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

// Configuration according to Mandatory Implementation Blueprint
autoUpdater.autoDownload = false; // Wait for user to click "Update Now"
autoUpdater.autoInstallOnAppQuit = true;

let updaterInitialized = false;
let currentMainWindow = null;

function setupDesktopAutoUpdater(mainWindow) {
  currentMainWindow = mainWindow;

  if (updaterInitialized) return;
  updaterInitialized = true;

  // Check once on cold start, plus whenever Firebase triggers 'check-for-update'
  ipcMain.handle('updater:check', async () => {
    try {
      return await autoUpdater.checkForUpdates();
    } catch (err) {
      console.warn('[AutoUpdater Check Notice]:', err.message);
      return null;
    }
  });

  // Triggered when user clicks "Update Now" in the popup
  ipcMain.handle('updater:download-and-install', async () => {
    try {
      return await autoUpdater.downloadUpdate();
    } catch (err) {
      console.warn('[AutoUpdater Download Error]:', err.message);
      throw err;
    }
  });

  autoUpdater.on('update-available', (info) => {
    if (currentMainWindow && !currentMainWindow.isDestroyed()) {
      currentMainWindow.webContents.send('updater:available', info);
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    if (currentMainWindow && !currentMainWindow.isDestroyed()) {
      currentMainWindow.webContents.send('updater:progress', Math.round(progressObj.percent));
    }
  });

  autoUpdater.on('update-downloaded', () => {
    // Silent install (isSilent = true) and immediate relaunch (isForceRunAfter = true)
    console.log('[AutoUpdater] Update downloaded. Executing silent hot-swap and restart...');
    autoUpdater.quitAndInstall(true, true);
  });

  autoUpdater.on('error', (err) => {
    console.warn('[AutoUpdater Event Error]:', err.message);
    if (currentMainWindow && !currentMainWindow.isDestroyed()) {
      currentMainWindow.webContents.send('updater:error', err.message);
    }
  });
}

module.exports = { setupDesktopAutoUpdater, autoUpdater };
