// //DOX//CHECKER//FORMATTER.JS

function generateTxtReport(bucket, pctReg, pctUnreg) {
const totalRegionNum = bucket.terdaftar.length + bucket.tidakTerdaftar.length;
const rawFlag = bucket.flag.replace(/<[^>]*>/g, '');

return `==================================================
📊 LAPORAN HASIL PENGECEKAN
==================================================
🌍 Region : ${rawFlag} ${bucket.name}
📊 Total Input Nomor: ${totalRegionNum}
 ├✅ Total Terdaftar WA: ${bucket.terdaftar.length} [${pctReg}%]
 │ ├📝 Memiliki Bio: ${bucket.adaBio.length}
 │ ├🚫 Tanpa Bio: ${bucket.tanpaBio.length}
 │ ├🏢 Meta Business: ${bucket.metaBusinessList.length}
 │ └✨ Nomor Cantik: ${bucket.nomorCantikList.length}
 └❌ Total Tidak Terdaftar: ${bucket.tidakTerdaftar.length} [${pctUnreg}%]
==================================================
[ 📝 ADA BIO ] [${bucket.adaBio.length}]
${bucket.txtOnlyBio.trim() ? bucket.txtOnlyBio.trim() : "(Tidak ada nomor yang memiliki bio)"}
--------------------------------------------------
[ 🏢 META BUSINESS ] [${bucket.metaBusinessList.length}]
${bucket.txtOnlyBusiness.trim() ? bucket.txtOnlyBusiness.trim() : "(Tidak ada data nomor bertipe bisnis)"}
--------------------------------------------------
[ ✨ NOMOR CANTIK ] [${bucket.nomorCantikList.length}]
${bucket.txtNomorCantik.trim() ? bucket.txtNomorCantik.trim() : "(Tidak ada nomor cantik)"}
--------------------------------------------------
[ 🟢 MESSENGER ] [${bucket.terdaftar.length}]
${bucket.txtPersonalNoBio.trim() ? bucket.txtPersonalNoBio.trim() : "(Tidak ada nomor personal biasa)"}
--------------------------------------------------
[ ❌ TIDAK TERDAFTAR ] [${bucket.tidakTerdaftar.length}]
${bucket.txtNotRegistered.trim() ? bucket.txtNotRegistered.trim() : "(Tidak ada data nomor tidak terdaftar)"}
--------------------------------------------------`; }

function generateTelegramSummary(groupedRegions, globalStats, totalLines) {
const regionKeys = Object.keys(groupedRegions);
  
  if (regionKeys.length === 1) {
const bucket = groupedRegions[regionKeys[0]];
return `${e.check} <b>PROSES CHECKER SELESAI!</b>
──────────────────────────
${e.earth} <b>Region:</b> ${bucket.flag} ${bucket.name}
${e.chartbar} <b>HASIL PENGECEKAN:</b>
 ├${e.total} <code>Total Nomor</code>: <b>${totalLines}</b>
 ├${e.yes} <code>Terdaftar WA</code>: <b>${globalStats.terdaftar}</b> (${((globalStats.terdaftar / (totalLines || 1)) * 100).toFixed(1)}%)
 │ ├${e.memo} <code>Memiliki Bio</code>: <b>${globalStats.adaBio}</b>
 │ ├${e.forbid} <code>Tanpa Bio   </code>: <b>${globalStats.tanpaBio}</b>
 │ ├${e.office} <code>WA Business </code>: <b>${globalStats.metaBusiness}</b>
 │ └${e.sparkles} <code>Nomor Cantik</code>: <b>${globalStats.nomorCantik}</b>
 └${e.no} <code>Tidak Terdaftar</code>: <b>${globalStats.tidakTerdaftar}</b> (${((globalStats.tidakTerdaftar / (totalLines || 1)) * 100).toFixed(1)}%)
──────────────────────`; }
  
  let summaryRegionsText = "";
  regionKeys.forEach((rName) => {
const bucket = groupedRegions[rName];
const totalRegionNum = bucket.terdaftar.length + bucket.tidakTerdaftar.length;

summaryRegionsText +=
` ├${bucket.flag} <b>${rName}</b>\n` +
` │ ├${e.total} <code>Total Nomor</code>: <b>${totalRegionNum}</b>\n` +
` │ ├${e.yes} <code>Terdaftar WA</code>: <b>${bucket.terdaftar.length}</b>\n` +
` │ └${e.no} <code>Tidak Terdaftar</code>: <b>${bucket.tidakTerdaftar.length}</b>\n`;
});  
return `${e.yes} <b>PROSES CHECKER SELESAI!</b>
──────────────────────────
${e.chartup} <b>HASIL CHECKER MULTI-REGION:</b>
${summaryRegionsText} └────────────────────────
${e.chartbar} <b>TOTAL HASIL PENGECEKAN</b>
 ├${e.total} <code>Total Nomor</code>: <b>${totalLines}</b>
 ├${e.yes} <code>Terdaftar WA</code>: <b>${globalStats.terdaftar}</b> (${((globalStats.terdaftar / (totalLines || 1)) * 100).toFixed(1)}%)
 │ ├${e.memo} <code>Memiliki Bio</code>: <b>${globalStats.adaBio}</b>
 │ ├${e.forbid} <code>Tanpa Bio   </code>: <b>${globalStats.tanpaBio}</b>
 │ ├${e.office} <code>WA Business </code>: <b>${globalStats.metaBusiness}</b>
 │ └${e.sparkles} <code>No Cantik   </code>: <b>${globalStats.nomorCantik}</b>
 └${e.no} <code>Tidak Terdaftar</code>: <b>${globalStats.tidakTerdaftar}</b> (${((globalStats.tidakTerdaftar / (totalLines || 1)) * 100).toFixed(1)}%)
──────────────────────`;
}

module.exports = { generateTxtReport, generateTelegramSummary };

