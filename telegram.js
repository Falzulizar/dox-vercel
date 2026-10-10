//DOX//TELEGRAM.JS
const https = require('https');
const { Telegraf } = require('telegraf');
const config = require('./config');
const userState = require('./utils/state');
const menu = require('./menus/router');

const bot = new Telegraf(config.TOKEN, {
    handlerTimeout: 1800000,
    telegram: {
        agent: new https.Agent({
            keepAlive: true,
            maxSockets: 100,
            keepAliveMsecs: 5000
        })
    }
});

global.sessionStore = {};

// ==============================================================
// 🛡️ ERROR BOUNDARY GLOBAL SYSTEM
// ==============================================================
bot.catch((err, ctx) => {
    console.log('\x1b[33m%s\x1b[0m',
    `[⚠️ ERROR BOUNDARY] BERHASIL MEREDAM ERROR: ${err.message}`);
});

// ==============================================================
// 🔌 REGISTER DEFAULT TELEGRAM BOT COMMANDS
// ==============================================================
bot.telegram.setMyCommands([
{ command: 'start', description: '🔄 Restart bot' },
{ command: 'checker', description: '📱 Cek Nomor / Cek Bio' },
{ command: 'fixred', description: '🚨 Kirim Banding Fixred' },
{ command: 'premium', description: '💠 Info & Upgrade Premium' },
{ command: 'reward', description: '🎁 Check-In & Reward Premium' }
]).then(() => {
    console.log('\x1b[32m%s\x1b[0m', '[✓] MENU TELEGRAM TERPASANG!');
}).catch((err) => {
    console.error('\x1b[31m%s\x1b[0m', '[x] GAGAL MEMUAT MENU TELEGRAM:', err.message);
});

// ==============================================================
// 🎯 MIDDLEWARE GLOBAL + AUTOMATIC STATE CLEANER
// ==============================================================
bot.use(async (ctx, next) => {
const chatId = ctx.chat?.id;
const userId = ctx.from?.id;

  if (ctx.callbackQuery) {
const clickData = ctx.callbackQuery.data;
        
  if (global.sessionStore[chatId]) {
  if (['checker', 'dashboard', 'add_worker', 'historyfix', 'sender', 'antrian'].includes(clickData) || clickData?.startsWith('view_fxhist_')) {
  delete global.sessionStore[chatId].stage; 
}

  if (['fixred', 'dashboard', 'speed', 'historycek', 'worker'].includes(clickData) || clickData?.startsWith('view_ckhist_')) {
  if (userState[userId]) delete userState[userId]; 
  }
}        
  if (clickData?.includes('checker')) {
  if (!global.sessionStore[chatId]) global.sessionStore[chatId] = {}; 
      global.sessionStore[chatId].checker_message_id = ctx.callbackQuery.message?.message_id; 
  } 
}        
  if (ctx.message) {
      ctx.deleteMessage().catch(() => {});
}
    return next(); 
});

// ==============================================================
// 🔌 PUSAT MEMUAT SELURUH MODUL HANDLERS SINKRON
// ==============================================================
try {
    const registerHandlers = require('./handlers/router');
    registerHandlers(bot, global.sessionStore);
} catch (e) {
    console.error('\x1b[31m%s\x1b[0m',
    '[x] GAGAL MEMUAT MENU DARI handlers.js:', e.message); 
}

try {
    const registerCoreCommands = require('./handlers/commands');
    registerCoreCommands(bot);
} catch (e) {
    console.error('\x1b[31m%s\x1b[0m',
    '[x] GAGAL MEMUAT REGISTER CORE COMMANDS:', e.message); 
}

module.exports = { 
    bot, 
    handleDashboard: (ctx, fromCallback) => menu.handleDashboard(ctx, fromCallback, global.sessionStore)
};

