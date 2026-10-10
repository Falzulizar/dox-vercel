// //DOX//MENUS//BANTUAN.JS
const config = require('../config');

async function handleBantuan(ctx, fromCallback = true, tab = 'checker') {
    try {
        let textHelp = '';

const keyboard = [
[ toggle("❓CHECKER❓", "𓊈𝗖𝗛𝗘𝗖❓𝗞𝗘𝗥𓊉", tab === 'checker', "helptab_checker", "primary"),
    toggle("❓FIXRED❓", "𓊈𝗙𝗜𝗫❓𝗥𝗘𝗗𓊉", tab === 'fixred', "helptab_fixred", "primary") ],
[ urlbutton( "message", "CHAT ADMIN",
             "https://t.me/rezardomilos", "primary" ) ],
[ button("back", "KEMBALI", "dashboard", "danger") ]
];

// =================================================================
// 📑 KONDISI TAB 1: PANDUAN CHECKER WHATSAPP (PAS 21 BARIS)
// =================================================================
  if (tab === 'checker') {
textHelp = 
`${e.question} <b>PANDUAN UTAMA CHECKER</b>
──────────────────────────
${e.one} <b>PENAUTAN WORKER</b>
  ├ᴍᴀꜱᴜᴋ ᴋᴇ ᴅᴀʟᴀᴍ ᴍᴇɴᴜ <b>WORKER</b>
  ├ᴋʟɪᴋ <b>ADD WORKER</b> & ᴘɪʟɪʜ ᴍᴇᴛᴏᴅᴇ
  ├ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ / ꜱᴄᴀɴ ǫʀ ᴡʜᴀᴛꜱᴀᴘᴘ
  └────────────────────────
${e.two} <b>CARA PENGGUNAAN</b>
  ├ᴍᴀꜱᴜᴋ ᴋᴇ ᴅᴀʟᴀᴍ ᴍᴇɴᴜ <b>CHECKER</b>
  ├ᴋɪʀɪᴍ ɴᴏᴍᴏʀ ᴛᴀʀɢᴇᴛ ᴠɪᴀ ᴋᴇᴛɪᴋ
  ├ᴀᴛᴀᴜ ᴋɪʀɪᴍ ꜰɪʟᴇ ʙᴇʀʙᴀꜱɪꜱ .txt / .xlsx
  ├ᴅɪᴡᴀᴊɪʙᴋᴀɴ 𝟷 ɴᴏᴍᴏʀ ᴘᴇʀʙᴀʀɪꜱ
  └────────────────────────
${e.three} <b>HASIL LAPORAN</b>
  ├ʙᴏᴛ ᴍᴇᴍɪꜱᴀʜᴋᴀɴ ɴᴏᴍᴏʀ ᴏᴛᴏᴍᴀᴛɪꜱ
  ├ᴛᴇʀᴅᴀꜰᴛᴀʀ ᴡᴀ (ʙɪᴏ,ʙɪꜱɴɪꜱ,& ɴᴏ ᴄᴀɴᴛɪᴋ)
  ├ᴛɪᴅᴀᴋ ᴛᴇʀᴅᴀꜰᴛᴀʀ ᴡᴀ
  └────────────────────────
${e.pin} <i>ᴘᴀꜱᴛɪᴋᴀɴ ꜱᴛᴀᴛᴜꜱ ᴡᴏʀᴋᴇʀ ᴀɴᴅᴀ ꜱᴇᴅᴀɴɢ
ᴀᴋᴛɪꜰ ꜱᴇʙᴇʟᴜᴍ ᴍᴇᴍᴜʟᴀɪ ᴘᴇɴɢᴇᴄᴇᴋᴀɴ.</i>
──────────────────────`;

// =================================================================
// 📑 KONDISI TAB 2: PANDUAN BANDING FIXRED (PAS 21 BARIS)
// =================================================================
} else if (tab === 'fixred') {
textHelp = 
`${e.question} <b>PANDUAN BANDING FIXRED</b>
──────────────────────────
${e.one} <b>FUNGSI FIXRED</b>
  ├ꜰɪᴛᴜʀ ᴋʜᴜꜱᴜꜱ ᴛᴇᴍʙᴀᴋ ʙᴀɴᴅɪɴɢ ɴᴏᴍᴏʀ
  ├ᴛᴀʀɢᴇᴛ ɴᴏᴍᴏʀ ʏᴀɴɢ ᴛᴇʀᴋᴇɴᴀ ᴍᴇʀᴀʜ
  ├ᴋᴏɴᴅɪꜱɪ <b>"ʟᴏɢɪɴ ᴛɪᴅᴀᴋ ᴛᴇʀꜱᴇᴅɪᴀ"</b>
  └────────────────────────
${e.two} <b>CARA PENGGUNAAN</b>
  ├ᴍᴀꜱᴜᴋ ᴋᴇ ᴅᴀʟᴀᴍ ᴍᴇɴᴜ <b>FIXRED</b>
  ├ᴍᴀꜱᴜᴋᴀɴ ꜱᴀᴛᴜ ɴᴏᴍᴏʀ ᴛᴀʀɢᴇᴛ ꜱᴀᴊᴀ
  ├ᴄᴏɴᴛᴏʜ: 628xxxxx ᴀᴛᴀᴜ +628xxxx
  ├ᴘᴀꜱᴛɪᴋᴀɴ ɴᴏᴍᴏʀ ꜱᴜᴅᴀʜ ᴛᴇʀᴅᴀꜰᴛᴀʀ ᴡᴀ
  └────────────────────────
${e.three} <b>MONITORING & ANTRIAN</b>
  ├ᴘʀᴏꜱᴇꜱ ᴛᴀɴᴘᴀ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜱᴇɴᴅᴇʀ
  ├ᴄᴇᴋ ᴋᴇᴘᴀᴅᴀᴛᴀɴ ᴅɪ <b>STATS ANTRIAN</b>
  ├ʙᴏᴛ ᴋɪʀɪᴍ ɴᴏᴛɪꜰ ᴋᴀʟᴏ ᴜᴅᴀʜ ᴋᴇʟᴀʀ
  └────────────────────────
${e.pin} <i>ꜱᴇᴛɪᴀᴘ ᴘᴇɴɢᴀᴊᴜᴀɴ ᴍᴇᴍʙᴜᴛᴜʜᴋᴀɴ
ᴡᴀᴋᴛᴜ ᴛᴇʀɢᴀɴᴛᴜɴɢ ᴀɴᴛʀᴇᴀɴ ꜱᴇʀᴠᴇʀ.</i>
──────────────────────`;
        }

const extraOptions = { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } };

  if (ctx.callbackQuery && fromCallback) {
  await ctx.editMessageText(textHelp, extraOptions).catch((err) => {
      console.error("[-] Gagal update callback bantuan:", err.message);
});
} else {
  await ctx.reply(textHelp, extraOptions).catch((err) => {
      console.error(
      "[-] Gagal kirim pesan baru bantuan:", err.message);
  });
}
} catch (globalErr) {
      console.error(
      "[x] GAGAL TOTAL RENDERING BANTUAN ENGINE:", globalErr.message);
  }
}

module.exports = { handleBantuan };

