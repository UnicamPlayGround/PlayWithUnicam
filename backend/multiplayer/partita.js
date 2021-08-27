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

//TODO commentare
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
            cambiaGiocatoreCorrente(username, partita.codice_lobby);
            return response.status(200).send({ 'esito': "1" });
        })
}

function cambiaGiocatoreCorrente(username, codiceLobby) {
    var nuovoGiocatore;

    lobby.getGiocatoriLobby(username, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Server error!');
        }

        const tmp = JSON.parse(JSON.stringify(results.rows));
        const giocatori = tmp[0];

        for (let i = 0; i < giocatori.length; i++)
            if (giocatori[i].username == username) {
                if (i == (giocatori.length - 1))
                    nuovoGiocatore = giocatori[0];
                else
                    nuovoGiocatore = giocatori[i + 1];
            }

        db.pool.query('UPDATE public.partite SET giocatore_corrente = $1 WHERE codice = $2',
            [nuovoGiocatore, codiceLobby], (error, results) => {
                if (error) {
                    console.log(error);
                    return response.status(400).send("Non è stato possibile aggiornare il Giocatore Corrente!");
                }
            })
    })
}

exports.creaPartita = (codiceLobby, giocatoreCorrente, response) => {
    //TODO controllare che la condizione dei giocatore minimi sia rispettata
    db.pool.query('INSERT INTO public.partite (codice, codice_lobby, giocatore_corrente) VALUES ($1, $2, $3)',
        [creaCodice(), codiceLobby, giocatoreCorrente], (error, results) => {
            if (error) return response.status(400).send("Non è stato possibile creare la partita!");
            return response.status(200).send({ 'esito': "1" });
        })
}

//TODO commentare
exports.getInfoPartita = (username, cb) => {
    return db.pool.query('SELECT partite.codice, partite.codice_lobby, giocatore_corrente, vincitore, info, id_gioco FROM' +
        ' (partite INNER JOIN lobby ON partite.codice_lobby=lobby.codice)' +
        ' INNER JOIN giocatori ON giocatori.codice_lobby=lobby.codice WHERE giocatori.username=$1',
        [username], (error, results) => {
            cb(error, results)
        })
}

/**
 * 
 * @param {String} username 
 * @param {*} infoGiocatore 
 * @param {*} response 
 */
exports.salvaInfoGiocatore = (username, infoGiocatore, response) => {

    //TODO da finire
    this.getInfoPartita(username, (error, results) => {
        if (error) return response.status(500).send('Server error!');
        if (controller.controllaRisultatoQuery(results)) return response.status(404).send('Nessuna partita trovata!');

        const tmp = JSON.parse(JSON.stringify(results.rows));
        const partita = tmp[0];

        game.getInfoGioco(partita.id_gioco, (error, results) => {
            if (error) return response.status(500).send('Server error!');

            tmp = JSON.parse(JSON.stringify(results.rows));
            const gioco = tmp[0];

            if (gioco.tipo == "TURNI" && partita.giocatore_corrente != username)
                return response.status(401).send('Devi aspettare il tuo turno!');
            else
                salvaInformazioni(username, partita, infoGiocatore, response);
        })
    })
}