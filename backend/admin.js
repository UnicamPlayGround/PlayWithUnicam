const db = require('./database');
const utente = require('./utente');
const controller = require('./controller');
const messaggi = require('./messaggi');

/**
 * Ritorna la lista degli Utenti che hanno tipo diverso da "ADMIN".
 * @param {*} username L'username del admin che fa la richiesta
 * @param {*} cb Callback
 * @returns il risultato della query
 */
exports.getUtenti = (username, cb) => {
    return db.pool.query('select username, nome, cognome, tipo from public.utenti where username <> $1',
        [username], (error, results) => {
            cb(error, results)
        });
}

/**
 * Elimina un gruppo di Utenti.
 * @param {*} utenti Utenti da eliminare
 * @param {*} response 
 */
exports.eliminaUtenti = (utenti, response) => {
    const usersToDelete = utenti.split(",");

    usersToDelete.forEach(username => {
        db.pool.query('delete from public.utenti where username = $1',
            [String(username)], (error, results) => {
                if (error) {
                    console.log(error);
                    return response.status(400).send('Errore nella query');
                }
            });
    });
    return response.status(200).send({ 'esito': "1" });
}

/**
 * Modifica le Informazioni di un Utente.
 * @param {string} username Username dell'Utente da modificare
 * @param {string} newUsername Nuovo Username
 * @param {string} nome Nuovo Nome da impostare
 * @param {string} cognome Nuovo Cognome da impostare
 * @param {*} response 
 */
exports.modificaUtente = (username, newUsername, nome, cognome, response) => {
    controller.controllaString(username, "L'username non è valido");
    controller.controllaDatiAccount(newUsername, nome, cognome);

    if (username === newUsername)
        utente.modificaNomeCognome(username, nome, cognome, response);
    else {
        utente.modificaUsername(username, newUsername, response, (error, results) => {
            if (error) {
                console.log(error);
                return response.status(500).send(messaggi.SERVER_ERROR);
            }
            utente.modificaNomeCognome(newUsername, nome, cognome, response);
        })
    }
}

//TODO: fare metodo e REST che modifica il tipo