//DOX//UTILS/EMAILLISTENER.JS
const { ImapFlow } = require('imapflow');
const db = require('../database');

function decodeQuotedPrintable(str) {
  return str
        .replace(/=\r?\n/g, '')
        .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))); 
}

function smartWrap(text, limit = 40) {
  if (!text) return "";
    
  let paragraphs = text.split(/\n{2,}/);
  let processed = paragraphs.map(p => {
  let cleanP = p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanP) return "";
              
  let words = cleanP.split(' ');
  let lines = [];
  let currentLine = '';

  for (let word of words) {
  if (!word) continue;
  if ((currentLine + (currentLine ? ' ' : '') + word).length > limit) {
  if (currentLine) lines.push(currentLine);
      currentLine = word;
} else {
      currentLine += (currentLine ? ' ' : '') + word; }
}
  if (currentLine) lines.push(currentLine);
              
return lines.join('\n');
}).filter(p => p !== "");
    
  return processed.join('\n\n'); 
}

function polesTeksAsliWa(text) {
  if (!text) return "";
    
  let hasil = text
      .replace(/â/g, "'")
      .replace(/â/g, "'")
      .replace(/â¼/g, "!!")
      .replace(/âCNG/g, '"')
      .replace(/â/g, '"')
      .replace(/â/g, "-")
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/\[EMAIL_BUTTON:[^\]]+\]/gi, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

      hasil = hasil.replace(/(This enables us to collect)/gi, '\n$1');
      hasil = hasil.replace(/(If you can't contact us)/gi, '\n$1');
      hasil = hasil.replace(/(If you are unable to)/gi, '\n$1');
      hasil = hasil.replace(/(You can download)/gi, '\n$1');
      hasil = hasil.replace(/(Replies to this email)/gi, '\n$1');
      hasil = hasil.replace(/(Thanks for your message)/gi, '\n$1');

  return hasil.trim(); 
}

async function listenEmails(bot) {
    setInterval(async () => {
  try {
  let trackingDb = db.readFlatFile('fixred_tracking');
  if (trackingDb.length === 0) return;

// ==============================================================
// ⏱️ SAKELAR PEMBERSIH GHAIB: WATCHDOG TIMEOUT 10 MENIT
// ==============================================================
const now = Date.now();
const timeoutLimit = 10 * 60 * 1000;
                  
const expiredTracks = trackingDb.filter(t => t.timestamp && (now - t.timestamp > timeoutLimit));
const activeTracks = trackingDb.filter(t => !t.timestamp || (now - t.timestamp <= timeoutLimit));

  if (expiredTracks.length > 0) {
  for (let track of expiredTracks) {
  await bot.telegram.deleteMessage(track.chatId, track.messageId).catch(() => {});
    console.log('\x1b[31m%s\x1b[0m',
    `[⏱️] WATCHDOG TIMEOUT: +${track.targetNumber}`);
}        
    db.writeFlatFile('fixred_tracking', activeTracks);
      trackingDb = activeTracks;
}
  if (trackingDb.length === 0) return;

const emailSender = db.readFlatFile('email');
const groupedTracks = {};
                        
  for (let track of trackingDb) {
  if (!groupedTracks[track.emailSender]) groupedTracks[track.emailSender] = [];
      groupedTracks[track.emailSender].push(track); 
}
  for (let email of Object.keys(groupedTracks)) {
const sender = emailSender.find(w => w.email === email);
  if (!sender || !sender.pass || sender.pass.includes('isi_app_password')) continue;

const client = new ImapFlow({
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      auth: { user: sender.email, pass: sender.pass },
      logger: false
});
  try {
  await client.connect();
  let lock = await client.getMailboxLock('INBOX');

  try {
  let messages = await client.search({ from: 'support@support.whatsapp.com', seen: false });
                                                    
  if (messages.length > 0) {
  for (let msgSeq of messages) {
  let fetchResult = await client.fetchOne(msgSeq, { source: true, envelope: true });
  let emailTime = new Date(fetchResult.envelope.date).getTime();
  let rawBody = fetchResult.source.toString('utf-8');
  let decodedBody = decodeQuotedPrintable(rawBody);
  let batasHeader = decodedBody.indexOf('\r\n\r\n');
  if (batasHeader === -1) batasHeader = decodedBody.indexOf('\n\n');
  if (batasHeader !== -1) {
      decodedBody = decodedBody.substring(batasHeader).trim(); 
}
  let bodyLines = decodedBody.split('\n');
  if (bodyLines.length > 0 && bodyLines[0].trim().startsWith('--')) {
  let boundaryStr = bodyLines[0].trim();
  for (let k = 1; k < bodyLines.length; k++) {
  if (bodyLines[k].trim() === boundaryStr) {
      decodedBody = bodyLines.slice(0, k).join('\n');
  break; } 
  }
}
  let compressedBody = decodedBody.replace(/\s+/g, '');
  let isTargetProcessed = false;

  for (let i = trackingDb.length - 1; i >= 0; i--) {
  const track = trackingDb[i];                                                                                        
  if (track.emailSender !== sender.email) continue;
  if (track.timestamp && emailTime < (track.timestamp - 30000)) continue;

  let isMatch = compressedBody.includes(track.targetNumber);
                                                                      
  if (!isMatch) {
  let selisihWaktu = emailTime - track.timestamp;
  if (selisihWaktu >= -30000 && selisihWaktu <= 300000) {
      isMatch = true; }
}                                    
  if (isMatch) {
  let cleanHtml = decodedBody
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
      cleanHtml = cleanHtml.replace(/<(br|p|div|tr|th|li|ul|ol)[^>]*>/gi, '\n');
      cleanHtml = cleanHtml.replace(/<\/td[^>]*>/gi, '\n');
  let cleanText = cleanHtml.replace(/<\/?[^>]+(>|$)/g, "");
      cleanText = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      cleanText = cleanText.replace(/[ \t\u00A0\u200B\u200C\u200D\uFEFF]+/g, ' '); 
      cleanText = cleanText.replace(/\n{3,}/g, '\n\n'); 
      cleanText = cleanText.split('\n').map(line => line.trim()).join('\n').trim();

  if (cleanText.toLowerCase().includes("this is what you wrote:")) {
  let parts = cleanText.split(/this is what you wrote:/i);
      cleanText = parts[0].trim(); 
}
  if (cleanText.toLowerCase().includes("ticket number:")) {
      cleanText = cleanText.split(/ticket number:/i)[0].trim(); 
}
  let realWaReply = cleanText;
      realWaReply = polesTeksAsliWa(realWaReply);
      realWaReply = smartWrap(realWaReply, 40);
      realWaReply = realWaReply.replace(/\*+(.*?)\*+/g, '<b>$1</b>');
      realWaReply = realWaReply.replace(/\*/g, '');

  if (realWaReply.length > 800) {
      realWaReply = realWaReply.substring(0, 750) + '...'; 
}
  await bot.telegram.deleteMessage(track.chatId, track.messageId).catch(() => {});

  let statusBanding = `${e.mails}`;
  let lowerWaReply = realWaReply.toLowerCase();

  if (lowerWaReply.includes("unbanned") || lowerWaReply.includes("restored") || lowerWaReply.includes("activated") || lowerWaReply.includes("kesalahan") || lowerWaReply.includes("contact us")) {
      statusBanding = `${e.check}`;
const currentSender = db.readFlatFile('email');
const wIdx = currentSender.findIndex(w => w.email === sender.email);
  if (wIdx !== -1) {
      currentSender[wIdx].success_count = (currentSender[wIdx].success_count || 0) + 1;
      db.writeFlatFile('email', currentSender); 
}
} else if (lowerWaReply.includes("remain banned") || lowerWaReply.includes("violation") || lowerWaReply.includes("permanen") || lowerWaReply.includes("cannot be unbanned")) {
      statusBanding = `${e.cross}`;
} else if (lowerWaReply.includes("sorry") || lowerWaReply.includes("unexpected issue") || lowerWaReply.includes("try again")) {
      statusBanding = `${e.warning}`; 
}
const sentMsg = await bot.telegram.sendMessage(track.chatId,
`${e.mail} <b>BALASAN DARI WHATSAPP</b>
──────────────────────────
 ${e.target} <code>Target</code>: <code>+${track.targetNumber}</code>
 ${e.ID} <code>Fix-ID</code>: <code>${track.ticketId}</code>
 ${e.pin} <code>Status</code>: <b>${statusBanding}</b>

${e.down} <b>ɪꜱɪ ᴘᴇꜱᴀɴ</b> ${e.down}
<blockquote>${realWaReply}</blockquote>
${e.alert}<i>ᴛᴜɴɢɢᴜ 𝟷-𝟸 ᴍᴇɴɪᴛ ꜱᴇʙᴇʟᴜᴍ ᴍᴇɴᴄᴏʙᴀ
ᴠᴇʀɪꜰɪᴋᴀꜱɪ ᴜʟᴀɴɢ ꜱᴍꜱ ᴅɪ ᴀᴘᴘ ᴡʜᴀᴛꜱᴀᴘᴘ.</i>
──────────────────────`,
  { parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: { inline_keyboard: [
  [ button("fixred", "BANDING LAGI", "fixred", "primary") ],
  [ button("home", "MENU UTAMA", "dashboard", "primary") ] ] } 
  }).catch(() => {});

  if (!global.sessionStore[track.chatId]) global.sessionStore[track.chatId] = {};
  if (sentMsg && sentMsg.message_id) {
      global.sessionStore[track.chatId].fixred_message_id = sentMsg.message_id; }
  delete global.sessionStore[track.chatId].stage; 

    console.log('\x1b[32m%s\x1b[0m',
    `[✓] FIXRED ON-DEMAND: ${track.targetNumber}`);                                            
const currentDb = db.readFlatFile('fixred_tracking');
const updatedDb = currentDb.filter(t => t.targetNumber !== track.targetNumber);
      db.writeFlatFile('fixred_tracking', updatedDb);

  await client.messageFlagsAdd(msgSeq, ['\\Seen', '\\Deleted']);
    console.log('\x1b[36m%s\x1b[0m',
    `[🗑️] AUTO-SWEEPER: ${track.targetNumber}`);
    isTargetProcessed = true;
  break; }
}
  if (!isTargetProcessed) {
  await client.messageFlagsAdd(msgSeq, ['\\Seen']); }
  }
}
} finally { 
      lock.release(); }
} catch (err) {
} finally {
  await client.logout().catch(() => {}); }
  }
} catch (globalErr) {
    console.error('\x1b[31m%s\x1b[0m',
    "[x] ERROR MONITOR ENGINE:", globalErr.message); }
  }, 15000);
}

module.exports = { listenEmails };

