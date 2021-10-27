const controller = require('../controller');
const db = require('../database');
const lobby = require('./lobby');
const utente = require('../utente');
const messaggi = require('../messaggi');

/**
 * Ricerca un Giocatore tramite il suo Username.
 * @param {string} username Username del Giocatore da ricercare
 */
exports.cercaGiocatore = (username) => {
    return new Promise((resolve, reject) => {
        db.pool.query('SELECT username FROM public.giocatori WHERE username=$1',
            [username], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Controlla se sono presenti Giocatori che non effettuano l'operazione di ping per più di 15 secondi, 
 * in caso positivo vengono eliminati dalla Tabella "giocatori".
 */
exports.controllaInattivi = () => {
    db.pool.query('SELECT * FROM public.giocatori', (error, results) => {
        if (error) console.log(error);

        if (results) {
            const giocatori = JSON.parse(JSON.stringify(results.rows));

            giocatori.forEach(giocatore => {
                var dif = Date.now() - Date.parse(giocatore.ping);

                //15 secondi
                if (dif > 15000 || giocatore.ping == null) {
                    lobby.cercaLobbyByUsername(giocatore.username)
                        .then(results => {
                            if (!controller.controllaRisultatoQuery(results))
                                lobby.abbandonaLobby(giocatore.username, null)
                                    .catch(error => { console.log(error); })
                            else
                                db.pool.query('DELETE FROM public.giocatori WHERE username=$1', [giocatore.username], (error, results) => {
                                    if (error) console.log(error);
                                });
                        })
                        .catch(error => { console.log(error); })
                }
            });
        }
    });
}

/**
 * Una volta verificato che l'username appartenga ad un utente/ospite, crea un nuovo giocatore
 * con l'username in questione o, se già ne esiste uno, lo aggiorna modificandone il codice lobby.
 * 
 * @param {string} username l'username con cui creare un nuovo giocatore
 * @param {*} codiceLobby il codice della lobby a cui si vuole partecipare
 */
exports.creaGiocatore = (username, codiceLobby) => {
    return new Promise((resolve, reject) => {
        var utenteNonTrovato = false;
        utente.cercaUtenteByUsername(username)
            .then(results => {
                if (controller.controllaRisultatoQuery(results)) utenteNonTrovato = true;
                return utente.cercaOspiteByUsername(username);
            })
            .then(results => {
                if (utenteNonTrovato && controller.controllaRisultatoQuery(results))
                    return reject("L'Utente '" + username + "' non esiste!");
                return this.cercaGiocatore(username);
            })
            .then(results => {
                if (controller.controllaRisultatoQuery(results)) {
                    db.pool.query('INSERT INTO public.giocatori (username, codice_lobby, data_ingresso) VALUES ($1, $2, NOW())',
                        [username, codiceLobby], (error, results) => {
                            if (error)
                                return reject(error);
                            else
                                return resolve(results);
                        });
                } else {
                    db.pool.query('UPDATE public.giocatori SET codice_lobby = $1, data_ingresso = NOW() WHERE username = $2',
                        [codiceLobby, username], (error, results) => {
                            if (error)
                                return reject(error);
                            else
                                return resolve(results);
                        });
                }
            })
            .catch(error => {
                console.log(error);
                return reject("Non è stato possibile creare il giocatore!");
            })
    })
}

/**
 * Espelle il giocatore selezionato dall'admin dalla tabella giocatori.
 * 
 * @param {string} username l'username del giocatore da eliminare
 * @param {*} codiceLobby il codice della lobby a cui appartiene il giocatore da espellere.
 */
exports.espelliGiocatore = (username, codiceLobby) => {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE from public.giocatori WHERE username = $1 AND codice_lobby = $2',
            [username, codiceLobby], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Elimina il giocatore che vuole abbandonare la lobby dalla tabella dei giocatori.
 * 
 * @param {string} username l'username del giocatore da eliminare
 */
exports.eliminaGiocatore = (username) => {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE from public.giocatori WHERE username = $1',
            [username], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Ritorna l'insieme delle informazioni di una partita salvate in ogni giocatore della lobby.
 * @param {*} codiceLobby Codice della Lobby
 */
exports.getInfoGiocatori = (codiceLobby) => {
    return new Promise((resolve, reject) => {
        db.pool.query('SELECT info FROM public.giocatori WHERE codice_lobby=$1',
            [codiceLobby], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Esegue l'operazione di Ping per permettere al Server di capire quali Giocatori risultino inattivi.
 * @param {string} username Username del Giocatore che sta effettuando il Ping
 */
exports.ping = (username) => {
    return new Promise((resolve, reject) => {
        lobby.cercaLobbyByUsername(username)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject(messaggi.PARTECIPAZIONE_LOBBY_ERROR);

                db.pool.query('UPDATE public.giocatori SET ping = NOW() WHERE username = $1', [username], (error, results) => {
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

//TODO commentare
exports.resetInfoPartita = (codiceLobby) => {
    return new Promise((resolve, reject) => {
        db.pool.query('UPDATE public.giocatori SET info = $1 WHERE codice_lobby = $2',
            [null, codiceLobby], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}