// //DOX//MENUS//REWARD.JS
const db = require('../database');

async function renderMenu(ctx, text, keyboard, fromCallback = false) {
const extra = { 
      parse_mode: 'HTML', 
      reply_markup: { inline_keyboard: keyboard } 
    };
    
  if (fromCallback) return ctx.editMessageText(text, extra).catch(() => {}); 
  return ctx.reply(text, extra);
}

// ==============================================================
// 🎁 HANDLE MENU REFERRAL & DAILY CHECK-IN
// ==============================================================
async function handleReward(ctx, fromCallback = false) {
  try {
const user = await db.getOrCreateUser(String(ctx.from.id), ctx.from.username || ctx.from.first_name);
const botInfo = await ctx.telegram.getMe();
const refLink = `https://t.me/${botInfo.username}?start=ref_${ctx.from.id}`;
 
const text = 
`${e.gift} <b>MENU REWARD PREMIUM</b>
──────────────────────────
${e.chartup} <b>STATS REWARD ANDA:</b>
  »  ${e.invited} <code>Invited</code>: <b>${user.total_referrals || 0} orang</b>
  »  ${e.puzzle} <code>Koin   </code>: <b>${user.total_coins || 0} / 1000 koin</b>
──────────────────────────
${e.gear} <b>CARA KERJA:</b>
1. Bagikan Link Referral Anda
2. 1 Orang  = <b>+5</b> Koin
3. Check-in = <b>+1</b> Koin
4. Maks Koin = <b>1000</b> Koin
5. Tukar Koin & Dapatkan Premium Gratis!

${e.link} <b>Link Referral Anda:</b>
<code>${refLink}</code>

${e.swap} <b>TUKAR KOIN:</b>
 1 Hari » 10 Koin | 3 Hari » 25 Koin
 7 Hari » 50 Koin | 30 Hari » 150 Koin
──────────────────────`;

const keyboard = [
      [ button("diamond", "1 HARI", "reward_1", "primary"),
        button("diamond", "3 HARI", "reward_3", "primary") ],
      [ button("diamond", "7 HARI", "reward_7", "primary"),
        button("diamond", "30 HARI", "reward_30", "primary") ],
      [ button("back", "KEMBALI", "dashboard", "danger"),
        button("calendar2", "CHECK-IN", "daily_checkin", "success") ] 
      ];
 
        return renderMenu(ctx, text, keyboard, fromCallback);
    } catch (err) {
        console.error("[x] Gagal merender Menu Reward:", err.message);
    }
}

module.exports = { handleReward };

