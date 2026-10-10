//DOX//DATA//SQLITE.JS
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'dx.db')
  : path.join(__dirname, 'dx.db');
const db = new DatabaseSync(dbPath);

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA temp_store = MEMORY;
PRAGMA foreign_keys = ON;
PRAGMA cache_size = -20000;
PRAGMA busy_timeout = 5000;
`);

console.log("\x1b[32m%s\x1b[0m", "[✓] SQLITE CONNECTED");

module.exports = db;
