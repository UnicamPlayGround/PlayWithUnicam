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
        this.cancellaLobby(tmp[0].codice);
    }
}

exports.cercaLobbyByAdmin = (adminLobby, cb) => {
    return db.pool.query('SELECT * FROM public.lobby WHERE admin_lobby=$1',
        [adminLobby], (error, results) => {
            cb(error, results)
        });
}

exports.cancellaLobby = (codice) => {
    db.pool.query('DELETE FROM public.lobby WHERE codice = $1', [codice], (error, results) => { })
}

exports.creaLobby = (adminLobby, idGioco, response) => {
    this.cercaLobbyByAdmin(adminLobby, (err, results) => {
        controllaLobbyAdmin(results);

        const codiceLobby = creaCodice();

        db.pool.query('INSERT INTO public.lobby (codice, ultima_richiesta, id_gioco) VALUES ($1, NOW(), $2)',
            [codiceLobby, idGioco], (error, results) => {
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
                if (error) return response.status(400).send("Non è stato impostare l'Admin della Lobby!");
                return response.status(200).send({ 'esito': "1" });
            })
    })
}