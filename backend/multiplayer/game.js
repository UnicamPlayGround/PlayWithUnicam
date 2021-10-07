const db = require('../database');
const lobby = require('./lobby');
const controller = require('../controller');
const messaggi = require('../messaggi');

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
 */
exports.creaGioco = (nome, tipo, minGiocatori, maxGiocatori, link, attivo, config, regolamento) => {
    nome = controller.xssSanitize(nome);
    tipo = controller.xssSanitize(tipo);
    link = controller.xssSanitize(link);
    regolamento = controller.xssSanitize(regolamento);

    return new Promise((resolve, reject) => {
        controller.controllaDatiGioco(nome, tipo, minGiocatori, maxGiocatori, link, attivo, regolamento)
            .then(_ => {
                db.pool.query('INSERT INTO public.giochi (nome, tipo, max_giocatori, min_giocatori, link, attivo, config, regolamento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [nome, tipo, maxGiocatori, minGiocatori, link, attivo, config, regolamento], (error, results) => {
                        if (error) {
                            console.log(error);
                            return reject(messaggi.CREAZIONE_GIOCO_ERROR);
                        }
                        return resolve();
                    })
            })
            .catch(error => {
                console.log(error);
                return reject(error);
            });
    })
}

/**
 * Ritorna il JSON di Configurazione del Gioco.
 * @param {string} username Username del Giocatore che richiede la Configurazione
 */
exports.getConfigGioco = (username) => {
    return new Promise((resolve, reject) => {
        lobby.cercaLobbyByUsername(username)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject(messaggi.PARTECIPAZIONE_LOBBY_ERROR);

                const lobby = JSON.parse(JSON.stringify(results.rows))[0];

                db.pool.query('select config from public.giochi where id=$1', [lobby.id_gioco], (error, results) => {
                    if (error)
                        return reject(error);
                    else
                        return resolve(results);
                });
            })
            .catch(error => {
                console.log(error);
                return reject("Non è stato possibile trovare la lobby");
            })
    })
}

/**
 * Ritorna le Informazioni del Gioco.
 * @param {*} idGioco ID del Gioco
 * @returns Le Informazioni del Gioco (id, nome, tipo, max_giocatori, min_giocatori, link)
 */
exports.getInfoGioco = (idGioco) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, link from public.giochi where id=$1',
            [idGioco], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Ritorna le Informazioni dei Giochi che sono *"attivi"*.
 * @returns Le Informazioni dei Giochi (id, nome, tipo, max_giocatori, min_giocatori, link)
 */
exports.getListaGiochi = () => {
    return new Promise((resolve, reject) => {
        db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, link from public.giochi where attivo=$1',
            [true], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Ritorna all'Admim della Piattaforma le Informazioni dei Giochi.
 * @returns Le Informazioni dei Giochi (id, nome, tipo, max_giocatori, min_giocatori, link, attivo, config, regolamento)
 */
exports.getListaGiochiAsAdmin = () => {
    return new Promise((resolve, reject) => {
        db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, link, attivo, config, regolamento from public.giochi',
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
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
 */
exports.modificaGioco = (id, nome, tipo, minGiocatori, maxGiocatori, link, attivo, config, regolamento) => {
    nome = controller.xssSanitize(nome);
    tipo = controller.xssSanitize(tipo);
    link = controller.xssSanitize(link);
    regolamento = controller.xssSanitize(regolamento);

    return new Promise((resolve, reject) => {
        controller.controllaDatiGioco(nome, tipo, minGiocatori, maxGiocatori, link, attivo, regolamento)
            .then(_ => {
                db.pool.query('UPDATE public.giochi SET nome=$1, tipo=$2, max_giocatori=$3, min_giocatori=$4, link=$5, attivo=$6, config=$7, regolamento=$8 WHERE id=$9',
                    [nome, tipo, maxGiocatori, minGiocatori, link, attivo, config, regolamento, id], (error, results) => {
                        if (error) {
                            console.log(error);
                            return reject(messaggi.CREAZIONE_GIOCO_ERROR);
                        }
                        return resolve();
                    })
            })
            .catch(error => {
                console.log(error);
                return reject(error);
            });
    })
}