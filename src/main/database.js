const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { app } = require('electron');

let db;

function dbPath() {
  const dir = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'nass-mazao-255.sqlite');
}

function backupDatabase(reason = 'manual') {
  const source = dbPath();
  if (!fs.existsSync(source)) return null;
  const dir = path.join(app.getPath('userData'), 'backups');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join(dir, `backup-${reason}-${stamp}.sqlite`);
  fs.copyFileSync(source, target);
  return target;
}

function initDatabase() {
  db = new Database(dbPath());
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS crops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      unit TEXT NOT NULL DEFAULT 'kg',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('purchase','sale','expense','debt_in','debt_out','capital','loss')),
      crop_id INTEGER,
      person TEXT,
      quantity REAL DEFAULT 0,
      unit_price REAL DEFAULT 0,
      amount REAL NOT NULL DEFAULT 0,
      paid REAL NOT NULL DEFAULT 0,
      note TEXT,
      date TEXT NOT NULL DEFAULT CURRENT_DATE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(crop_id) REFERENCES crops(id)
    );
    CREATE TABLE IF NOT EXISTS stock_moves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_id INTEGER NOT NULL,
      quantity_in REAL DEFAULT 0,
      quantity_out REAL DEFAULT 0,
      reason TEXT,
      transaction_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(crop_id) REFERENCES crops(id)
    );
    CREATE TABLE IF NOT EXISTS markets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      crop TEXT,
      buy_price REAL DEFAULT 0,
      sell_price REAL DEFAULT 0,
      contact TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const count = db.prepare('SELECT COUNT(*) as n FROM crops').get().n;
  if (count === 0) {
    const insert = db.prepare('INSERT INTO crops(name, unit) VALUES (?, ?)');
    ['Mahindi','Mpunga','Ufuta','Maharage','Alizeti','Mtama','Karanga'].forEach(c => insert.run(c, 'kg'));
  }
  return db;
}

function getDb() {
  if (!db) initDatabase();
  return db;
}

function dashboard() {
  const d = getDb();
  const row = d.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type='capital' THEN amount ELSE 0 END),0) capital,
      COALESCE(SUM(CASE WHEN type='purchase' THEN amount ELSE 0 END),0) purchases,
      COALESCE(SUM(CASE WHEN type='sale' THEN amount ELSE 0 END),0) sales,
      COALESCE(SUM(CASE WHEN type IN ('expense','loss') THEN amount ELSE 0 END),0) expenses,
      COALESCE(SUM(CASE WHEN type IN ('debt_in','debt_out') THEN amount-paid ELSE 0 END),0) debts
    FROM transactions
  `).get();
  row.profit = row.sales - row.purchases - row.expenses;
  row.cashflow = row.capital + row.sales - row.purchases - row.expenses;
  row.stock_value = Math.max(0, row.purchases - row.sales);
  const expensePressure = row.sales > 0 ? (row.expenses / row.sales) * 100 : 0;
  row.discipline_score = Math.max(0, Math.min(100, 90 - expensePressure + (row.profit > 0 ? 10 : -20)));
  return row;
}

function listTransactions() {
  return getDb().prepare(`
    SELECT t.*, c.name crop_name FROM transactions t
    LEFT JOIN crops c ON c.id=t.crop_id
    ORDER BY t.id DESC LIMIT 300
  `).all();
}

function addTransaction(data) {
  const d = getDb();
  const stmt = d.prepare(`
    INSERT INTO transactions(type,crop_id,person,quantity,unit_price,amount,paid,note,date)
    VALUES (@type,@crop_id,@person,@quantity,@unit_price,@amount,@paid,@note,@date)
  `);
  const info = stmt.run({
    type: data.type,
    crop_id: data.crop_id || null,
    person: data.person || '',
    quantity: Number(data.quantity || 0),
    unit_price: Number(data.unit_price || 0),
    amount: Number(data.amount || (Number(data.quantity||0) * Number(data.unit_price||0))),
    paid: Number(data.paid || 0),
    note: data.note || '',
    date: data.date || new Date().toISOString().slice(0,10)
  });
  if (data.crop_id && ['purchase','sale'].includes(data.type)) {
    d.prepare('INSERT INTO stock_moves(crop_id, quantity_in, quantity_out, reason, transaction_id) VALUES (?,?,?,?,?)')
      .run(data.crop_id, data.type === 'purchase' ? Number(data.quantity||0) : 0, data.type === 'sale' ? Number(data.quantity||0) : 0, data.type, info.lastInsertRowid);
  }
  return info.lastInsertRowid;
}

function listCrops() { return getDb().prepare('SELECT * FROM crops ORDER BY name').all(); }
function addCrop(name, unit='kg') { return getDb().prepare('INSERT OR IGNORE INTO crops(name, unit) VALUES (?, ?)').run(name, unit); }
function stockReport() { return getDb().prepare(`SELECT c.name, c.unit, COALESCE(SUM(s.quantity_in-s.quantity_out),0) stock FROM crops c LEFT JOIN stock_moves s ON s.crop_id=c.id GROUP BY c.id ORDER BY c.name`).all(); }
function listMarkets() { return getDb().prepare('SELECT * FROM markets ORDER BY id DESC LIMIT 300').all(); }
function addMarket(data) { return getDb().prepare('INSERT INTO markets(name,location,crop,buy_price,sell_price,contact,note) VALUES (@name,@location,@crop,@buy_price,@sell_price,@contact,@note)').run({name:data.name||'',location:data.location||'',crop:data.crop||'',buy_price:Number(data.buy_price||0),sell_price:Number(data.sell_price||0),contact:data.contact||'',note:data.note||''}); }
function aiAdvice() {
  const d = dashboard();
  const advice = [];
  if (d.profit < 0) advice.push({title:'Hatari ya Hasara', message:'Biashara iko kwenye hasara. Punguza matumizi, hakiki bei ya kununua, na uza stock yenye margin nzuri kwanza.'});
  else advice.push({title:'Faida Ipo', message:'Endelea kurudisha sehemu ya faida kwenye mtaji na stock. Usitumie faida yote kwenye matumizi binafsi.'});
  if (d.expenses > d.sales * 0.2 && d.sales > 0) advice.push({title:'Matumizi Yamezidi', message:'Matumizi yamezidi 20% ya mauzo. Weka bajeti ya mwezi na ruhusu matumizi muhimu tu.'});
  advice.push({title:'Kanuni ya Mtaji', message:'Gawa mapato: 50% mtaji/stock, 20% akiba au uwekezaji, 20% matumizi binafsi, 10% dharura.'});
  advice.push({title:'Masoko', message:'Linganisha bei za masoko kabla ya kuuza. Uza kwenye soko lenye tofauti kubwa kati ya bei ya kununua na kuuza.'});
  advice.push({title:'Madeni', message:'Rekodi deni kila siku na weka tarehe ya kufuatilia. Madeni yasiyodhibitiwa huua cashflow.'});
  return advice;
}
function resetAll() { backupDatabase('before-format'); getDb().exec('DELETE FROM stock_moves; DELETE FROM transactions; DELETE FROM markets;'); return true; }

module.exports = { initDatabase, dashboard, listTransactions, addTransaction, listCrops, addCrop, stockReport, listMarkets, addMarket, aiAdvice, backupDatabase, resetAll };
