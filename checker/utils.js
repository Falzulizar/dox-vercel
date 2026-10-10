//DOX//CHECKER//UTILS.JS
function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)) ]);
}
function isNomorCantik(num) {
    if (!num || num.length < 6) return false;
const last6 = num.slice(-6);
    if (/(\d)\1{3,}$/.test(last6)) return true;
    if (last6.substring(0,3) === last6.substring(3,6)) return true;
    if (last6[0] === last6[1] && last6[2] === last6[3] && last6[4] === last6[5]) return true;
    if (last6[0] === last6[1] && last6[1] === last6[2] && last6[3] === last6[4] && last6[4] === last6[5]) return true;
const polaUrutan = [
        "123456", "234567", "345678", "456789", 
        "987654", "876543", "765432", "654321"];
    if (polaUrutan.includes(last6)) return true;

    return false;
}

module.exports = { withTimeout, isNomorCantik };

