//DOX//WORKER.JS
const pino = require('pino');
const config = require('./config');
const dbCore = require('./data/sqlite');

dbCore.exec(`
  CREATE TABLE IF NOT EXISTS session (
      session_id TEXT,
      key TEXT,
      value TEXT,
      PRIMARY KEY (session_id, key)
  );
`);

async function getBaileys() {
  return await import('@whiskeysockets/baileys'); }

// ========================================================
// 🛡️ ADAPTER KASTA TERTINGGI: SQLITE AUTH STATE PROVIDER
// ========================================================
async function useSQLiteAuthState(sessionId) {
  const { BufferJSON, initAuthCreds } = await getBaileys();

  const readData = (key) => {
    try {
      const row = dbCore.prepare('SELECT value FROM session WHERE session_id = ? AND key = ?').get(sessionId, key);
      if (!row) return null;
      return JSON.parse(row.value, BufferJSON.reviver);
    } catch { return null; }
  };

  const writeData = (key, value) => {
    try {
      const str = JSON.stringify(value, BufferJSON.replacer);
      dbCore.prepare('INSERT OR REPLACE INTO session (session_id, key, value) VALUES (?, ?, ?)').run(sessionId, key, str);
    } catch (err) { console.error("[x] GAGAL UPDATE KEY SESSION SQLITE:", err.message); }
  };

  const removeData = (key) => {
    try {
      dbCore.prepare('DELETE FROM session WHERE session_id = ? AND key = ?').run(sessionId, key);
    } catch {}
  };

  let creds = readData('creds');
  if (!creds) {
    creds = initAuthCreds();
    writeData('creds', creds);
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          for (const id of ids) {
            let value = readData(`${type}-${id}`);
            if (type === 'app-state-sync-key' && value) {
              const { proto } = await getBaileys();
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            data[id] = value;
          }
          return data;
        },
        set: async (data) => {
          for (const type in data) {
            for (const id in data[type]) {
              const value = data[type][id];
              if (value) {
                writeData(`${type}-${id}`, value);
              } else {
                removeData(`${type}-${id}`);
              }
            }
          }
        }
      }
    },
    saveCreds: () => {
      writeData('creds', creds);
    },
    purgeSession: () => {
      dbCore.prepare('DELETE FROM session WHERE session_id = ?').run(sessionId);
    }
  };
}

const workerManager = { 
      workers: [],
      currentIndex: 0,
      pending: {},
      userIndices: {},
// ========================================================
// ♻️ DYNAMIC AUTO-LOAD (MIGRASI NATIVE SQLITE ROW READER)
// ========================================================
    async initAllWorkers() {
    console.log('\x1b[36m%s\x1b[0m',
    '[♻] RECONNECT SEMUA SESI WORKER VIA SQLITE...');

  const rows = dbCore.prepare('SELECT DISTINCT session_id FROM session').all();
  if (!rows || rows.length === 0) {
  return console.log('\x1b[31m%s\x1b[0m',
    '[x] BELUM ADA SESI WORKER TERSIMPAN DI SQLITE.'); }

const connectionQueue = [];             
      rows.forEach(row => {
const folder = row.session_id; 
  if (folder.startsWith('pairing_')) {
const parts = folder.replace('pairing_', '').split('_');
  if (parts.length === 2) {
      connectionQueue.push({ type: 'PAIRING', id: parts[1], ownerId: parts[0] });
} else {
      connectionQueue.push({ type: 'PAIRING', id: parts[0], ownerId: String(config.OWNERID || '') }); }
} else if (folder.startsWith('scan_')) { 
const parts = folder.replace('scan_', '').split('_');
  if (parts.length === 2) {
      connectionQueue.push({ type: 'QR', id: parts[1], ownerId: parts[0] });
} else {
      connectionQueue.push({ type: 'QR', id: parts[0], ownerId: String(config.OWNERID || '') }); } 
    } 
});
      console.log('\x1b[33m%s\x1b[0m',
      `[⚠] TERDETEKSI ${connectionQueue.length} SESI WORKER...`);
        
      connectionQueue.forEach((task, index) => {
      setTimeout(() => {
      console.log(`\x1b[34m[♻] CONNECTING...\x1b[0m\n ├ Number: ${task.id}\n └ UserID: ${task.ownerId}`);
        
  if (task.type === 'PAIRING') {
      this.startPairing(task.id, null, null, null, task.ownerId);
} else {
      this.startQR(null, task.id, task.ownerId); }
    }, index * 5000);
  });
},
      getNextWorker(userId) {
  if (!userId) return null;
  if (!this.workers || this.workers.length === 0) return null;

const userWorkers = this.workers.filter(w => String(w.ownerId) === String(userId));
  if (userWorkers.length === 0) return null;

  if (this.userIndices[userId] === undefined || this.userIndices[userId] >= userWorkers.length) {
      this.userIndices[userId] = 0; }
                    
const worker = userWorkers[this.userIndices[userId]];
      this.userIndices[userId] = (this.userIndices[userId] + 1) % userWorkers.length;
  return worker || null;
},
      closeAllWorkers: async function() {
      console.log('\x1b[33m%s\x1b[0m',
      '[♻] MENUTUP SEMUA SOCKET WORKER...');
  for (const worker of this.workers) {
  try {
  if (worker.sock) {
      worker.sock.end();
      console.log(`[✓] Worker ${worker.id} ditutup.`);
  }
} catch (err) {
      console.error(
      `[x] Gagal menutup worker ${worker.id}:`, err.message);
  }
}
  this.workers = [];
},
// ========================================================
// 🔢 PAIRING CODE ENGINE
// ========================================================
    startPairing: async function(phoneNumber, ctx, msgId, loadingMsgId, existingOwnerId = null) {
const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, Browsers } = await getBaileys();
const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
                        
const targetOwnerId = existingOwnerId || (ctx ? String(ctx.from.id) : String(config.OWNERID || ''));
const sessionKey = `pairing_${targetOwnerId}_${formattedNumber}`;

  if (ctx && msgId) {
      dbCore.prepare('DELETE FROM session WHERE session_id = ?').run(sessionKey);
}
  let pairingSent = false;
  const startSocketPairing = async () => {
  const { state, saveCreds, purgeSession } = await useSQLiteAuthState(sessionKey);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));
                         
  const sock = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: false,
        defaultQueryTimeoutMs: 30000,
        keepAliveIntervalMs: 10000,
        syncFullHistory: false,
        shouldIgnoreOldMessages: true 
});
  if (ctx) workerManager.pending[ctx.chat.id] = sock;
      sock.ev.on('creds.update', saveCreds);
      sock.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update;

  if (!sock.authState.creds.registered && !pairingSent && ctx && msgId) { pairingSent = true;

      setTimeout(async () => {
  try {
const code = await sock.requestPairingCode(formattedNumber);
const finalCode = code.match(/.{1,4}/g).join('-');

await ctx.telegram.editMessageText(ctx.chat.id, msgId, null,
`${e.check} <b>PAIRING CODE BERHASIL DIBUAT!</b>
──────────────────────────
 ${e.down} CODE ${e.down}

<b>𓊈</b> <code>${finalCode}</code> <b>𓊉</b>

${e.paircode} Silakan masukkan kode di atas
pada WhatsApp Anda.
──────────────────────`,
 { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
[ button("cross","BATALKAN PENAUTAN", "batal_pairing", "danger") ] ] } 
}).catch(()=>{});
  if (loadingMsgId) {
  await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsgId).catch(()=>{}); }

      setTimeout(async () => {
  if (!sock.authState.creds.registered) { 
  if (sock) { 
      sock.ev.removeAllListeners('creds.update');
      sock.end(); 
}
      setTimeout(() => {
          purgeSession();
}, 500);
  if (ctx) await ctx.telegram.editMessageText(ctx.chat.id, msgId, null, `${e.warning} <b>PAIRING CODE KEDALUWARSA</b>`, { parse_mode: 'HTML' }).catch(()=>{}); }
}, 60000);
} catch (err) {
      console.error(err);
      pairingSent = false;
  if (ctx) await ctx.telegram.editMessageText(ctx.chat.id, msgId, null,
`${e.warning} <b>GAGAL MEMBUAT PAIRING CODE</b>
──────────────────────────
Silahkan coba lagi nanti.
──────────────────────`,
 { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
[ button("back", "KEMBALI", "add_worker", "danger") ] ] } 
}).catch(()=>{});
  if (loadingMsgId && ctx) { 
ctx.telegram.deleteMessage(ctx.chat.id, loadingMsgId).catch(()=>{}); } 
    }
  }, 1000); 
}
  if (connection === 'open') {
      console.log(`\x1b[32m[◉] CONNECTED!\x1b[0m\n ├ Number: ${formattedNumber}\n └ UserID: ${targetOwnerId}`);

  if (!workerManager.workers.some(w => w.id === formattedNumber)) {
      workerManager.workers.push({ id: formattedNumber, sock, ownerId: targetOwnerId }); }

  if (ctx && workerManager.pending[ctx.chat.id]) {
  delete workerManager.pending[ctx.chat.id]; }

  if (ctx && msgId) {
  await ctx.telegram.editMessageText(ctx.chat.id, msgId, null,
`${e.party} <b>WORKER BERHASIL TERHUBUNG!</b>
──────────────────────────
${e.yes} ${formattedNumber}

${e.robot2} <i>ᴡᴏʀᴋᴇʀ ꜱɪᴀᴘ ᴜɴᴛᴜᴋ ᴅɪɢᴜɴᴀᴋᴀɴ!</i>
──────────────────────`,
 { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
[ button("search", "CHECKER", "checker", "primary") ],
[ button("back", "KEMBALI", "worker", "danger") ] ] } 
}).catch(()=>{}); }
}
  if (connection === 'close') {
const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.data?.statusCode;
const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403 || statusCode === 411;
                                                
      workerManager.workers = workerManager.workers.filter(w => w.id !== formattedNumber);

  if (!isLoggedOut) { 
      setTimeout(() => startSocketPairing(), 5000);
} else {
      purgeSession(); } 
            } 
          });
      };
  await startSocketPairing();
},
// ========================================================
// 📱 SCAN QR CODE ENGINE
// ========================================================
    startQR: async function(ctx, existingWorkerId = null, existingOwnerId = null) {
const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, Browsers } = await getBaileys();
                    
const targetOwnerId = existingOwnerId || (ctx ? String(ctx.from.id) : String(config.OWNERID || ''));
const workerId = existingWorkerId || `QR${Math.floor(100000 + Math.random() * 900000)}`;
const sessionKey = `scan_${targetOwnerId}_${workerId}`;

  let qrSent = false;
  let qrMsg = null;

const startSocketQR = async () => {
const { state, saveCreds, purgeSession } = await useSQLiteAuthState(sessionKey);
const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

const sock = makeWASocket({
      auth: state,
      version,
      logger: pino({ level: 'silent' }),
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal: false,
      defaultQueryTimeoutMs: 30000,
      keepAliveIntervalMs: 10000,
      syncFullHistory: false,
      shouldIgnoreOldMessages: true 
});
  if (ctx) workerManager.pending[ctx.chat.id] = sock;
      sock.ev.on('creds.update', saveCreds);
      sock.ev.on('connection.update', async (update) => {
const { connection, qr, lastDisconnect } = update;

  if (qr && !qrSent && ctx) {
      qrSent = true;

   if (ctx.callbackQuery && ctx.callbackQuery.message) {
   await ctx.telegram.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id).catch(() => {}); }

const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
      qrMsg = await ctx.replyWithPhoto({ url: qrUrl }, {
      caption: `${e.frame} <b>SCAN QR INI DI WHATSAPP...</b>\n<i>ǫʀ ᴀᴋᴀɴ ᴏᴛᴏᴍᴀᴛɪꜱ ᴅɪʜᴀᴘᴜꜱ ᴅᴀʟᴀᴍ 𝟷 ᴍᴇɴɪᴛ!</i>`,
  parse_mode: 'HTML', reply_markup: { inline_keyboard: [
[ button("back", "BATALKAN PENAUTAN", "batal_qr") ] ] }
}).catch(() => {});

  if (qrMsg) {
      setTimeout(async () => {
  if (sock) {
      sock.isDead = true;
      sock.ev.removeAllListeners('creds.update');
      sock.end(); 
}
      setTimeout(() => {
          purgeSession();
}, 3000);

  if (ctx) await ctx.telegram.deleteMessage(ctx.chat.id, qrMsg.message_id).catch(() => {});

const textMenuBalik = 
`${e.warning} <b>QR CODE KEDALUWARSA</b>
──────────────────────────
${e.link} Silakan pilih kembali metode
penautan perangkat WhatsApp Anda:
──────────────────────`;
  if (ctx) {
  await ctx.reply(textMenuBalik, { 
        parse_mode: 'HTML', 
        reply_markup: { 
        inline_keyboard: [
[ button("paircode", "PAIRING", "pairing_code", "primary"),
  button("frame", "SCAN QR", "scan_qr", "primary") ], 
[ button("back", "KEMBALI", "worker", "primary") ] ] }
}).catch(() => {}); }
}, 60000);
  }
}
  if (connection === 'open') {
const finalId = sock.user?.id?.split(':')[0] || workerId;
      console.log(`\x1b[32m[◉] CONNECTED!\x1b[0m\n ├ WorkerID: ${finalId}\n └ UserID  : ${targetOwnerId}`);

  if (!workerManager.workers.some(w => w.id === finalId)) {
      workerManager.workers.push({ id: finalId, sock, ownerId: targetOwnerId }); }

  if (ctx && workerManager.pending[ctx.chat.id]) {
  delete workerManager.pending[ctx.chat.id]; }

  if (ctx && qrMsg) {
  await ctx.telegram.editMessageCaption(ctx.chat.id, qrMsg.message_id, null,
`${e.party} <b>WORKER BERHASIL TERHUBUNG!</b>
──────────────────────────
${e.yes} ${finalId}

${e.robot2} <i>ᴡᴏʀᴋᴇʀ ꜱɪᴀᴘ ᴜɴᴛᴜᴋ ᴅɪɢᴜɴᴀᴋᴀɴ!</i>
──────────────────────`,
 { parse_mode: 'HTML', reply_markup: { inline_keyboard: [
[ button("search", "CHECKER", "checker", "primary") ],
[ button("back", "KEMBALI", "worker", "danger") ] ] } 
}).catch(()=>{}); }
}
  if (connection === 'close') {
  if (sock.isDead) {
      purgeSession(); 
  return; 
}
const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.data?.statusCode;
const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403 || statusCode === 411;
const finalId = sock.user?.id?.split(':')[0] || workerId;

      workerManager.workers = workerManager.workers.filter(w => w.id !== finalId);

  if (!isLoggedOut) {
      setTimeout(() => startSocketQR(), 5000);
} else {
      purgeSession(); } 
          }
        });
      };
    await startSocketQR();
  }
};

module.exports = workerManager;

