const db = require('../database');
const lobby = require('./lobby');
const controller = require('../controller');

/**
 * Crea un nuovo Gioco.
 * @param {string} nome Nome del Gioco
 * @param {string} tipo Tipologia del Gioco (es. "Gioco a TURNI")
 * @param {*} minGiocatori Numero Minimo di Giocatori
 * @param {*} maxGiocatori Numero Massimo di Giocatori
 * @param {string} link Link del Gioco
 * @param {boolean} attivo Valore booleano per determinare se il Gioco è attivo o no
 * @param {JSON} config JSON di Configuarazione del Gioco
 * @param {string} regolamento Regolamento del Gioco
 * @param {*} response 
 */
exports.creaGioco = (nome, tipo, minGiocatori, maxGiocatori, link, attivo, config, regolamento, response) => {
    controller.controllaDatiGioco(nome, tipo, minGiocatori, maxGiocatori, link, attivo, regolamento);

    db.pool.query('INSERT INTO public.giochi (nome, tipo, max_giocatori, min_giocatori, link, attivo, config, regolamento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [nome, tipo, maxGiocatori, minGiocatori, link, attivo, config, regolamento], (error, results) => {
            if (error) {
                console.log(error);
                return response.status(400).send("Non è stato possibile creare il gioco!");
            }
            return response.status(200).send({ 'esito': "1" });
        })
}

/**
 * Ritorna il JSON di Configurazione del Gioco.
 * @param {string} username Username del Giocatore che richiede la Configurazione
 * @param {*} response 
 * @param {*} cb Callback
 */
exports.getConfigGioco = (username, response, cb) => {
    lobby.cercaLobbyByUsername(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(400).send("Non è stato possibile trovare la lobby");
        }
        if (controller.controllaRisultatoQuery(results))
            return response.status(400).send("Errore: devi partecipare ad una lobby!");

        const lobby = JSON.parse(JSON.stringify(results.rows))[0];

        db.pool.query('select config from public.giochi where id=$1', [lobby.id_gioco], (error, results) => {
            cb(error, results)
        });
    })
}

/**
 * Ritorna le Informazioni del Gioco.
 * @param {*} idGioco ID del Gioco
 * @param {*} cb Callback
 * @returns Le Informazioni del Gioco (id, nome, tipo, max_giocatori, min_giocatori, link)
 */
exports.getInfoGioco = (idGioco, cb) => {
    return db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, link from public.giochi where id=$1',
        [idGioco], (error, results) => {
            cb(error, results)
        });
}

/**
 * Ritorna le Informazioni dei Giochi che sono *"attivi"*.
 * @param {*} cb Callback
 * @returns Le Informazioni dei Giochi (id, nome, tipo, max_giocatori, min_giocatori, link)
 */
exports.getListaGiochi = (cb) => {
    return db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, link from public.giochi where attivo=$1',
        [true], (error, results) => {
            cb(error, results)
        });
}

/**
 * Ritorna all'Admim della Piattaforma le Informazioni dei Giochi.
 * @param {*} cb Callback
 * @returns Le Informazioni dei Giochi (id, nome, tipo, max_giocatori, min_giocatori, link, attivo, config, regolamento)
 */
exports.getListaGiochiAsAdmin = (cb) => {
    return db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, link, attivo, config, regolamento from public.giochi',
        (error, results) => {
            cb(error, results)
        });
}

/**
 * Modifica le Informazioni del Gioco.
 * @param {*} id ID del Gioco da modificare
 * @param {string} nome Nome del Gioco
 * @param {string} tipo Tipologia del Gioco (es. "Gioco a TURNI")
 * @param {*} minGiocatori Numero Minimo di Giocatori
 * @param {*} maxGiocatori Numero Massimo di Giocatori
 * @param {string} link Link del Gioco
 * @param {boolean} attivo Valore booleano per determinare se il Gioco è attivo o no
 * @param {JSON} config JSON di Configuarazione del Gioco
 * @param {string} regolamento Regolamento del Gioco
 * @param {*} response 
 */
exports.modificaGioco = (id, nome, tipo, minGiocatori, maxGiocatori, link, attivo, config, regolamento, response) => {
    controller.controllaDatiGioco(nome, tipo, minGiocatori, maxGiocatori, link, attivo, regolamento);

    db.pool.query('UPDATE public.giochi SET nome=$1, tipo=$2, max_giocatori=$3, min_giocatori=$4, link=$5, attivo=$6, config=$7, regolamento=$8 WHERE id=$9',
        [nome, tipo, maxGiocatori, minGiocatori, link, attivo, config, regolamento, id], (error, results) => {
            if (error) {
                console.log(error);
                return response.status(400).send("Non è stato possibile creare il gioco!");
            }
            return response.status(200).send({ 'esito': "1" });
        })
}