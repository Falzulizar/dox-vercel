// //DOX//HANDLERS/FIXRED.JS
const nodemailer = require('nodemailer');
const config = require('../config');
const premium = require('../utils/premium');
const db = require('../database');
const { detectRegion } = require('../utils/regionDetector');

async function handleFixredAction(ctx, text) {
const chatId = ctx.chat.id;
const msgId = global.sessionStore[chatId]?.fixred_message_id; 
const userId = String(ctx.from.id);

  if (global.sessionStore[chatId]) {
  delete global.sessionStore[chatId].stage; 
  }
  try {
  await ctx.deleteMessage().catch(() => {});      
  if (!msgId) {
return ctx.reply(
`${e.warning} <b>SESI MENU KADALUWARSA</b>
──────────────────────────
Silakan buka ulang menu Fixred.
──────────────────────`
  ); 
}
const digitBlocks = text.match(/\d+/g) || [];
const numbersCount = digitBlocks.filter(b => b.length >= 9).length;

  if (numbersCount > 1) {
  return ctx.telegram.editMessageText(chatId, msgId, null, 
`${e.warning} <b>AKSES DITOLAK!</b>
──────────────────────────
Kirim satu nomor aja, jangan ngirim
banyak sekaligus!
──────────────────────`, 
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("back", "KEMBALI", "fixred", "danger") ]] }
  }).catch(() => {});
}
const rawNumber = text.replace(/[^0-9]/g, '');
  if (rawNumber.length < 10) {
  return ctx.telegram.editMessageText(chatId, msgId, null, 
`${e.warning} <b>NOMOR TIDAK VALID!</b>
──────────────────────────
Minimal nomor berisi 10 digit angka.
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("back", "KEMBALI", "fixred", "danger") ]] } 
  }).catch(() => {});
}
const targetNumber = rawNumber.startsWith('0') ? '62' + rawNumber.slice(1) : rawNumber;
              
const userDb = db.readFlatFile('fixred');
const emailSender = db.readFlatFile('email');

const regionInfo = detectRegion([targetNumber]);
const regionName = regionInfo.name;
const countryFlag = regionInfo.emojiId 
    ? `<tg-emoji emoji-id="${regionInfo.emojiId}">${regionInfo.flag}</tg-emoji>` 
    : regionInfo.flag;

const today = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
              
  let userData = userDb.find(u => String(u.id) === userId);
                  
  if (!userData) {
      userData = { id: userId, lastUsed: 0, date: today, count: 0, total_count: 0 };
      userDb.push(userData); 
    }
  if (userData.date !== today) {
      userData.date = today;
      userData.count = 0; 
    }
const now = Date.now();
const isOwner = userId === String(config.OWNERID);
const isPremium = premium(ctx.from.id);
const cooldownTime = (isPremium || isOwner) ? (1 * 60 * 1000) : (2 * 60 * 1000);

  if (now - userData.lastUsed < cooldownTime) {
const sisaDetik = Math.ceil((cooldownTime - (now - userData.lastUsed)) / 1000);
  return ctx.telegram.editMessageText(chatId, msgId, null, 
`${e.warning} <b>COOLDOWN BANDING FIXRED</b>
──────────────────────────
${e.hglass} Mohon tunggu: <b>${sisaDetik} detik</b> lagi...

${e.pin} <i>ᴘɪɴᴛᴜ ɪɴᴘᴜᴛ ᴀᴋᴀɴ ᴛᴇʀʙᴜᴋᴀ ᴏᴛᴏᴍᴀᴛɪꜱ
ꜱᴇᴛᴇʟᴀʜ ᴄᴏᴏʟᴅᴏᴡɴ ꜱᴇʟᴇꜱᴀɪ.</i>
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
  }).catch(() => {}); 
}
  if (!isPremium && !isOwner && userData.count >= 5) {
  return ctx.telegram.editMessageText(chatId, msgId, null,
`${e.warning} <b>LIMIT HARIAN!</b>
──────────────────────────
Anda sudah mencapai batas maksimal
(5/5 hari ini).
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("diamond", "UPGRADE PREMIUM", "premium", "primary") ]] }
  }).catch(() => {});
}
  if (emailSender.length === 0) {
  return ctx.telegram.editMessageText(chatId, msgId, null,
`${e.warning} <b>DATABASE EMAIL KOSONG!</b>
──────────────────────────
Silakan hubungi admin untuk mengisi
email sender.
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
  }).catch(() => {});
}
const minLastUsed = Math.min(...emailSender.map(w => w.lastUsed || 0));
const candidates = emailSender.filter(w => (w.lastUsed || 0) === minLastUsed);
  let availableSender = candidates[Math.floor(Math.random() * candidates.length)];

  if (minLastUsed > 0 && (now - minLastUsed < 300000)) {
return ctx.telegram.editMessageText(chatId, msgId, null,
`${e.warning} <b>SISTEM SEDANG SIBUK!</b>
──────────────────────────
Semua database email sedang cooldown.
──────────────────────`, 
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] } 
  }).catch(() => {});
}        
  await ctx.telegram.editMessageText(chatId, msgId, null, 
        `${e.hglass2} <b>Mengirim banding</b>...`, { parse_mode: 'HTML' }).catch(() => {});

const randomTicket = 'DX-' + Math.floor(10000 + Math.random() * 90000);
const JKT_ZONE = { timeZone: 'Asia/Jakarta' };
const tglFix = new Date().toLocaleDateString('id-ID', JKT_ZONE).replace(/\//g, '-');
const jamFix = new Date().toLocaleTimeString('id-ID', { ...JKT_ZONE, hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
const waktuFix = `${tglFix}, ${jamFix}`;

  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: availableSender.email, pass: availableSender.pass },
      connectionTimeout: 10000,
      socketTimeout: 10000
  });
  await transporter.sendMail({
        from: availableSender.email,
        to: 'support@support.whatsapp.com',
        subject: '', 
        text: `+${targetNumber}`
  });
        
        availableSender.lastUsed = now;
        userData.lastUsed = now;
        userData.count += 1;
        userData.total_count = (userData.total_count || 0) + 1;
        
        db.writeFlatFile('email', emailSender);
        db.writeFlatFile('fixred', userDb);
        
  try {
const dbCore = require('../data/sqlite');
      dbCore.prepare(`
                UPDATE users 
                SET fixred_count = IFNULL(fixred_count, 0) + 1,
                    total_fixred = IFNULL(total_fixred, 0) + 1
                WHERE id = ?
      `).run(userId);
} catch (errSync) { 
      console.error("Gagal sinkron fixred stats:", errSync.message); 
    }
        
const regionData = db.readFlatFile('region');
  if (!regionData.fixred) regionData.fixred = {};
      regionData.fixred[regionName] = (regionData.fixred[regionName] || 0) + 1;
      db.writeFlatFile('region', regionData);

const trackingDb = db.readFlatFile('fixred_tracking');
      trackingDb.push({
      targetNumber: targetNumber,
      ticketId: randomTicket,
      chatId: chatId,
      messageId: msgId,
      emailSender: availableSender.email,
      timestamp: now 
});
      db.writeFlatFile('fixred_tracking', trackingDb);

// ==============================================================
// 📜 ENGINE LOGGER HISTORY FIXRED (MIGRASI FULL SQLITE NATIVE)
// ==============================================================
  try {
const dbCore = require('../data/sqlite');
      dbCore.prepare(`
                INSERT INTO history (id, user_id, type, numbers, success, failed, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(randomTicket, userId, 'FIXRED', targetNumber, randomTicket, regionName, Date.now());
        } catch (dbHistoryErr) { 
      console.error(
"[x] Gagal mengunci history fixred ke SQLite:", dbHistoryErr.message); 
  }
        
// ==============================================================
// 📡 ENGINE LOG LOGGING CHANNEL
// ==============================================================
  if (config.GROUPID) {
const maskedNumber = targetNumber.substring(0, 4) + '𝕏𝕏𝕏𝕏' + targetNumber.substring(targetNumber.length - 4);
const safeChanName = (ctx.from.first_name || 'User').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const safeChanUser = (ctx.from.username || '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
ctx.telegram.sendMessage(config.GROUPID,
`<b>𓊈${e.siren}𓊉 ${e.yes}BANDING DIKIRIM${e.yes} 𓊈${e.siren}𓊉</b>
────────────────────────
┌ ${e.user} : ${safeChanName} (@${safeChanUser})
├ ${e.target} : +${maskedNumber}
├ ${countryFlag} : <b>${regionName}</b>
└ ${e.clock} : ${waktuFix} WIB
──────────────────`, 
  { parse_mode: 'HTML' }).then((channelMsg) => {
    setTimeout(() => { ctx.telegram.deleteMessage(config.GROUPID, channelMsg.message_id).catch(() => {});
      console.log('\x1b[36m%s\x1b[0m',
      `[🗑️] AUTO-CLEANER CHANNEL: ${randomTicket}`); 
  }, 300000);
}).catch((err) => {
      console.error('\x1b[31m%s\x1b[0m',
      '[x] GAGAL KIRIM KE LOG CHANNEL:', err.message);
  }); 
}

await ctx.telegram.editMessageText(chatId, msgId, null,
`${e.fixred} <b>BANDING TELAH DIKIRIM!</b>
──────────────────────────
 ${e.target} <code>Target</code>: <code>+${targetNumber}</code>
 ${e.ID} <code>Fix-ID</code>: <code>${randomTicket}</code>
 ${e.clock} <code>Waktu </code>: ${waktuFix} WIB
 ${e.chartbar} <code>Limit </code>: <b>${(isPremium || isOwner) ? '∞' : (5 - userData.count)}</b>
──────────────────────────
${e.bell} <i>ɴᴏᴛɪꜰɪᴋᴀꜱɪ ᴏᴛᴏᴍᴀᴛɪꜱ ᴅɪᴋɪʀɪᴍ ᴊɪᴋᴀ
ꜱɪꜱᴛᴇᴍ ᴍᴇɴᴅᴇᴛᴇᴋꜱɪ ᴀᴅᴀ ʙᴀʟᴀꜱᴀɴ ᴍᴀꜱᴜᴋ.</i>
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
}).catch(() => {});

} catch (err) {
      console.error('\x1b[31m%s\x1b[0m',
      "[x] ERROR FIXRED ACTION:", err.message);
            
await ctx.telegram.editMessageText(chatId, msgId, null,
`${e.warning} <b>TERJADI KESALAHAN INTERNAL</b>
──────────────────────────
<i>${err.message}</i>
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
  }).catch(() => {}); 
  }
}

module.exports = { handleFixredAction };

