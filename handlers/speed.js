//DOX//HANDLERS//SPEED.JS
const config = require('../config');
const premium = require('../utils/premium');
const userState = require('../utils/state');
const menu = require('../menus/router');

function owner(userId) { 
  return String(userId) === String(config.OWNERID); }

module.exports = function registerSpeedHandlers(bot) {
    
// ==============================================================
// ⚡ CONFIG SPEED SETTINGS HANDLERS (STERIL MULTI-USER)
// ==============================================================    
bot.action('set_speed_SLOW', async (ctx) => {
  if (!owner(ctx.from.id) && !premium(ctx.from.id)) {
  return ctx.answerCbQuery(
  '❌ Akses Ditolak! Mode SLOW hanya terbuka khusus PREMIUM.',
  { show_alert: true });
}        
      userState.speeds = userState.speeds || {};
      userState.speeds[ctx.from.id] = 'Slow';
        
  await ctx.answerCbQuery(
  '✅ Speed Mode diatur ke SLOW').catch(() => {});
  await menu.handleSpeed(ctx, true);
});
       
bot.action('set_speed_STANDAR', async (ctx) => {
      userState.speeds = userState.speeds || {};
      userState.speeds[ctx.from.id] = 'Standar';
        
  await ctx.answerCbQuery(
  '✅ Speed Mode diatur ke STANDAR').catch(() => {});
  await menu.handleSpeed(ctx, true);
});

bot.action('set_speed_FAST', async (ctx) => {
  if (!owner(ctx.from.id) && !premium(ctx.from.id)) {
  return ctx.answerCbQuery(
  '❌ Akses Ditolak! Mode FAST hanya terbuka khusus PREMIUM.',
  { show_alert: true });
}        
      userState.speeds = userState.speeds || {};
      userState.speeds[ctx.from.id] = 'Fast';
        
  await ctx.answerCbQuery(
  '⚡ Speed Mode diatur ke FAST').catch(() => {});
  await menu.handleSpeed(ctx, true);
    });
};
