const { Markup } = require('telegraf');
const config = require('../config');
const premium = require('../utils/premium');
const db = require('../database');
const workerManager = require('../worker');

function owner(userId) { 
    return String(userId) === String(config.OWNERID); 
}

async function handleDashboard(ctx, fromCallback = false, sessionStore = {}) {
  try {
    const userId = String(ctx.from.id);
    const user = await db.getOrCreateUser(userId, ctx.from.username || ctx.from.first_name);
    const globalStats = await db.getGlobalStats();
    const activeWorkers = workerManager.workers ? workerManager.workers.length : 0;
    const isOwner = owner(ctx.from.id);
    const isPremium = premium(ctx.from.id);

    let statusUser = `${e.free}`; 
    let premiumUntil = '-';
        
    if (isOwner || isPremium) {
        statusUser = isOwner ? `${e.crown}` : `${e.diamond}`;

        if (user && user.premium_expired_at) {
            premiumUntil = new Date(Number(user.premium_expired_at)).toLocaleDateString('id-ID', { 
                timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
            }).replace(/\//g, '-'); 
        }
    }
    const totalWorkers = workerManager.workers ? workerManager.workers.filter(w => String(w.ownerId) === userId).length : 0;        

    const userFixredTotal = user?.total_fixred || 0;

    let globalFixredTotal = 0;
    try {
        const dbCore = require('../data/sqlite');
        const row = dbCore.prepare('SELECT SUM(IFNULL(total_fixred, 0)) as total FROM users').get();
        globalFixredTotal = row ? row.total : 0;
    } catch (e) {
        globalFixredTotal = 0;
    }
    const text = 
`${e.wave} Haloo, <b>${ctx.from.first_name}</b>
──────────────────────────
${e.user} <b>PROFIL ANDA</b>
  »  <code>Nama    </code>: ${ctx.from.first_name}
  »  <code>Username</code>: @${ctx.from.username || '-'}
  »  <code>ID      </code>: <code>${ctx.from.id}</code>
  »  <code>Status  </code>: <b>${statusUser}</b>
  »  <code>Expired </code>: (${premiumUntil})
──────────────────────────
${e.chartbar} <b>STATISTIK ANDA</b>
  »  <code>Worker Aktif</code>: <b>${totalWorkers}</b>
  »  <code>Total Fixred</code>: <b>${userFixredTotal.toLocaleString('id-ID')}</b>
  »  <code>Total Check </code>: <b>${(user?.total_checked || 0).toLocaleString('id-ID')}x</b>
  »  <code>Nomor Dicek </code>: <b>${(user?.total_numbers || 0).toLocaleString('id-ID')}</b>
──────────────────────────
${e.globe} <b>STATISTIK GLOBAL</b>
  »  <code>Total Users </code>: <b>${Number(globalStats.total_users || 0).toLocaleString('id-ID')}</b>
  »  <code>Worker Aktif</code>: <b>${activeWorkers}</b>
  »  <code>Total Fixred</code>: <b>${globalFixredTotal.toLocaleString('id-ID')}</b>
  »  <code>Nomor Dicek </code>: <b>${Number(globalStats.total_checked || 0).toLocaleString('id-ID')}</b>
──────────────────────`;
const inlineKeyboard = [
  [ button("search", "CHECKER", "checker", "danger"),
    button("fixred", "FIXRED", "fixred", "danger") ],
  [ button("diamond", "PREMIUM", "premium", "primary"),
    button("gift", "REWARD", "reward", "primary") ],
  [ button("trophy", "LEADBOARD", "leaderboard", "success"),
    button("question", "BANTUAN", "bantuan", "success") ]
];
    if (fromCallback) {
      await ctx.editMessageText(text, { 
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: inlineKeyboard }
      }).catch(() => {});
    } else {
      const sweeper = await ctx.reply('👇', Markup.removeKeyboard()).catch(() => {});
      if (sweeper) await ctx.telegram.deleteMessage(ctx.chat.id, sweeper.message_id).catch(() => {});

      const sentMsg = await ctx.reply(text, { 
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: inlineKeyboard } 
      });            
      const chatId = ctx.chat.id;
      if (!sessionStore[chatId]) sessionStore[chatId] = {};
      sessionStore[chatId].bot_message_id = sentMsg.message_id; 
    }
  } catch (err) { 
    console.error('\x1b[31m%s\x1b[0m', "[x] GAGAL MEMUAT DASHBOARD:", err.message); 
  }
}

module.exports = { handleDashboard };

