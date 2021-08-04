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

exports.creaGiocatore = (username, codiceLobby, ruolo, response) => {
    try {
        utente.cercaUtenteByUsername(username, (err, results) => {
            if (controller.controllaRisultatoQuery(results)) return response.status(400).send("L'Utente '" + username + "' non esiste!");

            db.pool.query('INSERT INTO public.giocatori (username, codice_lobby, ruolo) VALUES ($1, $2, $3)',
                [username, codiceLobby, ruolo], (error, results) => {
                    if (error) return response.status(400).send("Non è stato possibile creare il Giocatore!");

                    if (ruolo == "ADMIN")
                        lobby.impostaAdminLobby(username, codiceLobby, response);
                })
        })
    } catch (error) {
        return response.status(400).send(error);
    }
}