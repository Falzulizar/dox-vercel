//DOX//PANEL_MODULES//MONITOR.JS
const { exec } = require('child_process');
const cfg = require('./config');

const options = [
    { id: '1', label: 'START BOT' },   { id: '2', label: 'STOP BOT' },
    { id: '3', label: 'RESTART BOT' }, { id: '4', label: 'DELETE ENGINE' },
    { id: '0', label: 'REFRESH' },   { id: '5', label: '⌫ BACK' }
];
let selectedIdx = 0;

function renderPm2Menu() {
    console.clear();
    console.log(cfg.renderBorder());
    console.log(`${cfg.W}${cfg.BOLD}│          ${cfg.C}𝗣𝗠𝟮 𝗦𝗬𝗦𝗧𝗘𝗠 𝗠𝗢𝗡𝗜𝗧𝗢𝗥 𝗘𝗡𝗚𝗜𝗡𝗘          ${cfg.W}│`);
    console.log(cfg.renderDivider());
    
    for (let i = 0; i < 3; i++) {
        const leftIdx = i * 2;
        const rightIdx = i * 2 + 1;
        const leftOpt = options[leftIdx];
        const rightOpt = options[rightIdx];

        const leftStr = cfg.formatCell(leftOpt.label, leftIdx === selectedIdx, 22);
        const rightStr = cfg.formatCell(rightOpt.label, rightIdx === selectedIdx, 22);

        console.log(`${cfg.W}│${leftStr}${cfg.W}│${rightStr}${cfg.W}│`);
        
        if (i < 2) {
            console.log(cfg.renderDivider());
        }
    }
    console.log(cfg.renderClose());

    exec('pm2 list', (err, stdout) => {
        console.log(`\n   𓉘 PERSENTASE STATUS RESOURCE SYSTEM 𓉝`);
        if (err) {
            console.log(`   ${cfg.R}❌ PM2 Tidak Terdeteksi di Lingkungan HP Ini.${cfg.RST}\n`);
        } else {
            const lines = stdout.split('\n').filter(l => l.includes('online') || l.includes('stopped') || l.includes('errored'));
            if (lines.length === 0) console.log(`   ${cfg.Y}！Tidak ada instansi pm2 terdaftar.${cfg.RST}\n`);
            lines.forEach(l => console.log(`   👉 ${cfg.C}${l.replace(/│/g, '').trim().substring(0, 60)}${cfg.RST}`));
            console.log("");
        }
    });
}

function handlePm2Navigation(key, askQuestion, exitCallback) {
    if (key.name === 'up') {
        selectedIdx = (selectedIdx - 2 + options.length) % options.length;
        renderPm2Menu();
    } else if (key.name === 'down') {
        selectedIdx = (selectedIdx + 2) % options.length;
        renderPm2Menu();
    } else if (key.name === 'left' || key.name === 'right') {
        selectedIdx = selectedIdx ^ 1;
        renderPm2Menu();
    } else if (key.name === 'return') {
        const actionId = options[selectedIdx].id;
        
        if (actionId === '0') {
            renderPm2Menu();
        } else if (actionId === '1') {
            console.clear();
            console.log(`\n${cfg.G}🟢 Menyalakan Engine Bot PM2...${cfg.RST}`);
            exec('pm2 start all', () => {
                console.log(`${cfg.G}[✓] Engine Berhasil Dihidupkan!${cfg.RST}`);
                setTimeout(() => renderPm2Menu(), 1500);
            });
        } else if (actionId === '2') {
            console.clear();
            console.log(`\n${cfg.R}🛑 Mematikan Engine Bot PM2...${cfg.RST}`);
            exec('pm2 stop all', () => {
                console.log(`${cfg.R}[×] Engine Berhasil Dinonaktifkan Sementara!${cfg.RST}`);
                setTimeout(() => renderPm2Menu(), 1500);
            });
        } else if (actionId === '3') {
            console.clear();
            console.log(`\n${cfg.Y}🔄 Merestart Engine Bot PM2...${cfg.RST}`);
            exec('pm2 restart all', () => {
                console.log(`${cfg.G}[✓] Sukses dikalibrasi ulang!${cfg.RST}`);
                setTimeout(() => renderPm2Menu(), 1500);
            });
        } else if (actionId === '4') {
            console.clear();
            console.log(`\n${cfg.R}💥 DELETING ALL: Menghapus Seluruh Instansi Server PM2...${cfg.RST}`);
            exec('pm2 delete all', () => {
                console.log(`${cfg.G}[✓] Sirkuit Bersih! Seluruh Instansi Berhasil Dihapus Total!${cfg.RST}`);
                setTimeout(() => renderPm2Menu(), 1500);
            });
        } else {
            exitCallback();
        }
    }
}

module.exports = { renderPm2Menu, handlePm2Navigation };

