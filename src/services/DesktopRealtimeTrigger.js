// src/services/DesktopRealtimeTrigger.js
// Listens to Firestore (app_meta/desktop_release) for zero-delay instant desktop release notifications

(function(global) {
  function subscribeToInstantDesktopRelease(onNewRelease) {
    let currentVersion = '2.0.0';
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.getAppVersion === 'function') {
      window.electronAPI.getAppVersion().then(v => { if (v) currentVersion = v; }).catch(() => {});
    }

    // 1. Listen via Electron Main Process Firestore bridge
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.onDesktopRelease === 'function') {
      window.electronAPI.onDesktopRelease((data) => {
        if (!data || !data.version) return;
        if (data.version !== currentVersion) {
          if (window.electronUpdater && typeof window.electronUpdater.check === 'function') {
            window.electronUpdater.check().catch(() => {});
          }
          if (typeof onNewRelease === 'function') {
            onNewRelease(data.version, data.releaseNotes || '');
          }
        }
      });
    }

    // 2. Listen for updater:available from GitHub Releases blockmaps
    if (typeof window !== 'undefined' && window.electronUpdater && typeof window.electronUpdater.onAvailable === 'function') {
      window.electronUpdater.onAvailable((info) => {
        if (info && info.version && info.version !== currentVersion) {
          if (typeof onNewRelease === 'function') {
            onNewRelease(info.version, info.releaseNotes || '');
          }
        }
      });
    }
  }

  global.subscribeToInstantDesktopRelease = subscribeToInstantDesktopRelease;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { subscribeToInstantDesktopRelease };
  }
})(typeof window !== 'undefined' ? window : globalThis);
