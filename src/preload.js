const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nassAPI', {
  readData: () => ipcRenderer.invoke('data:read'),
  writeData: (data) => ipcRenderer.invoke('data:write', data),
  backupData: (reason) => ipcRenderer.invoke('data:backup', reason),
  formatData: () => ipcRenderer.invoke('data:format'),
  checkUpdates: () => ipcRenderer.invoke('updates:check'),
  downloadUpdate: () => ipcRenderer.invoke('updates:download'),
  installUpdate: () => ipcRenderer.invoke('updates:install'),
  onUpdateStatus: (callback) => ipcRenderer.on('updates:status', (_, payload) => callback(payload))
});
