const db = require('../database');

//TODO commentare
exports.getInfoPartita = (cb) => {
    return db.pool.query('select info_partita from public.partite where codice_lobby=$1',
        [decoded_token.codiceLobby], (error, results) => {
            cb(error, results)
        });
}