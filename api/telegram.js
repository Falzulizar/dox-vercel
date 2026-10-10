// Vercel serverless webhook for Telegram / Telegraf
const { bot } = require('../telegram');

const handler = bot.webhookCallback('/api/telegram', {
  secretToken: process.env.TELEGRAM_WEBHOOK_SECRET || undefined
});

module.exports = handler;
