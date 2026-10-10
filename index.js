//DOX//INDEX.JS
require('dotenv').config();
require('./data/schema')();
const db = require('./database');
const { bot } = require('./telegram');
const emoticons = require('./emoticons/router');
const workerManager = require('./worker');
const { initAutoCleaner } = require('./utils/cleaner');
const { listenEmails } = require('./utils/emailListener');

global.isShuttingDown = false;
global.e = emoticons.e;
global.i = emoticons.i;
global.button = emoticons.button;
global.urlbutton = emoticons.urlbutton;
global.toggle = emoticons.toggle;
// ==============================================================
// 🔌 ENGINE SHUTDOWN PROCEDURES (PROSES PENUTUPAN STERIL)
// ==============================================================
const handleBotShutdown = async (signal) => {
      console.log('\x1b[33m%s\x1b[0m',
      `[⚠] MENERIMA SINYAL ${signal}...`);

      global.isShuttingDown = true;
    
  try {
      console.log('\x1b[36m%s\x1b[0m',
      '[♻] MEMATIKAN JALUR POLLING...');
      bot.stop(signal);
} catch (err) {
      console.error('\x1b[31m%s\x1b[0m',
      "[x] GAGAL STOP TELEGRAM:", err.message); 
    }    
  try {
  if (workerManager && typeof workerManager.closeAllWorkers === 'function') { 
  await workerManager.closeAllWorkers();
        }
} catch (err) { 
      console.error('\x1b[31m%s\x1b[0m',
      "[x] GAGAL CLOSE WORKER:", err.message);
    }
  try {
  if (db && typeof db.closeConnection === 'function') {
      db.closeConnection();
  }
} catch (err) {
      console.error('\x1b[31m%s\x1b[0m',
      "[x] GAGAL CLOSE SQLITE:", err.message);
    }
    console.log('\x1b[32m%s\x1b[0m',
    '[✓] JALUR POLLING DIMATIKAN!');
    process.exit(0);
};
process.once('SIGINT', () => handleBotShutdown('SIGINT'));
process.once('SIGTERM', () => handleBotShutdown('SIGTERM'));
// ==============================================================
// 🚀 LAUNCH PAD PUSAT (DEPLOYMENT)
// ==============================================================
bot.launch({ dropPendingUpdates: true })
    .then(() => {
        console.log('\x1b[32m%s\x1b[0m',
        "[✓] BOT TELEGRAM ONLINE!");
}).catch((err) => {
        console.error('\x1b[31m%s\x1b[0m',
        "[x] GAGAL LAUNCH BOT TELEGRAM:", err.message);
});
// ==============================================================
// ♻️ ASYNCHRONOUS INITIALIZATION ENGINE
// ==============================================================
setTimeout(() => { 
  try {
      workerManager.initAllWorkers(); 
      initAutoCleaner();

      if (typeof listenEmails === 'function') { listenEmails(bot); }

const runBackup = require('./data/backup');
const runOptimizer = require('./data/optimizer');

      runOptimizer();
      runBackup();
      
      setInterval(() => {
      runOptimizer();
      runBackup();
      }, 6 * 60 * 60 * 1000);

} catch (err) {
        console.error('\x1b[31m%s\x1b[0m',
        "[x] GAGAL INIT ASYNC MODULES:", err.message);
    }
}, 2000);

