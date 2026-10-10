// //DOX//MENUS//CHECKER.JS
const config = require('../config');
const premium = require('../utils/premium');
const userState = require('../utils/state');
const db = require('../database');
const workerManager = require('../worker');

function owner(userId) { 
  return String(userId) === String(config.OWNERID); 
}

async function renderMenu(ctx, text, keyboard, fromCallback = false) {
const extra = { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } };
  if (fromCallback) return ctx.editMessageText(text, extra).catch(() => {}); 
  return ctx.reply(text, extra); 
}

// ==============================================================
// 📱 HANDLER MENU CEK NOMOR
// ==============================================================
// 🔌 INJEKSI PIPA DYNAMIC: Menambahkan parameter backTarget agar sasis menu input bisa membaca target pulang dari nav.js
async function handleChecker(ctx, fromCallback = false, sessionStore = {}, backTarget = 'dashboard') {
  try {
const user = await db.getOrCreateUser(String(ctx.from.id), ctx.from.username || ctx.from.first_name);
const isOwner = owner(ctx.from.id);
const isPremium = premium(ctx.from.id);
        
const totalWorkers = workerManager.workers ? workerManager.workers.filter(w => String(w.ownerId) === String(ctx.from.id)).length : 0;
const currentSpeed = userState.speeds ? (userState.speeds[ctx.from.id] || 'Standar') : 'Standar';
        
const todayStr = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
const currentUsage = (user && user.last_check_date === todayStr) ? (user.daily_count || 0) : 0;
        
  let maxNomor = '500';
  let limitHarianStr = `${currentUsage}/5`;
               
  if (isOwner || isPremium) {
      maxNomor = '∞';
      limitHarianStr = `${currentUsage}/∞`; 
    }

  let text = "";
  let keyboard = [];

if (totalWorkers === 0) {
text += 
`${e.search} <b>MENU CEK NOMOR WHATSAPP</b>
──────────────────────────
${e.warning} <b>BELUM ADA WORKER AKTIF!</b>
<i>(ꜱɪʟᴀʜᴋᴀɴ ᴛᴀᴍʙᴀʜᴋᴀɴ ᴡᴏʀᴋᴇʀ ᴅᴜʟᴜ)</i>
──────────────────────`;
  keyboard = [
[ button("plus", "ADD WORKER", "add_worker", "success") ],
[ button("gear", "SPEED MODE", "speed", "primary"),
  button("history", "HISTORY", "historycek", "primary") ],
[ button("back", "KEMBALI", backTarget, "danger") ] ];
} else {
  userState[ctx.from.id] = "WAIT_BIO";
text +=
`${e.search} <b>MENU CEK NOMOR WHATSAPP</b>
──────────────────────────
${e.chartbar} <b>STATS CHECKER ANDA</b>
  »  <code>Worker ON  </code>: <b>${totalWorkers}</b>
  »  <code>Limit Check</code>: <b>${limitHarianStr}</b>
  »  <code>Maks Nomor </code>: <b>${maxNomor}</b>
  »  <code>Speed Mode </code>: <b>${currentSpeed}</b>
──────────────────────────
Silahkan ketik / paste nomor target
di kolom chat (satu nomor per baris)

Contoh:
62812xxxxxxx
+62812xxxxxxx
  
Atau kirimkan file berformat:
.txt, .xls, atau .xlsx

${e.pin} <i>ᴄᴇᴋ ɴᴏᴍᴏʀ ʟᴇʙɪʜ ᴅᴀʀɪ 𝟸𝟻𝟶+ ɴᴏᴍᴏʀ
ᴅɪꜱᴀʀᴀɴᴋᴀɴ ᴋɪʀɪᴍ ᴍᴇʟᴀʟᴜɪ ꜰɪʟᴇ</i>
──────────────────────`;
  keyboard = [
[ button("robot", "DAFTAR WORKER", "worker", "success") ],
[ button("gear", "SPEED MODE", "speed", "primary"),
  button("history", "HISTORY", "historycek", "primary") ],
[ button("back", "KEMBALI", backTarget, "danger") ] ];
}
const menuMsg = await renderMenu(ctx, text, keyboard, fromCallback);
  if (!sessionStore[ctx.chat.id]) sessionStore[ctx.chat.id] = {};
  if (fromCallback && ctx.callbackQuery?.message){
      sessionStore[ctx.chat.id].cekbio_message_id = ctx.callbackQuery.message.message_id;
} else if (menuMsg) {
      sessionStore[ctx.chat.id].cekbio_message_id = menuMsg.message_id; 
    }
  return menuMsg;
} catch (err) {
        console.error('\x1b[31m%s\x1b[0m',
        "[x] GAGAL MEMUAT MENU CEK NOMOR:", err.message); 
    }
}

// ==============================================================
// ⚡ HANDLER SPEED CONFIG
// =============================================================
async function handleSpeed(ctx, fromCallback = false) {
  if (!userState.speeds) userState.speeds = {};

const isOwner = owner(ctx.from.id);
const isPremium = premium(ctx.from.id);

  if (!isOwner && !isPremium) userState.speeds[ctx.from.id] = 'Standar';
     
const currentSpeed = userState.speeds[ctx.from.id] || 'Standar';

  let statusIcon = `${e.free}`;
  if (isOwner) statusIcon = `${e.crown}`;
  else if (isPremium) statusIcon = `${e.diamond}`;

  let text = `${e.gear} <b>MENU SPEED CONFIG</b>\n` +
             `──────────────────────────\n` +
             `${e.stopwatch} Speed Mode Saat Ini: <b>${currentSpeed}</b>\n\n` +
             `${e.user} Ketentuan Berdasarkan Status Akun:\n`;
  let keyboard = [];
    
  if (isOwner || isPremium) {
     text += `  »  Status Akun Anda: ${statusIcon}\n` +
             `  »  Semua Speed Mode dapat digunakan\n` +
             `──────────────────────`;
  keyboard = [
[ toggle("SLOW", "𓊈🔸𝗦𝗟𝗢𝗪🔸𓊉", currentSpeed === "Slow",
         "set_speed_SLOW", "primary") ],
[ toggle("STANDAR", "𓊈🔹𝗦𝗧𝗔𝗡𝗗𝗔𝗥🔹𓊉", currentSpeed ===
         "Standar", "set_speed_STANDAR", "primary") ],
[ toggle("FAST", "𓊈⚡𝗙𝗔𝗦𝗧⚡𓊉", currentSpeed === "Fast",
         "set_speed_FAST", "primary") ],
[ button("back", "KEMBALI", "checker", "danger") ] ];

} else {
      text += `${e.lock} Status Akun Anda: ${statusIcon}\n`+
              `  »  Tidak dapat mengatur Speed Mode\n`+
              `  »  Limit harian: <b>5x Cek / Hari</b>\n` +
              `  »  Limit nomor : <b>500 Nomor / Sesi</b>\n` +
              `──────────────────────`;
  keyboard = [
[ button("diamond", "UPGRADE PREMIUM", "premium", "primary") ],
[ button("back", "KEMBALI", "checker", "danger") ] ];
    }
    return renderMenu(ctx, text, keyboard, fromCallback);
}

// ==============================================================
// 📜 HANDLER HISTORY CEK
// ==============================================================
async function handleHistoryCek(ctx, fromCallback = false) {
const userId = String(ctx.from.id);
  let historyRows = [];
  try {
  const dbCore = require('../data/sqlite');
        historyRows = dbCore.prepare(`
            SELECT id, success, failed, created_at 
            FROM history 
            WHERE user_id = ? AND type = 'CHECKER' 
            ORDER BY created_at DESC 
            LIMIT 8
        `).all(userId);
} catch (e) {
        console.error("[x] Gagal menarik data history:", e.message);
    }

  let text = `${e.history} <b>HISTORY CEK NOMOR WHATSAPP</b>\n` +
             `──────────────────────────\n`;
const keyboard = [];
  if (historyRows.length === 0) {
      text += `${e.inform} <i>ʙᴇʟᴜᴍ ᴀᴅᴀ ʀɪᴡᴀʏᴀᴛ ᴄʜᴇᴄᴋᴇʀ ꜱᴀᴀᴛ ɪɴɪ.</i>\n` +
              `──────────────────────`;
} else {
      text += `<b>${historyRows.length} pengecekan terakhir:</b>`;
      historyRows.forEach((row) => {
const timeObject = new Date(row.created_at);
const shortDate = timeObject.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Jakarta' });
const shortTime = timeObject.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).replace(':', '.');
const totalNomor = (row.success || 0) + (row.failed || 0);

const btnText = `${shortDate}, ${shortTime} — ${totalNomor} nomor`;
      keyboard.push([ button("calendar", btnText,
                             `view_ckhist_${row.id}`, "primary") ]); 
      });
  }
      keyboard.push([ button("back", "KEMBALI", "checker", "danger") ]);
    return renderMenu(ctx, text, keyboard, fromCallback);
}

module.exports = {
   handleChecker,
   handleSpeed,
   handleHistoryCek,
   renderMenu
};

