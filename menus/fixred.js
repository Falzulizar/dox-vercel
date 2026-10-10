//DOX//MENUS//FIXRED.JS
const config = require('../config');
const premium = require('../utils/premium');
const db = require('../database');

async function handleFixred(ctx, fromCallback = true) {
const chatId = ctx.chat.id;
const userId = String(ctx.from.id);
const isOwner = userId === String(config.OWNERID);
const isPremium = premium(ctx.from.id);

  if (!global.sessionStore[chatId]) global.sessionStore[chatId] = {};

const userDb = db.readFlatFile('fixred');
const userData = userDb.find(u => String(u.id) === userId);
const now = Date.now();
const cooldownTime = (isPremium || isOwner) ? (1 * 60 * 1000) : (2 * 60 * 1000);

const userFixredTotal = userDb
      .filter(u => String(u.id) === userId)
      .reduce((sum, u) => sum + (u.total_count || u.count || 0), 0);

const todayStr = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
const fixredToday = (userData && userData.date === todayStr) ? (userData.count || 0) : 0;

  let limitFixredStr = `${fixredToday}/5`;
  if (isOwner || isPremium) {
      limitFixredStr = `${fixredToday}/∞`;
    }

const replyMarkup = { 
      inline_keyboard: [
    [ button("hglass", "ANTRIAN BANDING", "antrian", "primary") ],
    [ button("history", "HISTORY", "historyfix", "primary") ],
    [ button("back", "KEMBALI", "dashboard", "danger") ] ] 
};

  if (userData && (now - userData.lastUsed < cooldownTime)) {
      global.sessionStore[chatId].stage = 'COOLDOWN';
        
  let sisaWaktuMs = cooldownTime - (now - userData.lastUsed);
  let sisaDetik = Math.ceil(sisaWaktuMs / 1000);

const cooldownMarkup = { inline_keyboard:[
    [ button("home", "MENU UTAMA", "dashboard", "danger") ]] };
const textCooldown = 
`${e.warning} <b>COOLDOWN BANDING FIXRED</b>
──────────────────────────
${e.hglass} Mohon tunggu: <b>${sisaDetik} detik</b> lagi...

${e.pin} <i>ᴘɪɴᴛᴜ ɪɴᴘᴜᴛ ᴀᴋᴀɴ ᴛᴇʀʙᴜᴋᴀ ᴏᴛᴏᴍᴀᴛɪꜱ
ꜱᴇᴛᴇʟᴀʜ ᴄᴏᴏʟᴅᴏᴡɴ ꜱᴇʟᴇꜱᴀɪ.</i>
──────────────────────`;

  try {
  if (ctx.callbackQuery) {
  await ctx.editMessageText(textCooldown, { parse_mode: 'HTML', reply_markup: cooldownMarkup }).catch(() => {});
        global.sessionStore[chatId].fixred_message_id = ctx.callbackQuery.message.message_id;
} else {
  if (global.sessionStore[chatId].fixred_message_id) {
  await ctx.telegram.editMessageText(chatId, global.sessionStore[chatId].fixred_message_id, null, textCooldown, { parse_mode: 'HTML', reply_markup: cooldownMarkup }).catch(() => {});
  } else {
const msg = await ctx.reply(textCooldown, { parse_mode: 'HTML', reply_markup: cooldownMarkup });
        global.sessionStore[chatId].fixred_message_id = msg.message_id;
    }
  }
} catch (err) { }            

  if (global.sessionStore[chatId].cooldownInterval) clearInterval(global.sessionStore[chatId].cooldownInterval);

      global.sessionStore[chatId].cooldownInterval = setInterval(async () => {
  if (global.sessionStore[chatId]?.stage !== 'COOLDOWN') {
                clearInterval(global.sessionStore[chatId].cooldownInterval);
  delete global.sessionStore[chatId].cooldownInterval;
  return;
}
      sisaDetik--;
  if (sisaDetik <= 0) {
                clearInterval(global.sessionStore[chatId].cooldownInterval);
  delete global.sessionStore[chatId].cooldownInterval;
  if (global.sessionStore[chatId].fixred_message_id) {
  await ctx.telegram.deleteMessage(chatId, global.sessionStore[chatId].fixred_message_id).catch(() => {});
  delete global.sessionStore[chatId].fixred_message_id;
}
  delete global.sessionStore[chatId].stage;
  return handleFixred(ctx, false);
}
const textTick = 
`${e.warning} <b>COOLDOWN BANDING FIXRED</b>
──────────────────────────
${e.hglass} Mohon tunggu: <b>${sisaDetik} detik</b> lagi...

${e.pin} <i>ᴘɪɴᴛᴜ ɪɴᴘᴜᴛ ᴀᴋᴀɴ ᴛᴇʀʙᴜᴋᴀ ᴏᴛᴏᴍᴀᴛɪꜱ
ꜱᴇᴛᴇʟᴀʜ ᴄᴏᴏʟᴅᴏᴡɴ ꜱᴇʟᴇꜱᴀɪ.</i>
──────────────────────`;
  if (global.sessionStore[chatId].fixred_message_id) {
  await ctx.telegram.editMessageText(chatId, global.sessionStore[chatId].fixred_message_id, null, textTick, { parse_mode: 'HTML', reply_markup: cooldownMarkup }).catch(() => {});
}
}, 1000);
  return;
}
      global.sessionStore[chatId].stage = 'WAIT_FIX';
const emailSender = db.readFlatFile('email');
const totalSender = emailSender.length;
const textInput =
`${e.fixred} <b>MENU BANDING FIXRED</b>
──────────────────────────
${e.chartbar} <b>STATS FIXRED ANDA</b>
  »  <code>Fixred Today</code>: <b>${fixredToday}</b>
  »  <code>Total Fixred</code>: <b>${userFixredTotal.toLocaleString('id-ID')}</b>
  »  <code>Limit Harian</code>: <b>${limitFixredStr}</b>
──────────────────────────
Silahkan kirimkan nomor target yang
sedang terkena merah, lengkap dengan
format kode negara.

Contoh:
628xxxxx atau +628xxxxx

<b>Pastikan nomor target sudah terdaftar
di whatsapp dan kondisi nomor
"Login Tidak Tersedia"</b>

${e.bulb} <i>ᴘʀᴏꜱᴇꜱ ᴛᴀɴᴘᴀ ꜱᴇɴᴅᴇʀ
${e.stopwatch} ʀᴇꜱᴇᴛ ʟɪᴍɪᴛ ꜱᴇᴛɪᴀᴘ ᴊᴀᴍ 𝟶𝟶:𝟶𝟶 ᴡɪʙ</i>
──────────────────────`;

  if (ctx.callbackQuery && fromCallback) {
  await ctx.editMessageText(textInput, { parse_mode: 'HTML', reply_markup: replyMarkup }).catch(() => {});
      global.sessionStore[chatId].fixred_message_id = ctx.callbackQuery.message.message_id;
} else {
  if (!fromCallback && global.sessionStore[chatId].fixred_message_id) {
  await ctx.telegram.deleteMessage(chatId, global.sessionStore[chatId].fixred_message_id).catch(() => {});
  delete global.sessionStore[chatId].fixred_message_id;
}
const msg = await ctx.reply(textInput, { parse_mode: 'HTML', reply_markup: replyMarkup });
      global.sessionStore[chatId].fixred_message_id = msg.message_id;
  }
}

async function handleAntrian(ctx) {
  try {
const activeTrackingList = db.readFlatFile('fixred_tracking');
const totalAntrean = activeTrackingList.length;
        
  let estimasiWaktu = totalAntrean * 30; 
  let waktuStr = '0 detik';
  if (estimasiWaktu > 0) {
      waktuStr = estimasiWaktu < 60 ? `${estimasiWaktu} detik` : `${Math.ceil(estimasiWaktu / 60)} menit`;
}
  let statusEngine = `${e.gcircle} READY`;
  if (totalAntrean > 15) {
      statusEngine = `${e.rcircle} OVERLOAD`;
  } else if (totalAntrean > 0) {
      statusEngine = `${e.warning} COOLDOWN`;
}
        
let textQueue = 
`${e.fixred} <b>STATUS ANTRIAN BANDING</b>
──────────────────────────
  » <code>Total   </code>: <b>${totalAntrean} Nomor</b>
  » <code>Estimasi</code>: <b>${waktuStr}</b>
  » <code>Status  </code>: <b>${statusEngine}</b>
──────────────────────`;
            
const keyboard = [[ button("back", "KEMBALI", "fixred", "danger") ]];
  await ctx.editMessageText(textQueue, { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } }).catch(() => {});
} catch (err) {
        console.error(
        "[x] ERROR PADA ENGINE QUEUE STATUS:", err.message);
    }
}

async function handleHistoryFix(ctx, fromCallback = false) {
const userId = String(ctx.from.id);
  let historyRows = [];
  try {
const dbCore = require('../data/sqlite');
      historyRows = dbCore.prepare(`SELECT id, created_at FROM history WHERE user_id = ? AND type = 'FIXRED' ORDER BY created_at DESC LIMIT 8`).all(userId);
} catch (e) {
        console.error(
        "[x] Gagal menarik data history fixred:", e.message);
    }
let text = `${e.history} <b>HISTORY BANDING FIXRED</b>\n` +
           `──────────────────────────\n`;    
const keyboard = [];  
  if (historyRows.length === 0) {
    text += `${e.inform} <i>ʙᴇʟᴜᴍ ᴀᴅᴀ ʀɪᴡᴀʏᴀᴛ ꜰɪxʀᴇᴅ ꜱᴀᴀᴛ ɪɴɪ.</i>\n` +
            `──────────────────────`;
} else {
    text += `<b>${historyRows.length} pengajuan terakhir:</b>`;
      historyRows.forEach((row) => {
const timeObject = new Date(row.created_at);
const shortDate = timeObject.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Jakarta' });
const shortTime = timeObject.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).replace(':', '.');
const btnText = `${shortDate}, ${shortTime} — ${row.id} `;
      keyboard.push([ button("calendar", btnText,
                             `view_fxhist_${row.id}`, "primary") ]); 
  });
}
      keyboard.push([ button("back", "KEMBALI", "fixred", "danger") ]);

const extra = { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } };
  if (fromCallback) return ctx.editMessageText(text, extra).catch(() => {});
  return ctx.reply(text, extra);
}

module.exports = { handleFixred, handleAntrian, handleHistoryFix };

