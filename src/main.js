const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow;
const dataDir = app.getPath('userData');
const dbPath = path.join(dataDir, 'nass-mazao-data.json');
const backupDir = path.join(dataDir, 'backups');

function ensureData() {
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({
      version: 1,
      createdAt: new Date().toISOString(),
      capital: [],
      crops: [],
      purchases: [],
      sales: [],
      stock: [],
      expenses: [],
      debts: [],
      personalBudget: [],
      settings: { language: 'sw' }
    }, null, 2));
  }
}

function backupData(reason = 'manual') {
  ensureData();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${reason}-${stamp}.json`);
  fs.copyFileSync(dbPath, backupPath);
  return backupPath;
}

function createWindow() {
  ensureData();
  mainWindow = new BrowserWindow({
    width: 1250,
    height: 780,
    minWidth: 1050,
    minHeight: 650,
    title: 'NASS MAZAO 255 Business Manager',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdates().catch(() => {});
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('data:read', () => {
  ensureData();
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
});

ipcMain.handle('data:write', (_, data) => {
  ensureData();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  return true;
});

ipcMain.handle('data:backup', (_, reason) => backupData(reason || 'manual'));

ipcMain.handle('data:format', async () => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Ghairi', 'Ndiyo, futa zote'],
    defaultId: 0,
    cancelId: 0,
    title: 'Format taarifa zote',
    message: 'Una uhakika unataka kufuta taarifa zote na kuanza upya?',
    detail: 'Backup itatengenezwa kwanza kabla ya kufuta.'
  });
  if (result.response !== 1) return false;
  backupData('before-format');
  fs.writeFileSync(dbPath, JSON.stringify({
    version: 1,
    createdAt: new Date().toISOString(),
    capital: [], crops: [], purchases: [], sales: [], stock: [], expenses: [], debts: [], personalBudget: [],
    settings: { language: 'sw' }
  }, null, 2));
  return true;
});

ipcMain.handle('updates:check', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { ok: true, updateInfo: result?.updateInfo || null };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('updates:download', async () => {
  try {
    backupData('before-update');
    await autoUpdater.downloadUpdate();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('updates:install', () => {
  autoUpdater.quitAndInstall(false, true);
});

autoUpdater.on('update-available', info => {
  mainWindow?.webContents.send('updates:status', { type: 'available', info });
});
autoUpdater.on('update-not-available', info => {
  mainWindow?.webContents.send('updates:status', { type: 'none', info });
});
autoUpdater.on('download-progress', progress => {
  mainWindow?.webContents.send('updates:status', { type: 'progress', progress });
});
autoUpdater.on('update-downloaded', info => {
  mainWindow?.webContents.send('updates:status', { type: 'downloaded', info });
});
autoUpdater.on('error', err => {
  mainWindow?.webContents.send('updates:status', { type: 'error', error: err.message });
});
