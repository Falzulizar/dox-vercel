//DOX//CHECKER//ENGINE.JS
const { detectRegion } = require('../utils/regionDetector');
const userState = require('../utils/state');
const premium = require('../utils/premium');
const config = require('../config');
const { withTimeout, isNomorCantik } = require('./utils');
const { generateAndSendReport } = require('./reporter');

async function processNumbersEngine(ctx, rawLines, workerManager, targetMessageId = null) {
    
const startTime = Date.now();
  let lastProgressUpdate = Date.now();
  let isEditingProgress = false;

  if (!workerManager) workerManager = require('../worker');
  if (!rawLines) {
  if (ctx.message && ctx.message.text) rawLines = ctx.message.text.split('\n');
  else rawLines = [];
} else if (typeof rawLines === 'string') { 
       rawLines = rawLines.split('\n'); }

const lines = rawLines.map(line => line.replace(/[^0-9]/g, '').trim()).filter(line => line.length >= 10);

  if (lines.length === 0) {
const errorText = 
`${e.cross} INPUT TIDAK VALID!
──────────────────────────
Tidak ditemukan nomor valid di dalam
input pesan.
──────────────────────`;
  if (targetMessageId) {
  return ctx.telegram.editMessageText(ctx.chat.id, targetMessageId, null, errorText, { parse_mode: 'HTML' }).catch(() => {}); }
  return ctx.reply(errorText); 
}
// =================================================================
// 🛡️ TAMENG LAPIS 1: VALIDASI KEPEMILIKAN WORKER
// =================================================================
const userId = String(ctx.from?.id || '');
const userWorkers = workerManager.workers ? workerManager.workers.filter(w => String(w.ownerId) === userId) : [];

  if (userWorkers.length === 0) {
const errorNoWorker = 
`${e.cross} <b>AKSES DITOLAK!</b>
──────────────────────────
${e.warning} Anda belum menghubungkan perangkat
WhatsApp di menu <b>WORKER</b>, atau perangkat 
worker Anda sedang offline.
 
${e.bulb} <i><b>NOTE:</b> Silakan tautkan worker terlebih dahulu
sebelum melakukan proses checking nomor!</i>
──────────────────────`;

  if (targetMessageId) {
  return ctx.telegram.editMessageText(ctx.chat.id, targetMessageId, null, errorNoWorker, { parse_mode: 'HTML' }).catch(() => {}); }
  return ctx.reply(errorNoWorker, { parse_mode: 'HTML' });
}
// =================================================================
const totalNomor = lines.length;
const chatKey = String(ctx.chat.id);
    
  if (!userState.isChecking) userState.isChecking = {};
      userState.isChecking[chatKey] = true;
  if (!userState.speeds) userState.speeds = {};

const isOwner = String(ctx.from?.id || '') === String(config.OWNERID);
const isPremium = premium(ctx.from?.id);
        
  let currentSpeedMode = userState.speeds[ctx.from?.id] || 'Standar';
  if (!isOwner && !isPremium) currentSpeedMode = 'Standar';

  let checkedResults = []; 
  let activeTerdaftarCount = 0;
  let activeTidakTerdaftarCount = 0;

const textInisialisasi =
`${e.gcircle} <b>PROSES SEGERA DIMULAI</b>\n` +
`──────────────────────────\n` +
`${e.search} <code>Menginisialisasi nomor</code>...\n` +
`${e.gear} <code>Speed Mode</code>: <b>${currentSpeedMode}</b>\n` +
`${e.right} ▱▱▱▱▱▱▱▱▱▱ <b>0%</b>\n` +
`${e.total} <code>Diproses</code>: <b>0 / ${totalNomor}</b> Nomor\n\n` +
`${e.yes} <code>Terdaftar WA</code>: <b>${activeTerdaftarCount}</b>\n` +
`${e.no} <code>Tidak Terdaftar</code>: <b>${activeTidakTerdaftarCount}</b>\n` +
`──────────────────────`;

  let mainMessageId;
  if (targetMessageId) {
    mainMessageId = targetMessageId;
    await ctx.telegram.editMessageText(ctx.chat.id, mainMessageId, null, textInisialisasi, { parse_mode: 'HTML' }).catch(() => {});
  } else {
    const progressMsg = await ctx.reply(textInisialisasi, { parse_mode: 'HTML' }); 
    mainMessageId = progressMsg.message_id; }

  try {
const speedSafetyMode = String(currentSpeedMode).trim().toUpperCase();
  let batchSize = 3;
  let minDelay = 50;
  let maxDelay = 150;

  if (speedSafetyMode === 'SLOW') {
      batchSize = 1;
      minDelay = 1000;
      maxDelay = 2000; 
} else if (speedSafetyMode === 'FAST') {
      batchSize = 5;
      minDelay = 25;
      maxDelay = 100; 
}
const chunks = [];
  for (let i = 0; i < lines.length; i += batchSize) {
      chunks.push(lines.slice(i, i + batchSize)); }

  let diprosesKe = 0;
  for (const chunk of chunks) {
           
  const worker = workerManager.getNextWorker(ctx.from?.id);
  if (!worker || !worker.sock) {
  await ctx.telegram.editMessageText(ctx.chat.id, mainMessageId, null, 
`${e.cross} <b>PROSES DIHENTIKAN!</b>
──────────────────────────
Seluruh koneksi perangkat worker Anda
dalam keadaan offline.
──────────────────────`,
 { parse_mode: 'HTML' }).catch(() => {}); 
  break; 
}           
const { sock } = worker;

  await Promise.all(chunk.map(async (target) => {
  const region = detectRegion([target]);
    let visualFlag = region.emojiId 
        ? `<tg-emoji emoji-id="${region.emojiId}">${region.flag}</tg-emoji>` 
        : region.flag;
  let resObj = {
      target,
      exists: false,
      hasBio: false,
      statusText: "-",
      isBusiness: false,
      bizData: null,
      isPretty: isNomorCantik(target),
      countryName: region.name,
      countryFlag: visualFlag
};
  try {
const [result] = await withTimeout(sock.onWhatsApp(`${target}@s.whatsapp.net`), 2000);
                            
  if (result && result.exists) {
      resObj.exists = true;
      activeTerdaftarCount++;
const jid = result.jid;
                                          
const [resStatus, biz] = await Promise.all([
      withTimeout(sock.fetchStatus(jid), 800).catch(() => null),
      withTimeout(sock.getBusinessProfile(jid), 800).catch(() => null)
]);                               
  if (resStatus && resStatus.status) {
      resObj.hasBio = true;
      resObj.statusText = resStatus.status;
}
  if (biz) {
      resObj.isBusiness = true;
      resObj.bizData = {
      name: biz.name || "-",
      description: biz.description || "-",
      email: biz.email || "-",
      websites: biz.websites || null };
}
} else {
      activeTidakTerdaftarCount++; }
} catch (error) {
      activeTidakTerdaftarCount++;
} finally {
      checkedResults.push(resObj);
      diprosesKe++; 
}
}));
const persentase = Math.round((diprosesKe / totalNomor) * 100);
const jumlahBalok = Math.floor(persentase / 10);
const jumlahBaloks = 10 - jumlahBalok;
const loadingBar = '▰'.repeat(jumlahBalok) + '▱'.repeat(jumlahBaloks);

const currentTime = Date.now();
  if (!isEditingProgress && (diprosesKe % 10 === 0 || diprosesKe === totalNomor || (currentTime - lastProgressUpdate > 1000))) {
      lastProgressUpdate = currentTime;
      isEditingProgress = true; 
                             
ctx.telegram.editMessageText(ctx.chat.id, mainMessageId, null,
`${e.hglass2} <b>PROSES SEDANG BERJALAN</b>\n` +
`──────────────────────────\n` +
`${e.search} <code>Proses checking</code>...\n` +
`${e.gear} <code>Speed Mode</code>: <b>${currentSpeedMode}</b>\n` +
`${e.right} ${loadingBar} <b>${persentase}%</b>\n` +
`${e.total} <code>Diproses</code>: <b>${diprosesKe} / ${totalNomor}</b> Nomor\n\n`+
`${e.yes} <code>Terdaftar WA</code>: <b>${activeTerdaftarCount}</b>\n` +
`${e.no} <code>Tidak Terdaftar</code>: <b>${activeTidakTerdaftarCount}</b>\n` +
`──────────────────────`,
 { parse_mode: 'HTML' }
      ).then(() => { isEditingProgress = false; }) 
      .catch(() => { isEditingProgress = false; }); 
}
  if (minDelay > 0) {
  await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay)); }
}
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
      const dbCore = require('../data/sqlite');
      dbCore.prepare(`
          UPDATE users 
          SET checker_count = IFNULL(checker_count, 0) + ?
          WHERE id = ?
      `).run(lines.length, userId);
  } catch (errSync) {
      console.error("[DB] CHECKER/ENGINE.JS", errSync.message); 
  }
  await generateAndSendReport(ctx, {
      rawLines, 
      lines, 
      checkedResults, 
      mainMessageId,
      startTime,
      currentSpeedMode 
});
} catch (err) {
    console.error('\x1b[31m%s\x1b[0m',
    "[x] ERROR KRITIS CHECKER ENGINE:", err.message);
    ctx.reply("❌ Terjadi kesalahan internal saat menjalankan mesin checker.");
} finally { 
    userState.isChecking[chatKey] = false; }
}

module.exports = { processNumbersEngine };

