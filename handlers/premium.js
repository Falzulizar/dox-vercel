// //DOX//HANDLERS//PREMIUM.JS
const config = require('../config');
const premium = require('../utils/premium');
const db = require('../database');

const invoices = {};

module.exports = function registerPremiumHandlers(bot) {
    
// ==============================================================
// 💳 HANDLER BUY PREMIUM (GENERATOR QRIS VIA PAKASIR)
// ==============================================================
bot.action(/buy_prem_(1|3|7|30)/, async (ctx) => {
  try {
const premiumPricesConfig = {
      'buy_prem_1': { price: 'Rp 1.000', days: 1 },
      'buy_prem_3': { price: 'Rp 2.000', days: 3 },
      'buy_prem_7': { price: 'Rp 5.000', days: 7 },
      'buy_prem_30': { price: 'Rp 15.000', days: 30 } 
  };
const actionKey = ctx.callbackQuery.data;
const item = premiumPricesConfig[actionKey];

  await ctx.answerCbQuery('🔄 Menyiapkan QRIS Pembayaran...').catch(() => {});

const randomInvoiceId = 'DX' + Date.now().toString().slice(-6);
const cleanPrice = parseInt(item.price.toString().replace(/[^0-9]/g, ''));

const expiredTimeMs = Date.now() + (15 * 60 * 1000);
const expiredDate = new Date(expiredTimeMs);
const targetTimeWib = expiredDate.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit"
  }).replace(/\./g, ':');
const expiredString = `${targetTimeWib} WIB`;

const resPakasir = await requestPakasirQRIS(randomInvoiceId, cleanPrice);
  if (!resPakasir) {
  throw new Error("QRIS tidak diterima dari Pakasir"); 
}            
const { qrisString, totalPayment } = resPakasir;
    invoices[randomInvoiceId] = {
      userId: ctx.from.id,
      days: item.days,
      amount: cleanPrice,
      createdAt: Date.now(),
      status: "pending" 
  };
            
const payText = 
`${e.diamond} <b>INVOICE PEMBELIAN PREMIUM</b> ${e.diamond}
──────────────────────────────
 ${e.receipt} <code>ORDER ID </code>: <code>${randomInvoiceId}</code>
 ${e.cart} <code>PRODUK   </code>: ${e.diamond} <b>Premium</b>
 ${e.calendar2} <code>SELAMA   </code>: <b>${item.days} Hari</b>
 ${e.pay} <code>HARGA    </code>: <b>Rp ${totalPayment.toLocaleString('id-ID')}</b>
 ${e.clock} <code>EXP. QRIS</code>: <b>${expiredString}</b>
──────────────────────────`;

  const keyboard = [
[ button("refresh", "CEK STATUS", `check_status_${randomInvoiceId}`, "primary") ],
[ button("cross", "BATALKAN", `cancel_invoice_${randomInvoiceId}`, "danger") ]
  ];

const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=10&data=${encodeURIComponent(qrisString)}`;  

  await ctx.replyWithPhoto(qrCodeImageUrl, {
    caption: payText, parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard }   
});            
  await ctx.deleteMessage().catch(() => {});
            
} catch (err) {
      console.error('\x1b[31m%s\x1b[0m',
      "[x] GAGAL MEMPROSES ORDERAN PREMIUM QRIS:", err.message);
  await ctx.answerCbQuery(
  '❌ Gagal membuat invoice tagihan. Hubungi admin.',
  { show_alert: true }).catch(() => {}); 
  }
});

// ==============================================================
// 🔄 HANDLER CEK STATUS TRANSAKSI (MIGRASI TOTAL FULL SQLITE NATIVE)
// ==============================================================
bot.action(/check_status_(.+)/, async (ctx) => {
  try {
const orderId = ctx.match[1];
const invoice = invoices[orderId];

  if (!invoice) {
  return ctx.answerCbQuery(
  "❌ Invoice tidak ditemukan atau telah kedaluwarsa.",
  { show_alert: true }); 
}
            
const response = await fetch(`https://app.pakasir.com/api/transactiondetail?project=pondoxbot&amount=${invoice.amount}&order_id=${orderId}&api_key=${config.APIKEY}`);
const data = await response.json(); 

  if (data.transaction && data.transaction.status === "completed") {
const expired = Date.now() + (invoice.days * 86400000);

  try {
const dbCore = require('../data/sqlite');
      dbCore.prepare(`
                        UPDATE users 
                        SET status = 'PREMIUM', premium_expired_at = ? 
                        WHERE id = ?
                    `).run(expired, String(invoice.userId));
} catch (dbErr) {
      console.error(
      "[x] Gagal sinkron status qris premium:", dbErr.message);
  }
                          
  if (db && typeof db.addPremium === 'function') {
  await db.addPremium(invoice.userId, invoice.days);
}                
                
  delete invoices[orderId];
  await ctx.deleteMessage().catch(() => {});
                
await ctx.reply(
`${e.party} <b>PEMBAYARAN SUKSES!</b>
──────────────────────────
Status ${e.diamond} PREMIUM Anda telah aktif.
Terima kasih telah berlangganan!
──────────────────────`, 
  { parse_mode: "HTML", reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
}).catch(() => {});
  return; 
}            
  return ctx.answerCbQuery(
  "⌛ Pembayaran belum masuk. Pastikan nominal transfer pas!",
  { show_alert: true });
} catch (err) {
      console.error("[x] ERROR CHECK STATUS:", err.message);
  return ctx.answerCbQuery(
  "❌ Gagal cek status pembayaran server.",
  { show_alert: true }); 
  }
});

// ==============================================================
// ❌ HANDLER PEMBATALAN INVOICE
// ==============================================================
bot.action(/cancel_invoice_(.+)/, async (ctx) => {
    try {
const orderId = ctx.match[1];
const invoice = invoices[orderId];

  if (!invoice) {
  return ctx.answerCbQuery(
  "❌ Invoice tidak ditemukan.",
  { show_alert: true }); 
}
  await ctx.answerCbQuery(
  "❌ Membatalkan invoice...");
                      
  await fetch("https://app.pakasir.com/api/transactioncancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project: "pondoxbot",
      order_id: orderId,
      amount: invoice.amount,
      api_key: config.APIKEY
  })
}).catch(() => {});
                      
  delete invoices[orderId];
  await ctx.deleteMessage().catch(() => {});
                      
  await ctx.reply(
`${e.cross} <b>INVOICE TELAH DIBATALKAN.</b>`,
  { parse_mode: "HTML", reply_markup: { inline_keyboard: [
  [ button("home", "MENU UTAMA", "dashboard", "primary") ]] }
  }).catch(() => {});
} catch (err) {
      console.error(
      "[x] ERROR CANCEL INVOICE:", err.message);
  return ctx.answerCbQuery(
  "❌ Gagal membatalkan invoice.",
  { show_alert: true }); 
  }
});

// ==============================================================
// 💠 PREVENT CLICK DUMMY
// ==============================================================
bot.action("premium", async (ctx) => {
  try {
  await ctx.answerCbQuery().catch(() => {});
  await ctx.deleteMessage().catch(() => {});
} catch (err) {
  console.error(err); 
        }
    });
};

// ==============================================================
// 📡 ENGINE CORE FETCH INTEGRATION QRIS PAKASIR
// ==============================================================
async function requestPakasirQRIS(orderId, amount) {
  try {
const response = await fetch('https://app.pakasir.com/api/transactioncreate/qris', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    "project": "pondoxbot",
    "order_id": orderId,
    "amount": amount,
    "api_key": config.APIKEY
  })
});
const data = await response.json();        
  if (data && data.payment) {
  return {
    qrisString: data.payment.payment_number,
    totalPayment: parseInt(data.payment.total_payment) 
  };
} else {
  throw new Error(data.message || 'Gagal generate invoice dari Pakasir');
      }    
} catch (errApi) {
      console.error('Error Pakasir API:', errApi.message);
  return null;
  }
}

