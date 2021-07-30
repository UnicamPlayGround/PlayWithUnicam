const db = require('./database');

/**
 * Ritorna la lista degli Utenti che hanno tipo diverso da "ADMIN".
 * @param {*} cb Callback
 * @returns il risultato della query
 */
exports.getUtenti = (cb) => {
    return db.pool.query('select username from public.utenti where tipo<>$1',
        ["ADMIN"], (error, results) => {
            cb(error, results)
        });
}