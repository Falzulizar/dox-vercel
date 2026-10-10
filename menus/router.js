//DOX/MENUS/ROUTER.JS
const { handleDashboard } = require('./dashboard');
const { handleChecker, handleSpeed, handleHistoryCek } = require('./checker');
const { handleWorker, handleAddWorker, handlePairing } = require('./worker');
const { handleFixred, handleSender, handleAntrian, handleHistoryFix } = require('./fixred');
const { handlePremium } = require('./premium');
const { handleReward } = require('./reward');
const { handleLeaderboard } = require('./leaderboard');
const { handleBantuan } = require('./bantuan');

module.exports = { 
    handleDashboard,
    handleChecker, 
    handleWorker,
    handleAddWorker, 
    handlePairing,
    handleSpeed, 
    handleHistoryCek,
    handleFixred,
    handleSender,
    handleAntrian,
    handleHistoryFix,
    handlePremium, 
    handleReward,
    handleLeaderboard,
    handleBantuan
};