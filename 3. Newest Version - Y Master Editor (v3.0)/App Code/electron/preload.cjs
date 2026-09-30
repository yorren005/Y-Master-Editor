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
  // Firebase Authentication & Cloud Firestore
  firebaseSignIn: (accountData) => ipcRenderer.invoke('firebase-signin', accountData),
  firebaseSignOut: () => ipcRenderer.invoke('firebase-signout'),
  firebaseLoadUserData: (uid) => ipcRenderer.invoke('firebase-load-user-data', uid),
  firebaseSaveUserData: (uid, data) => ipcRenderer.invoke('firebase-save-user-data', { uid, data }),
  firebaseGetCurrentUser: () => ipcRenderer.invoke('firebase-get-current-user')
});

