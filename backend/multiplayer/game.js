const db = require('../database');
const lobby = require('./lobby');
const controller = require('../controller');

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

//TODO commentare
exports.getInfoGioco = (idGioco, cb) => {
    return db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, link from public.giochi where id=$1',
        [idGioco], (error, results) => {
            cb(error, results)
        });
}

//TODO commentare
exports.getConfigGioco = (username, response, cb) => {
    lobby.cercaLobbyByUsername(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(400).send("Non è stato possibile trovare la Lobby");
        }
        if (controller.controllaRisultatoQuery(results))
            return response.status(400).send("Errore: Devi partecipare ad una Lobby!");

        const lobby = JSON.parse(JSON.stringify(results.rows))[0];

        db.pool.query('select config from public.giochi where id=$1', [lobby.id_gioco], (error, results) => {
            cb(error, results)
        });
    })
}

//TODO commentare
exports.creaGioco = (nome, tipo, minGiocatori, maxGiocatori, link, attivo, config, regolamento, response) => {
    controller.controllaDatiGioco(nome, tipo, minGiocatori, maxGiocatori, link, attivo, regolamento);

    return db.pool.query('INSERT INTO public.giochi (nome, tipo, max_giocatori, min_giocatori, link, attivo, config, regolamento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [nome, tipo, maxGiocatori, minGiocatori, link, attivo, config, regolamento], (error, results) => {
            if (error) {
                console.log(error);
                return response.status(400).send("Non è stato possibile creare il gioco!");
            }
            return response.status(200).send({ 'esito': "1" });
        })
}