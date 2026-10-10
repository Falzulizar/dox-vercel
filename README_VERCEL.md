# DOX - Vercel webhook build

This build is adapted to receive Telegram updates through a Vercel serverless webhook.

## Important limitations

- Vercel does NOT provide a permanent Node.js process.
- The original `index.js` polling process is intentionally NOT started on Vercel.
- WhatsApp/Baileys worker sockets are not suitable as permanent 24/7 processes on Vercel.
- SQLite is redirected to `/tmp` on Vercel, which is temporary and NOT a persistent database.
- For permanent WhatsApp worker sessions and persistent data, use a VPS/Render-like long-running service plus persistent storage/database.

## Vercel Environment Variables

Add these in Project -> Settings -> Environment Variables:

TOKEN=...
APIKEY=...
OWNERID=...
GROUPID=...
TELEGRAM_WEBHOOK_SECRET=...
SETUP_SECRET=...

Do NOT upload `.env`.

## Deploy

1. Push this folder to GitHub.
2. Import the repository into Vercel.
3. Deploy.
4. Open:

   https://YOUR-DOMAIN.vercel.app/api/setup-webhook?key=YOUR_SETUP_SECRET

5. The response should say `Telegram webhook berhasil dipasang`.
6. Test the bot in Telegram.

## Security

The Telegram bot token that was present in the source archive should be rotated/revoked and replaced with a new token before deploying.
