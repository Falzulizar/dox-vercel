//DOX//DATA//SCHEMA.JS
const db = require('./sqlite');

function initSchema() {

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT DEFAULT '-',
        status TEXT DEFAULT 'FREE USER',
        created_at INTEGER DEFAULT (strftime('%s','now')),
        premium_expired_at INTEGER,
        last_checkin TEXT,
        total_referrals INTEGER DEFAULT 0,
        total_coins INTEGER DEFAULT 0,
        checker_count INTEGER DEFAULT 0,
        total_checker INTEGER DEFAULT 0,
        daily_count INTEGER DEFAULT 0,
        last_check_date TEXT,
        fixred_count INTEGER DEFAULT 0,
        total_fixred INTEGER DEFAULT 0,
        total_checked INTEGER DEFAULT 0,
        total_numbers INTEGER DEFAULT 0 );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        type TEXT,
        numbers TEXT,
        success INTEGER DEFAULT 0,
        failed INTEGER DEFAULT 0,
        has_bio INTEGER DEFAULT 0,
        no_bio INTEGER DEFAULT 0,
        is_business INTEGER DEFAULT 0,
        is_pretty INTEGER DEFAULT 0,
        duration TEXT,
        speed TEXT,
        created_at INTEGER DEFAULT (strftime('%s','now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT,
        message TEXT,
        created_at INTEGER DEFAULT (strftime('%s','now')) )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS cache (
        cache_key TEXT PRIMARY KEY,
        cache_value TEXT NOT NULL,
        expires_at INTEGER NOT NULL )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS session (
        session_id TEXT,
        key TEXT,
        value TEXT,
        PRIMARY KEY (session_id, key) );
`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_history_user
ON history(user_id);
`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_history_date
ON history(created_at);
`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_cache_expire
ON cache(expires_at);
`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_logs_date
ON logs(created_at);
`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_status
ON users(status);
`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_premium
ON users(premium_expired_at);
`);
  
    console.log('\x1b[36m%s\x1b[0m',
    '[DB] SCHEMA SQLITE NATIVE INITIALIZED SUCCESSFULLY!');
}

module.exports = initSchema;

