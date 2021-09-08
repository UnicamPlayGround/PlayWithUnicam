const db = require('../database');
const controller = require('../controller');
const game = require('./game');
const lobby = require('./lobby');

//TODO refactor con creaCodice di Lobby
function creaCodice() {
    var toReturn = "" + Math.floor(Math.random() * 10);
    for (let i = 0; i < 5; i++)
        toReturn = toReturn.concat(Math.floor(Math.random() * 10));
    return toReturn;
}

/**
 * Salva le Informazioni del Giocatore nel DB.
 * @param {string} username Username del Giocatore
 * @param {*} partita Informazioni della Partita salvate nel DB
 * @param {*} infoGiocatore Informazioni del Giocatore 
 * @param {*} response 
 */
function salvaInformazioni(username, partita, infoGiocatore, response) {
    if (partita.info == null)
        partita.info = { giocatori: [] };

    var index = 0;

    for (let i = 0; i < partita.info.giocatori.length; i++) {
        if (partita.info.giocatori[i].username == username) {
            index = i;
            break;
        }
        index++;
    }

    const toSave = {
        "username": username,
        "info_giocatore": infoGiocatore
    }

    partita.info.giocatori[index] = toSave;

    db.pool.query('UPDATE public.partite SET info = $1 WHERE codice = $2',
        [partita.info, partita.codice], (error, results) => {
            if (error) {
                console.log(error);
                return response.status(400).send("Non è stato possibile caricare le informazioni del Giocatore!");
            }
            return response.status(200).send({ 'esito': "1" });
        })
}

/**
 * Controlla che i vincoli dei Giocatori Minimi e Massimi siano rispettati prima di creare una Partita.
 * @param {*} adminLobby Admin della Lobby
 * @param {*} cb Callback
 */
function controllaNumeroGiocatori(adminLobby, cb) {
    lobby.cercaLobbyByAdmin(adminLobby, (error, results) => {
        if (error) {
            console.log(error);
            return cb(error, "Non è stato possibile creare la partita!", null);
        }

        if (controller.controllaRisultatoQuery(results))
            return cb(true, "Devi essere l'Admin della Lobby per creare una partita!", null);

        const lobbyInfo = JSON.parse(JSON.stringify(results.rows))[0];

        lobby.getNumeroGiocatoriLobby(lobbyInfo.codice, (error, results) => {
            if (error) {
                console.log(error);
                return cb(error, "Non è stato possibile creare la partita!", null);
            }

            const numeroGiocatori = JSON.parse(JSON.stringify(results.rows))[0];

            if (lobbyInfo.min_giocatori > numeroGiocatori.count)
                return cb(true, "Non ci sono abbastanza Giocatori per iniziare!", null);

            if (lobbyInfo.max_giocatori < numeroGiocatori.count)
                return cb(true, "Ci sono troppi Giocatori per iniziare!", null);

            return cb(null, null, lobbyInfo);
        })
    })
}

/**
 * Trova il prossimo Giocatore Corrente della Partita.
 * @param {[{username:string}]} giocatori Array dei Giocatori della Partita
 * @param {string} usernameGiocatoreCorrente Username dell'attuale Giocatore Corrente
 * @returns Il Nuovo Giocatore Corrente
 */
function getNuovoGiocatore(giocatori, usernameGiocatoreCorrente) {
    var nuovoGiocatore;

    for (let i = 0; i < giocatori.length; i++)
        if (giocatori[i].username == usernameGiocatoreCorrente) {
            if (i == (giocatori.length - 1))
                nuovoGiocatore = giocatori[0];
            else
                nuovoGiocatore = giocatori[i + 1];
        }

    return nuovoGiocatore;
}

/**
 * Modifica il Giocatore Corrente di una Partita.
 * @param {string} username Username dell'attuale Giocatore Corrente
 * @param {*} response 
 */
exports.cambiaGiocatoreCorrente = (username, response) => {
    exports.getInfoPartita(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(500).send('Server error!');
        }

        const partita = JSON.parse(JSON.stringify(results.rows))[0];
        if (partita.giocatore_corrente != username)
            return response.status(401).send('Devi aspettare il tuo turno!');

        lobby.getGiocatoriLobby(username, response, (error, results) => {
            if (error) {
                console.log(error);
                return response.status(500).send('Server error!');
            }

            const giocatori = JSON.parse(JSON.stringify(results.rows));
            var nuovoGiocatore = getNuovoGiocatore(giocatori, username);

            db.pool.query('UPDATE public.partite SET giocatore_corrente = $1 WHERE codice_lobby = $2',
                [nuovoGiocatore.username, partita.codice_lobby], (error, results) => {
                    if (error) {
                        console.log(error);
                        return response.status(400).send("Non è stato possibile aggiornare il Giocatore Corrente!");
                    }
                    return response.status(200).send({ 'esito': "1" });
                })
        })
    })
}

/**
 * Ricerca una Partita tramite il Codice della Lobby.
 * @param {*} codiceLobby 
 * @param {*} cb Callback
 */
exports.cercaPartitaByCodiceLobby = (codiceLobby, cb) => {
    db.pool.query('SELECT * FROM public.partite WHERE codice_lobby=$1',
        [codiceLobby], (error, results) => {
            cb(error, results);
        })
}

/**
 * Crea una nuova Partita, controllando che i vincoli sui Giocatori minimi e massimi siano rispettati.
 * @param {string} adminLobby Admin della Lobby, che vuole creare la Partita
 * @param {*} response 
 */
exports.creaPartita = (adminLobby, response) => {
    controllaNumeroGiocatori(adminLobby, (error, errorText, lobbyInfo) => {
        if (error) return response.status(400).send(errorText);

        this.cercaPartitaByCodiceLobby(lobbyInfo.codice, (error, results) => {
            if (error) {
                console.log(error);
                return response.status(400).send("Non è stato possibile creare la partita!");
            }

            if (controller.controllaRisultatoQuery(results)) {
                db.pool.query('INSERT INTO public.partite (codice, codice_lobby, giocatore_corrente, terminata) VALUES ($1, $2, $3, $4)',
                    [creaCodice(), lobbyInfo.codice, adminLobby, false], (error, results) => {
                        if (error) {
                            console.log(error);
                            return response.status(400).send("Non è stato possibile creare la partita!");
                        }
                        return response.status(200).send({ 'esito': "1" });
                    });
            } else {
                db.pool.query('UPDATE public.partite SET codice = $1, giocatore_corrente = $2, info = $3, terminata = $4 WHERE codice_lobby = $5',
                    [creaCodice(), adminLobby, null, false, lobbyInfo.codice], (error, results) => {
                        if (error) {
                            console.log(error);
                            return response.status(400).send("Non è stato possibile creare la partita!");
                        }
                        return response.status(200).send({ 'esito': "1" });
                    });
            }
        })
    })
}

/**
 * Ritorna le Informazioni della Partita.
 * @param {string} username Username del Giocatore collegato alla Partita
 * @param {*} cb Callback
 * @returns le Informazioni della Partita (codice, codice_lobby, giocatore_corrente, terminata, info, id_gioco)
 */
exports.getInfoPartita = (username, cb) => {
    return db.pool.query('SELECT partite.codice, partite.codice_lobby, giocatore_corrente, terminata, info, id_gioco FROM' +
        ' (partite INNER JOIN lobby ON partite.codice_lobby=lobby.codice)' +
        ' INNER JOIN giocatori ON giocatori.codice_lobby=lobby.codice WHERE giocatori.username=$1',
        [username], (error, results) => {
            cb(error, results)
        })
}

/**
 * Salva nel Database in formato JSON le Informazioni aggiornate relative ad un Giocatore.
 * @param {string} username Username del Giocatore
 * @param {*} infoGiocatore Informazioni della partita dal punto di vista del Giocatore
 * @param {*} response 
 */
exports.salvaInfoGiocatore = (username, infoGiocatore, response) => {

    //TODO da finire
    this.getInfoPartita(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(500).send('Server error!');
        }
        if (controller.controllaRisultatoQuery(results)) return response.status(404).send('Nessuna partita trovata!');

        var tmp = JSON.parse(JSON.stringify(results.rows));
        const partita = tmp[0];

        game.getInfoGioco(partita.id_gioco, (error, results) => {
            if (error) {
                console.log(error);
                return response.status(500).send('Server error!');
            }

            tmp = JSON.parse(JSON.stringify(results.rows));
            const gioco = tmp[0];

            if (gioco.tipo == "TURNI" && partita.giocatore_corrente != username)
                return response.status(401).send('Devi aspettare il tuo turno!');
            else
                salvaInformazioni(username, partita, infoGiocatore, response);
        })
    })
}

//TODO commentare
exports.terminaPartita = (username, response) => {
    this.getInfoPartita(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(500).send('Server error!');
        }
        if (controller.controllaRisultatoQuery(results))
            return response.status(404).send('Nessuna partita trovata!');

        const partita = JSON.parse(JSON.stringify(results.rows))[0];

        console.log(partita);

        db.pool.query('UPDATE public.partite SET terminata = $1 WHERE codice = $2',
            [true, partita.codice], (error, results) => {
                if (error) {
                    console.log(error);
                    return response.status(500).send('Server error!');
                }

                return response.status(200).send({ 'esito': "1" });
            });
    })
}