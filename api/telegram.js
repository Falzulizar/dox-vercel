// Vercel serverless webhook for Telegram / Telegraf
const { bot } = require('../telegram');

const handler = bot.webhookCallback('/api/telegram');

module.exports = handler;
