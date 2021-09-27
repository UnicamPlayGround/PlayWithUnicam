const db = require('./database');
const utente = require('./utente');
const controller = require('./controller');
const messaggi = require('./messaggi');

/**
 * Ritorna la lista degli Utenti che hanno tipo diverso da "ADMIN".
 * @param {*} username L'username del admin che fa la richiesta
 * @returns il risultato della query
 */
exports.getUtenti = (username) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select username, nome, cognome, tipo from public.utenti where username <> $1',
            [username], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Elimina un gruppo di Utenti.
 * @param {*} utenti Utenti da eliminare
 */
exports.eliminaUtenti = (utenti) => {
    return new Promise((resolve, reject) => {
        const usersToDelete = utenti.split(",");

        usersToDelete.forEach(username => {
            db.pool.query('delete from public.utenti where username = $1',
                [String(username)], (error, results) => {
                    if (error) {
                        console.log(error);
                        return reject('Errore nell\'eliminazione dell\'utente: ' + username);
                    }
                });
        });
        return resolve();
    })
}

/**
 * Modifica le Informazioni di un Utente.
 * @param {string} username Username dell'Utente da modificare
 * @param {string} newUsername Nuovo Username
 * @param {string} nome Nuovo Nome da impostare
 * @param {string} cognome Nuovo Cognome da impostare
 */
exports.modificaUtente = (username, newUsername, nome, cognome) => {
    return new Promise((resolve, reject) => {
        if (controller.controllaString(username))
            return reject("L'username non è valido");
        if (controller.controllaString(newUsername))
            return reject("Il nuovo username non è valido");
        if (controller.controllaString(newNome))
            return reject("Il nuovo nome non è valido");
        if (controller.controllaString(newCognome))
            return reject("Il nuovo cognome non è valido");

        if (username === newUsername)
            utente.modificaNomeCognome(username, nome, cognome).then(_ => resolve());
        else {
            utente.modificaUsername(username, newUsername)
                .then(_ => { return utente.modificaNomeCognome(newUsername, nome, cognome) })
                .then(_ => resolve())
                .catch(error => {
                    console.log(error);
                    return reject(messaggi.SERVER_ERROR);
                });
        }
    })
}

//TODO: fare metodo e REST che modifica il tipo