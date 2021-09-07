const controller = require('../controller');
const db = require('../database');
const giocatore = require('./giocatore');

function creaCodice() {
    var toReturn = "" + Math.floor(Math.random() * 10);
    for (let i = 0; i < 5; i++)
        toReturn = toReturn.concat(Math.floor(Math.random() * 10));
    return toReturn;
}

/**
 * Controlla che non siano attive altre Lobby create dallo stesso Admin.
 * In caso positivo la vecchia lobby viene cancellata.
 * 
 * @param {*} results Risultato della query del metodo "cercaLobbyByAdmin"
 */
function controllaLobbyAdmin(results) {
    if (!controller.controllaRisultatoQuery(results)) {
        const tmp = JSON.parse(JSON.stringify(results.rows));
        exports.cancellaLobby(tmp[0].codice);
    }
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
 * Elimina un Giocatore e ritorna una Response 
 * @param {String} username Giocatore da eliminare
 * @param {*} response 
 */
function eliminaGiocatore(username, response) {
    giocatore.eliminaGiocatore(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(400).send("Non è stato possibile abbandonare la lobby");
        }
        return response.status(200).send({ 'esito': "1" });
    });
}

/**
 * //TODO rifare il commento
 * Controlla se esistono lobby che hanno come admin l'username passato.
 * 
 * @param {String} adminLobby l'username da controllare
 * @param {*} cb callback
 */
exports.cercaLobbyByAdmin = (adminLobby, cb) => {
    db.pool.query('SELECT codice, data_creazione, admin_lobby, id_gioco, min_giocatori, max_giocatori, pubblica FROM ' +
        '(public.giocatori INNER JOIN public.lobby ON public.giocatori.codice_lobby = public.lobby.codice) ' +
        'INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE admin_lobby = $1',
        [adminLobby], (error, results) => {
            cb(error, results)
        });
}

/**
 * //TODO rifare commento
 * Controlla se esiste già una lobby con il codice uguale a quello passato
 * @param {*} codice codice della lobby da cercare
 * @param {*} cb callback
 */
//TODO
exports.cercaLobbyByCodice = (codice, cb) => {
    db.pool.query('SELECT codice, data_creazione, admin_lobby, min_giocatori, max_giocatori, pubblica FROM ' +
        '(public.giocatori INNER JOIN public.lobby ON public.giocatori.codice_lobby = public.lobby.codice) ' +
        'INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE codice = $1',
        [codice], (error, results) => {
            cb(error, results)
        });
}

/**
 * //TODO rifare commento
 * Controlla se esiste una lobby in cui è presente l'username passato
 * @param {String} username l'username utilizzato per controllare se esiste una lobby in cui è presente
 * @param {*} cb callback
 */
//TODO
exports.cercaLobbyByUsername = (username, cb) => {
    db.pool.query('SELECT codice, data_creazione, admin_lobby, id_gioco, public.giochi.nome, min_giocatori, max_giocatori, pubblica, regolamento, link FROM ' +
        '(public.giocatori INNER JOIN public.lobby ON public.giocatori.codice_lobby = public.lobby.codice) ' +
        'INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE username = $1',
        [username], (error, results) => {
            cb(error, results)
        });
}

/**
 * Resituisce tutte le lobby pubbliche tranne quella in cui l'username passato è admin
 * @param {String} username username dell'utente che ha effettuato la richiesta 
 * @param {*} cb callback
 */
exports.getLobbyPubbliche = (username, cb) => {
    db.pool.query('SELECT codice, admin_lobby, data_creazione, id_gioco, nome, max_giocatori, min_giocatori FROM public.lobby' +
        ' INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE pubblica=$1 AND admin_lobby <> $2', [true, username], (error, results) => {
            cb(error, results)
        });
}

/**
 * Restituisce i giocatori di una lobby cercandola tramite l' username di un Utente
 * @param {String} username username usato per cercare la lobby
 * @param {*} response 
 * @param {*} cb callback
 */
exports.getGiocatoriLobby = (username, response, cb) => {
    this.cercaLobbyByUsername(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(400).send("Non è stato possibile trovare la Lobby");
        }
        if (controller.controllaRisultatoQuery(results))
            return response.status(400).send("Errore: Devi partecipare ad una Lobby!");

        const tmp = JSON.parse(JSON.stringify(results.rows));
        db.pool.query('SELECT * FROM public.giocatori WHERE codice_lobby = $1 ORDER BY data_ingresso ASC', [tmp[0].codice], (error, results) => {
            cb(error, results)
        });
    })
}

/**
 * Restituisce in numero dei giocatori che si trovano all'interno di una Lobby
 * @param {*} codiceLobby il codice della lobby da cui prendere il numero dei giocatori
 * @param {*} cb callback
 */
exports.getNumeroGiocatoriLobby = (codiceLobby, cb) => {
    db.pool.query('SELECT COUNT(*) FROM public.giocatori WHERE codice_lobby = $1', [codiceLobby], (error, results) => {
        cb(error, results)
    });
}

//TODO
/**
 * Permette di modificare una lobby impostandola da privata a pubblica o viceversa
 * @param {String} username username dell'admin che intende modificare una lobby
 * @param {Boolean} pubblica attributo per indicare se una lobby è privata o pubblica
 * @param {*} response 
 */
exports.modificaLobby = (username, pubblica, response) => {
    this.cercaLobbyByAdmin(username, (err, results) => {
        if (controller.controllaRisultatoQuery(results)) return response.status(401).send("Solo l'admin può modificare la lobby");
        const tmp = JSON.parse(JSON.stringify(results.rows));

        db.pool.query('UPDATE public.lobby SET pubblica = $1 WHERE codice = $2',
            [pubblica, tmp[0].codice], (error, results) => {
                if (error) {
                    console.log(error);
                    return response.status(400).send("Non è stato possibile modificare la lobby");
                }
                return response.status(200).send({ 'esito': "1" });
            })
    })
}

//TODO
/**
 * Cancella dal Database una lobby
 * @param {*} codice codice della lobby da cancellare
 */
exports.cancellaLobby = (codice) => {
    db.pool.query('DELETE FROM public.lobby WHERE codice = $1', [codice], (error, results) => { })
}

/**
 * Elimina un utente da una lobby
 * @param {String} admin username dell'admin della lobby 
 * @param {String} username username dell'utente da cancellare dalla lobby
 * @param {*} response 
 */
exports.eliminaPartecipante = (admin, username, response) => {
    this.cercaLobbyByAdmin(admin, (err, results) => {
        if (controller.controllaRisultatoQuery(results)) return response.status(401).send("Solo l'admin può eliminare i partecipanti della lobby");
        const tmp = JSON.parse(JSON.stringify(results.rows));

        giocatore.espelliGiocatore(username, tmp[0].codice, (error, results) => {
            if (error) {
                console.log(error);
                return response.status(400).send("Non è stato possibile cancellare il giocatore dalla lobby");
            }
            return response.status(200).send({ 'esito': "1" });
        });
    })
}

/**
 * Permette ad un utente di abbandonare una lobby.
 * Se l'utente era l'admin della lobby, il ruolo di admin verrà passato ad un altro partecipante
 * @param {String} username username dell'utente che deve abbandonare la lobby
 * @param {*} response 
 */
exports.abbandonaLobby = (username, response) => {
    this.cercaLobbyByAdmin(username, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(400).send("Non è stato possibile trovare la lobby");
        }
        if (controller.controllaRisultatoQuery(results)) {
            eliminaGiocatore(username, response);
        } else {
            const tmp = JSON.parse(JSON.stringify(results.rows));
            const codiceLobby = tmp[0].codice;
            this.getGiocatoriLobby(username, response, (error, results) => {
                if (error) {
                    console.log(error);
                    return response.status(500).send("Server error");
                }
                var giocatori = JSON.parse(JSON.stringify(results.rows));
                if (giocatori.length > 1) {
                    this.impostaAdminLobby(giocatori[1].username, codiceLobby, (error, results) => {
                        if (error) {
                            console.log(error);
                            return response.status(400).send("Non è stato possibile impostare l'Admin della Lobby!");
                        }
                        eliminaGiocatore(username, response);
                    });
                } else eliminaGiocatore(username, response);
            })
        }
    })
}

/**
 * Crea una lobby di gioco
 * @param {String} adminLobby username dell'admin della lobby
 * @param {*} idGioco id del gioco a cui la lobby fa riferimento 
 * @param {Boolean} pubblica parametro per indicare se la lobby è privata o pubblica
 * @param {*} response 
 */
//TODO rimuovere ultima_richiesta
exports.creaLobby = (adminLobby, idGioco, pubblica, response) => {
    this.cercaLobbyByAdmin(adminLobby, (err, results) => {
        controllaLobbyAdmin(results);

        giocatore.cercaGiocatore(adminLobby, (err, results) => {
            if (!controller.controllaRisultatoQuery(results)) this.abbandonaLobby(adminLobby);

            const codiceLobby = creaCodice();

            db.pool.query('INSERT INTO public.lobby (codice, data_creazione, ultima_richiesta, id_gioco, pubblica) VALUES ($1, $2, NOW(), $3, $4)',
                [codiceLobby, getDataOdierna(), idGioco, pubblica], (error, results) => {
                    if (error) {
                        console.log(error);
                        return response.status(400).send("Non è stato possibile creare la Lobby!");
                    }

                    giocatore.creaGiocatore(adminLobby, codiceLobby, response, (error, results) => {
                        if (error) {
                            console.log(error);
                            return response.status(400).send("Non è stato possibile creare la lobby!");
                        }
                        this.impostaAdminLobby(adminLobby, codiceLobby, (error, results) => {
                            if (error) {
                                console.log(error);
                                return response.status(400).send("Non è stato possibile impostare l'Admin della Lobby!");
                            }
                            return response.status(200).send({ 'esito': "1" });
                        });
                    });
                })
        })
    })
}

/**
 * Imposta un nuovo admin nella lobby con lo stesso codice passato in input
 * @param {String} adminLobby l'username del nuovo admin della lobby
 * @param {*} codiceLobby id della lobby in cui cambiare admin
 * @param {*} cb callback
 */
exports.impostaAdminLobby = (adminLobby, codiceLobby, cb) => {
    giocatore.cercaGiocatore(adminLobby, (err, results) => {
        if (controller.controllaRisultatoQuery(results)) return response.status(400).send("Il Giocatore '" + adminLobby + "' non esiste!");

        db.pool.query('UPDATE public.lobby SET admin_lobby = $1 WHERE codice = $2',
            [adminLobby, codiceLobby], (error, results) => {
                //TODO fare controlli
                cb(error, results);
            })
    })
}

/**
 * Permette ad un giocatore di entrare nella lobby desiderata.
 * Se la lobby è piena, al giocatore non sarà possibile accedere alla lobby
 * @param {String} username username dell'utente
 * @param {*} codiceLobby codidce della lobby in cui inserire il nuovo giocatore
 * @param {*} response 
 */
exports.partecipaLobby = (username, codiceLobby, response) => {
    this.cercaLobbyByCodice(codiceLobby, (err, results) => {
        if (controller.controllaRisultatoQuery(results))
            return response.status(401).send("Non è stata trovata alcuna lobby corrispondente al codice inserito!");

        const tmp = JSON.parse(JSON.stringify(results.rows));
        const lobby = tmp[0];

        this.getNumeroGiocatoriLobby(codiceLobby, (error, results) => {
            if (error) {
                console.log(error);
                return response.status(500).send('Server error!');
            }
            const tmp2 = JSON.parse(JSON.stringify(results.rows));
            const count = tmp2[0].count;

            console.log("count", count);
            console.log("max_giocatori", lobby.max_giocatori);

            if (count < lobby.max_giocatori) {
                giocatore.creaGiocatore(username, codiceLobby, response, (error, results) => {
                    if (error) {
                        console.log(error);
                        return response.status(400).send("Non è stato possibile partecipare alla lobby.");
                    }
                    return response.status(200).send({ 'esito': "1" });
                });
            } else {
                return response.status(409).send('La lobby selezionata è già al completo!');
            }
        })
    })
}