const controller = require('./controller');
const db = require('./database');
const bcrypt = require('bcrypt');
const messaggi = require('./messaggi');

/**
 * Modifica la Password di un Utente.
 * @param {string} newPassword Nuova Password
 * @param {string} oldPassword Vecchia Password
 * @param {string} username Username dell'Utente che deve modificare la password
 * @returns L'esito della modifica
 */
exports.cambiaPassword = (newPassword, oldPassword, username) => {
    return new Promise((resolve, reject) => {
        if (controller.controllaPassword(newPassword))
            return reject("La nuova password deve essere compresa tra 8 e 16 caratteri.");

        this.cercaUtenteByUsername(username)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject(messaggi.UTENTE_NON_TROVATO_ERROR);

                const risultati = JSON.parse(JSON.stringify(results.rows));

                const data = risultati[0];
                const hash = bcrypt.hashSync(oldPassword + process.env.SECRET_PWD, data.salt);

                if (hash == data.password) {
                    const newHash = bcrypt.hashSync(newPassword + process.env.SECRET_PWD, data.salt);

                    db.pool.query('UPDATE public.utenti SET password = $1 WHERE username = $2',
                        [newHash, username], (error, results) => {
                            if (error) {
                                console.log(error);
                                return reject("Errore nella modifica dei dati.");
                            }
                            return resolve();
                        });
                } else return reject('La vecchia password non è corretta');
            })
            .catch(error => {
                console.log(error);
                return reject(messaggi.SERVER_ERROR);
            });
    })
}

/**
 * Ricerca un Ospite tramite il suo Username.
 * @param {string} username Username dell'Ospite da ricercare
 * @returns Le informazioni dell'Ospite
 */
exports.cercaOspiteByUsername = (username) => {
    return new Promise((resolve, reject) => {
        if (controller.controllaNotNull(username))
            return reject("L'username non deve essere vuoto!")

        db.pool.query('SELECT * FROM public.ospiti WHERE username = $1', [username], (error, results) => {
            if (error)
                return reject(error);
            else
                return resolve(results);
        });
    })
}

/**
 * Ricerca un Utente tramite il suo Username.
 * @param {string} username Username dell'Utente da ricercare
 * @returns Le informazioni dell'Utente
 */
exports.cercaUtenteByUsername = (username) => {
    return new Promise((resolve, reject) => {
        if (controller.controllaNotNull(username))
            return reject("L'username non deve essere vuoto!");

        db.pool.query('SELECT * FROM public.utenti WHERE username = $1', [username], (error, results) => {
            if (error)
                return reject(error);
            else
                return resolve(results);
        });
    })
}

/**
 * Crea un nuovo Ospite.
 * @param {string} username Username dell'Ospite da creare
 */
exports.creaOspite = (username) => {
    return new Promise((resolve, reject) => {
        var data = new Date();
        if (controller.controllaNotNull(username))
            return reject("L'username non deve essere vuoto!");

        db.pool.query('INSERT INTO public.ospiti (username, data_creazione) VALUES ($1, $2)',
            [username, data], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Crea un nuovo Utente.
 * @param {string} username Username dell'Utente da creare
 * @param {string} nome Nome dell'Utente da creare
 * @param {string} cognome Cognome dell'Utente da creare
 * @param {string} password Password dell'Utente da creare
 */
exports.creaUtente = (username, nome, cognome, password) => {
    return new Promise((resolve, reject) => {
        try {
            if (controller.controllaString(username))
                return reject("Il campo 'username' non deve essere vuoto!");
            if (controller.controllaString(nome))
                return reject("Il campo 'nome' non deve essere vuoto!");
            if (controller.controllaString(cognome))
                return reject("Il campo 'cognome' non deve essere vuoto!");
            if (controller.controllaPassword(password))
                return reject("La password deve essere compresa tra 8 e 16 caratteri.");

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password + process.env.SECRET_PWD, salt);

            db.pool.query('INSERT INTO public.utenti (username, nome, cognome, password, salt, tipo) VALUES ($1, $2, $3, $4, $5, $6)',
                [username, nome, cognome, hash, salt, "GIOCATORE"], (error, results) => {
                    if (error) {
                        console.log(error);
                        return reject("Non è stato possibile creare l'utente");
                    }
                    return resolve();
                })
        } catch (error) {
            console.log(error);
            return reject(error);
        }
    })
}

/**
 * Ritorna l'Username, il Nome ed il Cognome di un Utente.
 * @param {string} username Username dell'Utente
 * @returns Le informazioni dell'Utente
 */
exports.getUserInfo = (username) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select username, nome, cognome from public.utenti where username=$1',
            [username], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Modifica il Nome ed il Cognome di un Utente.
 * @param {string} username Username dell'Utente da modificare
 * @param {string} nome Nuovo Nome da impostare
 * @param {string} cognome Nuovo Cognome da impostare
 */
exports.modificaNomeCognome = (username, nome, cognome) => {
    return new Promise((resolve, reject) => {
        if (controller.controllaString(nome))
            return reject("Il campo 'nome' non è valido!");
        if (controller.controllaString(cognome))
            return reject("Il campo 'cognome' non è valido!");

        this.cercaUtenteByUsername(username)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject(messaggi.UTENTE_NON_TROVATO_ERROR);

                db.pool.query('UPDATE public.utenti SET nome = $1, cognome = $2 WHERE username = $3',
                    [nome, cognome, username], (error, results) => {
                        if (error) {
                            console.log(error);
                            return reject('Errore dati query');
                        }
                        return resolve();
                    })
            })
            .catch(error => {
                console.log(error);
                return reject(messaggi.SERVER_ERROR);
            });
    })
}

/**
 * Modifica l'Username di un Utente.
 * @param {string} oldUsername Vecchio Username
 * @param {string} newUsername Nuovo Username
 */
exports.modificaUsername = (oldUsername, newUsername) => {
    return new Promise((resolve, reject) => {
        if (controller.controllaString(newUsername))
            return reject("Il nuovo username non è valido!");

        this.cercaUtenteByUsername(oldUsername)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject(messaggi.UTENTE_NON_TROVATO_ERROR);

                return this.cercaUtenteByUsername(newUsername);
            })
            .then(results => {
                if (!controller.controllaRisultatoQuery(results))
                    return reject("Il nuovo username è già utilizzato!");

                db.pool.query('UPDATE public.utenti SET username = $1 WHERE username = $2',
                    [newUsername, oldUsername], (error, results) => {
                        if (error)
                            return reject(error);
                        else
                            return resolve(results);
                    });
            })
            .catch(error => {
                console.log(error);
                reject(messaggi.SERVER_ERROR);
            });
    })
}

//TODO da commentare
exports.eliminaOspite = (username) => {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE FROM public.ospiti WHERE username=$1', [username], (error, results) => {
            if (error)
                return reject(error);
            else
                return resolve(results);
        });
    })
}

/**
 * Elimina tutti gli ospiti che si sono registrati più di 24 ore fa.
 * * 86400000 millisecondi corispondono a 24 ore
 */
exports.eliminaOspiti = () => {
    var data = new Date();

    db.pool.query('SELECT * FROM public.ospiti', (error, results) => {
        if (error) {
            console.log(error);
            return;
        }

        const ospiti = JSON.parse(JSON.stringify(results.rows));

        ospiti.forEach(ospite => {
            var dataOspite = new Date(ospite.data_creazione);
            if ((data.getTime() - dataOspite.getTime()) > 86400000)
                this.eliminaOspite(ospite.username).catch(error => console.log(error));
        });
    })
}