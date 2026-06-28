const migrations = [
  {
    version: 1,
    name: 'initial_database',
    sql: `
      CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS records (
        id TEXT PRIMARY KEY,
        module TEXT NOT NULL,
        date TEXT NOT NULL,
        name TEXT DEFAULT '',
        crop TEXT DEFAULT '',
        quantity REAL DEFAULT 0,
        unit TEXT DEFAULT '',
        amount REAL DEFAULT 0,
        status TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_records_module ON records(module);
      CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        module TEXT DEFAULT '',
        record_id TEXT DEFAULT '',
        details TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    `
  },
  {
    version: 2,
    name: 'financial_discipline',
    sql: `
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        month TEXT NOT NULL,
        category TEXT NOT NULL,
        planned REAL DEFAULT 0,
        actual REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
    `
  }
];
module.exports = { migrations };
