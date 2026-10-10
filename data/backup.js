//DOX//DATA//BACKUPS.JS
const fs = require('fs');
const path = require('path');
const db = require('./sqlite');

function runBackup() {
  try {
    const backupDir = path.join(__dirname, '../backups');

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_` +
                      `${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}`;
    
    const backupPath = path.join(backupDir, `backup_${timestamp}.db`);

    db.exec(`VACUUM INTO '${backupPath}'`);
        
    console.log('\x1b[32m%s\x1b[0m', `[DB] SUCCESS: backup_${timestamp}.db`);
    return true;
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', '[DB] BACKUP FAILED:', err.message);
        return false;
    }
}

module.exports = runBackup;

