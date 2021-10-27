const controller = require('../controller');
const db = require('../database');
const giocatore = require('./giocatore');
const messaggi = require('../messaggi');

function creaCodice() {
    var toReturn = "" + Math.floor(Math.random() * 10);
    for (let i = 0; i < 5; i++)
        toReturn = toReturn.concat(Math.floor(Math.random() * 10));
    return toReturn;
}

/**
 * Controlla che non siano attive altre Lobby create dallo stesso Admin.
 * In caso positivo viene effettuata l'operazione di abbandono dalla vecchia Lobby.
 * 
 * @param {*} results Risultato della query del metodo "cercaLobbyByAdmin" 
 */
function controllaLobbyAdmin(results) {
    return new Promise((resolve, reject) => {
        if (!controller.controllaRisultatoQuery(results)) {
            const lobby = JSON.parse(JSON.stringify(results.rows))[0];
            exports.abbandonaLobby(lobby.admin_lobby, null)
                .then(_ => resolve())
                .catch(error => {
                    console.log(error);
                    return reject(error);
                });
        } else resolve();
    })
}

/**
 * Ritorna la Data Odierna.
 * @returns la Data di oggi in formato gg/mm/yyyy
 */
function getDataOdierna() {
    var tmp = new Date();
    return (tmp.getDate() + '/' + (tmp.getMonth() + 1) + '/' + tmp.getFullYear());
}

/**
 * Elimina un Giocatore. 
 * @param {String} username Giocatore da eliminare
 */
function eliminaGiocatore(username) {
    return giocatore.eliminaGiocatore(username);
}

/**
 * Esegue la query per creare una lobby.
 * @param {*} codiceLobby Codice della lobby da creare
 * @param {*} idGioco ID del Gioco
 * @param {*} pubblica true se la lobby deve essere pubblica, false se deve essere privata
 */
function creaLobbyQuery(codiceLobby, idGioco, pubblica) {
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.lobby (codice, data_creazione, id_gioco, pubblica, partita_iniziata) VALUES ($1, $2, $3, $4, $5)',
            [codiceLobby, getDataOdierna(), idGioco, pubblica, false], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject(messaggi.CREAZIONE_LOBBY_ERROR);
                } else
                    return resolve();
            })
    })
}

//TODO commentare
exports.resetLobby = () => {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE FROM public.lobby', (error, results) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve();
        });
    })
}

/**
 * Imposta il parametro *partita_iniziata* della Lobby a **true**.
 * @param {*} codiceLobby Codice della Lobby
 */
exports.iniziaPartita = (codiceLobby) => {
    return new Promise((resolve, reject) => {
        db.pool.query('UPDATE public.lobby SET partita_iniziata = $1 WHERE codice = $2',
            [true, codiceLobby], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject(messaggi.CREAZIONE_PARTITA_ERROR);
                }
                return resolve();
            });
    })
}

/**
 * Imposta il parametro *partita_iniziata* della Lobby a **false**.
 * @param {*} codiceLobby Codice della Lobby
 */
exports.terminaPartita = (codiceLobby) => {
    return new Promise((resolve, reject) => {
        db.pool.query('UPDATE public.lobby SET partita_iniziata = $1 WHERE codice = $2',
            [false, codiceLobby], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject("Non è stato possibile terminare la partita!");
                }
                return resolve();
            });
    })
}

/**
 * Cerca la lobby che ha come Admin l'username passato.
 * @param {String} adminLobby l'username dell'Admin
 */
exports.cercaLobbyByAdmin = (adminLobby) => {
    return new Promise((resolve, reject) => {
        db.pool.query('SELECT codice, data_creazione, admin_lobby, id_gioco, min_giocatori, max_giocatori, pubblica FROM ' +
            '(public.giocatori INNER JOIN public.lobby ON public.giocatori.codice_lobby = public.lobby.codice) ' +
            'INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE admin_lobby = $1',
            [adminLobby], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Cerca la lobby attraverso il suo codice.
 * @param {*} codice codice della lobby da cercare
 */
exports.cercaLobbyByCodice = (codice) => {
    return new Promise((resolve, reject) => {
        db.pool.query('SELECT codice, data_creazione, admin_lobby, min_giocatori, max_giocatori, pubblica FROM ' +
            '(public.giocatori INNER JOIN public.lobby ON public.giocatori.codice_lobby = public.lobby.codice) ' +
            'INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE codice = $1 AND partita_iniziata = $2',
            [codice, false], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Cerca una lobby a cui partecipa il giocatore con l'username passato.
 * @param {String} username l'username utilizzato per cercare la lobby
 */
exports.cercaLobbyByUsername = (username) => {
    return new Promise((resolve, reject) => {
        db.pool.query('SELECT codice, data_creazione, admin_lobby, id_gioco, public.giochi.nome, min_giocatori, max_giocatori, pubblica, regolamento, link FROM ' +
            '(public.giocatori INNER JOIN public.lobby ON public.giocatori.codice_lobby = public.lobby.codice) ' +
            'INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE username = $1',
            [username], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Resituisce tutte le lobby pubbliche tranne quella in cui l'username passato è admin
 * @param {String} username username dell'utente che ha effettuato la richiesta 
 */
exports.getLobbyPubbliche = (username) => {
    return new Promise((resolve, reject) => {
        db.pool.query('SELECT codice, admin_lobby, data_creazione, id_gioco, nome, max_giocatori, min_giocatori FROM public.lobby' +
            ' INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE pubblica=$1 AND admin_lobby <> $2' +
            ' AND public.lobby.partita_iniziata = $3', [true, username, false], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Restituisce i giocatori di una lobby cercandola tramite l' username di un Utente.
 * @param {String} username username usato per cercare la lobby
 */
exports.getGiocatoriLobby = (username) => {
    return new Promise((resolve, reject) => {
        this.cercaLobbyByUsername(username)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject(messaggi.PARTECIPAZIONE_LOBBY_ERROR);

                const tmp = JSON.parse(JSON.stringify(results.rows));
                db.pool.query('SELECT * FROM public.giocatori WHERE codice_lobby = $1 ORDER BY data_ingresso ASC', [tmp[0].codice], (error, results) => {
                    if (error)
                        return reject(error);
                    else
                        return resolve(results);
                });
            })
            .catch(error => {
                console.log(error);
                return reject("Non è stato possibile trovare la lobby");
            })
    })
}

/**
 * Restituisce in numero dei giocatori che si trovano all'interno di una Lobby
 * @param {*} codiceLobby il codice della lobby da cui prendere il numero dei giocatori
 */
exports.getNumeroGiocatoriLobby = (codiceLobby) => {
    return new Promise((resolve, reject) => {
        db.pool.query('SELECT COUNT(*) FROM public.giocatori WHERE codice_lobby = $1', [codiceLobby], (error, results) => {
            if (error)
                return reject(error);
            else
                return resolve(results);
        });
    })
}

/**
 * Permette di modificare una lobby impostandola da privata a pubblica o viceversa.
 * @param {String} username username dell'admin che intende modificare una lobby
 * @param {Boolean} pubblica attributo per indicare se una lobby è privata o pubblica
 */
exports.modificaLobby = (username, pubblica) => {
    return new Promise((resolve, reject) => {
        this.cercaLobbyByAdmin(username)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject("Solo l'admin può modificare la lobby");

                const tmp = JSON.parse(JSON.stringify(results.rows));

                db.pool.query('UPDATE public.lobby SET pubblica = $1 WHERE codice = $2',
                    [pubblica, tmp[0].codice], (error, results) => {
                        if (error) {
                            console.log(error);
                            return reject("Non è stato possibile modificare la lobby");
                        }
                        return resolve();
                    })
            })
            .catch(error => {
                console.log(error);
                return reject("Non è stato possibile modificare la lobby");
            })
    })
}

/**
 * Elimina un utente da una lobby
 * @param {String} admin username dell'admin della lobby 
 * @param {String} username username dell'utente da cancellare dalla lobby
 */
exports.eliminaPartecipante = (admin, username) => {
    return new Promise((resolve, reject) => {
        this.cercaLobbyByAdmin(admin)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject("Solo l'admin può eliminare i partecipanti della lobby");

                const lobby = JSON.parse(JSON.stringify(results.rows))[0];
                return giocatore.espelliGiocatore(username, lobby.codice);
            })
            .then(_ => { return resolve(); })
            .catch(error => {
                console.log(error);
                return reject("Non è stato possibile eliminare il giocatore dalla lobby");
            })
    })
}

/**
 * Permette ad un utente di abbandonare una lobby.
 * Se l'utente era l'admin della lobby, il ruolo di admin verrà passato ad un altro partecipante.
 * @param {String} username username dell'utente che deve abbandonare la lobby
 */
exports.abbandonaLobby = (username) => {
    return new Promise((resolve, reject) => {
        this.cercaLobbyByAdmin(username)
            .then(results => {
                if (controller.controllaRisultatoQuery(results)) {
                    return eliminaGiocatore(username)
                        .then(_ => resolve())
                        .catch(error => {
                            console.log(error);
                            return reject(messaggi.SERVER_ERROR);
                        });
                } else {
                    const tmp = JSON.parse(JSON.stringify(results.rows));
                    const codiceLobby = tmp[0].codice;
                    this.getGiocatoriLobby(username)
                        .then(results => {
                            var giocatori = JSON.parse(JSON.stringify(results.rows));
                            if (giocatori.length > 1) {
                                this.impostaAdminLobby(giocatori[1].username, codiceLobby)
                                    .then(_ => { return eliminaGiocatore(username); })
                                    .then(_ => resolve())
                                    .catch(error => {
                                        console.log(error);
                                        return reject("Non è stato possibile impostare l'admin della Lobby!");
                                    })
                            } else
                                return eliminaGiocatore(username)
                                    .then(_ => resolve())
                                    .catch(error => {
                                        console.log(error);
                                        return reject(messaggi.SERVER_ERROR);
                                    });
                        })
                        .catch(error => {
                            console.log(error);
                            return reject(messaggi.SERVER_ERROR);
                        });
                }
            })
            .catch(error => {
                console.log(error);
                return reject("Non è stato possibile abbandonare la lobby");
            })
    })
}

/**
 * Crea una lobby di gioco
 * @param {String} adminLobby username dell'admin della lobby
 * @param {*} idGioco id del gioco a cui la lobby fa riferimento 
 * @param {Boolean} pubblica parametro per indicare se la lobby è privata o pubblica
 */
exports.creaLobby = (adminLobby, idGioco, pubblica) => {
    return new Promise((resolve, reject) => {
        const codiceLobby = creaCodice();

        this.cercaLobbyByAdmin(adminLobby)
            .then(results => { return controllaLobbyAdmin(results); })
            .then(_ => { return creaLobbyQuery(codiceLobby, idGioco, pubblica); })
            .then(_ => { return giocatore.creaGiocatore(adminLobby, codiceLobby); })
            .then(_ => { return this.impostaAdminLobby(adminLobby, codiceLobby); })
            .then(_ => { return resolve(); })
            .catch(error => {
                console.log(error);
                return reject(error);
            })
    })
}

/**
 * Imposta un nuovo admin nella lobby con lo stesso codice passato in input
 * @param {String} adminLobby l'username del nuovo admin della lobby
 * @param {*} codiceLobby id della lobby in cui cambiare admin
 */
exports.impostaAdminLobby = (adminLobby, codiceLobby) => {
    return new Promise((resolve, reject) => {
        giocatore.cercaGiocatore(adminLobby)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject("Il giocatore '" + adminLobby + "' non esiste!");

                db.pool.query('UPDATE public.lobby SET admin_lobby = $1 WHERE codice = $2',
                    [adminLobby, codiceLobby], (error, results) => {
                        if (error)
                            return reject(error)
                        else
                            return resolve(results);
                    })
            })
    });
}

/**
 * Permette ad un giocatore di entrare nella lobby desiderata.
 * Se la lobby è piena, al giocatore non sarà possibile accedere alla lobby.
 * @param {String} username username dell'utente
 * @param {*} codiceLobby codidce della lobby in cui inserire il nuovo giocatore
 */
exports.partecipaLobby = (username, codiceLobby) => {
    return new Promise((resolve, reject) => {
        var lobby;
        this.cercaLobbyByCodice(codiceLobby)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    return reject("Non è stata trovata alcuna lobby corrispondente al codice inserito!");

                lobby = JSON.parse(JSON.stringify(results.rows))[0];
                return this.getNumeroGiocatoriLobby(codiceLobby);
            })
            .then(results => {
                const tmp = JSON.parse(JSON.stringify(results.rows));
                const count = tmp[0].count;

                if (count < lobby.max_giocatori) {
                    this.cercaLobbyByAdmin(username)
                        .then(results => { return controllaLobbyAdmin(results); })
                        .then(_ => { return giocatore.creaGiocatore(username, codiceLobby); })
                        .then(_ => { return resolve(); })
                        .catch(error => {
                            console.log(error);
                            return reject(error);
                        });
                } else
                    return reject('La lobby selezionata è già al completo!');
            })
            .catch(error => {
                console.log(error);
                return reject(error);
            })
    })
}