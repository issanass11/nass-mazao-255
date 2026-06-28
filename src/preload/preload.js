const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  dashboard: () => ipcRenderer.invoke('dashboard'),
  listTransactions: () => ipcRenderer.invoke('transactions:list'),
  addTransaction: data => ipcRenderer.invoke('transactions:add', data),
  listCrops: () => ipcRenderer.invoke('crops:list'),
  addCrop: data => ipcRenderer.invoke('crops:add', data),
  stockReport: () => ipcRenderer.invoke('stock:report'),
  createBackup: () => ipcRenderer.invoke('backup:create'),
  formatAll: () => ipcRenderer.invoke('format:all'),
  checkUpdates: () => ipcRenderer.invoke('updates:check')
});
