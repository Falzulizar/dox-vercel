// //DOX//MENUS//LEADERBOARD.JS
const fs = require('fs');
const path = require('path');
const db = require('../database');
// ==============================================================
// 🛡️ OPTIMISASI 1: CACHE CONTENT FILE DI AWAL (ANTI-DISK SLAMMING)
// ==============================================================
let detectorContent = '';
try {
const detectorPath = path.join(__dirname, '../utils/regionDetector.js');
  if (fs.existsSync(detectorPath)) {
      detectorContent = fs.readFileSync(detectorPath, 'utf-8');
  }
} catch (err) {
      console.error(
      "[!] Gagal inisialisasi cache bendera dinamis:", err.message); 
}

function getCountryFlag(name) {
  if (!detectorContent) return "🌍";
  try {
const regex = /name:\s*"([^"]+)"\s*,\s*flag:\s*"([^"]+)"(?:\s*,\s*emojiId:\s*"([^"]+)")?/g;
  let match;
  while ((match = regex.exec(detectorContent)) !== null) {
  if (match[1].toLowerCase() === name.toLowerCase()) {
      if (match[3]) {
          return `<tg-emoji emoji-id="${match[3]}">${match[2]}</tg-emoji>`;
      }
  return match[2]; 
    }
  }
} catch (err) { 
      console.error(
      "[!] Gagal melacak bendera dinamis:", err.message); 
    }
  return "🌍"; 
}

function getMedal(index) {
const medals = [e.medal1, e.medal2, e.medal3, '  ❹ ', '  ❺ ', '  ❻ ', '  ❼ ', '  ❽ ', '  ❾ ', '  ❿ '];
  return medals[index] || '🔹'; 
}

async function renderMenu(ctx, text, keyboard, fromCallback = false) {
const extra = { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } };
  if (fromCallback) {
  return ctx.editMessageText(text, extra).catch(() => {}); 
    }
  return ctx.reply(text, extra); 
}

// ==============================================================
// 🏆 HANDLE LEADERBOARD FOUR-TAB SYSTEM (CLEAN VERTICAL STYLE)
// ==============================================================
async function handleLeaderboard(ctx, fromCallback = false, activeTab = 'checker') {
    try {
if (ctx.from) {
    await db.syncUsername(ctx.from.id, ctx.from.username || ctx.from.first_name);
}

const keyboard = [
[ toggle("CHECKER", "𓊈𝗖𝗛𝗘𝗖𝗞𝗘𝗥𓊉", activeTab === 'checker', "toptab_checker", "primary"),
  toggle("FIXRED", "𓊈𝗙𝗜𝗫𝗥𝗘𝗗𓊉", activeTab === 'fixred', "toptab_fixred", "primary") ],
[ toggle("REGION CEK", "𓊈𝗥𝗘𝗚𝗜𝗢𝗡 𝗖𝗘𝗞𓊉", activeTab === 'regioncek', "toptab_regioncek", "primary"),
  toggle("REGION FIX", "𓊈𝗥𝗘𝗚𝗜𝗢𝗡 𝗙𝗜𝗫𓊉", activeTab === 'regionfix', "toptab_regionfix", "primary") ],
[ button("back", "KEMBALI", "dashboard", "danger") ]
];

  let unitText = 'ɴᴏᴍᴏʀ';

// ────────────────────────────────────────────────────────
// 🌍 SKENARIO 1 & 2: TAB TOP REGION (CHECKER & FIXRED)
// ────────────────────────────────────────────────────────
  if (activeTab === 'regioncek' || activeTab === 'regionfix') {
const regionData = db.readFlatFile('region');
const targetCat = activeTab === 'regioncek' ? 'checker' : 'fixred';
const currentCatData = regionData[targetCat] || {};
const sortedData = Object.entries(currentCatData).sort((a, b) => b[1] - a[1]).slice(0, 10);
const titleLabel = activeTab === 'regioncek' ? 'REGION CHECK' : 'REGION FIXRED';

  let text = `${e.top}⌯${e.globe} 𓊈 <b>TOP ${titleLabel}</b> 𓊉 ${e.globe}⌯${e.top}\n`;
      text += `──────────────────────────\n`;          
  if (sortedData.length === 0) {
      text += `${e.inform} <i>(ʙᴇʟᴜᴍ ᴀᴅᴀ ᴅᴀᴛᴀ ᴘᴀᴅᴀ ᴋᴀᴛᴇɢᴏʀɪ ɪɴɪ)</i>\n`;
} else {
      sortedData.forEach((item, index) => {
const flag = getCountryFlag(item[0]);
      text += `${getMedal(index)}${flag} ${item[0]}\n`;
      text += `  └• <b>${Number(item[1]).toLocaleString('id-ID')}</b> ${unitText}\n`; });
}
    text += `──────────────────────`;
  return renderMenu(ctx, text, keyboard, fromCallback);
}
// ────────────────────────────────────────────────────────
// 👥 SKENARIO 3: RANKING USER GLOBAL (CHECKER & FIXRED)
// ────────────────────────────────────────────────────────
const rawUsers = await db.getAllUsers();        
  let titleLabel = activeTab === 'fixred' ? 'FIXRED' : 'CHECK';
const mappedUsers = rawUsers.map(user => {
  let liveValue = 0;
  if (activeTab === 'checker') {
      liveValue = user.total_numbers || 0; 
} else if (activeTab === 'fixred') {
      liveValue = user.total_fixred || 0; 
    } 
  return { ...user, liveValue };
});         
const sortedUsers = mappedUsers.sort((a, b) => b.liveValue - a.liveValue).slice(0, 10);

let text = `${e.top}⌯𓊈 <b>TOP LEADERBOARD ${titleLabel}</b> 𓊉⌯${e.top}\n`;
    text += `──────────────────────────\n`;        
  if (sortedUsers.length === 0) {
    text += `${e.inform} <i>(ʙᴇʟᴜᴍ ᴀᴅᴀ ᴅᴀᴛᴀ ᴘᴀᴅᴀ ᴋᴀᴛᴇɢᴏʀɪ ɪɴɪ)</i>\n`;
} else {
    sortedUsers.forEach((user, index) => {
const name = user.username ? `@${user.username}` : (user.first_name || 'User');
const safeName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      text += `${getMedal(index)}${safeName}\n`;
      text += `  └• <b>${Number(user.liveValue || 0).toLocaleString('id-ID')}</b> ${unitText}\n`; });
}
      text += `──────────────────────`;

  return renderMenu(ctx, text, keyboard, fromCallback);

} catch (err) {
      console.error(
      "[x] Gagal merender Leaderboard Pusat:", err.message);
  return ctx.reply("❌ Gagal memuat data peringkat server."); 
    }
}

module.exports = { handleLeaderboard };

