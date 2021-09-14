const controller = require('../controller');
const db = require('../database');
const lobby = require('./lobby');
const utente = require('../utente');
const messaggi = require('../messaggi');

/**
 * Ricerca un Giocatore tramite il suo Username.
 * @param {string} username Username del Giocatore da ricercare
 * @param {*} cb Callback
 */
exports.cercaGiocatore = (username, cb) => {
    db.pool.query('SELECT username FROM public.giocatori WHERE username=$1',
        [username], (error, results) => {
            cb(error, results)
        });
}

/**
 * Controlla se sono presenti Giocatori che non effettuano l'operazione di ping per più di 15 secondi, 
 * in caso positivo vengono eliminati dalla Tabella "giocatori".
 */
exports.controllaInattivi = () => {
    db.pool.query('SELECT * FROM public.giocatori', (error, results) => {
        if (error) console.log(error);

        const giocatori = JSON.parse(JSON.stringify(results.rows));

        giocatori.forEach(giocatore => {
            var dif = Date.now() - Date.parse(giocatore.ping);

            //15 secondi
            if (dif > 15000 || giocatore.ping == null) {
                lobby.cercaLobbyByUsername(giocatore.username, (error, results) => {
                    if (error) console.log(error);

                    if (!controller.controllaRisultatoQuery(results))
                        lobby.abbandonaLobby(giocatore.username, null, (error, errorText) => {
                            if (error) {
                                console.log(errorText);
                                console.log(error);
                            }
                        })
                    else
                        db.pool.query('DELETE FROM public.giocatori WHERE username=$1', [giocatore.username], (error, results) => {
                            if (error) console.log(error);
                        });
                })
            }
        });
    });
}

/**
 * Una volta verificato che l'username appartenga ad un utente/ospite, crea un nuovo giocatore
 * con l'username in questione o, se già ne esiste uno, lo aggiorna modificandone il codice lobby.
 * 
 * @param {string} username l'username con cui creare un nuovo giocatore
 * @param {*} codiceLobby il codice della lobby a cui si vuole partecipare
 * @param {*} response 
 * @param {*} cb callback
 */
exports.creaGiocatore = (username, codiceLobby, response, cb) => {
    try {
        var utenteNonTrovato = false;
        utente.cercaUtenteByUsername(username, (error, results) => {
            if (error) {
                console.log(error);
                return response.status(400).send("Non è stato possibile creare il giocatore!");
            }
            if (controller.controllaRisultatoQuery(results)) utenteNonTrovato = true;

            utente.cercaOspiteByUsername(username, (error, results) => {
                if (error) {
                    console.log(error);
                    return response.status(400).send("Non è stato possibile creare il giocatore!");
                }
                if (utenteNonTrovato && controller.controllaRisultatoQuery(results)) return response.status(404).send("L'Utente '" + username + "' non esiste!");

                this.cercaGiocatore(username, (error, results) => {
                    if (error) {
                        console.log(error);
                        return response.status(400).send("Non è stato possibile creare il giocatore!");
                    }

                    if (controller.controllaRisultatoQuery(results)) {
                        db.pool.query('INSERT INTO public.giocatori (username, codice_lobby, data_ingresso) VALUES ($1, $2, NOW())',
                            [username, codiceLobby], (error, results) => {
                                cb(error, results);
                            });
                    } else {
                        db.pool.query('UPDATE public.giocatori SET codice_lobby = $1, data_ingresso = NOW() WHERE username = $2',
                            [codiceLobby, username], (error, results) => {
                                cb(error, results);
                            });
                    }
                });
            })
        })
    } catch (error) {
        console.log(error);
        return response.status(400).send(error);
    }
}

/**
 * Espelle il giocatore selezionato dall'admin dalla tabella giocatori.
 * 
 * @param {string} username l'username del giocatore da eliminare
 * @param {*} codiceLobby il codice della lobby a cui appartiene il giocatore da espellere.
 * @param {*} cb callback
 */
exports.espelliGiocatore = (username, codiceLobby, cb) => {
    db.pool.query('DELETE from public.giocatori WHERE username = $1 AND codice_lobby = $2',
        [username, codiceLobby], (error, results) => {
            cb(error, results);
        });
}

/**
 * Elimina il giocatore che vuole abbandonare la lobby dalla tabella dei giocatori.
 * 
 * @param {string} username l'username del giocatore da eliminare
 * @param {*} cb callback
 */
exports.eliminaGiocatore = (username, cb) => {
    db.pool.query('DELETE from public.giocatori WHERE username = $1',
        [username], (error, results) => {
            cb(error, results);
        });
}

/**
 * Esegue l'operazione di Ping per permettere al Server di capire quali Giocatori risultino inattivi.
 * @param {string} username Username del Giocatore che sta effettuando il Ping
 * @param {*} response 
 * @param {*} cb Callback
 */
exports.ping = (username, response, cb) => {
    lobby.cercaLobbyByUsername(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(400).send("Non è stato possibile trovare la lobby");
        }
        if (controller.controllaRisultatoQuery(results))
            return response.status(400).send(messaggi.PARTECIPAZIONE_LOBBY_ERROR);

        db.pool.query('UPDATE public.giocatori SET ping = NOW() WHERE username = $1', [username], (error, results) => {
            cb(error, results)
        });
    })
}