// //DOX//HANDLERS//CHECKER.JS
const axios = require('axios');
const XLSX = require('xlsx');
const config = require('../config');
const premium = require('../utils/premium');
const userState = require('../utils/state');
const db = require('../database');
const workerManager = require('../worker');
const { processNumbersEngine } = require('../checker/engine');
const { detectRegion } = require('../utils/regionDetector');

function owner(userId) { 
    return String(userId) === String(config.OWNERID); 
}

function extractNumbersFromExcel(fileBuffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    let extractedNumbers = [];
    workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const dataRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        dataRows.forEach((row) => {
            if (!Array.isArray(row)) return;
            row.forEach((cellValue) => {
                if (cellValue) {
                    const cleanNumber = String(cellValue).trim().replace(/[^0-9+]/g, '');
                    if (cleanNumber.length >= 9) {
                        extractedNumbers.push(cleanNumber); 
                    }
                }
            });
        });
    });
    return [...new Set(extractedNumbers)]; 
}

// ==============================================================
// 🔌 INJEKTOR BATCH REGION CHECKER (ANTI-BUG TOP REGION)
// ==============================================================
function injectCheckerRegionStats(rawLines) {
    try {
        const regionData = db.readFlatFile('region');
        if (!regionData.checker) regionData.checker = {};

        rawLines.forEach(line => {
            const rawNumber = String(line).replace(/[^0-9]/g, '');
            if (rawNumber.length >= 9) {
                const targetNumber = rawNumber.startsWith('0') ? '62' + rawNumber.slice(1) : rawNumber;
                const regionInfo = detectRegion([targetNumber]);
                
                if (regionInfo && regionInfo.name) {
                    regionData.checker[regionInfo.name] = (regionData.checker[regionInfo.name] || 0) + 1; 
                }
            }
        });
        db.writeFlatFile('region', regionData);
    } catch (err) {
    console.error(
    '[x] GAGAL MENYUNTIKKAN DATA POIN REGION CHECKER:', err.message);
    }
}

// ==============================================================
// 📱 HANDLER UTAMA INPUT TEKS MANUAL
// ==============================================================
async function handleManualInput(ctx, text) {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;

    if (global.sessionStore[chatId]?.ignore_manual) return;

    const totalNomor = text.split('\n').filter(x => x.trim()).length;
    const LIMIT_MAKSIMAL = 250; 

    if (totalNomor > LIMIT_MAKSIMAL) {
        const menuMsgId = global.sessionStore[chatId]?.checker_message_id;
        if (menuMsgId) { 
            await ctx.telegram.deleteMessage(chatId, menuMsgId).catch(() => {});
            delete global.sessionStore[chatId].checker_message_id; 
        }

        if (!global.sessionStore[chatId]) global.sessionStore[chatId] = {};
        global.sessionStore[chatId].ignore_manual = true;
    
        setTimeout(() => {
            if (global.sessionStore[chatId]) delete global.sessionStore[chatId].ignore_manual;
            if (userState[userId] === "WAIT_BIO") delete userState[userId];
        }, 1500);

        return ctx.reply(
`${e.warning} <b>INPUT OVERLOAD DETECTED!</b>
──────────────────────────
ᴛᴇʀᴅᴇᴛᴇᴋꜱɪ <b>${totalNomor}</b> ɴᴏᴍᴏʀ ᴅᴀʀɪ ɪɴᴘᴜᴛ ᴛᴇxᴛ.
<i>ꜱɪꜱᴛᴇᴍ ᴛᴇʟᴇɢʀᴀᴍ ᴍᴇᴍʙᴀᴛᴀꜱɪ ᴘᴀɴᴊᴀɴɢ
ᴍᴀᴋꜱɪᴍᴀʟ ꜱᴇʙᴜᴀʜ ᴘᴇꜱᴀɴ.</i>

${e.bulb} <i>ᴅɪꜱᴀʀᴀɴᴋᴀɴ ᴋɪʀɪᴍ ᴜʟᴀɴɢ ᴍᴇʟᴀʟᴜɪ
ᴍᴇᴛᴏᴅᴇ ᴘᴇɴɢɪʀɪᴍᴀɴ ᴅᴏᴋᴜᴍᴇɴ ʙᴇʀꜰᴏʀᴍᴀᴛ:
.txt ᴀᴛᴀᴜ .xlsx.</i>
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("search", "CEK ULANG", "checker", "primary") ]] }
  }).catch(() => {}); 
}   
const isOwner = owner(userId);
const isPremium = premium(userId);
const todayStr = new Date().toLocaleDateString('id-ID', { 
      timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' 
}).replace(/\//g, '-');
                    
const userDb = await db.getUser(userId);
const currentUsage = (userDb && userDb.last_check_date === todayStr) ? (userDb.daily_count || 0) : 0;

  if (!isOwner && !isPremium && currentUsage >= 5) { 
return ctx.reply(
`${e.warning} <b>LIMIT CHECKING!</b>
──────────────────────────
<i>ꜰʀᴇᴇ ᴜꜱᴇʀ ᴄᴜᴍᴀ ʙɪꜱᴀ ʟᴀᴋᴜᴋᴀɴ 𝟻 ᴋᴀʟɪ
ᴘᴇɴɢᴇᴄᴇᴋᴀɴ ᴘᴇʀ ʜᴀʀɪ.

ꜱɪʟᴀʜᴋᴀɴ ᴜᴘɢʀᴀᴅᴇ ᴋᴇ ᴘʀᴇᴍɪᴜᴍ ᴜɴᴛᴜᴋ
ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴀᴋꜱᴇꜱ ᴛᴀɴᴘᴀ ʙᴀᴛᴀꜱ!</i>
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("diamond", "UPGRADE PREMIUM", "premium", "primary") ],
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]
    ]}
  }).catch(() => {}); 
}        

const userWorkers = workerManager.workers ? workerManager.workers.filter(w => String(w.ownerId) === String(userId)) : [];
  if (userWorkers.length === 0) { 
return ctx.reply(
`${e.warning} <b>TIDAK DAPAT MEMPROSES!</b>
──────────────────────────
<i>ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴡᴏʀᴋᴇʀ ʏᴀɴɢ ᴛᴇʀʜᴜʙᴜɴɢ ꜱᴀᴀᴛ ɪɴɪ.
ꜱɪʟᴀʜᴋᴀɴ ʜᴜʙᴜɴɢᴋᴀɴ ᴛᴇʀʟᴇʙɪʜ ᴅᴀʜᴜʟᴜ!</i>
──────────────────────`, 
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("plus", "ADD WORKER", "add_worker", "success") ],
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]
    ]}
  }).catch(() => {}); 
}    

const rawLines = text.split('\n').filter(x => x.trim());
  if (!isOwner && !isPremium && rawLines.length > 500) {
return ctx.reply(
`${e.warning} <b>LIMIT MAKSIMAL NOMOR!</b>
──────────────────────────
<i>ꜰʀᴇᴇ ᴜꜱᴇʀ ᴍᴀᴋꜱɪᴍᴀʟ ʜᴀɴʏᴀ ʙɪꜱᴀ ᴍᴇɴɢᴇᴄᴇᴋ
<b>𝟻𝟶𝟶 ɴᴏᴍᴏʀ</b> ᴅᴀʟᴀᴍ ꜱᴇᴋᴀʟɪ ᴋɪʀɪᴍ.

ꜱɪʟᴀʜᴋᴀɴ ᴜᴘɢʀᴀᴅᴇ ᴋᴇ ᴘʀᴇᴍɪᴜᴍ ᴜɴᴛᴜᴋ
ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴀᴋꜱᴇꜱ ᴛᴀɴᴘᴀ ʙᴀᴛᴀꜱ!</i>
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("diamond", "UPGRADE PREMIUM", "premium", "primary") ],
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]
    ]}
  }).catch(() => {}); 
}        

  delete userState[userId];
  await db.updateDailyLimit(userId, todayStr, currentUsage + 1); 

const menuMsgId = global.sessionStore[chatId]?.checker_message_id;
  if (menuMsgId) { 
  await ctx.telegram.deleteMessage(chatId, menuMsgId).catch(() => {});
  delete global.sessionStore[chatId].checker_message_id; 
}    
  if (typeof processNumbersEngine === 'function') {
const loadingMsg = await ctx.reply(
  `${e.hglass2} <b>Menyiapkan data...</b>`, { parse_mode: 'HTML' });
      injectCheckerRegionStats(rawLines);
      processNumbersEngine(ctx, rawLines, workerManager, loadingMsg.message_id); 
} else { 
  ctx.reply(
`${e.warning} <b>TERJADI KESALAHAN!</b>
──────────────────────────
<i>ʙᴇʀᴋᴀꜱ ꜱɪꜱᴛᴇᴍ ᴄʜᴇᴄʜᴇʀ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ.</i>
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("search", "CEK ULANG", "checker", "primary") ]] }
  }).catch(() => {}); 
  } 
}

// ==============================================================
// 📂 HANDLER UTAMA INPUT BERKAS (.TXT & EXCEL .XLSX/.XLS)
// ==============================================================
async function handleDocumentInput(ctx) {
    const doc = ctx.message.document;
    const fileName = doc.file_name.toLowerCase();
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

  if (!fileName.endsWith('.txt') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
return ctx.reply(
`${e.warning} <b>VALIDASI GAGAL!</b>
──────────────────────────
<i>ꜱɪꜱᴛᴇᴍ ʜᴀɴʏᴀ ᴍᴇɴᴇʀɪᴍᴀ ꜰɪʟᴇ ʙᴇʀꜰᴏʀᴍᴀᴛ
.txt, .xls, ᴀᴛᴀᴜ .xlsx</i>
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("search", "CEK ULANG", "checker", "primary") ]] }
  }).catch(() => {}); 
}    
  try {
const isOwner = owner(userId);
const isPremium = premium(userId);
const todayStr = new Date().toLocaleDateString('id-ID', { 
      timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' 
        }).replace(/\//g, '-');

const userDb = await db.getUser(userId);
const currentUsage = (userDb && userDb.last_check_date === todayStr) ? (userDb.daily_count || 0) : 0;

  if (!isOwner && !isPremium && currentUsage >= 5) {
return ctx.reply(
`${e.warning} <b>LIMIT CHECKING!</b>
──────────────────────────
<i>ꜰʀᴇᴇ ᴜꜱᴇʀ ᴄᴜᴍᴀ ʙɪꜱᴀ ʟᴀᴋᴜᴋᴀɴ 𝟻 ᴋᴀʟɪ
ᴘᴇɴɢᴇᴄᴇᴋᴀɴ ᴘᴇʀ ʜᴀʀɪ.

ꜱɪʟᴀʜᴋᴀɴ ᴜᴘɢʀᴀᴅᴇ ᴋᴇ ᴘʀᴇᴍɪᴜᴍ ᴜɴᴛᴜᴋ
ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴀᴋꜱᴇꜱ ᴛᴀɴᴘᴀ ʙᴀᴛᴀꜱ!</i>
──────────────────────`,
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("diamond", "UPGRADE PREMIUM", "premium", "primary") ],
  [ button("home", "MENU UTAMA", "dashboard", "primary") ] ]}
  }).catch(() => {});
}        
const userWorkers = workerManager.workers ? workerManager.workers.filter(w => String(w.ownerId) === String(userId)) : [];
  if (userWorkers.length === 0) { 
return ctx.reply(
`${e.warning} <b>TIDAK DAPAT MEMPROSES!</b>
──────────────────────────
<i>ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴡᴏʀᴋᴇʀ ʏᴀɴɢ ᴛᴇʀʜᴜʙᴜɴɢ ꜱᴀᴀᴛ ɪɴɪ.</i>
──────────────────────`, 
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("plus", "ADD WORKER", "add_worker", "success") ],
  [ button("home", "MENU UTAMA", "dashboard", "primary") ] ]}
  }).catch(() => {}); 
}        
const menuMsgId = global.sessionStore[chatId]?.checker_message_id;
const fileUrl = await ctx.telegram.getFileLink(doc.file_id);
        
  let rawLines = [];

  if (fileName.endsWith('.txt')) {
const response = await axios.get(fileUrl.href);
      rawLines = response.data.split(/\r?\n/).filter(line => line.trim() !== '');
} else {
const response = await axios.get(fileUrl.href, { responseType: 'arraybuffer' });
const buffer = Buffer.from(response.data);
      rawLines = extractNumbersFromExcel(buffer);
}
  if (rawLines.length === 0) {
const txtEmpty = 
`${e.warning} <b>TIDAK DAPAT MEMPROSES!</b>
──────────────────────────
<i>ɪꜱɪ ʙᴇʀᴋᴀꜱ ꜰɪʟᴇ ᴀɴᴅᴀ ᴋᴏꜱᴏɴɢ ᴀᴛᴀᴜ ᴛɪᴅᴀᴋ
ᴅɪᴛᴇᴍᴜᴋᴀɴ ɴᴏᴍᴏʀ ʏᴀɴɢ ᴠᴀʟɪᴅ!</i>
──────────────────────`;
  const kbEmpty = { inline_keyboard: [
  [ button("search", "CEK ULANG", "checker", "primary") ]] };
                        
  if (menuMsgId) { 
  return ctx.telegram.editMessageText(chatId, menuMsgId, null, txtEmpty, { parse_mode: 'HTML', reply_markup: kbEmpty }).catch(() => {}); 
}
  return ctx.reply(txtEmpty, { parse_mode: 'HTML', reply_markup: kbEmpty }).catch(() => {});
}    
  if (!isOwner && !isPremium && rawLines.length > 500) {
const txtLimit = 
`${e.warning} <b>LIMIT MAXIMUM NUMBER!</b>
──────────────────────────
<i>ʙᴇʀᴋᴀꜱ ꜰʀᴇᴇ ᴜꜱᴇʀ ᴍᴀᴋꜱɪᴍᴀʟ ʙᴇʀɪꜱɪ 𝟻𝟶𝟶 ɴᴏᴍᴏʀ!!</i>
──────────────────────`;
const kbLimit = { inline_keyboard: [
  [ button("diamond", "UPGRADE PREMIUM", "premium", "primary") ],
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]
]};
  if (menuMsgId) { 
  return ctx.telegram.editMessageText(chatId, menuMsgId, null, txtLimit, { parse_mode: 'HTML', reply_markup: kbLimit }).catch(() => {}); 
  }
  return ctx.reply(txtLimit, { parse_mode: 'HTML', reply_markup: kbLimit }).catch(() => {});
}        
  await db.updateDailyLimit(userId, todayStr, currentUsage + 1); 

  if (menuMsgId) { 
  await ctx.telegram.deleteMessage(chatId, menuMsgId).catch(() => {}); 
  delete global.sessionStore[chatId].checker_message_id; 
  }
        
  if (typeof processNumbersEngine === 'function') {
const initialMsg = await ctx.reply(`${e.hglass2} <b>Menyiapkan data...</b>`, { parse_mode: 'HTML' });
      injectCheckerRegionStats(rawLines);
      processNumbersEngine(ctx, rawLines, workerManager, initialMsg.message_id); 
  }
} catch (err) { 
      console.error(err); 
      ctx.reply(
'❌ Terjadi kesalahan internal saat membaca berkas.').catch(() => {}); 
    }
}

module.exports = { handleManualInput, handleDocumentInput };

