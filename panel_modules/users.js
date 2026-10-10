//DOX//PANEL_MODULES//USERS.JS
const dbCore = require('../data/sqlite');
const db = require('../database');
const cfg = require('./config');

function searchUserWizard(askQuestion, callback) {
    console.clear();
    console.log(cfg.renderBorder());
    console.log(`${cfg.W}${cfg.BOLD}│            ${cfg.C}𝗣𝗥𝗢𝗦𝗘𝗦 𝗣𝗘𝗡𝗖𝗔𝗥𝗜𝗔𝗡 𝗨𝗦𝗘𝗥            ${cfg.W}│`);
    console.log(cfg.renderBorder());
    
    askQuestion(`${cfg.BC}👉 Masukan ID User: ${cfg.RST}`, (id) => {
        console.clear();
        try {
            const row = dbCore.prepare('SELECT * FROM users WHERE id = ?').get(id.trim());
            if (!row) {
                console.log(cfg.renderBorder());
                console.log(`${cfg.W}│  ${cfg.R}[x] GAGAL: ID user tidak ditemukan!        ${cfg.W}│`);
                console.log(cfg.renderBorder());
            } else {
                console.log(cfg.renderBorder());
                console.log(`${cfg.W}${cfg.BOLD}│               ${cfg.A}👤 𝗨𝗦𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘               ${cfg.W}│`);
                console.log(cfg.renderBorder());
                console.log(`${cfg.W}${cfg.BOLD}│ ${cfg.A}ID       : ${cfg.RST}${String(row.id).padEnd(32)} ${cfg.BOLD}│`);
                console.log(`${cfg.W}${cfg.BOLD}│ ${cfg.A}Username : ${cfg.RST}${String(row.username || '-').padEnd(32)} ${cfg.BOLD}│`);
                console.log(`${cfg.W}${cfg.BOLD}│ ${cfg.A}Status   : ${cfg.RST}${String(row.status).padEnd(32)} ${cfg.BOLD}│`);
                console.log(`${cfg.W}${cfg.BOLD}│ ${cfg.A}Coins    : ${cfg.RST}${String(row.total_coins).padEnd(32)} ${cfg.BOLD}│`);
                console.log(`${cfg.W}${cfg.BOLD}│ ${cfg.A}Daily    : ${cfg.RST}${String(row.daily_count).padEnd(32)} ${cfg.BOLD}│`);
                console.log(`${cfg.W}${cfg.BOLD}│ ${cfg.A}Checked  : ${cfg.RST}${String(row.total_checked).padEnd(32)} ${cfg.BOLD}│`);
                console.log(`${cfg.W}${cfg.BOLD}│ ${cfg.A}Numbers  : ${cfg.RST}${String(row.total_numbers).padEnd(32)} ${cfg.BOLD}│`);
                console.log(`${cfg.W}${cfg.BOLD}│ ${cfg.A}Fixred   : ${cfg.RST}${String(row.total_fixred).padEnd(32)} ${cfg.BOLD}│`);
                console.log(cfg.renderBorder());
            }
        } catch (err) { console.log(`\nError: ${err.message}`); }
        askQuestion(`\n${cfg.Y}🔘 Tekan [ENTER] untuk kembali...${cfg.RST}`, () => callback());
    });
}

function listUsersWizard(askQuestion, callback) {
    console.clear();
    console.log(cfg.renderBorder());
    console.log(`${cfg.W}${cfg.BOLD}│              ${cfg.C}𝗦𝗘𝗠𝗨𝗔 𝗗𝗔𝗙𝗧𝗔𝗥 𝗨𝗦𝗘𝗥              ${cfg.W}│`);
    console.log(cfg.renderBorder());
    console.log("");
    try {
        const rows = dbCore.prepare('SELECT id, username, status, total_coins, daily_count, total_checked FROM users').all();
        if (rows.length === 0) console.log(`${cfg.Y}❕ Database user kosong.${cfg.RST}`);
        else console.table(rows);
    } catch (err) { console.log(`Error: ${err.message}`); }
    askQuestion(`\n${cfg.Y}🔘 Tekan [ENTER] untuk kembali...${cfg.RST}`, () => callback());
}

function addCoinsWizard(askQuestion, callback) {
    console.clear();
    console.log(cfg.renderBorder());
    console.log(`${cfg.W}${cfg.BOLD}│           ${cfg.C}🪙 𝗧𝗔𝗠𝗕𝗔𝗛𝗞𝗔𝗡 𝗦𝗔𝗟𝗗𝗢 𝗞𝗢𝗜𝗡           ${cfg.W}│`);
    console.log(cfg.renderBorder());
    
    askQuestion(`${cfg.BC}👉 Masukan ID User: ${cfg.RST}`, (id) => {
        const targetId = id.trim();

        const userCheck = dbCore.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
        if (!userCheck) {
            console.clear();
            console.log(cfg.renderBorder());
            console.log(`${cfg.W}│  ${cfg.R}[x] GAGAL: ID User tidak ditemukan!        ${cfg.W}│`);
            console.log(cfg.renderBorder());
            setTimeout(() => callback(), 1500);
            return;
        }

        askQuestion(`${cfg.BC}👉 Jumlah Koin: ${cfg.RST}`, (coins) => {
            console.clear();
            const coinStr = coins.trim();

            if (!/^\d+$/.test(coinStr)) {
                console.log(cfg.renderBorder());
                console.log(`${cfg.W}│  ${cfg.R}[x] GAGAL: Koin harus berupa angka!  ${cfg.W}│`);
                console.log(cfg.renderBorder());
                setTimeout(() => callback(), 1500);
                return;
            }

            const coinAmount = parseInt(coinStr, 10);

            db.updateUserCoins(targetId, coinAmount).then((success) => {
                console.log(cfg.renderBorder());
                if (success) {
                    const msgText = `[✓] ID ${targetId} Koin: +${coinAmount}`;
                    const fillSpace = Math.max(0, 44 - msgText.length);
                    console.log(`${cfg.W}│ ${cfg.G}${msgText}${" ".repeat(fillSpace)}${cfg.W}│`);
                } else {
                    console.log(`${cfg.W}│ ${cfg.R}[x] GAGAL: Modifikasi koin user.             ${cfg.W}│`);
                }
                console.log(cfg.renderBorder());
                setTimeout(() => callback(), 1500);
            });
        });
    });
}

function resetLimitWizard(callback) {
    console.clear();
    console.log(cfg.renderBorder());
    console.log(`${cfg.W}${cfg.BOLD}│          ${cfg.C}🔄 𝗥𝗘𝗦𝗘𝗧 𝗦𝗘𝗠𝗨𝗔 𝗟𝗜𝗠𝗜𝗧 𝗨𝗦𝗘𝗥          ${cfg.W}│`);
    console.log(cfg.renderBorder());
    try {
        dbCore.exec('UPDATE users SET daily_count = 0');
        console.log(`\n${cfg.G}[✓] Global limit berhasil direset!${cfg.RST}`);
    } catch (e) { console.log(`[x] Gagal reset: ${e.message}`); }
    setTimeout(() => callback(), 1500);
}

function deleteUserWizard(askQuestion, callback) {
    console.clear();
    console.log(cfg.renderBorder());
    console.log(`${cfg.W}${cfg.BOLD}│            ${cfg.R}𝗛𝗔𝗣𝗨𝗦 𝗦𝗘𝗠𝗨𝗔 𝗗𝗔𝗧𝗔 𝗨𝗦𝗘𝗥            ${cfg.W}│`);
    console.log(cfg.renderBorder());
    
    askQuestion(`${cfg.Y}❕ Masukkan ID User: ${cfg.RST}`, (id) => {
        console.clear();
        try {
            const targetId = id.trim();
            const result = dbCore.prepare('DELETE FROM users WHERE id = ?').run(targetId);
            dbCore.prepare('DELETE FROM history WHERE user_id = ?').run(targetId);
            
            console.log(cfg.renderBorder());
            if (result.changes > 0) {
                console.log(`${cfg.W}│ ${cfg.G}[✓] WIPE SUCCESS: Akun & History Clean!     ${cfg.W}│`);
            } else {
                console.log(`${cfg.W}│ ${cfg.Y}[!] WARNING: ID User tidak ditemukan.       ${cfg.W}│`);
            }
            console.log(cfg.renderBorder());
        } catch (err) { console.log(`Error: ${err.message}`); }
        setTimeout(() => callback(), 1500);
    });
}

module.exports = { searchUserWizard, listUsersWizard, addCoinsWizard, resetLimitWizard, deleteUserWizard };

