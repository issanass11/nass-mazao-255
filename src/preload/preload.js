const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('nassAPI', {
  listRecords: module => ipcRenderer.invoke('records:list', module),
  addRecord: record => ipcRenderer.invoke('records:add', record),
  updateRecord: (id, patch) => ipcRenderer.invoke('records:update', id, patch),
  deleteRecord: id => ipcRenderer.invoke('records:delete', id),
  getDashboard: () => ipcRenderer.invoke('dashboard:get'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSetting: (key,value) => ipcRenderer.invoke('settings:set', key,value),
  createBackup: reason => ipcRenderer.invoke('backup:create', reason),
  listBackups: () => ipcRenderer.invoke('backup:list'),
  formatData: () => ipcRenderer.invoke('data:format'),
  checkUpdates: () => ipcRenderer.invoke('updates:check'),
  downloadUpdate: () => ipcRenderer.invoke('updates:download'),
  installUpdate: () => ipcRenderer.invoke('updates:install'),
  onUpdateStatus: cb => ipcRenderer.on('updates:status', (_, payload)=> cb(payload))
});
