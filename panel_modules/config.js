//DOX//PANEL_MODULES//CONFIG.JS
module.exports = {
    BOLD: '\x1b[1m',
    B: '\x1b[34m', 
    BB: '\x1b[94m', 
    C: '\x1b[36m',
    BC: '\x1b[96m', 
    RST: '\x1b[0m',
    G: '\x1b[32m',
    R: '\x1b[31m',
    Y: '\x1b[33m',
    W: '\x1b[37m',
    A: '\x1b[90m',

    formatCell: (label, isSelected, targetWidth = 22) => {
        const bold = '\x1b[1m';
        const bc = '\x1b[96m'; 
        const w = '\x1b[37m'; 
        const rst = '\x1b[0m';

        if (isSelected) {
            const decorated = ` 𓊈${label.trim()}𓊉 `;
            const remaining = (targetWidth + 2) - decorated.length;
            const leftPad = Math.floor(remaining / 2);
            const rightPad = remaining - leftPad;
            return `${bc}${bold}${" ".repeat(leftPad)}${decorated}${" ".repeat(rightPad)}${rst}`;
        } else {
            const remaining = targetWidth - label.length;
            const leftPad = Math.floor(remaining / 2);
            const rightPad = remaining - leftPad;
            return `${w}${" ".repeat(leftPad)}${label}${" ".repeat(rightPad)}${rst}`;
        }
    },

    renderBorder: () => `\x1b[37m\x1b[1m✧─────────────────────────────────────────────✧\x1b[0m`,
    renderClose: () => `\x1b[37m✧──────────────────────✧──────────────────────✧\x1b[0m`,
    renderDivider: () => `\x1b[37m✧──────────────────────✧──────────────────────✧\x1b[0m`
};

