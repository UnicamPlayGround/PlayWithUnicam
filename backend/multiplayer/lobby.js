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

exports.getLobbyPubbliche = (cb) => {
    db.pool.query('SELECT codice, admin_lobby, data_creazione, id_gioco, nome, max_giocatori, min_giocatori FROM public.lobby' +
        ' INNER JOIN public.giochi ON public.lobby.id_gioco = public.giochi.id WHERE pubblica=$1', [true], (error, results) => {
            cb(error, results)
        });
}

//TODO
exports.modificaLobby = (idLobby, pubblica, username, response) => {
    this.cercaLobbyByAdmin(username, (err, results) => {
        if (controller.controllaRisultatoQuery(results)) return response.status(401).send("Solo l'admin può modificare la lobby");

        db.pool.query('UPDATE public.lobby SET pubblica = $1 WHERE codice = $2',
            [pubblica, idLobby], (error, results) => {
                //TODO fare controlli
                if (error) return response.status(400).send("Non è stato possibile modificare la lobby");
                return response.status(200).send({ 'esito': "1" });
            })
    })
}

//TODO
exports.cancellaLobby = (codice) => {
    db.pool.query('DELETE FROM public.lobby WHERE codice = $1', [codice], (error, results) => { })
}

exports.abbandonaLobby = (username) => {
    giocatore.cancellaGiocatore(username, (error, results) => {
        //TODO: rivedere
        // if (error) return response.status(400).send("Non è stato possibile abbandonare la lobby");
    });
}

exports.creaLobby = (adminLobby, idGioco, pubblica, response) => {
    this.cercaLobbyByAdmin(adminLobby, (err, results) => {
        controllaLobbyAdmin(results);

        giocatore.cercaGiocatore(adminLobby, (err, results) => {
            if (!controller.controllaRisultatoQuery(results)) this.abbandonaLobby(adminLobby);

            const codiceLobby = creaCodice();

            db.pool.query('INSERT INTO public.lobby (codice, ultima_richiesta, id_gioco, pubblica) VALUES ($1, NOW(), $2, $3)',
                [codiceLobby, idGioco, pubblica], (error, results) => {
                    if (error) {
                        console.log(error);
                        return response.status(400).send("Non è stato possibile creare la Lobby!");
                    }

                    giocatore.creaGiocatore(adminLobby, codiceLobby, response, (err, results) => {
                        if (err) {
                            console.log(err);
                            return response.status(400).send("Non è stato possibile creare la lobby!");
                        }
                        this.impostaAdminLobby(adminLobby, codiceLobby, response);
                    });
                })
        })
    })
}

exports.impostaAdminLobby = (adminLobby, codiceLobby, response) => {
    giocatore.cercaGiocatore(adminLobby, (err, results) => {
        if (controller.controllaRisultatoQuery(results)) return response.status(400).send("Il Giocatore '" + adminLobby + "' non esiste!");

        db.pool.query('UPDATE public.lobby SET admin_lobby = $1 WHERE codice = $2',
            [adminLobby, codiceLobby], (error, results) => {
                //TODO fare controlli
                if (error) return response.status(400).send("Non è stato possibile impostare l'Admin della Lobby!");
                return response.status(200).send({ 'esito': "1" });
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