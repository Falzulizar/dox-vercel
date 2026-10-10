// //DOX//HANDLERS//NAV.JS
const menu = require('../menus/router');
const extras = require('./extras');
const workerManager = require('../worker');

module.exports = function registerNavHandlers(bot, sessionStore) {
//====================================================================
bot.action('dashboard', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    const chatId = ctx.chat.id;
    if (sessionStore[chatId]) {
    if (sessionStore[chatId].cooldownInterval) clearInterval(sessionStore[chatId].cooldownInterval);
    if (sessionStore[chatId].cooldownTimeout) clearTimeout(sessionStore[chatId].cooldownTimeout);
    delete sessionStore[chatId].cooldownInterval;
    delete sessionStore[chatId].cooldownTimeout;
    delete sessionStore[chatId].stage; }
    await menu.handleDashboard(ctx, true, sessionStore);
});
//====================================================================
bot.action('checker', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (workerManager.pending[ctx.chat.id]) {
        workerManager.pending[ctx.chat.id].end();
    delete workerManager.pending[ctx.chat.id];}
    if (ctx.session) ctx.session.step = null;
    if (sessionStore[ctx.chat.id]) {
        sessionStore[ctx.chat.id].awaiting_worker_setup = false;
        sessionStore[ctx.chat.id].step = null; }
    await menu.handleChecker(ctx, true, sessionStore, 'dashboard');
});

bot.action(/checker_report(?:_([\w-]+))?/, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (workerManager.pending[ctx.chat.id]) {
        workerManager.pending[ctx.chat.id].end();
    delete workerManager.pending[ctx.chat.id]; }
    if (ctx.session) ctx.session.step = null;
    if (sessionStore[ctx.chat.id]) {
        sessionStore[ctx.chat.id].awaiting_worker_setup = false;
        sessionStore[ctx.chat.id].step = null; }
    const randomLogId = ctx.match[1];
    const backTarget = (randomLogId && randomLogId !== 'NONE') ? `restore_summary_view_${randomLogId}` : 'back_report';
    await menu.handleChecker(ctx, true, sessionStore, backTarget);
});

bot.action('worker', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await menu.handleWorker(ctx, true);
});

bot.action('add_worker', async (ctx) => { 
    await ctx.answerCbQuery().catch(() => {});
    await extras.handleAddWorker(ctx);
});

bot.action('pairing_code', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (ctx.session) ctx.session.step = 'pairing_code';
    if (sessionStore[ctx.chat.id]) {
        sessionStore[ctx.chat.id].awaiting_worker_setup = true;
        sessionStore[ctx.chat.id].step = 'pairing_code'; }
    await menu.handlePairing(ctx, true, sessionStore);
});

bot.action('batal_pairing', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await extras.handleBatalPairing(ctx, sessionStore);
});

bot.action('scan_qr', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await extras.handleScanQr(ctx);
});

bot.action('batal_qr', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});     
    await extras.handleBatalQr(ctx, sessionStore);
});

bot.action('speed', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await menu.handleSpeed(ctx, true);
});

bot.action('historycek', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await menu.handleHistoryCek(ctx, true);
});

bot.action(/view_ckhist_(.+)/, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await extras.handleViewCkhist(ctx);
});
//====================================================================
bot.action('fixred', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    if (!sessionStore[ctx.chat.id]) sessionStore[ctx.chat.id] = {};
        sessionStore[ctx.chat.id].stage = 'WAIT_FIX';
    await menu.handleFixred(ctx);
});

bot.action('sender', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await menu.handleSender(ctx);
});

bot.action('antrian', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await menu.handleAntrian(ctx);
});

bot.action('historyfix', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await menu.handleHistoryFix(ctx, true);
});

bot.action(/^view_fxhist_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await extras.handleViewFxhist(ctx);
});
//====================================================================
bot.action('premium', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await menu.handlePremium(ctx, true);
});
//====================================================================
bot.action('reward', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await menu.handleReward(ctx, true);
});
//====================================================================
bot.action('leaderboard', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await menu.handleLeaderboard(ctx, true, 'checker');
});

bot.action('toptab_checker', async (ctx) => {
    await ctx.answerCbQuery('🔄 Memuat Top Checker...').catch(() => {});
    await menu.handleLeaderboard(ctx, true, 'checker');
});

bot.action('toptab_fixred', async (ctx) => {
    await ctx.answerCbQuery('🔄 Memuat Top Fixred...').catch(() => {});
    await menu.handleLeaderboard(ctx, true, 'fixred');
});

bot.action('toptab_regioncek', async (ctx) => {
    await ctx.answerCbQuery('🔄 Memuat Top Region Checker...').catch(() => {});
    await menu.handleLeaderboard(ctx, true, 'regioncek');
});
bot.action('toptab_regionfix', async (ctx) => {
    await ctx.answerCbQuery('🔄 Memuat Top Region Fixred...').catch(() => {});
    await menu.handleLeaderboard(ctx, true, 'regionfix');
});
//====================================================================
// =============================================================
// ❓ HANDLER MULTI-TAB MENU BANTUAN (SINKRON 21 BARIS)
// =============================================================
bot.action('bantuan', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await menu.handleBantuan(ctx, true, 'checker');
});

bot.action('helptab_checker', async (ctx) => {
    await ctx.answerCbQuery('🔄 Memuat Panduan Checker...')
    .catch(() => {});
    await menu.handleBantuan(ctx, true, 'checker');
});

bot.action('helptab_fixred', async (ctx) => {
    await ctx.answerCbQuery('🔄 Memuat Panduan Fixred...')
    .catch(() => {});
    await menu.handleBantuan(ctx, true, 'fixred');
});

//====================================================================
bot.action('back_report', async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    await extras.handleBackReport(ctx);
});

};

