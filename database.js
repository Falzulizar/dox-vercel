//DOX//DATABASE.JS
const db = require('./data/sqlite');

// ==============================================================
// 🧠 1. INTERNAL SYSTEM HELPERS
// ==============================================================
function bitGlobalStats(userInc = 0, checkInc = 0) {
    const row = db.prepare("SELECT value FROM config WHERE key = 'global_stats'").get();
    let stats = row ? JSON.parse(row.value) : { total_users: 0, total_checked: 0 };
    
    stats.total_users += userInc;
    stats.total_checked += checkInc;
    
    db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES ('global_stats', ?)")
      .run(JSON.stringify(stats));
    return stats;
}

function formatUser(row) {
    if (!row) return null;
    return {
        id: String(row.id),
        username: row.username || '-',
        status: row.status,
        created_at: row.created_at,
        premium_expired_at: row.premium_expired_at,
        lastCheckIn: row.last_checkin,
        total_referrals: row.total_referrals,
        total_coins: row.total_coins,
        checker_count: row.checker_count,
        total_checker: row.total_checker,
        daily_count: row.daily_count,
        last_check_date: row.last_check_date,
        fixred_count: row.fixred_count,
        total_fixred: row.total_fixred,
        total_checked: row.total_checked,
        total_numbers: row.total_numbers
    };
}

// ==============================================================
// 📊 2. CORE INTERACTION LAYER (SYNCHRONIZED WITH SCHEMA.JS)
// ==============================================================
const databaseRegistry = { 
    readFlatFile(type) {
        const row = db.prepare('SELECT value FROM config WHERE key = ?').get(type);
        if (row) return JSON.parse(row.value);
        
        if (type === "region") return { checker: {}, fixred: {} };
        if (type === "premium") return {};
        return [];
    },

    writeFlatFile(type, data) {
        db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(type, JSON.stringify(data));
        return true;
    },

    async getOrCreateUser(userId, username = "-") {
        const cleanId = String(userId);
        const safeUsername = (username && username !== "undefined") ? username : "-";
        
        try {
            let user = db.prepare('SELECT * FROM users WHERE id = ?').get(cleanId);
            if (user) return formatUser(user);

            db.prepare(`INSERT INTO users (id, username) VALUES (?, ?)`).run(cleanId, safeUsername);
            bitGlobalStats(1, 0);
            
            user = db.prepare('SELECT * FROM users WHERE id = ?').get(cleanId);
            return formatUser(user);
        } catch (err) {
            console.error("[DB] GET/CREATE USER ERROR:", err.message);
            return null;
        }
    },
                   
    async updateStats(userId, totalNumbersChecked = 0) {
        try {
            db.prepare(`INSERT OR IGNORE INTO users (id, username) VALUES (?, '-')`).run(String(userId));

            db.prepare(`
                UPDATE users 
                SET total_checked = total_checked + 1,
                    total_numbers = total_numbers + ?
                WHERE id = ?
            `).run(totalNumbersChecked, String(userId));
            bitGlobalStats(0, totalNumbersChecked);
            return true;
        } catch (err) {
            return false;
        }
    },

    async getUser(userId) {
        return formatUser(db.prepare('SELECT * FROM users WHERE id = ?').get(String(userId)));
    },

    async getGlobalStats() {
        const row = db.prepare("SELECT value FROM config WHERE key = 'global_stats'").get();
        return row ? JSON.parse(row.value) : { total_users: 0, total_checked: 0 };
    },

    async getAllUsers() {
        return db.prepare('SELECT * FROM users').all().map(row => formatUser(row));
    },

    async syncUsername(userId, username) {
        try {
            const cleanId = String(userId);
            const safeUsername = (username && username !== "undefined") ? username : "-";
            db.prepare('UPDATE users SET username = ? WHERE id = ?').run(safeUsername, cleanId);
            return true;
        } catch (err) {
            console.error("[DB] SYNC USERNAME ERROR:", err.message);
            return false;
        }
    },

    async updateUserCoins(userId, newCoins) {
        db.prepare('UPDATE users SET total_coins = ? WHERE id = ?').run(newCoins, String(userId));
        return true;
    },  

    async updateUserCheckIn(userId, todayStr) {
        db.prepare('UPDATE users SET last_checkin = ? WHERE id = ?').run(todayStr, String(userId));
        return true;
    },

    async updateDailyLimit(userId, todayStr, newCount) {
        db.prepare('UPDATE users SET last_check_date = ?, daily_count = ? WHERE id = ?').run(todayStr, newCount, String(userId));
        return true;
    },

    async addPremium(userId, days, explicitExpire = null) {
        try {
            const user = db.prepare('SELECT premium_expired_at FROM users WHERE id = ?').get(String(userId));
            const durationMs = parseInt(days) * 24 * 60 * 60 * 1000;
            const baseTime = (user && user.premium_expired_at > Date.now()) ? user.premium_expired_at : Date.now();
            const expiredAt = explicitExpire || (baseTime + durationMs);
            
            db.prepare(`UPDATE users SET status = 'PREMIUM', premium_expired_at = ? WHERE id = ?`).run(expiredAt, String(userId));
            return true;
        } catch (err) { return false; }
    },

    async deletePremium(userId) {
        db.prepare("UPDATE users SET status = 'FREE USER', premium_expired_at = NULL WHERE id = ?").run(String(userId));
        return true;
    },

    async getPremiumUsers() {
        return db.prepare("SELECT * FROM users WHERE status = 'PREMIUM'").all().map(row => formatUser(row));
    },

    async autoCleanInvalidUsers() {
        return db.prepare("DELETE FROM users WHERE id GLOB '*[^0-9]*' OR id = ''").run().changes;
    },

    closeConnection() {
        db.close();
    }
};

module.exports = databaseRegistry;

