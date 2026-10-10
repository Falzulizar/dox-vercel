//DOX//PANEL_MODULES//SESSION.JS
const dbCore = require('../data/sqlite');
const cfg = require('./config');

const options = [
    "ACTIVE SESSION",
    "KICK SESSION",
    "WIPE SESSIONS",
    "⌫ BACK"
];
let selectedIdx = 0;

function renderSessionMenu() {
    console.clear();
    console.log(cfg.renderBorder());
    console.log(`${cfg.W}│          ${cfg.C}${cfg.BOLD} 𝗠𝗔𝗡𝗔𝗝𝗘𝗠𝗘𝗡 𝗪𝗢𝗥𝗞𝗘𝗥 𝗦𝗘𝗦𝗦𝗜𝗢𝗡          ${cfg.W}│`);
    console.log(cfg.renderDivider());

    for (let i = 0; i < 2; i++) {
        const leftIdx = i * 2;
        const rightIdx = i * 2 + 1;

        const leftStr = cfg.formatCell(options[leftIdx], leftIdx === selectedIdx, 22);
        const rightStr = cfg.formatCell(options[rightIdx], rightIdx === selectedIdx, 22);

        console.log(`${cfg.W}│${leftStr}${cfg.W}│${rightStr}${cfg.W}│`);
        
        if (i < 1) {
            console.log(cfg.renderDivider());
        }
    }
    console.log(cfg.renderClose());
}

function handleSessionNavigation(key, askQuestion, exitCallback) {
    if (key.name === 'up') {
        selectedIdx = (selectedIdx - 2 + options.length) % options.length;
        renderSessionMenu();
    } else if (key.name === 'down') {
        selectedIdx = (selectedIdx + 2) % options.length;
        renderSessionMenu();
    } else if (key.name === 'left' || key.name === 'right') {
        selectedIdx = selectedIdx ^ 1;
        renderSessionMenu();
    } else if (key.name === 'return') {
        if (selectedIdx === 0) {
            console.clear();
            console.log(cfg.renderBorder());
            console.log(`${cfg.W}${cfg.BOLD}│            ${cfg.C}𓉘SESSION DI DATABASE𓉝            ${cfg.W}│${cfg.RST}`);
            console.log(cfg.renderBorder());
            try {
                const rows = dbCore.prepare('SELECT DISTINCT session_id FROM session').all();
                if (rows.length === 0) console.log(`${cfg.Y}❕ Sasis session kosong / tidak ada device linked.${cfg.RST}`);
                else console.table(rows);
            } catch(e) { console.log("Error:" + e.message); }
            askQuestion(`\n${cfg.Y}🔘 Tekan [Enter] untuk kembali...${cfg.RST}`, () => renderSessionMenu());
        } else if (selectedIdx === 1) {
            console.clear();
            askQuestion(`${cfg.R}👉 Masukkan Nama Session ID yang mau dibuang: ${cfg.RST}`, (sid) => {
                try {
                    const res = dbCore.prepare('DELETE FROM session WHERE session_id = ?').run(sid.trim());
                    if (res.changes > 0) console.log(`\n${cfg.G}[✓] Session ${sid.trim()} berhasil deleted total!${cfg.RST}`);
                    else console.log(`\n${cfg.R}[x] Gagal: Session ID tidak ditemukan!${cfg.RST}`);
                } catch(e) { console.log("Error wipe:" + e.message); }
                setTimeout(() => renderSessionMenu(), 1500);
            });
        } else if (selectedIdx === 2) {
            console.clear();
            askQuestion(`${cfg.R}❕ YAKIN WIPE TOTAL ALL SESSIONS WORKER? (y/n): ${cfg.RST}`, (ans) => {
                if (ans.trim().toLowerCase() === 'y') {
                    try {
                        const res = dbCore.prepare('DELETE FROM session').run();
                        console.log(`\n${cfg.G}[✓] Sirkuit Bersih! Seluruh ${res.changes} session worker berhasil di-wipe total!${cfg.RST}`);
                    } catch(e) { console.log("Error wipe total:" + e.message); }
                } else {
                    console.log(`\n${cfg.Y}🔹 Eksekusi dibatalkan, sasis session aman!${cfg.RST}`);
                }
                setTimeout(() => renderSessionMenu(), 1500);
            });
        } else {
            exitCallback();
        }
    }
}

module.exports = { renderSessionMenu, handleSessionNavigation };

