// //DOX//HANDLERS//OWNER.JS
const nodemailer = require('nodemailer');
const config = require('../config');
const db = require('../database');

module.exports = function registerOwnerCommands(bot) {

// ==============================================================
// 📢 COMMAND ENGINE: BROADCASTER ADMIN PANEL (/bc)
// ==============================================================
bot.command('bc', async (ctx) => {
const userId = ctx.from.id;
                
  if (String(userId) !== String(config.OWNERID)) {
  return ctx.reply(
`${e.warning} <b>AKSES DITOLAK!</b>
──────────────────────────
Perintah ini hanya khusus untuk Admin.
──────────────────────`, 
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] } 
  }).catch(() => {});
} 
        
const bcText = ctx.payload ? ctx.payload.trim() : '';
  if (!bcText) {
  return ctx.reply(
`${e.warning} <b>FORMAT SALAH!</b>
──────────────────────────
Silakan ketik pesan setelah perintah.

Contoh:
/bc Halo seluruh user bot DOX
──────────────────────`, 
  { parse_mode: 'HTML' });
  }
  if (typeof db.getAllUsers !== 'function') {
return ctx.reply(
`${e.warning} <b>CRITICAL ERROR!</b>
──────────────────────────
Fungsi db.getAllUsers() belum di pasang.
──────────────────────`,
  { parse_mode: 'HTML' });
  }     
const statusMsg = await ctx.reply(
  `${e.hglass} <b>Mengirim Broadcast</b>...`, { parse_mode: 'HTML' });        
  try {
const allUsers = await db.getAllUsers();
  let sukses = 0;
  let gagal = 0;

  for (const u of allUsers) {
       const targetId = u.id || u._id || u.userId || String(u);
  if (!targetId || targetId.length < 5) continue;

  try {
  await ctx.telegram.sendMessage(targetId, bcText, { parse_mode: 'HTML' }); 
      sukses++; 
} catch (err) { 
      gagal++; 
    }
  await new Promise(resolve => setTimeout(resolve, 50)); 
}
            
return ctx.telegram.editMessageText(ctx.chat.id, statusMsg.message_id, null,
`${e.broadcast} <b>INFO BROADCAST!</b>
───────────────────
 ${e.check} <code>Sukses</code>: <b>${sukses} Users</b>
 ${e.cross} <code>Gagal </code>: <b>${gagal} Users</b>
 ${e.chartbar} <code>Total </code>: <b>${allUsers.length} Akun</b>
──────────────`, 
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] } 
  }).catch(() => {});

} catch (err) {
  return ctx.reply('❌ Gagal eksekusi database: ' + err.message); 
}
  });

// ==============================================================
// 🩺 COMMAND ENGINE: HEALTH CHECKER EMAIL WORKER (/mail)
// ==============================================================
bot.command('mail', async (ctx) => {
  try {
const userId = String(ctx.from.id);
const ownerId = String(config.OWNERID);
                        
  if (userId !== ownerId) return;

const infoMsg = await ctx.reply(
`🩺 <b>DIAGNOSIS EMAIL SENDER...</b>
──────────────────────────
${e.hglass2} Mohon tunggu sebentar abangkuh...
──────────────────────`,
  { parse_mode: 'HTML' }).catch(() => {});

const emailSender = db.readFlatFile('email');
  if (emailSender.length === 0) {
  return ctx.reply(`${e.warning} <b>DATABASE KOSONG!</b> Belum ada email worker yang terdaftar.`, { parse_mode: 'HTML' });
  }
            
  let reportText = `🩺 <b>LAPORAN EMAIL SENDER</b>\n`;
      reportText += `──────────────────────────\n`;
      reportText += `${e.chartbar} Total Email: <b>${emailSender.length}</b>\n\n`;
            
  for (let i = 0; i < emailSender.length; i++) {
const sender = emailSender[i];
      reportText += `<b>${i + 1}.</b>${e.robot} <code>${sender.email}</code>\n`;
  try {
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: sender.email, pass: sender.pass },
      connectionTimeout: 5000,
      socketTimeout: 5000
  });                
  await transporter.verify();
        reportText += `     └ ꜱᴛᴀᴛᴜꜱ: ${e.check} <b>ᴀᴄᴛɪᴠᴇ</b>\n`;
} catch (err) {
        reportText += `     └ ꜱᴛᴀᴛᴜꜱ: ${cross} <b>ᴇʀʀᴏʀ</b>\n     └ ᴘᴇꜱᴀɴ: <i>${err.message}</i>\n`;
                }
            }    
        reportText += `──────────────────────`;
                  
  if (infoMsg) await ctx.telegram.deleteMessage(ctx.chat.id, infoMsg.message_id).catch(() => {});
                  
  await ctx.reply(reportText, { 
        parse_mode: 'HTML', 
        reply_markup: { inline_keyboard: [
      [ button("home", "MENU UTAMA", "dashboard", "primary") ]] } 
  });
} catch (err) {
      console.error('\x1b[31m%s\x1b[0m',
      "[x] CRASH AT HEALTH CHECKER COMMAND:", err.message);
  await ctx.reply(`${e.warning} Terjadi kesalahan internal: <i>${err.message}</i>`, { parse_mode: 'HTML' }); 
    }
});

// ==============================================================
// 📥 COMMAND ENGINE: INJECT EMAIL WORKER (/addmail)
// ==============================================================
bot.command('addmail', async (ctx) => {
const userId = String(ctx.from.id);
  if (userId !== String(config.OWNERID)) return;

const payload = ctx.payload ? ctx.payload.trim() : '';
  if (!payload.includes(' ')) {
return ctx.reply(
`${e.warning} <b>FORMAT SALAH ABANGKUH!</b>
──────────────────────────
Gunakan format: /addmail (Email) (Pass)
──────────────────────`,
  { parse_mode: 'HTML' }); 
}        
const firstSpaceIndex = payload.indexOf(' ');
const email = payload.substring(0, firstSpaceIndex).trim();
const pass = payload.substring(firstSpaceIndex + 1).trim();

  if (!email || !pass) {
  return ctx.reply(
  `${e.cross} <b>Error:</b> Email atau Password tidak boleh kosong!`, { parse_mode: 'HTML' });
}        
  try {
  let emailSender = db.readFlatFile('email');
  const index = emailSender.findIndex(w => w.email.toLowerCase() === email.toLowerCase());

  if (index !== -1) {
      emailSender[index].pass = pass;
  if (emailSender[index].success_count === undefined) emailSender[index].success_count = 0;
} else {
      emailSender.push({ email, pass, success_count: 0 }); 
}
      db.writeFlatFile('email', emailSender);

const reportAddMail = 
`${e.check} <b>ADD EMAIL SENDER SUCCESS</b> 
──────────────────────────
${e.mails} : <code>${email}</code>
${e.key} : Tersimpan (App Password)

<i>Berhasil ditambahkan ke sirkuit database!</i>
──────────────────────`;
                      
  await ctx.reply(reportAddMail, { parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
  });
} catch (err) {
  await ctx.reply(
  `${e.cross} <b>GAGAL ADD MAIL:</b> <i>${err.message}</i>`,
  { parse_mode: 'HTML' }); 
  }
});

// ==============================================================
// 🗑️ COMMAND ENGINE: BANISH EMAIL SENDER WORKER (/delmail)
// ==============================================================
bot.command('delmail', async (ctx) => {
const userId = String(ctx.from.id);
  if (userId !== String(config.OWNERID)) return;

const email = ctx.payload ? ctx.payload.trim() : '';
  if (!email) {
return ctx.reply(
`${e.warning} <b>FORMAT SALAH ABANGKUH!</b>
──────────────────────────
Gunakan format: /delmail (Email)
──────────────────────`,
  { parse_mode: 'HTML' } ); 
}
  try {
  let emailSender = db.readFlatFile('email');
const filterSender = emailSender.filter(w => w.email.toLowerCase() !== email.toLowerCase());

  if (emailSender.length === filterSender.length) {
  return ctx.reply(
  `${e.cross} <b>Error:</b> Email tidak ditemukan di database!`,
  { parse_mode: 'HTML' }); 
}
      db.writeFlatFile('email', filterSender);

const reportDelMail = 
`${e.trash} <b>DELETE EMAIL SENDER SUCCESS</b>
──────────────────────────
${e.mails} : <code>${email}</code>

<i>Berhasil dihapus dari database!</i>
──────────────────────`;
                      
  await ctx.reply(reportDelMail, { parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
  });
} catch (err) {
  await ctx.reply(
  `${e.cross} <b>GAGAL DEL MAIL:</b> <i>${err.message}</i>`,
  { parse_mode: 'HTML' }); 
  }
});

// ==============================================================
// 📊 COMMAND ENGINE: THE GACOR INDEX SCORES (/statsmail)
// ==============================================================
bot.command('statsmail', async (ctx) => {
const userId = String(ctx.from.id);
  if (userId !== String(config.OWNERID)) return;

  try {
const emailSender = db.readFlatFile('email');
  if (emailSender.length === 0) {
  return ctx.reply(
  `${e.warning} <b>DATABASE KOSONG!</b> Belum ada email worker terdaftar.`, { parse_mode: 'HTML' });
  }
const sortedSender = [...emailSender].sort((a, b) => (b.success_count || 0) - (a.success_count || 0));

  let reportStats = `${e.top} 𓊈<b>TOP KLASEMEN EMAILSENDER</b>𓊉 ${e.top}\n`;
      reportStats += `──────────────────────────\n`;
      sortedSender.forEach((sender, index) => {
const count = sender.success_count || 0;
  let medal = e.robot;
  if (index === 0) medal = e.medal1;
  else if (index === 1) medal = e.medal2;
  else if (index === 2) medal = e.medal3;
      reportStats += `<b>${index + 1}.</b>${medal} <code>${sender.email}</code>\n`;
      reportStats += `     └ ꜱᴜᴋꜱᴇꜱ: <b>${count} ɴᴏᴍᴏʀ</b>\n`; 
  });
      reportStats += `──────────────────────`;

  await ctx.reply(reportStats, { parse_mode: 'HTML', 
        reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
  });
} catch (err) {
  await ctx.reply(
  `${e.cross} <b>GAGAL LOAD STATS:</b> <i>${err.message}</i>`,
  { parse_mode: 'HTML' }); 
  }
});

// ==============================================================
// 💠 COMMAND ENGINE: ADD PREMIUM USER
// ==============================================================
bot.command('addprem', async (ctx) => {
const userId = String(ctx.from.id);
  if (userId !== String(config.OWNERID)) return;

const args = ctx.payload ? ctx.payload.trim().split(/\s+/) : [];
const targetId = args[0];
const days = args[1];

  if (!targetId || !days || isNaN(days)) {
return ctx.reply(
`${e.warning} <b>FORMAT SALAH ABANGKUH!</b>
──────────────────────────
Silahkan Masukkan ID dan Durasi (Hari) setelah command!

Contoh: /addprem 7701310561 30
──────────────────────`,
  { parse_mode: 'HTML' }); 
}
  try {
const durationMs = parseInt(days) * 24 * 60 * 60 * 1000;
const expiredTime = Date.now() + durationMs;

  await db.addPremium(targetId, days);
            
const dbCore = require('../data/sqlite');
      dbCore.prepare(`
                UPDATE users 
                SET status = 'PREMIUM', premium_expired_at = ? 
                WHERE id = ?
      `).run(expiredTime, targetId);

const reportAdd = 
`${e.diamond} <b>UPGRADE PREMIUM MANUAL</b>
──────────────────────────
${e.ID} : <code>${targetId}</code>
${e.calendar2} : <b>${days} Hari</b>

<i>Berhasil ditambahkan ke Premium!</i>
──────────────────────`;

  const keyboardAdd = { inline_keyboard: [
  [ button("history", "DAFTAR PREMIUM", "listprem", "primary") ],
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]
  ]};
  await ctx.reply(reportAdd, { parse_mode: 'HTML', reply_markup: keyboardAdd });
} catch (err) {
  await ctx.reply(
  `${e.cross} <b>GAGAL ADD PREM:</b> <i>${err.message}</i>`,
    { parse_mode: 'HTML' }); 
  }
});

// ==============================================================
// 🗑️ COMMAND ENGINE: DELETE PREMIUM USER
// ==============================================================
bot.command('delprem', async (ctx) => {
const userId = String(ctx.from.id);
  if (userId !== String(config.OWNERID)) return;

const targetId = ctx.payload ? ctx.payload.trim() : '';
  if (!targetId) {
return ctx.reply(
`${e.warning} <b>FORMAT SALAH!</b>
──────────────────────────
Silahkan masukkan ID setelah command!

Contoh: /delprem 123456789
──────────────────────`,
  { parse_mode: 'HTML' }); 
}        
  try {
  await db.deletePremium(targetId);
            
const dbCore = require('../data/sqlite');
      dbCore.prepare(`
                UPDATE users 
                SET status = 'FREE USER', premium_expired_at = NULL 
                WHERE id = ?
      `).run(targetId);
                      
const reportDel = 
`${e.trash} <b>DELETE PREMIUM MANUAL</b>
──────────────────────────
${e.ID} : <code>${targetId}</code>

<i>Berhasil dihapus dari status Premium!</i>
──────────────────────`;
                      
const keyboardDel = { inline_keyboard: [
  [ button("history", "DAFTAR PREMIUM", "listprem", "primary") ],
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]
  ]};

  await ctx.reply(reportDel, { parse_mode: 'HTML', reply_markup: keyboardDel });
} catch (err) {
  await ctx.reply(
  `${e.cross} <b>GAGAL DEL PREM:</b> <i>${err.message}</i>`,
  { parse_mode: 'HTML' }); 
  }
});

// ==============================================================
// 📋 COMMAND ENGINE: LIST ALL PREMIUM USERS (/listprem)
// ==============================================================
bot.command('listprem', async (ctx) => {
const userId = String(ctx.from.id);
  if (userId !== String(config.OWNERID)) return;
  try {
const premiumUsers = await db.getPremiumUsers();
  let listText = `${e.history} <b>DAFTAR USER PREMIUM</b>\n`;
      listText += `──────────────────────────\n`;       
  if (premiumUsers.length === 0) {
      listText += `${e.inform} <i>ʙᴇʟᴜᴍ ᴀᴅᴀ ᴜꜱᴇʀ ʏᴀɴɢ ᴛᴇʀᴅᴀꜰᴛᴀʀ.</i>\n`;
} else {
      premiumUsers.forEach((user, index) => {
const safeUser = user.username !== '-' ? user.username.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
      listText += `<b>${index + 1}.</b> ID: <code>${user.id}</code> ${safeUser ? `(@${safeUser})` : ''}\n`; 
  }); 
}
      listText += `──────────────────────`;
                  
const keyboardList = { inline_keyboard: [
[ button("home", "MENU UTAMA", "dashboard", "primary") ]] };
  await ctx.reply(listText, { parse_mode: 'HTML', reply_markup: keyboardList });
} catch (err) {
  await ctx.reply(
  `${e.cross} <b>GAGAL AMBIL LIST PREM:</b> <i>${err.message}</i>`,
  { parse_mode: 'HTML' }); 
  }
});

// ==============================================================
// 🎛 *ACTION HANDLER: INLINE INTERACTION LIST PREMIUM*
// ==============================================================
bot.action('listprem', async (ctx) => {
const userId = String(ctx.from.id);
  if (userId !== String(config.OWNERID)) {
  return ctx.answerCbQuery('Akses Khusus Admin! ❌', { show_alert: true }).catch(() => {});  
  }
await ctx.answerCbQuery(
  `⏳ Loading List Premium... `).catch(() => {});
  try {
  const premiumUsers = await db.getPremiumUsers();
  let listText = `${e.history} <b>DAFTAR USER PREMIUM</b>\n`;
      listText += `──────────────────────────\n`;
  if (premiumUsers.length === 0) {
      listText += `${e.inform} <i>ʙᴇʟᴜᴍ ᴀᴅᴀ ᴜꜱᴇʀ ʏᴀɴɢ ᴛᴇʀᴅᴀꜰᴛᴀʀ.</i>\n`;
} else {
      premiumUsers.forEach((user, index) => {
const safeUser = user.username !== '-' ? user.username.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
      listText += `<b>${index + 1}.</b> ID: <code>${user.id}</code> ${safeUser ? `(@${safeUser})` : ''}\n`; 
  }); 
}
      listText += `──────────────────────`;
                  
const keyboardList = { inline_keyboard: [
[ button("home", "MENU UTAMA", "dashboard", "primary") ]] };
  await ctx.editMessageText(listText, { parse_mode: 'HTML', reply_markup: keyboardList }).catch(() => {});
} catch (err) {
  await ctx.reply(
  `${e.cross} <b>GAGAL PROSES ACTION LIST:</b> <i>${err.message}</i>`, { parse_mode: 'HTML' }); 
    }
  });
};

