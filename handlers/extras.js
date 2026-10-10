// //DOX//HANDLERS//EXTRAS.JS
const menu = require('../menus/router');
const workerManager = require('../worker');
const premium = require('../utils/premium');
const config = require('../config');
const { detectRegion } = require('../utils/regionDetector');

async function handleAddWorker(ctx) {
  try {
const userId = String(ctx.from.id);
const isPremium = premium(ctx.from.id);
const userWorkersCount = workerManager.workers ? workerManager.workers.filter(w => String(w.ownerId) === userId).length : 0;
const ownerId = String(config.OWNERID);
        
  if (!isPremium && userId !== ownerId && userWorkersCount >= 5) {
return ctx.answerCbQuery(
`⚠️ BATASAN WORKER FREE USER!
Slot worker Anda sudah maksimal (5/5).

Silahkan upgrade ke 💠 PREMIUM untuk menambah slot worker tanpa batas!`, 
  { show_alert: true }).catch(() => {});
}    

await ctx.editMessageText(
`${e.plus} <b>MENU ADD WORKER</b>
──────────────────────────
Silakan pilih metode penautan perangkat
WhatsApp Anda:
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("paircode", "PAIRING", "pairing_code", "primary"),
    button("frame", "SCAN QR", "scan_qr", "primary") ],
  [ button("back", "KEMBALI", "worker", "danger") ] ]}
  }).catch(() => {});
} catch (err) {
      console.error('\x1b[31m%s\x1b[0m',
      "[x] GAGAL SENSOR LIMIT WORKER:", err.message);
  await ctx.answerCbQuery(
      "❌ Terjadi kesalahan sistem.").catch(() => {}); 
  }
}

async function handleBatalPairing(ctx, sessionStore) {
  if (workerManager.pending[ctx.chat.id]) {
      workerManager.pending[ctx.chat.id].isDead = true;
      workerManager.pending[ctx.chat.id].end();       
  delete workerManager.pending[ctx.chat.id];
  }
  if (ctx.session) ctx.session.step = null;
  if (sessionStore[ctx.chat.id]) {
      sessionStore[ctx.chat.id].awaiting_worker_setup = false;
      sessionStore[ctx.chat.id].step = null;
  }
  await ctx.deleteMessage().catch(() => {});
  await menu.handleAddWorker(ctx, false, 'dashboard');
}

async function handleScanQr(ctx) {
  await ctx.telegram.editMessageText(
        ctx.chat.id, 
        ctx.callbackQuery.message.message_id, null, 
        `${e.hglass} <b>MEMUAT GAMBAR QR ...</b>`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("cross", "BATALKAN PENAUTAN", "add_worker", "danger") ]] } 
  }).catch(() => {});                             
  if (workerManager.startQR) await workerManager.startQR(ctx);
}

async function handleBatalQr(ctx, sessionStore) {
  if (workerManager.pending[ctx.chat.id]) {
      workerManager.pending[ctx.chat.id].isDead = true;
      workerManager.pending[ctx.chat.id].end();
  delete workerManager.pending[ctx.chat.id];
    }
  if (ctx.session) ctx.session.step = null;
  if (sessionStore[ctx.chat.id]) {
      sessionStore[ctx.chat.id].awaiting_worker_setup = false;
      sessionStore[ctx.chat.id].step = null;
    }
  await ctx.deleteMessage().catch(() => {}); 
  await menu.handleAddWorker(ctx, false, 'dashboard');
}

async function handleBackReport(ctx) {
  try {
const userState = require('../utils/state'); 
  if (userState && userState[ctx.from.id]) {
      userState[ctx.from.id] = null;
    }
  if (ctx.session) ctx.session.step = null;        
const chatKey = String(ctx.chat.id);
  let cache = global.lastCheckerResults ? global.lastCheckerResults[chatKey] : null;

  if (!cache) {
  try {
const dbCore = require('../data/sqlite');
const row = dbCore.prepare('SELECT cache_value FROM cache WHERE cache_key = ?').get(chatKey);
  if (row) cache = JSON.parse(row.cache_value);
} catch (err) { cache = null; }
  }    

  if (!cache) {
  return ctx.answerCbQuery(
  '⚠️ Cache laporan kedaluwarsa, silakan lakukan cek nomor ulang.',
  { show_alert: true }).catch(() => {});
}    

const keyboard = [
[ button("yes", `${cache.terdaftar?.length || 0}`, 'view_list_terdaftar_NONE', "success"), 
  button("no", `${cache.tidakTerdaftar?.length || 0}`, 'view_list_tidakterdaftar_NONE', "danger") ],
[ button("memo", `${cache.adaBio?.length || 0}`, 'view_list_adabio_NONE', "success"), 
  button("forbid", `${cache.tanpaBio?.length || 0}`, 'view_list_tanpabio_NONE', "danger") ],
[ button("office", `${cache.metaBusinessList?.length || 0}`, 'view_list_business_NONE', "primary"),
  button("sparkles", `${cache.nomorCantikList?.length || 0}`, 'view_list_nomorcantik_NONE', "primary") ],
[ button("search", "CEK LAGI", "checker_report", "primary"), 
  button("home", "MENU UTAMA", "dashboard", "primary") ] ];

  await ctx.editMessageText(cache.teksStatistik, { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } }).catch(() => {});
} catch (err) {
      console.error(
      "[❌] GAGAL RE-RENDER TOMBOL POLOS REPORT:", err.message); 
  }
}

async function handleViewCkhist(ctx) {
  try {
const logId = ctx.match[1];
const userId = String(ctx.from.id);

const dbCore = require('../data/sqlite');
const log = dbCore.prepare(`SELECT * FROM history WHERE id = ? AND user_id = ? AND type = 'CHECKER'`).get(logId, userId);
        
  if (!log) {
  return ctx.reply(
  '❌ Detail berkas riwayat telah kadaluwarsa.').catch(() => {});
}

const safeFile = String(log.numbers || 'Manual').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const safeId = String(log.id || '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const terdaftar = parseInt(log.success || 0);
const tidakTerdaftar = parseInt(log.failed || 0);
const total = terdaftar + tidakTerdaftar;
const adaBio = parseInt(log.has_bio || 0);
const tanpaBio = parseInt(log.no_bio || 0);
const waBiz = parseInt(log.is_business || 0);
const noCantik = parseInt(log.is_pretty || 0);

  let liveDuration = log.duration || '1s';
const angkaDetik = parseFloat(liveDuration); 
if (!isNaN(angkaDetik)) { liveDuration = `${Math.round(angkaDetik)}s`; }
const liveSpeed = log.speed || 'Standar';

const timeObject = new Date(log.created_at);
const dateStr = timeObject.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jakarta' }).replace(/\//g, '-');
const timeStr = timeObject.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).replace(/\./g, ':');
const waktuWib = `${dateStr}, ${timeStr}`;
    
const pctTerdaftar = total > 0 ? ((terdaftar / total) * 100).toFixed(1) : 0;
const pctTidakTerdaftar = total > 0 ? ((tidakTerdaftar / total) * 100).toFixed(1) : 0;
            
let textDetail = 
`${e.history} <b>DETAIL HISTORY CHECKER</b>
──────────────────────────
${e.ID} <code>ID</code>: <code>${safeId}</code>
${e.paircode} <code>Input </code>: ${safeFile}
${e.clock} <code>Waktu </code>: ${waktuWib} WIB
${e.stopwatch} <code>Durasi</code>: <b>${liveDuration}</b>
${e.gear} <code>Speed </code>: <b>${liveSpeed}</b>
──────────────────────────
${e.chartbar} <b>STATISTIK:</b>
 ├${e.total} <code>Total Nomor</code>: <b>${total}</b>
 ├${e.yes} <code>Terdaftar WA</code>: <b>${terdaftar}</b> (${pctTerdaftar}%)
 │ ├${e.memo} <code>Memiliki Bio</code>: <b>${adaBio}</b>
 │ ├${e.forbid} <code>Tanpa Bio   </code>: <b>${tanpaBio}</b>
 │ ├${e.office} <code>WA Business </code>: <b>${waBiz}</b>
 │ └${e.sparkles} <code>Nomor Cantik</code>: <b>${noCantik}</b>
 └${e.no} <code>Tidak Terdaftar</code>: <b>${tidakTerdaftar}</b> (${pctTidakTerdaftar}%)
──────────────────────`;

const keyboard = [
  [ button("back", "KEMBALI", "historycek", "primary") ] ];
  await ctx.telegram.editMessageText(ctx.chat.id, ctx.callbackQuery.message.message_id, null, textDetail, { 
  parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard }
}).catch((err) => {
      console.error('\x1b[31m%s\x1b[0m',
      "[x] FAILED TO EDIT MESSAGE HISTORY CHECKER:", err.message);
    });
} catch (err) {
      console.error('\x1b[31m%s\x1b[0m',
      "[x] CRASH AT VIEW HISTORY CHECKER:", err.message); 
    }
}

async function handleViewFxhist(ctx) {
  try {
const logId = ctx.match[1];
const userId = String(ctx.from.id);

const dbCore = require('../data/sqlite');
const log = dbCore.prepare(`SELECT * FROM history WHERE id = ? AND user_id = ? AND type = 'FIXRED'`).get(logId, userId);
        
  if (!log) {
  return ctx.reply(
  '❌ Berkas riwayat telah kadaluwarsa.').catch(() => {});
}
const targetNumber = log.numbers;
const regionInfo = detectRegion([targetNumber]);
const regionName = log.failed || regionInfo.name;
const countryFlag = regionInfo.emojiId 
    ? `<tg-emoji emoji-id="${regionInfo.emojiId}">${regionInfo.flag}</tg-emoji>` 
    : regionInfo.flag;

const timeObject = new Date(log.created_at);
const dateStr = timeObject.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jakarta' }).replace(/\//g, '-');
const timeStr = timeObject.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).replace(/\./g, ':');
const waktuWib = `${dateStr}, ${timeStr}`;

let textDetail = 
`${e.history} <b>DETAIL HISTORY FIXRED</b>
──────────────────────────
 ${e.ID} <code>Fix-ID</code>: <code>${log.success}</code>
 ${e.target} <code>Target</code>: <code>${targetNumber}</code>
 ${e.earth} <code>Region</code>: ${countryFlag} <b>${regionName}</b>
 ${e.clock} <code>Waktu </code>: ${waktuWib} WIB
──────────────────────`;

const keyboard = [
  [ button("back", "KEMBALI", "historyfix", "primary") ] ];
  await ctx.telegram.editMessageText(ctx.chat.id, ctx.callbackQuery.message.message_id, null, textDetail,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard }
}).catch((err) => {
      console.error('\x1b[31m%s\x1b[0m',
      "[x] FAILED TO EDIT MESSAGE HISTORY FIXRED:", err.message);
    });
} catch (err) {
      console.error('\x1b[31m%s\x1b[0m',
      "[x] CRASH AT VIEW HISTORY FIXRED:", err.message); 
    }
}

module.exports = {
    handleAddWorker,
    handleBatalPairing,
    handleScanQr,
    handleBatalQr,
    handleBackReport,
    handleViewCkhist,
    handleViewFxhist
};

