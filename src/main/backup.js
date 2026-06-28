const fs = require('fs'); const path = require('path'); const { app } = require('electron'); const database = require('./database');
function backupDir(){ const dir = path.join(app.getPath('userData'), 'backups'); fs.mkdirSync(dir,{recursive:true}); return dir; }
function createBackup(reason='manual'){
  database.openDb();
  const stamp = new Date().toISOString().replace(/[:.]/g,'-');
  const out = path.join(backupDir(), `nass-mazao-255-${reason}-${stamp}.sqlite`);
  fs.copyFileSync(database.dbPath(), out); return out;
}
function listBackups(){ return fs.readdirSync(backupDir()).filter(f=>f.endsWith('.sqlite')).map(f=>({ name:f, path:path.join(backupDir(),f), created: fs.statSync(path.join(backupDir(),f)).mtime.toISOString() })).sort((a,b)=> b.created.localeCompare(a.created)); }
module.exports = { createBackup, listBackups };
