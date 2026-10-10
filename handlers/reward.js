// //DOX//HANDLERS//REWARD.JS
const db = require('../database');
const dbCore = require('../data/sqlite');
const menu = require('../menus/reward'); 

const activeLocks = new Set();

module.exports = function registerRewardHandlers(bot) {
    
// =============================================================
// 📆 HANDLER DAILY CHECK-IN (ANTI-SPAM ULTRA LOCK ENGINE)
// =============================================================
bot.action('daily_checkin', async (ctx) => {
const userId = String(ctx.from.id);

  if (activeLocks.has(userId)) {
return ctx.answerCbQuery(
`⚠️ SABAR JING, JANGAN DI-SPAM!

Server lagi memproses check-in lu.
Santai aja sat-set pasti masuk!`, 
  { show_alert: true } );
}
      activeLocks.add(userId);

  try {
const user = await db.getOrCreateUser(userId, ctx.from.username || ctx.from.first_name);
const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);

  if (user.lastCheckIn === today) {
return ctx.answerCbQuery(
`⚠️ COBA LAGI NANTI!

check-in harian reset setiap jam 00:00 WIB!`, 
  { show_alert: true } );
}
const currentCoins = user.total_coins || 0;
  if (currentCoins >= 1000) {
return ctx.answerCbQuery(
`⚠️ MENCAPAI BATAS MAKSIMAL!

Koin lu mencapai batas (1000 Koin).
Tukar dulu, baru check-in lagi!`, 
  { show_alert: true } );
}
const newCoins = currentCoins + 1;
            
  await db.updateUserCoins(userId, newCoins);
  await db.updateUserCheckIn(userId, today); 

await ctx.answerCbQuery(
`✅ CHECK-IN BERHASIL!

🎉 Selamat, +1 Koin!
🪙 Total Koin sekarang: ${newCoins} Koin`, 
  { show_alert: true }
);            
  await menu.handleReward(ctx, true);
} catch (err) {
    console.error(
    '[x] ERROR PADA DAILY CHECK-IN HANDLER:', err.message);
  await ctx.answerCbQuery(
  '❌ Terjadi kesalahan internal server check-in harian.',
  { show_alert: true }); 
} finally {
    activeLocks.add(userId); 
    activeLocks.delete(userId); 
  }
});
// =============================================================
// 🎁 HANDLER PENUKARAN REWARD COIN (MIGRASI TOTAL FULL NATIVE SQLITE)
// =============================================================
bot.action(/reward_(1|3|7|30)/, async (ctx) => {
const userId = String(ctx.from.id);

  if (activeLocks.has(userId)) {
return ctx.answerCbQuery(
`⚠️ PROSES SEDANG BERJALAN...!

Mohon tunggu sirkuit memproses penukaran koin lu!`, 
  { show_alert: true } );
}
    activeLocks.add(userId);

  try {
const claimRewardsConfig = {
  'reward_1': { coins: 10, days: 1, label: '1 Hari' },
  'reward_3': { coins: 25, days: 3, label: '3 Hari' },
  'reward_7': { coins: 50, days: 7, label: '7 Hari' },
  'reward_30': { coins: 150, days: 30, label: '30 Hari' } 
};                
const actionKey = ctx.callbackQuery.data;
const reward = claimRewardsConfig[actionKey];                
const user = await db.getOrCreateUser(userId, ctx.from.username || ctx.from.first_name);
const currentCoins = user.total_coins || 0;

  if (currentCoins < reward.coins) {
return ctx.answerCbQuery(
`❌ KOIN TIDAK MENCUKUPI!
  
🪙 Koin Anda: ${currentCoins} Koin
📌 Dibutuhkan: ${reward.coins} Koin.`, 
  { show_alert: true } );
}

const existingExpire = user.premium_expired_at && Date.now() < Number(user.premium_expired_at) ? Number(user.premium_expired_at) : Date.now();
const newExpire = existingExpire + (reward.days * 86400000);
              
dbCore.prepare(`
    UPDATE users 
    SET status = 'PREMIUM', premium_expired_at = ? 
    WHERE id = ?
`).run(newExpire, userId);

  await db.updateUserCoins(userId, currentCoins - reward.coins);

  await ctx.answerCbQuery(`🎉 Sukses menukarkan ${reward.coins} Koin dengan ${reward.label} Akses PREMIUM!`, { show_alert: true });
  await menu.handleReward(ctx, true);

} catch (err) {
    console.error('\x1b[31m%s\x1b[0m',
    "[x] ERROR PADA PENUKARAN KOIN REFERRAL:", err.message);
  await ctx.answerCbQuery('❌ Terjadi kesalahan internal penukaran koin server.', { show_alert: true }); 
} finally {
    activeLocks.delete(userId); 
    }
  });
};

