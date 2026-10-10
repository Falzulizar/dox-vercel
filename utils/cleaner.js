const fs = require('fs');
const path = require('path');
const db = require('../database');

function initAutoCleaner() {
    const cacheDir = './cache';
    const backupDir = './backups';
    const maxAgeMs = 12 * 60 * 60 * 1000;
    const maxBackupAgeMs = 7 * 24 * 60 * 60 * 1000;

    const cleanPatrol = async () => {
          console.log('\x1b[34m%s\x1b[0m',
          '[🗑️] AUTO-CLEANER: STARTING PATROL...');

  if (fs.existsSync(cacheDir)) {
  try {
    const files = fs.readdirSync(cacheDir);
          files.forEach(file => {
  if (file.endsWith('.txt') || file.startsWith('cache_')) {
    const filePath = path.join(cacheDir, file);
  if (Date.now() - fs.statSync(filePath).mtimeMs > maxAgeMs) fs.unlinkSync(filePath);
  }
});
} catch (e) { console.error('[x] CLEANER FILE GAGAL:', e.message); }
  }
  if (fs.existsSync(backupDir)) {
  try {
    const files = fs.readdirSync(backupDir);
          files.forEach(file => {
    const filePath = path.join(backupDir, file);
  if (file.startsWith('backup_') && file.endsWith('.db')) {
  if (Date.now() - fs.statSync(filePath).mtimeMs > maxBackupAgeMs) {
                   fs.unlinkSync(filePath);
          console.log('\x1b[33m%s\x1b[0m',
          `[🗑️] PURGED OLD BACKUP: ${file}`);
    }
  }
});
} catch (e) { console.error('[x] PURGE BACKUP GAGAL:', e.message); }
}
  try {
    const dbCore = require('../data/sqlite');
    dbCore.prepare(`DELETE FROM cache WHERE expires_at < ?`).run(Date.now());

    const infoHistory = dbCore.prepare(`
        DELETE FROM history 
        WHERE (strftime('%s', 'now') - created_at) > 43200
    `).run();
    
    if (infoHistory.changes > 0) {
        console.log('\x1b[33m%s\x1b[0m', 
        `[🗑️] AUTO-CLEANER: Berhasil menyapu ${infoHistory.changes} sampah berkas history (6 Jam+)!`);
    }

  if (db && typeof db.autoCleanInvalidUsers === 'function') await db.autoCleanInvalidUsers();
} catch (err) {
          console.error('\x1b[31m%s\x1b[0m',
          '[x] AUTO-CLEANER DATABASE GAGAL:', err.message);
  }
};

    cleanPatrol();
    setInterval(cleanPatrol, 6 * 60 * 60 * 1000);
}

module.exports = { initAutoCleaner };

