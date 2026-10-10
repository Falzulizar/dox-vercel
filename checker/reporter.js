// //DOX/CHECKER/REPORTER.JS
const https = require('https');
const db = require('../database');
const config = require('../config'); 
const { detectRegion } = require('../utils/regionDetector');
const formatter = require('./formatter');

function sendAtomicDocument(token, chatId, caption, fileName, fileContent) {
  return new Promise((resolve, reject) => {
const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
const payloadParts = [
`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n`,
`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`,
`--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nHTML\r\n`,
`--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: text/plain\r\n\r\n${fileContent}\r\n`,
`--${boundary}--\r\n` ];
const payloadBuffer = Buffer.concat(payloadParts.map(p => Buffer.from(p, 'utf-8')));
const options = {
      hostname: 'api.telegram.org', port: 443, path: `/bot${token}/sendDocument`, method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': payloadBuffer.length },
      timeout: 20000 
};
const req = https.request(options, (res) => {
  let resData = '';
      res.on('data', (chunk) => { resData += chunk; });
      res.on('end', () => {
  if (res.statusCode === 200) resolve(true);
  else reject(new Error(`Telegram API Error: ${res.statusCode} - ${resData}`)); });
});
      req.on('error', (err) => { reject(err); });
      req.on('timeout', () => { req.destroy(); reject(new Error('Jalur koneksi timeout')); });
      req.write(payloadBuffer);
      req.end();
  });
}

async function generateAndSendReport(ctx, data) {
const { rawLines, lines, checkedResults, mainMessageId, startTime, currentSpeedMode } = data;

  const durationText = startTime ? `${((Date.now() - startTime) / 1000).toFixed(1)}s` : '-';

  const randomLogId = 'DX' + Math.floor(10000 + Math.random() * 90000);

  try {
  await db.updateStats(String(ctx.from.id), lines.length);
} catch (dbErr) {
    console.error("[x] DB SQLITE UPDATE STATS ISSUE:", dbErr.message); 
}
const groupedRegions = {};
  for (const item of checkedResults) {
const regionInfo = detectRegion([item.target]) || { name: "Global / Multi", flag: "🌍" };
const rName = regionInfo.name || "Global / Multi";
const visualFlag = regionInfo.emojiId 
    ? `<tg-emoji emoji-id="${regionInfo.emojiId}">${regionInfo.flag}</tg-emoji>` 
    : (regionInfo.flag || "🌍");

  if (!groupedRegions[rName]) {
      groupedRegions[rName] = {
      name: rName, flag: visualFlag,
      terdaftar: [], tidakTerdaftar: [],
      adaBio: [], tanpaBio: [],
      metaBusinessList: [], nomorCantikList: [],
      txtOnlyBio: "", txtOnlyBusiness: "", txtPersonalNoBio: "", txtNotRegistered: "", txtNomorCantik: "" };
}
const bucket = groupedRegions[rName];
  if (item.exists) {
      bucket.terdaftar.push(item.target);
  if (item.isPretty) { bucket.nomorCantikList.push(item.target); bucket.txtNomorCantik += `${item.target}\n`; }
  if (item.hasBio) {
      bucket.adaBio.push(item.target);
      bucket.txtOnlyBio += `${item.target}\n  └ Bio: ${item.statusText}\n`;
} else { bucket.tanpaBio.push(item.target); }
  if (item.isBusiness) {
      bucket.metaBusinessList.push(item.target);
const b = item.bizData || {};
      bucket.txtOnlyBusiness += `${item.target} [BUSINESS]\n ├ Name: ${b.name || "-"}\n ├ Desc: ${b.description || "-"}\n ├ Email: ${b.email || "-"}\n └ Website: ${b.websites ? b.websites.join(', ') : "-"}\n`;
}
  if (!item.isBusiness && !item.hasBio) { bucket.txtPersonalNoBio += `${item.target}\n`; }
} else {
      bucket.tidakTerdaftar.push(item.target);
      bucket.txtNotRegistered += `${item.target}\n`; }
}
  if (mainMessageId) { await ctx.telegram.deleteMessage(ctx.chat.id, mainMessageId).catch(() => {}); }

  let globalStats = { terdaftar: 0, tidakTerdaftar: 0, adaBio: 0, tanpaBio: 0, metaBusiness: 0, nomorCantik: 0 };
  let gTerdaftar = [], gTidakTerdaftar = [],gAdaBio = [], gTanpaBio = [], gMetaBiz = [], gPretty = [];

  for (const [rName, bucket] of Object.entries(groupedRegions)) {
const totalRegionNum = bucket.terdaftar.length + bucket.tidakTerdaftar.length;
    
    globalStats.terdaftar += bucket.terdaftar.length;
    globalStats.tidakTerdaftar += bucket.tidakTerdaftar.length;
    globalStats.adaBio += bucket.adaBio.length;
    globalStats.tanpaBio += bucket.tanpaBio.length;
    globalStats.metaBusiness += bucket.metaBusinessList.length;
    globalStats.nomorCantik += bucket.nomorCantikList.length;

    gTerdaftar.push(...bucket.terdaftar); gTidakTerdaftar.push(...bucket.tidakTerdaftar);
    gAdaBio.push(...bucket.adaBio); gTanpaBio.push(...bucket.tanpaBio);
    gMetaBiz.push(...bucket.metaBusinessList); gPretty.push(...bucket.nomorCantikList);

const pctReg = totalRegionNum > 0 ? ((bucket.terdaftar.length / totalRegionNum) * 100).toFixed(1) : 0;
const pctUnreg = totalRegionNum > 0 ? ((bucket.tidakTerdaftar.length / totalRegionNum) * 100).toFixed(1) : 0;

const finalTxtContent = formatter.generateTxtReport(bucket, pctReg, pctUnreg);

const fileName = `${rName.replace(/[^a-zA-Z0-9]/g, '_')}_${randomLogId}.txt`;
const captionText = `${bucket.flag} Region : ${rName} | Total : ${totalRegionNum} Nomor`;
   
  let uploadSuccess = false;
  for (let attempt = 1; attempt <= 2; attempt++) {
  try {
  await sendAtomicDocument(config.TOKEN, ctx.chat.id, captionText, fileName, finalTxtContent);
      uploadSuccess = true;
  break; 
} catch (err) {
  if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000)); }
}
  if (!uploadSuccess) {
  await ctx.reply(`⚠️ <b>Gagal upload berkas file (${rName})</b>`, { parse_mode: 'HTML' }).catch(() => {}); }
}
  try {
const regionNamesList = Object.keys(groupedRegions).join(', ');
const primaryFlag = Object.values(groupedRegions)[0]?.flag || "🌍";
const waktuCek = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-');

const safeFirstname = (ctx.from.first_name || 'User').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const safeUsername = (ctx.from.username || '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const logTeks = 
`<b>𓊈${e.siren}𓊉 ${e.yes}CHECK COMPLETE${e.yes} 𓊈${e.siren}𓊉</b>
────────────────────────
┌ ${e.user} : ${safeFirstname} (@${safeUsername})
├ ${e.total} : <b>${lines.length}</b> Nomor
├ ${primaryFlag} : <b>${regionNamesList}</b>
└ ${e.clock} : ${waktuCek} WIB
──────────────────`;
  if (config.GROUPID) {
const sentLogMsg = await ctx.telegram.sendMessage(config.GROUPID, logTeks, { parse_mode: 'HTML' }).catch(() => {});
  if (sentLogMsg?.message_id) { setTimeout(async () => { await ctx.telegram.deleteMessage(config.GROUPID, sentLogMsg.message_id).catch(() => {}); }, 300000); }
}
} catch (err) {}

const teksStatistik = formatter.generateTelegramSummary(groupedRegions, globalStats, lines.length);

const keyboard = [
[ button("yes", `(${globalStats.terdaftar})`, `view_list_terdaftar_${randomLogId}`, "success"), 
  button("no", `(${globalStats.tidakTerdaftar})`, `view_list_tidakterdaftar_${randomLogId}`, "danger") ],
[ button("memo", `(${globalStats.adaBio})`, `view_list_adabio_${randomLogId}`, "success"), 
  button("forbid", `(${globalStats.tanpaBio})`, `view_list_tanpabio_${randomLogId}`, "danger") ],
[ button("office", `(${globalStats.metaBusiness})`, `view_list_business_${randomLogId}`, "primary"),
  button("sparkles", `(${globalStats.nomorCantik})`, `view_list_nomorcantik_${randomLogId}`, "primary") ],
[ button("search", "CEK LAGI", `checker_report_${randomLogId}`, "primary"),
  button("home", "MENU UTAMA", "dashboard", "primary") ] ];

  await ctx.reply(teksStatistik, { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } }).catch(() => {});

const chatKey = String(ctx.chat.id);
const userId = String(ctx.from.id);
const cacheData = { adaBio: gAdaBio, tanpaBio: gTanpaBio, terdaftar: gTerdaftar, tidakTerdaftar: gTidakTerdaftar, metaBusinessList: gMetaBiz, nomorCantikList: gPretty, teksStatistik };

  try {
      const dbCore = require('../data/sqlite');
      const descriptor = ctx.message?.document?.file_name || `input - ${lines.length} nomor`;
      
dbCore.prepare(`
          INSERT INTO history (id, user_id, type, numbers, success, failed, has_bio, no_bio, is_business, is_pretty, duration, speed, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(randomLogId, userId, 'CHECKER', descriptor, globalStats.terdaftar, globalStats.tidakTerdaftar, globalStats.adaBio, globalStats.tanpaBio, globalStats.metaBusiness, globalStats.nomorCantik, durationText, currentSpeedMode, Date.now());

      const cacheValueStr = JSON.stringify(cacheData);
      const secureCacheKey = `${userId}_${randomLogId}`;
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

      dbCore.prepare(`
          INSERT OR REPLACE INTO cache (cache_key, cache_value, expires_at)
          VALUES (?, ?, ?)
      `).run(secureCacheKey, cacheValueStr, expiresAt);

      dbCore.prepare(`
          INSERT OR REPLACE INTO cache (cache_key, cache_value, expires_at)
          VALUES (?, ?, ?)
      `).run(chatKey, cacheValueStr, expiresAt);

      if (!global.lastCheckerResults) global.lastCheckerResults = {};
      global.lastCheckerResults[secureCacheKey] = cacheData;
      global.lastCheckerResults[chatKey] = cacheData;

  } catch (dbSyncErr) {
      console.error("[x] CRITICAL SQLITE HISTORY/CACHE SYNC ERROR:", dbSyncErr.message);
  }
}

module.exports = { generateAndSendReport };

