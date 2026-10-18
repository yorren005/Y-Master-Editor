/**
 * electron/storage-paths.cjs
 * Universal storage path resolver for development, test, and packaged asar production environments.
 * Prevents ENOTDIR and EROFS crashes when packaged into Electron asar archive.
 */

const path = require('path');
const fs = require('fs');

let electronApp = null;
try {
  const electron = require('electron');
  electronApp = electron.app || (electron.remote && electron.remote.app) || null;
} catch (_) {}

/**
 * Configure isolated user data directory early to avoid Chromium lock collisions
 */
function initializeUserData() {
  if (electronApp && typeof electronApp.getPath === 'function' && typeof electronApp.setPath === 'function') {
    try {
      const appData = electronApp.getPath('appData');
      const customUserData = path.join(appData, 'Y-Master-Editor-Studio');
      if (!fs.existsSync(customUserData)) {
        fs.mkdirSync(customUserData, { recursive: true });
      }
      electronApp.setPath('userData', customUserData);
      return customUserData;
    } catch (e) {
      console.warn('[StoragePaths] UserData path initialization notice:', e.message);
    }
  }
  return null;
}

/**
 * Returns true if running inside a packaged Electron app (app.asar)
 */
function isPackagedApp() {
  if (electronApp && typeof electronApp.isPackaged === 'boolean') {
    return electronApp.isPackaged;
  }
  return __dirname.includes('app.asar') || (process.resourcesPath && __dirname.includes(process.resourcesPath));
}

/**
 * Returns the root directory where runtime writable data must be stored.
 */
function getStorageRoot() {
  if (isPackagedApp()) {
    if (electronApp && typeof electronApp.getPath === 'function') {
      try {
        const userData = electronApp.getPath('userData');
        if (userData && !userData.includes('app.asar')) {
          return userData;
        }
      } catch (_) {}
    }
    const appData = process.env.APPDATA || (process.platform === 'darwin' ? path.join(process.env.HOME || '', 'Library/Application Support') : path.join(process.env.HOME || '', '.config'));
    const fallbackDir = path.join(appData, 'Y-Master-Editor-Studio');
    if (!fs.existsSync(fallbackDir)) {
      try { fs.mkdirSync(fallbackDir, { recursive: true }); } catch (_) {}
    }
    return fallbackDir;
  }

  // Development or standalone Node tests
  return path.join(__dirname, '..');
}

/**
 * Resolves a writable path for a runtime file or directory.
 * Ensures the target directory exists on disk.
 * @param {...string} subpaths
 * @returns {string} Guaranteed writable path
 */
function resolveWritablePath(...subpaths) {
  const root = getStorageRoot();
  const fullPath = path.join(root, ...subpaths);
  const dir = path.extname(fullPath) ? path.dirname(fullPath) : fullPath;
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn(`[StoragePaths] Directory creation notice for ${dir}:`, err.message);
  }
  return fullPath;
}

/**
 * Ensures state files (e.g. document_state.json) are seeded in userData if missing
 */
function ensureSeededFile(fileName, defaultContent = '{}') {
  const targetPath = resolveWritablePath(fileName);
  if (!fs.existsSync(targetPath)) {
    try {
      // Check if bundled template exists in app.asar / development root
      const bundledPath = path.join(__dirname, '..', fileName);
      if (fs.existsSync(bundledPath)) {
        const content = fs.readFileSync(bundledPath, 'utf-8');
        fs.writeFileSync(targetPath, content, 'utf-8');
      } else {
        fs.writeFileSync(targetPath, defaultContent, 'utf-8');
      }
    } catch (e) {
      console.warn(`[StoragePaths] Notice seeding ${fileName}:`, e.message);
    }
  }
  return targetPath;
}

/**
 * Locates the cloudflared executable.
 * In packaged production: process.resourcesPath/bin/cloudflared.exe
 * In development / test: ../bin/cloudflared.exe
 */
function getCloudflaredPath() {
  // 1. Check packaged extraResources location
  if (process.resourcesPath) {
    const packagedBin = path.join(process.resourcesPath, 'bin', 'cloudflared.exe');
    if (fs.existsSync(packagedBin)) {
      return packagedBin;
    }
    // Also check direct resources path
    const directBin = path.join(process.resourcesPath, 'cloudflared.exe');
    if (fs.existsSync(directBin)) {
      return directBin;
    }
  }

  // 2. Check development workspace path
  const devBin = path.join(__dirname, '..', 'bin', 'cloudflared.exe');
  if (fs.existsSync(devBin)) {
    return devBin;
  }

  // 3. Fallback to system command
  return 'cloudflared.exe';
}

module.exports = {
  initializeUserData,
  isPackagedApp,
  getStorageRoot,
  resolveWritablePath,
  ensureSeededFile,
  getCloudflaredPath
};
