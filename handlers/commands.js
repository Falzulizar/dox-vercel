// //DOX//HANDLERS//COMMANDS.JS
const config = require('../config');
const userState = require('../utils/state');
const db = require('../database');
const menu = require('../menus/router');
const workerManager = require('../worker');
const checkerHandler = require('./checker');

function owner(userId) { 
  return String(userId) === String(config.OWNERID); 
}

module.exports = function registerCoreCommands(bot) {

// ==============================================================
// 🎯 MASTER COMMANDS LISTENER (PINTU UTAMA & GERBANG REFERRAL)
// ==============================================================
bot.start(async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = String(ctx.from.id);
          
  if (global.sessionStore[chatId]) delete global.sessionStore[chatId].stage;
  if (userState[ctx.from.id]) delete userState[ctx.from.id];

  try {
const user = await db.getOrCreateUser(userId, ctx.from.username || ctx.from.first_name);
const payload = ctx.startPayload ? String(ctx.startPayload).trim() : '';

  if (payload.startsWith('ref_')) {
const inviterId = payload.replace('ref_', '').trim();
              
  if (inviterId !== userId && (!user || !user.referredBy)) {
const dbCore = require('../data/sqlite');
const inviter = dbCore.prepare('SELECT total_coins, total_referrals FROM users WHERE id = ?').get(inviterId);
                    
  if (inviter) {
const currentCoins = inviter.total_coins || 0;
  let newCoins = currentCoins + 5;
  if (newCoins > 1000) newCoins = 1000;

      dbCore.prepare(`UPDATE users SET total_coins = ?, total_referrals = IFNULL(total_referrals, 0) + 1 WHERE id = ?
                        `).run(newCoins, inviterId);

      dbCore.prepare(`UPDATE users SET referredBy = ? WHERE id = ?
                        `).run(inviterId, userId);

  let bonusText = `<b>+5 Koin!</b>`;
  if (currentCoins >= 1000) {
      bonusText = `<b>KOIN MENCAPAI BATAS (1000 Koin)!</b>`;
} else if (newCoins === 1000) {
      bonusText = `<b>+5 Koin!, MENCAPAI BATAS 1000 KOIN!</b>`; 
      }
await ctx.telegram.sendMessage(inviterId,
`${e.party} <b>BONUS REFERRAL MASUK ELITE!</b>
──────────────────────────
${e.user} : <a href="tg://user?id=${userId}">${ctx.from.first_name}</a>
${e.coin} : ${bonusText}
──────────────────────`,
  { parse_mode: 'HTML' }).catch(() => {}); 
      }
    }
  }
} catch (err) {
      console.error(
      "[x] GAGAL MEMPROSES INTERSEPTOR REFERRAL START:", err.message); 
      }

  await menu.handleDashboard(ctx, false, global.sessionStore); 
});

bot.command('checker', async (ctx) => {
const chatId = ctx.chat.id;
  if (global.sessionStore[chatId]) delete global.sessionStore[chatId].stage;
      userState[ctx.from.id] = "WAIT_BIO";

const originalReply = ctx.reply.bind(ctx);
      ctx.reply = async (text, extra) => {
const msg = await originalReply(text, extra);
  if (msg?.message_id) {
  if (!global.sessionStore[chatId]) global.sessionStore[chatId] = {};
      global.sessionStore[chatId].checker_message_id = msg.message_id; 
      }
  return msg; 
    };
  await menu.handleChecker(ctx, false, global.sessionStore); 
});

bot.command('fixred', async (ctx) => {
  try {
const chatId = ctx.chat.id;
  if (global.sessionStore[chatId]) delete global.sessionStore[chatId].stage;
  if (userState[ctx.from.id]) delete userState[ctx.from.id];
                        
  if (!global.sessionStore[chatId]) global.sessionStore[chatId] = {};
      global.sessionStore[chatId].stage = 'WAIT_FIX';

const { handleFixred } = require('../menus/fixred');
  return await handleFixred(ctx, false);
} catch (err) {
      console.error(
      "[x] GAGAL REDIRECT COMMAND FIXRED PUSAT:", err.message); 
      }
});

bot.command('premium', async (ctx) => {
  if (global.sessionStore[ctx.chat.id]) delete global.sessionStore[ctx.chat.id].stage;
  if (userState[ctx.from.id]) delete userState[ctx.from.id];
  await menu.handlePremium(ctx); 
});

bot.command('reward', async (ctx) => {
  if (global.sessionStore[ctx.chat.id]) delete global.sessionStore[ctx.chat.id].stage;
  if (userState[ctx.from.id]) delete userState[ctx.from.id];
  await menu.handleReward(ctx); 
});

// ==============================================================
// 📥 HANDLER INPUT TEKS PUSAT (ROUTER PENYALUR STERIL)
// ==============================================================
bot.on('text', async (ctx, next) => {
if (ctx.chat && String(ctx.chat.id) === String(config.GROUPID)) return;

const text = ctx.message.text.trim();
const chatId = ctx.chat.id;
const userId = ctx.from.id;

  if (ctx.message.text.startsWith('/')) {
  if (global.sessionStore[chatId]) delete global.sessionStore[chatId].stage;
  if (userState[userId]) delete userState[userId];
  return next(); 
}
  if (global.sessionStore[chatId]?.stage === 'WAIT_FIX') { 
const { handleFixredAction } = require('./fixred');
  return handleFixredAction(ctx, text); 
}       
  if (userState[userId] === "WAIT_BIO") {
  if (global.sessionStore[chatId]?.awaiting_worker_setup) {
  delete global.sessionStore[chatId].awaiting_worker_setup; }
}
  if (global.sessionStore[chatId]?.awaiting_worker_setup) {
const inputNomor = text.replace(/[^0-9]/g, '');
const mainMsgId = global.sessionStore[chatId].bot_message_id;
  delete global.sessionStore[chatId].awaiting_worker_setup;

  if (inputNomor) {
const loadingMsg = await ctx.reply(
  `${e.hglass2} <b>Connecting to ${inputNomor}...</b>`,
  { parse_mode: 'HTML' });

  await workerManager.startPairing(inputNomor, ctx, mainMsgId, loadingMsg.message_id);
} else { 
  await ctx.reply(`${e.cross} <b>Format nomor tidak valid.</b>`, { parse_mode: 'HTML' }); 
    }
  return; 
}
  if (userState[userId] === "WAIT_BIO") {
  return checkerHandler.handleManualInput(ctx, text); 
}          

ctx.reply(
`${e.question} <b>PERINTAH TIDAK DIKENALI.</b>
──────────────────────────
<i>ᴋᴇᴛɪᴋ /start ᴀᴛᴀᴜ ᴋʟɪᴋ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ
ᴜɴᴛᴜᴋ ᴍᴇᴍᴜᴀᴛ ᴜʟᴀɴɢ.</i> ${e.down}
──────────────────────`, 
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
        }).catch(() => {});
    });

// ==============================================================
// 📂 HANDLER INPUT BERKAS UTAMA (ROUTER MULTI-FORMAT FILE)
// ==============================================================
bot.on('document', async (ctx) => {
if (ctx.chat && String(ctx.chat.id) === String(config.GROUPID)) return;

const userId = ctx.from.id;

  if (userState[userId] !== "WAIT_BIO") {
return ctx.reply(
`${e.question} <b>PERINTAH TIDAK DIKENALI.</b>
──────────────────────────
<i>ᴋᴇᴛɪᴋ /start ᴀᴛᴀᴜ ᴋʟɪᴋ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ
ᴜɴᴛᴜᴋ ᴍᴇᴍᴜᴀᴛ ᴜʟᴀɴɢ.</i> ${e.down}
──────────────────────`, 
  { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
  }).catch(() => {}); 
}
  return checkerHandler.handleDocumentInput(ctx);
  });
};

