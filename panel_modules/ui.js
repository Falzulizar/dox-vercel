//DOX//PANEL_MODULES//UI.JS
const dbCore = require('../data/sqlite');
const cfg = require('./config');

function drawHeader() {
    console.clear();
    console.log(cfg.renderBorder());
    console.log(`${cfg.W}${cfg.BOLD}│           ${cfg.C}𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗣𝗔𝗡𝗘𝗟 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘            ${cfg.W}│`);
    console.log(cfg.renderBorder());
}

function drawDashboard(rawStatus, statusColor, statusSpaces) {
    let uCount = "0", pCount = "0", cCount = "0", fCount = "0";

    try {
        const stats = dbCore.prepare(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN status = 'PREMIUM' THEN 1 ELSE 0 END) as total_premium,
                IFNULL(SUM(total_numbers), 0) as total_checker,
                IFNULL(SUM(total_fixred), 0) as total_fixred
            FROM users
        `).get();

        if (stats) {
            uCount = (stats.total_users || 0).toLocaleString('id-ID');
            pCount = (stats.total_premium || 0).toLocaleString('id-ID');
            cCount = (stats.total_checker || 0).toLocaleString('id-ID');
            fCount = (stats.total_fixred || 0).toLocaleString('id-ID');
        }
    } catch (err) {}

    const art1 = "███╗  ██╗ █╗█╗".padEnd(19);
    const art2 = "█  █╗█  █╗╚█╔╝".padEnd(19);
    const art3 = "███╔╝╚██╔╝█╔█╗".padEnd(19);
    const art4 = "╚══╝  ╚═╝ ╚╝╚╝".padEnd(19);

    console.log(`${cfg.W}│  ${cfg.C}${cfg.BOLD}Database :${cfg.RST} SQLite${"".padEnd(26)}${cfg.W}│`); 
    console.log(`${cfg.W}│  ${cfg.C}${cfg.BOLD}Status   :${statusColor} ${rawStatus}${cfg.RST}${statusSpaces}${cfg.BC}${art1}${cfg.W}│`);
    console.log(`${cfg.W}│  ${cfg.C}${cfg.BOLD}Users    :${cfg.RST} ${uCount.padEnd(13)}${cfg.BC}${art2}${cfg.W}│`);
    console.log(`${cfg.W}│  ${cfg.C}${cfg.BOLD}Premium  :${cfg.RST} ${pCount.padEnd(13)}${cfg.BC}${art3}${cfg.W}│`);
    console.log(`${cfg.W}│  ${cfg.C}${cfg.BOLD}Checker  :${cfg.RST} ${cCount.padEnd(13)}${cfg.BC}${art4}${cfg.W}│`);
    console.log(`${cfg.W}│  ${cfg.C}${cfg.BOLD}Fixred   :${cfg.RST} ${fCount.padEnd(13)}                   ${cfg.W}│`);
    console.log(cfg.renderDivider());
}

module.exports = { drawHeader, drawDashboard };

