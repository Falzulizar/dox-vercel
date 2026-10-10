//DOX//UTILS//PREMIUM.JS
const dbCore = require('../data/sqlite');

module.exports = function isPremium(userId) {
const id = String(userId);

  try {
  const row = dbCore.prepare("SELECT status, premium_expired_at FROM users WHERE id = ?").get(id);
  if (!row) return false;
  
  if (row.status === 'PREMIUM') {
  if (row.premium_expired_at && Date.now() > Number(row.premium_expired_at)) {
      dbCore.prepare("UPDATE users SET status = 'FREE USER', premium_expired_at = NULL WHERE id = ?").run(id);
      return false;
  }
  return true;
}
  return false;
} catch (err) {
    console.error(
    '[x] ERROR AT ISPREMIUM INTEGRATION CHECKER UTILS:', err.message);
  return false;
  }
};

