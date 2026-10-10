// //DOX//MENUS//WORKER.JS
const config = require('../config');
const premium = require('../utils/premium');
const workerManager = require('../worker');

function owner(userId) { 
  return String(userId) === String(config.OWNERID); 
}

async function renderMenu(ctx, text, keyboard, fromCallback = false) {
const extra = { 
      parse_mode: 'HTML', 
      reply_markup: { inline_keyboard: keyboard } 
  };
    
  if (fromCallback) return ctx.editMessageText(text, extra).catch(() => {}); 
  return ctx.reply(text, extra);
}

//===============================================================
//🤖 HANDLE WORKER & TAMBAH WORKER (DYNAMIC TREE MULTI-USER)
//===============================================================
async function handleWorker(ctx, fromCallback = false) {
  const userWorkers = workerManager.workers ? workerManager.workers.filter(w => String(w.ownerId) === String(ctx.from.id)) : [];
  const totalWorkers = userWorkers.length;
  let maxSlot = '5';

  if (owner(ctx.from.id) || premium(ctx.from.id)) {
        maxSlot = '∞'; 
  }

  let text = `${e.robot} <b>MENU WORKER</b>\n`;
  text += `──────────────────────────\n`;
  text += `${e.chartbar} <b>STATISTIK WORKER</b>\n`;
  text += `  »  <code>Active</code>: <b>${totalWorkers}</b>\n`;
  text += `  »  <code>Limit </code>: <b>${maxSlot}</b>\n`;
  text += `──────────────────────────\n`;
  text += `${e.robot} <b>LIST WORKER ACTIVE</b>\n`;   
  
  if (totalWorkers === 0) {
      text += `${e.warning} <i>(ʙᴇʟᴜᴍ ᴀᴅᴀ ᴡᴏʀᴋᴇʀ ʏᴀɴɢ ᴛᴇʀʜᴜʙᴜɴɢ)</i>\n`;
  } else {
      userWorkers.forEach((worker, index) => {
const isLast = index === userWorkers.length - 1;
const branchSymbol = isLast ? '└' : '├';
  text += ` ${branchSymbol}  <code>${worker.id}</code>\n`; 
      }); 
  }
  text += `──────────────────────`;

  const keyboard = [
      [ button("arrows", "REFRESH", "worker", "primary"),
        button("plus", "ADD WORKER", "add_worker", "success") ],
      [ button("back", "KEMBALI", "checker", "danger") ] 
  ];
  return renderMenu(ctx, text, keyboard, fromCallback);
}

// ==================================================================
// ➕ HANDLER PILIHAN METODE TAMBAH WORKER
// ==================================================================
async function handleAddWorker(ctx, fromCallback = false) {
  const text = 
`${e.plus} <b>MENU ADD WORKER</b>
──────────────────────────
Silakan pilih metode penautan perangkat
WhatsApp Anda:
──────────────────────`;

  const keyboard = [
  [ button("paircode", "PAIRING", "pairing_code", "primary"),
    button("frame", "SCAN QR", "scan_qr", "primary") ],
  [ button("back", "KEMBALI", "worker", "danger") ] 
  ];
  return renderMenu(ctx, text, keyboard, fromCallback);
}

// ==============================================================
// 🔢 HANDLER INPUT KODE PAIRING WORKER
// ==============================================================
async function handlePairing(ctx, fromCallback = false) {
  const userWorkers = workerManager.workers ? workerManager.workers.filter(w => String(w.ownerId) === String(ctx.from.id)) : [];
  const totalWorkerSekarang = userWorkers.length;

  if (!owner(ctx.from.id) && !premium(ctx.from.id)) {
      if (totalWorkerSekarang >= 5) {
          return ctx.answerCbQuery('❌ SLOT WORKER PENUH! FREE USER maksimal 5 Worker.', { show_alert: true }); 
      } 
  }

  global.sessionStore[ctx.chat.id] = { 
      awaiting_worker_setup: true,
      step: 'pairing_code',
      bot_message_id: ctx.callbackQuery?.message?.message_id 
  };

  if (ctx.session) ctx.session.step = 'pairing_code';

  const text = 
`${e.paircode} <b>METODE PAIRING CODE</b>
──────────────────────────
Silakan masukkan nomor WhatsApp yang
akan dijadikan worker lengkap dengan
format kode negara.

Contoh:
62812xxxxxxx
+62812xxxxxxx
──────────────────────`;

  const keyboard = [
[ button("cross", "BATALKAN PENAUTAN", "batal_pairing", "danger") ] ];
  return renderMenu(ctx, text, keyboard, fromCallback);
}

module.exports = {
    handleWorker,
    handleAddWorker,
    handlePairing
};

