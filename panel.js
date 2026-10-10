//DOX//PANEL.JS (VERSI KALIBRASI GRID UTUH & SENTRALISASI FORMAT)
const readline = require('readline');
const { exec } = require('child_process');

const cfg = require('./panel_modules/config');
const ui = require('./panel_modules/ui');
const users = require('./panel_modules/users');
const emails = require('./panel_modules/emails');
const session = require('./panel_modules/session');
const pm2Mon = require('./panel_modules/monitor');
const errLog = require('./panel_modules/livelogs');

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

let selectedIndex = 0;
let currentMenuState = 'MAIN'; 
let isNavigating = true;

let rawStatus = "ONLINE";
let statusColor = cfg.G;
let statusSpaces = "       "; 

function patrolBotStatus() {
    exec('pm2 list', (err, stdout) => {
        if (!err && stdout.toLowerCase().includes('online')) {
            rawStatus = "ONLINE";
            statusColor = cfg.G;
            statusSpaces = "       "; 
        } else {
            rawStatus = "OFFLINE";
            statusColor = cfg.R;
            statusSpaces = "      ";  
        }
        if (currentMenuState === 'MAIN' && isNavigating) showMainMenu();
    });
}
patrolBotStatus();
setInterval(patrolBotStatus, 4000);

const mainOptions = [
{ id: '1', label: 'SEARCH USER' },   { id: '2', label: 'SHOW ALL USER' },
{ id: '3', label: 'SYSTEM ENGINE' }, { id: '4', label: 'LIVE LOGS' },  
{ id: '5', label: 'EMAILS SENDER' }, { id: '6', label: 'WORKER SESSION' },
{ id: '7', label: 'ADD COINS' },     { id: '8', label: 'RESET LIMITS' },
{ id: '9', label: 'WIPE ACCOUNT' },  { id: '0', label: 'CLOSE' }       
];

// 🛠️ NOTE MEKANIK: Fungsi formatCell lokal resmi dibuang agar tidak tumpang tindih dengan config pusat!

function showMainMenu() {
    ui.drawHeader();
    ui.drawDashboard(rawStatus, statusColor, statusSpaces);

    // 🏎️ RENDER ENGINE GRID 5x2 HUBUNGAN LANGSUNG KE CONFIG PUSAT
    for (let i = 0; i < 5; i++) {
        const leftIdx = i * 2;
        const rightIdx = i * 2 + 1;
        const leftOpt = mainOptions[leftIdx];
        const rightOpt = mainOptions[rightIdx];

        // Memanggil fungsi formatter pusat dengan lebar patokan 22 kolom, unselected text otomatis warna abu-abu
        const leftStr = cfg.formatCell(leftOpt.label, leftIdx === selectedIndex, 22);
        const rightStr = cfg.formatCell(rightOpt.label, rightIdx === selectedIndex, 22);

        console.log(`${cfg.W}│${leftStr}${cfg.W}│${rightStr}${cfg.W}│`);
        
        if (i < 4) {
            console.log(cfg.renderDivider());
        }
    }
    console.log(cfg.renderClose());
    console.log(`${cfg.C}👉 GUNAKAN TOMBOL PANAH (↑/↓/←/→) & [ENTER]${cfg.RST}`);
}

function askQuestion(query, callback) {
    isNavigating = false;
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.stdin.pause();
    const tempRl = readline.createInterface({ input: process.stdin, output: process.stdout });
    readline.clearLine(process.stdout, 0);
    tempRl.question(query, (answer) => {
        tempRl.close();
        process.stdin.resume();
        if (process.stdin.isTTY) process.stdin.setRawMode(true);
        isNavigating = true;
        callback(answer);
    });
}

function restoreToMain() {
    currentMenuState = 'MAIN';
    selectedIndex = 0;
    isNavigating = true;
    showMainMenu();
}

process.stdin.on('keypress', (str, key) => {
    if (!isNavigating) return;
    if (key.ctrl && key.name === 'c') process.exit(0);

    if (currentMenuState === 'EMAILS') {
        emails.handleEmailsNavigation(key, askQuestion, restoreToMain);
        return;
    } else if (currentMenuState === 'SESSION') {
        session.handleSessionNavigation(key, askQuestion, restoreToMain);
        return;
    } else if (currentMenuState === 'PM2') {
        pm2Mon.handlePm2Navigation(key, askQuestion, restoreToMain);
        return;
    } else if (currentMenuState === 'LOGS') {
        errLog.handleLogsNavigation(key, restoreToMain);
        return;
    }

    if (key.name === 'up') {
        selectedIndex = (selectedIndex - 2 + mainOptions.length) % mainOptions.length;
        showMainMenu();
    } else if (key.name === 'down') {
        selectedIndex = (selectedIndex + 2) % mainOptions.length;
        showMainMenu();
    } else if (key.name === 'left' || key.name === 'right') {
        selectedIndex = selectedIndex ^ 1;
        showMainMenu();
    } else if (key.name === 'return') {
        handleMainAction(mainOptions[selectedIndex].id);
    }
});

function handleMainAction(id) {
    console.clear(); 
    switch (id) {
        case '1': users.searchUserWizard(askQuestion, () => showMainMenu()); break;
        case '2': users.listUsersWizard(askQuestion, () => showMainMenu()); break;
        case '3': currentMenuState = 'PM2'; pm2Mon.renderPm2Menu(); break;
        case '4': currentMenuState = 'LOGS'; errLog.renderLogsMenu(); break;
        case '5': currentMenuState = 'EMAILS'; emails.renderEmailsMenu(); break;
        case '6': currentMenuState = 'SESSION'; session.renderSessionMenu(); break;
        case '7': users.addCoinsWizard(askQuestion, () => showMainMenu()); break; 
        case '8': users.resetLimitWizard(() => showMainMenu()); break;
        case '9': users.deleteUserWizard(askQuestion, () => showMainMenu()); break;
        case '0':
            console.clear();
            console.log(`\n${cfg.Y}${cfg.BOLD}🖕 PANEL CLOSED SUCCESSFULLY 🖕${cfg.RST}\n`);
            process.exit(0);
    }
}

showMainMenu();

