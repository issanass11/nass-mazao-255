const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { app } = require('electron');
const { migrations } = require('./schema');

let db;
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
function dataDir(){ const dir = path.join(app.getPath('userData'), 'data'); fs.mkdirSync(dir, { recursive: true }); return dir; }
function dbPath(){ return path.join(dataDir(), 'nass-mazao-255.sqlite'); }
function openDb(){
  if(db) return db;
  db = new sqlite3.Database(dbPath());
  db.serialize(() => {
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
    db.run('CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)');
    applyMigrations();
  });
  return db;
}
function run(sql, params=[]){ return new Promise((resolve,reject)=> openDb().run(sql, params, function(err){ err ? reject(err) : resolve({ id:this.lastID, changes:this.changes }); })); }
function all(sql, params=[]){ return new Promise((resolve,reject)=> openDb().all(sql, params, (err,rows)=> err ? reject(err) : resolve(rows))); }
function get(sql, params=[]){ return new Promise((resolve,reject)=> openDb().get(sql, params, (err,row)=> err ? reject(err) : resolve(row))); }
function applyMigrations(){
  const applied = new Set();
  db.all('SELECT version FROM migrations', [], (err, rows=[]) => {
    if(err) return;
    rows.forEach(r => applied.add(r.version));
    db.serialize(() => {
      migrations.forEach(m => {
        if(!applied.has(m.version)) {
          db.exec(m.sql);
          db.run('INSERT INTO migrations(version,name,applied_at) VALUES(?,?,?)', [m.version, m.name, now()]);
        }
      });
      db.run('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)', ['language','sw']);
    });
  });
}
async function listRecords(module){ return all('SELECT * FROM records WHERE module=? ORDER BY date DESC, created_at DESC', [module]); }
async function addRecord(record){
  const id = uid(); const t = now();
  await run(`INSERT INTO records(id,module,date,name,crop,quantity,unit,amount,status,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, record.module, record.date || t.slice(0,10), record.name||'', record.crop||'', Number(record.quantity||0), record.unit||'', Number(record.amount||0), record.status||'', record.notes||'', t, t]);
  await audit('create', record.module, id, JSON.stringify(record)); return { ...record, id, created_at:t, updated_at:t };
}
async function updateRecord(id, patch){
  const old = await get('SELECT * FROM records WHERE id=?', [id]); if(!old) throw new Error('Record haijapatikana');
  const next = { ...old, ...patch, updated_at: now() };
  await run(`UPDATE records SET date=?, name=?, crop=?, quantity=?, unit=?, amount=?, status=?, notes=?, updated_at=? WHERE id=?`,
    [next.date, next.name, next.crop, Number(next.quantity||0), next.unit, Number(next.amount||0), next.status, next.notes, next.updated_at, id]);
  await audit('update', old.module, id, JSON.stringify(patch)); return next;
}
async function deleteRecord(id){ const old = await get('SELECT * FROM records WHERE id=?', [id]); if(!old) return false; await run('DELETE FROM records WHERE id=?', [id]); await audit('delete', old.module, id, JSON.stringify(old)); return true; }
async function audit(action,module,recordId,details){ await run('INSERT INTO audit_log(id,action,module,record_id,details,created_at) VALUES(?,?,?,?,?,?)',[uid(),action,module||'',recordId||'',details||'',now()]); }
async function settings(){ const rows = await all('SELECT key,value FROM settings'); return Object.fromEntries(rows.map(r=>[r.key,r.value])); }
async function setSetting(key,value){ await run('INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)', [key, String(value)]); return true; }
async function dashboard(){
  const rows = await all('SELECT module, SUM(amount) total FROM records GROUP BY module');
  const m = Object.fromEntries(rows.map(r=>[r.module, Number(r.total||0)]));
  const capital = m.capital || 0, sales = m.sales || 0, purchases = m.purchases || 0, expenses = m.expenses || 0;
  const profit = sales - purchases - expenses;
  const disciplineScore = Math.max(0, Math.min(100, Math.round((1 - ((expenses)/(capital + sales + 1))) * 100)));
  return { capital, sales, purchases, expenses, debts:m.debts||0, stock:m.stock||0, profit, disciplineScore };
}
async function formatAll(){ await run('DELETE FROM records'); await run('DELETE FROM budgets'); await audit('format','system','','All records formatted'); return true; }
module.exports = { openDb, dbPath, listRecords, addRecord, updateRecord, deleteRecord, dashboard, settings, setSetting, formatAll, all };
