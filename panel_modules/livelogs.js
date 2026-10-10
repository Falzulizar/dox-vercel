//DOX//PANEL_MODULES//LIVELOGS.JS
const { exec } = require('child_process');
const cfg = require('./config');

let selectedIdx = 0;
let logMode = 'ALL'; 

function getOptions() {
    return [
        logMode === 'ALL' ? "ERROR LOGS" : "ALL LOGS",
        "CLEAR",
        "REFRESH",
        "⌫ BACK"
    ];
}

function renderLogsMenu() {
    console.clear();
    console.log(cfg.renderBorder());
    
    if (logMode === 'ALL') {
        console.log(`${cfg.W}${cfg.BOLD}│            ${cfg.G}𝗟𝗜𝗩𝗘 𝗔𝗟𝗟 𝗟𝗢𝗚𝗦 𝗦𝗧𝗥𝗘𝗔𝗠𝗘𝗥           ${cfg.W}│`);
    } else {
        console.log(`${cfg.W}${cfg.BOLD}│           ${cfg.R}𝗟𝗜𝗩𝗘 𝗘𝗥𝗥𝗢𝗥 𝗟𝗢𝗚 𝗦𝗧𝗥𝗘𝗔𝗠𝗘𝗥           ${cfg.W}│`);
    }
    console.log(cfg.renderDivider());
    
    const currentOptions = getOptions();
    for (let i = 0; i < 2; i++) {
        const leftIdx = i * 2;
        const rightIdx = i * 2 + 1;

        const leftStr = cfg.formatCell(currentOptions[leftIdx], leftIdx === selectedIdx, 22);
        const rightStr = cfg.formatCell(currentOptions[rightIdx], rightIdx === selectedIdx, 22);

        console.log(`${cfg.W}│${leftStr}${cfg.W}│${rightStr}${cfg.W}│`);
        
        if (i < 1) {
            console.log(cfg.renderDivider());
        }
    }
    console.log(cfg.renderBorder());

    const cmdLogs = logMode === 'ALL' 
        ? 'tail -n 15 ~/.pm2/logs/dox-out.log' 
        : 'tail -n 15 ~/.pm2/logs/dox-error.log';

    exec(cmdLogs, (err, stdout) => {
        if (logMode === 'ALL') {
            console.log(`${cfg.W}${cfg.BOLD}│      ${cfg.G}𓉘REKAM AKTIVITAS ALL LOGS SERVER𓉝      ${cfg.W}│${cfg.RST}`);
        } else {
            console.log(`${cfg.W}${cfg.BOLD}│     ${cfg.G}𓉘REKAM AKTIVITAS ERROR LOGS SERVER𓉝     ${cfg.W}│${cfg.RST}`);
        }
        console.log(cfg.renderBorder());
        
        if (err || !stdout.trim()) {
            console.log(`${cfg.W}│${cfg.G}  ✅ Tidak terdeteksi log aktivitas.         ${cfg.W}│`);
        } else {
            const logLines = stdout.split('\n').slice(-15);
            logLines.forEach(line => {
                if(line.trim()) console.log("  " + line.substring(0, 60));
            });
        }
        console.log(cfg.renderBorder());
    });
}

function handleLogsNavigation(key, exitCallback) {
    const currentOptions = getOptions();

    if (key.name === 'up') {
        selectedIdx = (selectedIdx - 2 + currentOptions.length) % currentOptions.length;
        renderLogsMenu();
    } else if (key.name === 'down') {
        selectedIdx = (selectedIdx + 2) % currentOptions.length;
        renderLogsMenu();
    } else if (key.name === 'left' || key.name === 'right') {
        selectedIdx = selectedIdx ^ 1;
        renderLogsMenu();
    } else if (key.name === 'return') {
        if (selectedIdx === 0) {
            logMode = logMode === 'ALL' ? 'ERR' : 'ALL';
            renderLogsMenu();
        } else if (selectedIdx === 1) {
            console.clear();
            console.log(`\n${cfg.Y}🧹 Membesihkan seluruh log server...${cfg.RST}`);
            exec('pm2 flush', () => {
                console.log(`${cfg.G}[✓] Riwayat log berhasil dibersihkan!${cfg.RST}`);
                setTimeout(() => renderLogsMenu(), 1000);
            });
        } else if (selectedIdx === 2) {
            renderLogsMenu();
        } else {
            exitCallback();
        }
    }
}

module.exports = { renderLogsMenu, handleLogsNavigation };

