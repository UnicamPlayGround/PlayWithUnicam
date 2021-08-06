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
 * @param {*} results Risultato della query del metodo "cercaLobbyByAdmin"
 */
function controllaLobbyAdmin(results) {
    if (!controller.controllaRisultatoQuery(results)) {
        const tmp = JSON.parse(JSON.stringify(results.rows));
        exports.cancellaLobby(tmp[0].codice);
    }
}

//TODO
exports.cercaLobbyByAdmin = (adminLobby, cb) => {
    db.pool.query('SELECT * FROM public.lobby WHERE admin_lobby=$1',
        [adminLobby], (error, results) => {
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

exports.creaLobby = (adminLobby, idGioco, pubblica, response) => {
    this.cercaLobbyByAdmin(adminLobby, (err, results) => {
        controllaLobbyAdmin(results);

        const codiceLobby = creaCodice();

        db.pool.query('INSERT INTO public.lobby (codice, ultima_richiesta, id_gioco, pubblica) VALUES ($1, NOW(), $2, $3)',
            [codiceLobby, idGioco, pubblica], (error, results) => {
                if (error) return response.status(400).send("Non è stato possibile creare la Lobby!");
                giocatore.creaGiocatore(adminLobby, codiceLobby, "ADMIN", response);
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