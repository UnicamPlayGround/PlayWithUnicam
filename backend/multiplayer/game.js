const db = require('../database');

//TODO commentare
exports.getListaGiochi = (cb) => {
    return db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, link from public.giochi where attivo=$1',
        [true], (error, results) => {
            cb(error, results)
        });
}

//TODO commentare
exports.lancioDado = (nFacce) => {
    if (nFacce == 0 || nFacce == null || isNaN(parseInt(nFacce)))
        throw "Errore, il numero delle facce del dado deve essere un numero maggiore di 0!";

    return Math.floor(Math.random() * nFacce) + 1;
}