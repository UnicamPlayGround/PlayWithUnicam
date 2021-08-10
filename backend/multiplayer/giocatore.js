const controller = require('../controller');
const db = require('../database');
const lobby = require('./lobby');
const utente = require('../utente');

exports.cercaGiocatore = (username, cb) => {
    return db.pool.query('SELECT username FROM public.giocatori WHERE username=$1',
        [username], (error, results) => {
            cb(error, results)
        });
}

/**
 * Una volta verificato che l'username appartenga ad un utente/ospite, crea un nuovo giocatore
 * con l'username in questione o, se già ne esiste uno, lo aggiorna modificandone il codice lobby.
 * 
 * @param {*} username l'username con cui creare un nuovo giocatore
 * @param {*} codiceLobby il codice della lobby a cui si vuole partecipare
 * @param {*} response 
 * @param {*} cb callback
 */
exports.creaGiocatore = (username, codiceLobby, response, cb) => {
    try {
        var utenteNonTrovato = false;
        utente.cercaUtenteByUsername(username, (err, results) => {
            if (controller.controllaRisultatoQuery(results)) utenteNonTrovato = true;

            utente.cercaOspiteByUsername(username, (err, results) => {
                if (utenteNonTrovato && controller.controllaRisultatoQuery(results)) return response.status(404).send("L'Utente '" + username + "' non esiste!");

                this.cercaGiocatore(username, (err, results) => {
                    if (controller.controllaRisultatoQuery(results)) {
                        db.pool.query('INSERT INTO public.giocatori (username, codice_lobby) VALUES ($1, $2)',
                            [username, codiceLobby], (error, results) => {
                                cb(error, results);
                            });
                    } else {
                        db.pool.query('UPDATE public.giocatori SET codice_lobby = $1 WHERE username = $2',
                            [codiceLobby, username], (error, results) => {
                                cb(error, results);
                            });
                    }
                });
            })
        })
    } catch (error) {
        return response.status(400).send(error);
    }
}

/**
 * Elimina un giocatore dalla tabella dei giocatori.
 * 
 * @param {*} username l'username del giocatore da eliminare
 * @param {*} cb callback
 */
exports.cancellaGiocatore = (username, cb) => {
    db.pool.query('DELETE from public.giocatori WHERE username = $1',
        [username], (error, results) => {
            cb(error, results);
        });
}