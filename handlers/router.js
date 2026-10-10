//DOX//HANDLERS/ROUTER.JS
const registerNavHandlers = require('./nav');
const registerResultHandlers = require('./results');
const registerPremiumHandlers = require('./premium');
const registerRewardHandlers = require('./reward');
const registerSpeedHandlers = require('./speed');
const registerOwnerHandlers = require('./owner');

module.exports = function registerHandlers(bot, sessionStore) {
  if (!bot || typeof bot.action !== 'function') {
      console.log("[⚠️] Peringatan: Jalur objek bot ditunda pengaktifannya di handlers.js...");
  return;
}
    registerNavHandlers(bot, sessionStore);
    registerResultHandlers(bot);
    registerOwnerHandlers(bot);
    registerPremiumHandlers(bot);
    registerRewardHandlers(bot);
    registerSpeedHandlers(bot);
};

