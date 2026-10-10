//DOX//PANEL_MODULES//EMAILS.JS
const db = require('../database');
const cfg = require('./config');

const subOptions = [
    { id: '1', label: 'SHOW ALL EMAIL' },
    { id: '2', label: 'ADD NEW EMAIL' },
    { id: '3', label: 'REMOVE EMAIL' },
    { id: '4', label: '⌫ BACK' }
];
let selectedIdx = 0;

function renderEmailsMenu() {
    console.clear();
    console.log(cfg.renderBorder());
    console.log(`${cfg.W}${cfg.BOLD}│           ${cfg.C}𝗠𝗔𝗡𝗔𝗝𝗘𝗠𝗘𝗡 𝗘𝗠𝗔𝗜𝗟 𝗦𝗘𝗡𝗗𝗘𝗥            ${cfg.W}│`);
    console.log(cfg.renderDivider());

    for (let i = 0; i < 2; i++) {
        const leftIdx = i * 2;
        const rightIdx = i * 2 + 1;
        const leftOpt = subOptions[leftIdx];
        const rightOpt = subOptions[rightIdx];

        const leftStr = cfg.formatCell(leftOpt.label, leftIdx === selectedIdx, 22);
        const rightStr = cfg.formatCell(rightOpt.label, rightIdx === selectedIdx, 22);

        console.log(`${cfg.W}│${leftStr}${cfg.W}│${rightStr}${cfg.W}│`);
        
        if (i < 1) {
            console.log(cfg.renderDivider());
        }
    }
    console.log(cfg.renderClose());
}

function handleEmailsNavigation(key, askQuestion, exitCallback) {
    if (key.name === 'up') {
        selectedIdx = (selectedIdx - 2 + subOptions.length) % subOptions.length;
        renderEmailsMenu();
    } else if (key.name === 'down') {
        selectedIdx = (selectedIdx + 2) % subOptions.length;
        renderEmailsMenu();
    } else if (key.name === 'left' || key.name === 'right') {
        selectedIdx = selectedIdx ^ 1;
        renderEmailsMenu();
    } else if (key.name === 'return') {
        executeEmailsAction(askQuestion, exitCallback);
    }
}

function executeEmailsAction(askQuestion, exitCallback) {
    if (selectedIdx === 0) {
        console.clear();
        console.log(`${cfg.B}📂 𓉘 DAFTAR EMAIL SENDER AKTIF 𓉝${cfg.RST}\n`);
        const list = db.readFlatFile('email') || [];
        if (list.length === 0) console.log(`${cfg.Y}❕ Belum ada email worker terdaftar.${cfg.RST}`);
        else console.table(list.map((w, idx) => ({ ID: idx + 1, Email: w.email, Gacor_Score: w.success_count || 0 })));
        askQuestion(`\n${cfg.Y}🔘 Tekan [Enter] untuk kembali...${cfg.RST}`, () => renderEmailsMenu());
    } else if (selectedIdx === 1) {
        console.clear();
        askQuestion(`${cfg.B}👉 Masukkan Alamat Email: ${cfg.RST}`, (email) => {
            askQuestion(`${cfg.B}👉 Masukkan App Password: ${cfg.RST}`, (pass) => {
                if (email.trim() && pass.trim()) {
                    let list = db.readFlatFile('email') || [];
                    const index = list.findIndex(w => w.email.toLowerCase() === email.trim().toLowerCase());
                    if (index !== -1) {
                        list[index].pass = pass.trim();
                    } else {
                        list.push({ email: email.trim(), pass: pass.trim(), success_count: 0 });
                    }
                    db.writeFlatFile('email', list);
                    console.log(`\n${cfg.G}[✓] Email sender telah ditambahkan!${cfg.RST}`);
                }
                setTimeout(() => renderEmailsMenu(), 1500);
            });
        });
    } else if (selectedIdx === 2) {
        console.clear();
        askQuestion(`${cfg.R}👉 Masukkan Email Sender: ${cfg.RST}`, (email) => {
            let list = db.readFlatFile('email') || [];
            const filtered = list.filter(w => w.email.toLowerCase() !== email.trim().toLowerCase());
            if (list.length === filtered.length) {
                console.log(`\n${cfg.R}[x] Email sender tidak ditemukan!${cfg.RST}`);
            } else {
                db.writeFlatFile('email', filtered);
                console.log(`\n${cfg.G}[✓] Email sender telah dihapus!${cfg.RST}`);
            }
            setTimeout(() => renderEmailsMenu(), 1500);
        });
    } else {
        exitCallback();
    }
}

module.exports = { renderEmailsMenu, handleEmailsNavigation };

