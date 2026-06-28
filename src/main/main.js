const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const db = require('./database');

let mainWindow;
function createWindow() {
  db.initDatabase();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(() => {
  createWindow();
  setTimeout(() => autoUpdater.checkForUpdatesAndNotify().catch(() => {}), 3000);
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

ipcMain.handle('dashboard', () => db.dashboard());
ipcMain.handle('transactions:list', () => db.listTransactions());
ipcMain.handle('transactions:add', (_, data) => db.addTransaction(data));
ipcMain.handle('crops:list', () => db.listCrops());
ipcMain.handle('crops:add', (_, data) => db.addCrop(data.name, data.unit));
ipcMain.handle('stock:report', () => db.stockReport());
ipcMain.handle('markets:list', () => db.listMarkets());
ipcMain.handle('markets:add', (_, data) => db.addMarket(data));
ipcMain.handle('ai:advice', () => db.aiAdvice());
ipcMain.handle('backup:create', () => db.backupDatabase('manual'));
ipcMain.handle('format:all', async () => {
  const res = await dialog.showMessageBox(mainWindow, {
    type: 'warning', buttons: ['Cancel', 'Format'], defaultId: 0, cancelId: 0,
    title: 'Format taarifa zote', message: 'Una uhakika unataka kufuta taarifa zote? Backup itahifadhiwa kwanza.'
  });
  if (res.response === 1) return db.resetAll();
  return false;
});
ipcMain.handle('updates:check', async () => {
  db.backupDatabase('before-update-check');
  return autoUpdater.checkForUpdatesAndNotify();
});
