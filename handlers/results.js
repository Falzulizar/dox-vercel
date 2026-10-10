// //DOX//HANDLERS//RESULTS.JS
const axios = require('axios');
const config = require('../config');
const dbCore = require('../data/sqlite');

const keyMap = {
    'terdaftar': 'terdaftar',
    'tidakterdaftar': 'tidakTerdaftar',
    'adabio': 'adaBio',
    'tanpabio': 'tanpaBio',
    'business': 'metaBusinessList',
    'nomorcantik': 'nomorCantikList'
};

const titleMap = {
    'terdaftar': 'TERDAFTAR WA',
    'tidakterdaftar': 'TIDAK TERDAFTAR',
    'adabio': 'ADA BIO',
    'tanpabio': 'TANPA BIO',
    'business': 'WA BUSINESS',
    'nomorcantik': 'NOMOR CANTIK'
};

function getCacheData(secureKey) {
  try {
      const row = dbCore.prepare('SELECT cache_value FROM cache WHERE cache_key = ?').get(secureKey);
      return row ? JSON.parse(row.cache_value) : null;
  } catch (err) { return null; }
}

const renderListResult = async (ctx, rawKeyType, titleName, page = 0, randomLogId = null) => {
const userId = String(ctx.from.id);
const chatKey = String(ctx.chat.id);
const secureKey = (randomLogId && randomLogId !== 'NONE') ? `${userId}_${randomLogId}` : chatKey;
    
const cacheData = getCacheData(secureKey);

  if (!cacheData) {
  return ctx.answerCbQuery('❌ Sesi rincian hasil pengecekan telah hangus!', { show_alert: true }).catch(() => {}); }

const actualKey = keyMap[rawKeyType];
  if (!cacheData[actualKey] || cacheData[actualKey].length === 0) {
  return ctx.answerCbQuery(`❌ Tidak ada nomor dalam kategori ini!`, { show_alert: true }).catch(() => {}); }

  await ctx.answerCbQuery().catch(() => {});

const listData = cacheData[actualKey];
const totalItems = listData.length;
const pageSize = 10;
const totalPages = Math.ceil(totalItems / pageSize);
const pageData = listData.slice(page * pageSize, (page + 1) * pageSize);

let textResult = `${e.history} <b>LIST DATA: ${titleName}</b>\n` +
                 `──────────────────────────\n` +
                 `📄 Halaman: <b>${page + 1} / ${totalPages}</b> | Total: <b>${totalItems}</b> Nomor\n\n` +
      pageData.map(num => ` <code>${num}</code>`).join('\n') +
                 `\n──────────────────────`;

const inlineKeyboard = [];
const navRow = [];

  if (page > 0) {
      navRow.push({ text: '⬅️', callback_data: `nav_${rawKeyType}_${page - 1}_${randomLogId || 'NONE'}` }); }
   
  if (page < totalPages - 1) {
      navRow.push({ text: '➡️', callback_data: `nav_${rawKeyType}_${page + 1}_${randomLogId || 'NONE'}` }); }

  if (navRow.length > 0) inlineKeyboard.push(navRow);
      inlineKeyboard.push([ button("inbox", "DOWNLOAD FILE .TXT", `dl_${rawKeyType}_${randomLogId || 'NONE'}`) ]);
      inlineKeyboard.push([ button("back", "KEMBALI", `restore_summary_view_${randomLogId || 'NONE'}`) ]);

  await ctx.telegram.editMessageText(ctx.chat.id, ctx.callbackQuery.message.message_id, null, textResult, { 
        parse_mode: 'HTML', 
        reply_markup: { inline_keyboard: inlineKeyboard }
}).catch(() => {}); 
};

module.exports = function registerResultHandlers (bot) {
    bot.action(/nav_(terdaftar|tidakterdaftar|adabio|tanpabio|business|nomorcantik)_(\d+)_([\w-]+)/, async (ctx) => {
const rawKeyType = ctx.match[1];
const page = parseInt(ctx.match[2], 10);
const randomLogId = ctx.match[3] === 'NONE' ? null : ctx.match[3];
    await renderListResult(ctx, rawKeyType, titleMap[rawKeyType], page, randomLogId);
});

    bot.action(/view_list_(terdaftar|tidakterdaftar|adabio|tanpabio|business|nomorcantik)(?:_([\w-]+))?/, async (ctx) => {
const rawKeyType = ctx.match[1];
const randomLogId = ctx.match[2] || 'NONE';
    await renderListResult(ctx, rawKeyType, titleMap[rawKeyType], 0, randomLogId);
});
    bot.action(/dl_(terdaftar|tidakterdaftar|adabio|tanpabio|business|nomorcantik)_([\w-]+)/, async (ctx) => {
const rawKeyType = ctx.match[1];
const randomLogId = ctx.match[2] === 'NONE' ? null : ctx.match[2];
const userId = String(ctx.from.id);
const chatKey = String(ctx.chat.id);
const secureKey = (randomLogId && randomLogId !== 'NONE') ? `${userId}_${randomLogId}` : chatKey;

const cacheData = getCacheData(secureKey);

  if (!cacheData) {
  return ctx.answerCbQuery('❌ Sesi hasil pengecekan telah kadaluwarsa!', { show_alert: true }).catch(() => {}); }

const actualKey = keyMap[rawKeyType];
const listData = cacheData[actualKey];
  if (!listData || listData.length === 0) {
  return ctx.answerCbQuery('❌ Tidak ada nomor dalam kategori ini untuk diunduh!', { show_alert: true }).catch(() => {}); }

  await ctx.answerCbQuery('📥 Sedang memproses dokumen...').catch(() => {});

const fileContent = listData.join('\n');
const formattedTitle = titleMap[rawKeyType].replace(/ /g, '_');
const filename = `${formattedTitle}_${randomLogId || 'MURNI'}.txt`;
const captionText = `${e.inbox} : <b>${titleMap[rawKeyType]}</b> | ${e.total} : <b>${listData.length} Nomor</b>`;

const createPayload = () => {
const form = new FormData();
const blob = new Blob([fileContent], { type: 'text/plain' });
      form.append('chat_id', String(ctx.chat.id));
      form.append('document', blob, filename);
      form.append('caption', captionText);
      form.append('parse_mode', 'HTML');
  return form;
};
  try {
  await axios.post(`https://api.telegram.org/bot${config.TOKEN}/sendDocument`, createPayload());
} catch (err) {
      console.error("[x] AXIOS MULTIPART BYPASS FAILED, TRYING NATIVE FETCH:", err.message);
  try {
  await fetch(`https://api.telegram.org/bot${config.TOKEN}/sendDocument`, {
      method: 'POST',
      body: createPayload()
});
} catch (fetchErr) {
      console.error("[x] CRITICAL SYSTEM JALUR DUA GAGAL:", fetchErr.message);
  await ctx.reply("⚠️ <b>KONEKSI API TELEGRAM SIBUK</b>\n──────────────────────────\nGagal mengirim file dokumen.", { parse_mode: 'HTML' }).catch(() => {}); }
    }
});

    bot.action(/restore_summary_view_([\w-]+)/, async (ctx) => {
const randomLogId = ctx.match[1] === 'NONE' ? null : ctx.match[1];
const userId = String(ctx.from.id);
const chatKey = String(ctx.chat.id);
const secureKey = (randomLogId && randomLogId !== 'NONE') ? `${userId}_${randomLogId}` : chatKey;

const cacheData = getCacheData(secureKey);

  if (!cacheData) return ctx.answerCbQuery('⚠️ Sesi ringkasan kadaluwarsa.', { show_alert: true }).catch(() => {});

  await ctx.answerCbQuery().catch(() => {});
  await ctx.telegram.editMessageText(ctx.chat.id, ctx.callbackQuery.message.message_id, null, cacheData.teksStatistik, { 
        parse_mode: 'HTML', 
        reply_markup: { inline_keyboard: [
[ button("yes", `(${cacheData.terdaftar?.length || 0})`, `view_list_terdaftar_${randomLogId || 'NONE'}`, "success"), 
  button("no", `(${cacheData.tidakTerdaftar?.length || 0})`, `view_list_tidakterdaftar_${randomLogId || 'NONE'}`, "danger") ],
[ button("memo", `(${cacheData.adaBio?.length || 0})`, `view_list_adabio_${randomLogId || 'NONE'}`, "success"), 
  button("forbid", `(${cacheData.tanpaBio?.length || 0})`, `view_list_tanpabio_${randomLogId || 'NONE'}`, "danger") ],
[ button("office", `(${cacheData.metaBusinessList?.length || 0})`, `view_list_business_${randomLogId || 'NONE'}`, "primary"),
  button("sparkles", `(${cacheData.nomorCantikList?.length || 0})`, `view_list_nomorcantik_${randomLogId || 'NONE'}`, "primary") ],
[ button("search", "CEK LAGI", `checker_report_${randomLogId || 'NONE'}`, "primary"),
  button("home", "MENU UTAMA", "dashboard", "primary") ] ] }
}).catch(() => {});
    });
};

