const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const db = require('./database');
const backups = require('./backup');
let mainWindow;
function createWindow(){
  db.openDb();
  mainWindow = new BrowserWindow({ width:1280, height:820, minWidth:1100, minHeight:700, title:'NASS MAZAO 255 Business Manager', webPreferences:{ preload:path.join(__dirname,'../preload/preload.js'), contextIsolation:true, nodeIntegration:false } });
  mainWindow.loadFile(path.join(__dirname,'../renderer/index.html'));
}
app.whenReady().then(()=>{ createWindow(); autoUpdater.autoDownload=false; autoUpdater.checkForUpdates().catch(()=>{}); });
app.on('window-all-closed',()=>{ if(process.platform !== 'darwin') app.quit(); });
ipcMain.handle('records:list', (_, module)=> db.listRecords(module));
ipcMain.handle('records:add', (_, record)=> db.addRecord(record));
ipcMain.handle('records:update', (_, id, patch)=> db.updateRecord(id, patch));
ipcMain.handle('records:delete', (_, id)=> db.deleteRecord(id));
ipcMain.handle('dashboard:get', ()=> db.dashboard());
ipcMain.handle('settings:get', ()=> db.settings());
ipcMain.handle('settings:set', (_, key, value)=> db.setSetting(key,value));
ipcMain.handle('backup:create', (_, reason)=> backups.createBackup(reason));
ipcMain.handle('backup:list', ()=> backups.listBackups());
ipcMain.handle('data:format', async()=>{ const res = await dialog.showMessageBox(mainWindow,{ type:'warning', buttons:['Ghairi','Ndiyo, futa zote'], defaultId:0, cancelId:0, title:'Format taarifa zote', message:'Una uhakika unataka kufuta taarifa zote?', detail:'Backup itatengenezwa kwanza kabla ya kufuta.' }); if(res.response!==1) return false; backups.createBackup('before-format'); return db.formatAll(); });
ipcMain.handle('updates:check', async()=>{ try { const r = await autoUpdater.checkForUpdates(); return { ok:true, info:r?.updateInfo||null }; } catch(e){ return { ok:false, error:e.message }; } });
ipcMain.handle('updates:download', async()=>{ try { backups.createBackup('before-update'); await autoUpdater.downloadUpdate(); return { ok:true }; } catch(e){ return { ok:false, error:e.message }; } });
ipcMain.handle('updates:install', ()=> autoUpdater.quitAndInstall(false,true));
for(const [event,type] of [['update-available','available'],['update-not-available','none'],['download-progress','progress'],['update-downloaded','downloaded'],['error','error']]) autoUpdater.on(event, payload=> mainWindow?.webContents.send('updates:status', { type, payload: type==='error' ? payload.message : payload }));
