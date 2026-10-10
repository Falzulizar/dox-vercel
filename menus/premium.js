// //DOX//MENUS//PREMIUM.JS
const config = require('../config');
const premium = require('../utils/premium');
const db = require('../database');

function owner(userId) { 
    return String(userId) === String(config.OWNERID); 
}

async function renderMenu(ctx, text, keyboard, fromCallback = false) {
    const extra = { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } };    
    if (fromCallback) return ctx.editMessageText(text, extra).catch(() => {}); 
    return ctx.reply(text, extra); 
}

// ==============================================================
// 💠 HANDLE MENU PREMIUM (STERIL & ULTRA LIGHTWEIGHT)
// ==============================================================
async function handlePremium(ctx, fromCallback = false) {
    try {
        const userId = String(ctx.from.id);
        const isOwner = owner(userId);
        const isPremium = premium(userId);

        let statusUser = `${e.free}`; 
        let premiumUntil = '-';
            
        if (isOwner || isPremium) {
            statusUser = isOwner ? `${e.crown}` : `${e.diamond}`;

            const user = await db.getOrCreateUser(userId, ctx.from.username || ctx.from.first_name);
            if (user && user.premium_expired_at) {
                premiumUntil = new Date(Number(user.premium_expired_at)).toLocaleDateString('id-ID', { 
                    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' 
                }).replace(/\//g, '-');
            }
        }

        const text = 
`${e.diamond} <b>MENU PREMIUM</b>
──────────────────────────
${e.user} <b>STATUS ANDA</b>
  »  <code>Status  </code>: ${statusUser}
  »  <code>Expired </code>: (<code>${premiumUntil}</code>)
──────────────────────────
${e.locko} <b>PERBANDINGAN</b>
 │       ${e.free}  <b>VS</b>  ${e.diamond}
 ├${e.search} <b>ᴄᴇᴋ ɴᴏᴍᴏʀ</b>
 │ └ (ᴍᴀᴋꜱ 𝟻𝟶𝟶 » <b>ᴛᴀɴᴘᴀ ʙᴀᴛᴀꜱ</b>)
 ├${e.arrows} <b>ᴘᴇɴɢᴇᴄᴇᴋᴀɴ</b>
 │ └ (𝟻x / ʜᴀʀɪ » <b>ᴛᴀɴᴘᴀ ʙᴀᴛᴀꜱ</b>)
 ├${e.gear} <b>ꜱᴘᴇᴇᴅ ᴍᴏᴅᴇ</b>
 │ └ (ꜱᴛᴀɴᴅᴀʀ » <b>ꜱᴇᴍᴜᴀ ᴍᴏᴅᴇ</b>)
 ├${e.fixred} <b>ꜰɪxʀᴇᴅ ʙᴀɴᴅɪɴɢ</b>
 │ └ (𝟻x / ʜᴀʀɪ » <b>ᴛᴀɴᴘᴀ ʙᴀᴛᴀꜱ</b>)
 └────────────────────•
${e.down} <i>ᴘɪʟɪʜ ᴅᴜʀᴀꜱɪ ᴘʀᴇᴍɪᴜᴍ ᴘᴀᴅᴀ ᴛᴏᴍʙᴏʟ
ᴅɪ ʙᴀᴡᴀʜ ɪɴɪ ᴜɴᴛᴜᴋ ᴍᴇʟᴀɴᴊᴜᴛᴋᴀɴ
ᴘᴇᴍʙᴀʏᴀʀᴀɴ ᴏᴛᴏᴍᴀᴛɪꜱ (ǫʀɪꜱ).</i>
──────────────────────`;
const keyboard = [
      [ button("pay", "Rp1k(1hari)", "buy_prem_1", "primary"),
        button("pay", "Rp2k(3hari)", "buy_prem_3", "primary") ],
      [ button("pay", "Rp5k(7hari)", "buy_prem_7", "primary"),
        button("pay", "Rp15k(30hari)", "buy_prem_30", "primary") ],
      [ button("back", "KEMBALI", "dashboard", "danger") ] 
];

        return renderMenu(ctx, text, keyboard, fromCallback);
    } catch (err) {
        console.error('[x] CRASH PADA MENU PREMIUM HANDLER:', err.message);
    }
}

module.exports = { handlePremium };

