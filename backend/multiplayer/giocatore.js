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
        return response.status(400).send(error);
    }
}

/**
 * Espelle il giocatore selezionato dall'admin dalla tabella giocatori
 * 
 * @param {*} username l'username del giocatore da eliminare
 * @param {*} codice_lobby il codice della lobby a cui appartiene il giocatore da espellere.
 * @param {*} cb callback
 */
exports.espelliGiocatore = (username, codice_lobby, cb) => {
    db.pool.query('DELETE from public.giocatori WHERE username = $1 AND codice_lobby = $2',
        [username, codice_lobby], (error, results) => {
            cb(error, results);
        });
}

/**
 * Elimina il giocatore che vuole abbandonare la lobby dalla tabella dei giocatori.
 * 
 * @param {*} username l'username del giocatore da eliminare
 * @param {*} cb callback
 */
exports.eliminaGiocatore = (username, cb) => {
    db.pool.query('DELETE from public.giocatori WHERE username = $1',
        [username], (error, results) => {
            cb(error, results);
        });
}

exports.ping = (username, response, cb) => {
    lobby.cercaLobbyByUsername(username, (error, results) => {
        if (error) return response.status(400).send("Non è stato possibile trovare la Lobby");
        if (controller.controllaRisultatoQuery(results))
            return response.status(400).send("Errore: Devi partecipare ad una Lobby!");

        db.pool.query('UPDATE public.giocatori SET ping = NOW() WHERE username = $1', [username], (error, results) => {
            cb(error, results)
        });
    })
}

exports.controllaInattivi = () => {
    db.pool.query('SELECT * FROM public.giocatori', (error, results) => {
        //TODO error
        const giocatori = JSON.parse(JSON.stringify(results.rows));

        giocatori.forEach(giocatore => {
            var dif = Date.now() - Date.parse(giocatore.ping);

            //10 secondi
            if (dif > 10000) {
                db.pool.query('DELETE FROM public.giocatori WHERE username=$1', [giocatore.username], (error, results) => {
                    //TODO error
                });
            }
        });
    });
}