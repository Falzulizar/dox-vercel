// One-time webhook setup endpoint.
// Protect this endpoint with SETUP_SECRET in Vercel Environment Variables.
const { bot } = require('../telegram');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const setupSecret = process.env.SETUP_SECRET;
  const supplied = req.query?.key;

  if (!setupSecret || supplied !== setupSecret) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const webhookUrl = `${proto}://${host}/api/telegram`;

  try {
    const options = { drop_pending_updates: true };
    if (process.env.TELEGRAM_WEBHOOK_SECRET) {
      options.secret_token = process.env.TELEGRAM_WEBHOOK_SECRET;
    }

    await bot.telegram.setWebhook(webhookUrl, options);

    return res.status(200).json({
      ok: true,
      message: 'Telegram webhook berhasil dipasang.',
      webhook: webhookUrl
    });
  } catch (error) {
    console.error('[WEBHOOK SETUP]', error);
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};
