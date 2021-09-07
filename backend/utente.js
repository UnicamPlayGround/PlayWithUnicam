const controller = require('./controller');
const db = require('./database');
const bcrypt = require('bcrypt');

//TODO
const SECRET_PWD = "secret";

/**
 * Modifica la Password di un Utente.
 * @param {string} newPassword Nuova Password
 * @param {string} oldPassword Vecchia Password
 * @param {*} response 
 * @param {string} username Username dell'Utente che deve modificare la password
 * @returns L'esito della modifica
 */
exports.cambiaPassword = (newPassword, oldPassword, response, username) => {
    try {
        controller.controllaPassword(newPassword);
    } catch (error) { return response.status(401).send('La password non è corretta'); }

    this.cercaUtenteByUsername(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(500).send('Server Error!');
        }

        if (controller.controllaRisultatoQuery(results))
            return response.status(404).send('Utente non trovato!');

        const risultati = JSON.parse(JSON.stringify(results.rows));
        if (risultati.length == 0)
            return response.status(404).send('Utente non trovato!');

        const data = risultati[0];
        const hash = bcrypt.hashSync(oldPassword + SECRET_PWD, data.salt);

        if (hash == data.password) {
            const newHash = bcrypt.hashSync(newPassword + SECRET_PWD, data.salt);

            db.pool.query('UPDATE public.utenti SET password = $1 WHERE username = $2',
                [newHash, username], (error, results) => {
                    if (error) {
                        console.log(error);
                        return response.status(400).send(db.ERRORE_DATI_QUERY);
                    }
                    return response.status(200).send({ 'esito': "1" });
                });
        } else return response.status(401).send('La vecchia password non è corretta');
    });
}

/**
 * Ricerca un Ospite tramite il suo Username.
 * @param {string} username Username dell'Ospite da ricercare
 * @param {*} cb Callback
 * @returns Ritorna le informazioni dell'Ospite
 */
exports.cercaOspiteByUsername = (username, cb) => {
    controller.controllaNotNull(username, "L'username non deve essere vuoto!");
    return db.pool.query('SELECT * FROM public.ospiti WHERE username = $1', [username], (error, results) => {
        cb(error, results)
    });
}

/**
 * Ricerca un Utente tramite il suo Username.
 * @param {string} username Username dell'Utente da ricercare
 * @param {*} cb Callback
 * @returns Ritorna le informazioni dell'Utente
 */
exports.cercaUtenteByUsername = (username, cb) => {
    controller.controllaNotNull(username, "L'username non deve essere vuoto!");
    return db.pool.query('SELECT * FROM public.utenti WHERE username = $1', [username], (error, results) => {
        cb(error, results)
    });
}

/**
 * Crea un nuovo Ospite.
 * @param {string} username Username dell'Ospite da creare
 * @param {*} cb Callback
 */
exports.creaOspite = (username, cb) => {
    var data = new Date();
    controller.controllaNotNull(username, "L'username non deve essere vuoto!");

    db.pool.query('INSERT INTO public.ospiti (username, data_creazione) VALUES ($1, $2)',
        [username, data], (error, results) => {
            cb(error, results)
        })
}

/**
 * Crea un nuovo Utente.
 * @param {string} username Username dell'Utente da creare
 * @param {string} nome Nome dell'Utente da creare
 * @param {string} cognome Cognome dell'Utente da creare
 * @param {string} password Password dell'Utente da creare
 * @param {*} response 
 */
exports.creaUtente = (username, nome, cognome, password, response) => {
    //TODO: metterli tutti in un unico metodo
    controller.controllaString(username, "Il campo 'Username' non deve essere vuoto!");
    controller.controllaString(nome, "Il campo 'Nome' non deve essere vuoto!");
    controller.controllaString(cognome, "Il campo 'Cognome' non deve essere vuoto!");
    controller.controllaPassword(password);

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password + SECRET_PWD, salt);

    db.pool.query('INSERT INTO public.utenti (username, nome, cognome, password, salt, tipo) VALUES ($1, $2, $3, $4, $5, $6)',
        [username, nome, cognome, hash, salt, "GIOCATORE"], (error, results) => {
            if (error) {
                console.log(error);
                return response.status(400).send("NON E' STATO POSSIBILE CREARE L'UTENTE!");
            }
            return response.status(200).send({ 'esito': "1" });
        })
}

/**
 * Ritorna l'Username, il Nome ed il Cognome di un Utente.
 * @param {string} username Username dell'Utente
 * @param {*} cb Callback
 * @returns Ritorna le informazioni dell'Utente
 */
exports.getUserInfo = (username, cb) => {
    return db.pool.query('select username, nome, cognome from public.utenti where username=$1',
        [username], (error, results) => {
            cb(error, results)
        });
}

/**
 * Modifica il Nome ed il Cognome di un Utente.
 * @param {string} username Username dell'Utente da modificare
 * @param {string} nome Nuovo Nome da impostare
 * @param {string} cognome Nuovo Cognome da impostare
 * @param {*} response 
 */
exports.modificaNomeCognome = (username, nome, cognome, response) => {
    controller.controllaString(nome, "Il campo 'Nome' non è valido!");
    controller.controllaString(cognome, "Il campo 'Cognome' non è valido!");

    this.cercaUtenteByUsername(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(500).send('Server Error!');
        }
        if (controller.controllaRisultatoQuery(results)) return response.status(404).send('Utente non trovato!');

        db.pool.query('UPDATE public.utenti SET nome = $1, cognome = $2 WHERE username = $3',
            [nome, cognome, username], (error, results) => {
                if (error) {
                    console.log(error);
                    return response.status(400).send('Errore dati query');
                }
                return response.status(200).send({ 'esito': "1" });
            })
    });
}

/**
 * Modifica l'Username di un Utente.
 * @param {string} oldUsername Vecchio Username
 * @param {string} newUsername Nuovo Username
 * @param {*} response 
 * @param {*} cb Callback
 */
exports.modificaUsername = (oldUsername, newUsername, response, cb) => {
    controller.controllaString(newUsername, "Il nuovo username non è valido!");

    this.cercaUtenteByUsername(oldUsername, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(500).send('Server Error!');
        }
        if (controller.controllaRisultatoQuery(results)) return response.status(404).send('Utente non trovato!');

        this.cercaUtenteByUsername(newUsername, (err, results) => {
            if (!controller.controllaRisultatoQuery(results)) return response.status(404).send("Il nuovo username è già utilizzato!");
            db.pool.query('UPDATE public.utenti SET username = $1 WHERE username = $2',
                [newUsername, oldUsername], (error, results) => {
                    cb(error, results);
                })
        })
    });
}

/**
 * Elimina tutti gli ospiti che si sono registrati più di 24 ore fa.
 * * 86400000 millisecondi corispondono ad un'ora
 */
exports.eliminaOspiti = () => {
    var data = new Date();

    db.pool.query('select * from public.ospiti', (error, results) => {
        if (error) {
            console.log(error);
            return response.status(400).send('Errore nella query');
        }

        const ospiti = JSON.parse(JSON.stringify(results.rows));
        
        ospiti.forEach(ospite => {
            var dataOspite = new Date(ospite.data_creazione);
            if ((data.getTime() - dataOspite.getTime()) > 86400000) {
                console.log("ospite eliminato è: "+ospite.username);
                db.pool.query('DELETE FROM public.ospiti WHERE username=$1', [ospite.username], (error, results) => {
                    if (error) {
                        console.log(error);
                        return response.status(400).send('Errore nella query');
                    }
                });
            }
        });
    })
}