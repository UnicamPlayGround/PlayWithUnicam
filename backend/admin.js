const db = require('./database');
const utente = require('./utente');
const controller = require('./controller');
const messaggi = require('./messaggi');

/**
 * //TODO commentare
 * @param {string} username 
 */
function deleteUserQuery(username) {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE FROM public.utenti WHERE username = $1',
            [username], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject('Errore nell\'eliminazione dell\'utente: ' + username);
                } else resolve();
            });
    })
}

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
    const usersToDelete = utenti.split(",");
    var promises = [];
    usersToDelete.forEach(username => { promises.push(deleteUserQuery(username)) });
    return Promise.all(promises);
}

/**
 * Elimina un gioco.
 * @param {*} id L'id del gioco da eliminare.
 */
exports.deleteGame = (id) => {
    return new Promise((resolve, reject) => {
        db.pool.query('delete from public.giochi where id = $1',
            [id], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject("Errore nell'eliminazione del gioco: " + id);
                } else
                    return resolve();
            });
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
        if (controller.controllaString(nome))
            return reject("Il nuovo nome non è valido");
        if (controller.controllaString(cognome))
            return reject("Il nuovo cognome non è valido");

        username = controller.xssSanitize(username);
        newUsername = controller.xssSanitize(newUsername);
        nome = controller.xssSanitize(nome);
        cognome = controller.xssSanitize(cognome);

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