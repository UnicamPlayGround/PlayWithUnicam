const db = require('../database');
const controller = require('../controller');
const game = require('./game');
const lobby = require('./lobby');
const giocatore = require('./giocatore');
const messaggi = require('../messaggi');

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
 * @param {*} infoGiocatore Informazioni del Giocatore 
 */
function salvaInformazioni(username, infoGiocatore) {
    return new Promise((resolve, reject) => {
        const toSave = {
            "username": username,
            "info_giocatore": infoGiocatore
        }

        db.pool.query('UPDATE public.giocatori SET info = $1 WHERE username = $2',
            [toSave, username], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject("Non è stato possibile caricare le informazioni del giocatore!");
                }
                return resolve();
            })
    })
}

/**
 * Controlla che i vincoli dei Giocatori Minimi e Massimi siano rispettati prima di creare una Partita.
 * @param {*} adminLobby Admin della Lobby
 */
function controllaNumeroGiocatori(adminLobby) {
    var lobbyInfo;
    return new Promise((resolve, reject) => {
        lobby.cercaLobbyByAdmin(adminLobby)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject("Devi essere l'admin della lobby per creare una partita!");

                lobbyInfo = JSON.parse(JSON.stringify(results.rows))[0];
                return lobby.getNumeroGiocatoriLobby(lobbyInfo.codice);
            })
            .then(results => {
                const numeroGiocatori = JSON.parse(JSON.stringify(results.rows))[0];

                if (lobbyInfo.min_giocatori > numeroGiocatori.count)
                    return reject("Non ci sono abbastanza giocatori per iniziare!");

                if (lobbyInfo.max_giocatori < numeroGiocatori.count)
                    return reject("Ci sono troppi giocatori per iniziare!");

                return resolve(lobbyInfo);
            })
            .catch(error => {
                console.log(error);
                return reject(messaggi.CREAZIONE_PARTITA_ERROR);
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
 * Controlla che all'interno della lobby ci siano abbastanza giocatori
 * per poter continuare la partita.
 * @param {*} username Username del Giocatore che richiede le informazioni della partita
 */
function controllaMinimoGiocatori(username) {
    var lobbyInfo;
    return new Promise((resolve, reject) => {
        lobby.cercaLobbyByUsername(username)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    throw (messaggi.PARTECIPAZIONE_LOBBY_ERROR);
                lobbyInfo = JSON.parse(JSON.stringify(results.rows))[0];
                return lobby.getNumeroGiocatoriLobby(lobbyInfo.codice);
            })
            .then(results => {
                const numeroGiocatori = JSON.parse(JSON.stringify(results.rows))[0];

                if (lobbyInfo.min_giocatori > numeroGiocatori.count)
                    throw (messaggi.MINIMO_GIOCATORI_ERROR);
                else
                    return resolve();
            })
            .catch(error => {
                console.log(error);
                return reject(error);
            })
    })
}

//TODO commentare
function creaPartitaQuery(codiceLobby, adminLobby, results) {
    return new Promise((resolve, reject) => {
        if (controller.controllaRisultatoQuery(results)) {
            db.pool.query('INSERT INTO public.partite (codice, codice_lobby, giocatore_corrente, terminata) VALUES ($1, $2, $3, $4)',
                [creaCodice(), codiceLobby, adminLobby, false], (error, results) => {
                    if (error) {
                        console.log(error);
                        return reject(messaggi.CREAZIONE_PARTITA_ERROR);
                    }
                    return resolve();
                });
        } else {
            db.pool.query('UPDATE public.partite SET codice = $1, giocatore_corrente = $2, terminata = $3 WHERE codice_lobby = $4',
                [creaCodice(), adminLobby, false, codiceLobby], (error, results) => {
                    if (error) {
                        console.log(error);
                        return reject(messaggi.CREAZIONE_PARTITA_ERROR);
                    }
                    return resolve();
                });
        }
    })
}

/**
 * Modifica il Giocatore Corrente di una Partita.
 * @param {string} username Username dell'attuale Giocatore Corrente
 */
exports.cambiaGiocatoreCorrente = (username) => {
    return new Promise((resolve, reject) => {
        var partitaInfo;
        exports.getInfoPartita(username)
            .then(data => {
                partitaInfo = data;
                if (partitaInfo.giocatore_corrente != username)
                    return reject('Devi aspettare il tuo turno!');

                return lobby.getGiocatoriLobby(username);
            })
            .then(results => {
                const giocatori = JSON.parse(JSON.stringify(results.rows));
                var nuovoGiocatore = getNuovoGiocatore(giocatori, username);

                db.pool.query('UPDATE public.partite SET giocatore_corrente = $1 WHERE codice_lobby = $2',
                    [nuovoGiocatore.username, partitaInfo.codice_lobby], (error, results) => {
                        if (error) {
                            console.log(error);
                            return reject("Non è stato possibile aggiornare il giocatore corrente!");
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
 * Ricerca una Partita tramite il Codice della Lobby.
 * @param {*} codiceLobby 
 */
exports.cercaPartitaByCodiceLobby = (codiceLobby) => {
    return new Promise((resolve, reject) => {
        db.pool.query('SELECT * FROM public.partite WHERE codice_lobby=$1',
            [codiceLobby], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Crea una nuova Partita, controllando che i vincoli sui Giocatori minimi e massimi siano rispettati.
 * @param {string} adminLobby Admin della Lobby, che vuole creare la Partita
 */
exports.creaPartita = (adminLobby) => {
    return new Promise((resolve, reject) => {
        var lobbyInfo;
        controllaNumeroGiocatori(adminLobby)
            .then(data => {
                lobbyInfo = data;
                return this.cercaPartitaByCodiceLobby(lobbyInfo.codice);
            })
            .then(results => { return creaPartitaQuery(lobbyInfo.codice, adminLobby, results); })
            .then(_ => lobby.iniziaPartita(lobbyInfo.codice))
            .then(_ => { resolve(); })
            .catch(error => {
                console.log(error);
                return reject(messaggi.CREAZIONE_PARTITA_ERROR);
            });
    })
}

/**
 * Ritorna le Informazioni della Partita.
 * @param {string} username Username del Giocatore collegato alla Partita
 * @returns le Informazioni della Partita (codice, codice_lobby, giocatore_corrente, terminata, info, id_gioco)
 */
exports.getInfoPartita = (username) => {
    return new Promise((resolve, reject) => {
        controllaMinimoGiocatori(username)
            .then(_ => {
                return db.pool.query('SELECT partite.codice, partite.codice_lobby, giocatore_corrente, terminata, id_gioco FROM' +
                    ' (partite INNER JOIN lobby ON partite.codice_lobby=lobby.codice)' +
                    ' INNER JOIN giocatori ON giocatori.codice_lobby=lobby.codice WHERE giocatori.username=$1',
                    [username], (error, results) => {
                        if (error) {
                            console.log(error);
                            return reject(error);
                        }
                        var partitaInfo = JSON.parse(JSON.stringify(results.rows))[0];

                        if (partitaInfo) {
                            giocatore.getInfoGiocatori(partitaInfo.codice_lobby)
                                .then(results => {
                                    const infoGiocatori = JSON.parse(JSON.stringify(results.rows));
                                    var toSave = [];

                                    infoGiocatori.forEach(element => {
                                        if (element.info)
                                            toSave.push(element.info);
                                    });

                                    if (toSave.length > 0)
                                        partitaInfo.info = { "giocatori": toSave };
                                    else
                                        partitaInfo.info = null;

                                    return resolve(partitaInfo);
                                })
                                .catch(error => {
                                    console.log(error);
                                    return reject(error);
                                });
                        } else return resolve(partitaInfo);
                    });
            })
            .catch(error => {
                console.log(error);
                return reject(error);
            });
    })
}

/**
 * Salva nel Database in formato JSON le Informazioni aggiornate relative ad un Giocatore.
 * @param {string} username Username del Giocatore
 * @param {*} infoGiocatore Informazioni della partita dal punto di vista del Giocatore
 */
exports.salvaInfoGiocatore = (username, infoGiocatore) => {
    return new Promise((resolve, reject) => {
        var partitaInfo;
        this.getInfoPartita(username)
            .then(data => {
                partitaInfo = data;
                if (partitaInfo == null || partitaInfo == undefined)
                    return reject(messaggi.PARTITA_NON_TROVATA_ERROR);
                return game.getInfoGioco(partitaInfo.id_gioco);
            })
            .then(results => {
                const gioco = JSON.parse(JSON.stringify(results.rows))[0];

                if (gioco.tipo == "TURNI" && partitaInfo.giocatore_corrente != username)
                    return reject('Devi aspettare il tuo turno!');
                else
                    return salvaInformazioni(username, infoGiocatore);
            })
            .then(_ => resolve())
            .catch(error => {
                console.log(error);
                return reject(messaggi.SERVER_ERROR);
            });
    })
}

/**
 * Termina la Partita, impostando il valore *"terminata"* della Partita a *true*.
 * @param {*} username Username del Giocatore che ha terminato per primo la Partita
 */
exports.terminaPartita = (username) => {
    return new Promise((resolve, reject) => {
        this.getInfoPartita(username)
            .then(partitaInfo => {
                if (partitaInfo == null || partitaInfo == undefined)
                    return reject(messaggi.PARTITA_NON_TROVATA_ERROR);

                db.pool.query('UPDATE public.partite SET terminata = $1 WHERE codice = $2',
                    [true, partitaInfo.codice], (error, results) => {
                        if (error) {
                            console.log(error);
                            return reject(messaggi.SERVER_ERROR);
                        }

                        return lobby.terminaPartita(partitaInfo.codice_lobby);
                    });
            })
            .then(_ => { resolve() })
            .catch(error => {
                console.log(error);
                return reject(messaggi.SERVER_ERROR);
            });
    })
}