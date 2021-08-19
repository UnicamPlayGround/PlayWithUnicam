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
 * Controlla se esistono lobby che hanno come admin l'username passato.
 * 
 * @param {*} adminLobby l'username da controllare
 * @param {*} cb callback
 */
exports.cercaLobbyByAdmin = (adminLobby, cb) => {
    db.pool.query('SELECT * FROM public.lobby WHERE admin_lobby=$1',
        [adminLobby], (error, results) => {
            cb(error, results)
        });
}

//TODO
exports.cercaLobbyByCodice = (codice, cb) => {
    db.pool.query('SELECT * FROM public.lobby WHERE codice=$1',
        [codice], (error, results) => {
            cb(error, results)
        });
}

//TODO
exports.cercaLobbyByUsername = (username, cb) => {
    db.pool.query('SELECT codice, data_creazione, admin_lobby, id_gioco, public.giochi.nome, min_giocatori, max_giocatori, pubblica FROM ' +
        '(public.giocatori INNER JOIN public.lobby ON public.giocatori.codice_lobby = public.lobby.codice) ' +
        'INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE username = $1',
        [username], (error, results) => {
            cb(error, results)
        });
}

exports.getLobbyPubbliche = (cb) => {
    db.pool.query('SELECT codice, admin_lobby, data_creazione, id_gioco, nome, max_giocatori, min_giocatori FROM public.lobby' +
        ' INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE pubblica=$1', [true], (error, results) => {
            cb(error, results)
        });
}

exports.getGiocatoriLobby = (username, response, cb) => {
    this.cercaLobbyByUsername(username, (error, results) => {
        if (error) return response.status(400).send("Non è stato possibile trovare la Lobby");
        if (controller.controllaRisultatoQuery(results))
            return response.status(400).send("Errore: Devi partecipare ad una Lobby!");

        const tmp = JSON.parse(JSON.stringify(results.rows));
        db.pool.query('SELECT * FROM public.giocatori WHERE codice_lobby = $1 ORDER BY data_ingresso ASC', [tmp[0].codice], (error, results) => {
            cb(error, results)
        });
    })
}

exports.getNumeroGiocatoriLobby = (codiceLobby, cb) => {
    db.pool.query('SELECT COUNT(*) FROM public.giocatori WHERE codice_lobby = $1', [codiceLobby], (error, results) => {
        cb(error, results)
    });
}

//TODO
exports.modificaLobby = (username, pubblica, response) => {
    this.cercaLobbyByAdmin(username, (err, results) => {
        if (controller.controllaRisultatoQuery(results)) return response.status(401).send("Solo l'admin può modificare la lobby");
        const tmp = JSON.parse(JSON.stringify(results.rows));

        db.pool.query('UPDATE public.lobby SET pubblica = $1 WHERE codice = $2',
            [pubblica, tmp[0].codice], (error, results) => {
                if (error) return response.status(400).send("Non è stato possibile modificare la lobby");
                return response.status(200).send({ 'esito': "1" });
            })
    })
}

//TODO
exports.cancellaLobby = (codice) => {
    db.pool.query('DELETE FROM public.lobby WHERE codice = $1', [codice], (error, results) => { })
}

exports.eliminaPartecipante = (admin, username, response) => {
    this.cercaLobbyByAdmin(admin, (err, results) => {
        if (controller.controllaRisultatoQuery(results)) return response.status(401).send("Solo l'admin può eliminare i partecipanti della lobby");
        const tmp = JSON.parse(JSON.stringify(results.rows));

        giocatore.espelliGiocatore(username, tmp[0].codice, (error, results) => {
            if (error) return response.status(400).send("Non è stato possibile cancellare il giocatore dalla lobby");
            return response.status(200).send({ 'esito': "1" });
        });
    })
}

exports.abbandonaLobby = (username, response) => {
    this.cercaLobbyByAdmin(username, (error, results) => {
        if (error) return response.status(400).send("Non è stato possibile trovare la lobby");
        if (controller.controllaRisultatoQuery(results)) {
            giocatore.eliminaGiocatore(username, (error, results) => {
                if (error) return response.status(400).send("Non è stato possibile abbandonare la lobby");
                return response.status(200).send({ 'esito': "1" });
            });
        } else {
            const tmp = JSON.parse(JSON.stringify(results.rows));
            const codiceLobby = tmp[0].codice;
            this.getGiocatoriLobby(username, response, (error, results) => {
                if (error) return response.status(500).send("Server error");
                var giocatori = JSON.parse(JSON.stringify(results.rows));
                console.log(giocatori);
                if (giocatori.length > 1) {
                    const admin = giocatori[1].username;
                    console.log(admin);
                    console.log(username);
                    this.impostaAdminLobby(admin, codiceLobby, (error, results) => {
                        if (error) return response.status(400).send("Non è stato possibile impostare l'Admin della Lobby!");
                        giocatore.eliminaGiocatore(username, (error, results) => {
                            if (error) return response.status(400).send("Non è stato possibile abbandonare la lobby");
                            return response.status(200).send({ 'esito': "1" });
                        });
                    });
                } else {
                    giocatore.eliminaGiocatore(username, (error, results) => {
                        if (error) return response.status(400).send("Non è stato possibile abbandonare la lobby");
                        return response.status(200).send({ 'esito': "1" });
                    });
                }
            })
        }
    })
}

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

                    giocatore.creaGiocatore(adminLobby, codiceLobby, response, (err, results) => {
                        if (err) {
                            console.log(err);
                            return response.status(400).send("Non è stato possibile creare la lobby!");
                        }
                        this.impostaAdminLobby(adminLobby, codiceLobby, (error, results) => {
                            if (error) return response.status(400).send("Non è stato possibile impostare l'Admin della Lobby!");
                            return response.status(200).send({ 'esito': "1" });
                        });
                    });
                })
        })
    })
}

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

exports.partecipaLobby = (username, codice_lobby, response) => {
    this.cercaLobbyByCodice(codice_lobby, (err, results) => {
        if (controller.controllaRisultatoQuery(results))
            return response.status(401).send("Non è stata trovata alcuna lobby corrispondente al codice inserito!");

        giocatore.creaGiocatore(username, codice_lobby, response, (error, results) => {
            if (error) return response.status(400).send("Non è stato possibile partecipare alla lobby.");
            return response.status(200).send({ 'esito': "1" });
        });
    })
}