//DOX//DATA//OPTIMIZER.JS
const db = require('./sqlite');

function runOptimizer() {
    try {
        console.log('\x1b[36m%s\x1b[0m',
        '[♻] STARTING DB TUNE-UP & OPTIMIZATION...');

        const now = Date.now();
        const cleanCache = db.prepare('DELETE FROM cache WHERE expires_at < ?').run(now);
        if (cleanCache.changes > 0) {
            console.log('\x1b[33m%s\x1b[0m',
            `[♻] OPTIMIZER: CLEANED ${cleanCache.changes}`);
        }

        db.exec('VACUUM');
        
        db.exec('ANALYZE');

        console.log('\x1b[32m%s\x1b[0m',
        '[DB] TUNE-UP FINISHED!');
        return true;
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m',
        '[DB] OPTIMIZATION FAILED:', err.message);
        return false;
    }
}

module.exports = runOptimizer;

