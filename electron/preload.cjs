const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  savePdf: (data) => ipcRenderer.invoke('save-pdf', data),
  savePptx: (data) => ipcRenderer.invoke('save-pptx', data),
  printDocument: (data) => ipcRenderer.invoke('print-document', data),
  saveUserData: (data) => ipcRenderer.invoke('save-user-data', data),
  loadUserData: () => ipcRenderer.invoke('load-user-data'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onMcpMessage: (callback) => {
    ipcRenderer.on('mcp-message', (_event, value) => callback(value));
  },
  sendToMcp: (payload) => ipcRenderer.send('renderer-to-mcp', payload),
  checkAppUpdate: () => ipcRenderer.invoke('check-app-update'),
  installAppUpdate: (opts) => ipcRenderer.invoke('install-app-update', opts),
  relaunchApp: () => ipcRenderer.invoke('relaunch-app'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Firebase Omni-Auth & Nickname Engine
  firebaseCheckNickname: (nickname) => ipcRenderer.invoke('firebase-check-nickname', nickname),
  firebaseSignUp: (data) => ipcRenderer.invoke('firebase-signup', data),
  firebaseSignInWithNickname: (data) => ipcRenderer.invoke('firebase-signin-nickname', data),
  firebaseSignInSocial: (provider, meta) => ipcRenderer.invoke('firebase-signin-social', { provider, meta }),
  firebaseSignIn: (accountData) => ipcRenderer.invoke('firebase-signin', accountData),
  firebaseSignOut: () => ipcRenderer.invoke('firebase-signout'),
  firebaseGetCurrentUser: () => ipcRenderer.invoke('firebase-get-current-user'),

  // Cloud Firestore User & Workspace Storage
  firebaseLoadUserData: (uid) => ipcRenderer.invoke('firebase-load-user-data', uid),
  firebaseSaveUserData: (uid, data) => ipcRenderer.invoke('firebase-save-user-data', { uid, data }),

  // Firebase Activity Tracking & Telemetry
  firebaseLogActivity: (data) => ipcRenderer.invoke('firebase-log-activity', data),
  firebaseGetActivityLogs: (opts) => ipcRenderer.invoke('firebase-get-activity-logs', opts),

  // Extensible Feature Repository CRUD
  firebaseRepoCreate: (payload) => ipcRenderer.invoke('firebase-repo-create', payload),
  firebaseRepoGet: (payload) => ipcRenderer.invoke('firebase-repo-get', payload),
  firebaseRepoUpdate: (payload) => ipcRenderer.invoke('firebase-repo-update', payload),
  firebaseRepoDelete: (payload) => ipcRenderer.invoke('firebase-repo-delete', payload),

  // MCP Document & Authorization Bridge
  getMcpDocumentState: () => ipcRenderer.invoke('get-mcp-document-state'),
  authorizeInstruction: (opts) => ipcRenderer.invoke('authorize-instruction', opts),
  openDocumentDialog: (opts) => ipcRenderer.invoke('open-document-dialog', opts),

  // MCP Gateway & Public Tunnel Status
  getMcpStatus: () => ipcRenderer.invoke('mcp:get-status'),
  restartMcpTunnel: () => ipcRenderer.invoke('mcp:restart-tunnel'),
  onMcpTunnelStatus: (callback) => {
    ipcRenderer.on('mcp:tunnel-status', (_event, data) => callback(data));
  },

  // Realtime Firebase Release Trigger
  onDesktopRelease: (callback) => ipcRenderer.on('firebase:desktop-release', (_event, data) => callback(data))
});

// Mandatory Desktop Auto-Updater Bridge
contextBridge.exposeInMainWorld('electronUpdater', {
  check: () => ipcRenderer.invoke('updater:check'),
  downloadAndInstall: () => ipcRenderer.invoke('updater:download-and-install'),
  onAvailable: (callback) => {
    ipcRenderer.on('updater:available', (_event, info) => callback(info));
  },
  onProgress: (callback) => {
    ipcRenderer.on('updater:progress', (_event, percent) => callback(percent));
  },
  onError: (callback) => {
    ipcRenderer.on('updater:error', (_event, error) => callback(error));
  }
});
