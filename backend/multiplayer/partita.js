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
            cambiaGiocatoreCorrente(username, partita.codice_lobby, response);
        })
}

function cambiaGiocatoreCorrente(username, codiceLobby, response) {
    var nuovoGiocatore;

    lobby.getGiocatoriLobby(username, response, (error, results) => {
        if (error) {
            console.log(error);
            return response.status(500).send('Server error!');
        }

        const giocatori = JSON.parse(JSON.stringify(results.rows));
        console.log('giocatori', giocatori);

        for (let i = 0; i < giocatori.length; i++)
            if (giocatori[i].username == username) {
                if (i == (giocatori.length - 1))
                    nuovoGiocatore = giocatori[0];
                else
                    nuovoGiocatore = giocatori[i + 1];
            }


        console.log('nuovoGiocatore', nuovoGiocatore);

        db.pool.query('UPDATE public.partite SET giocatore_corrente = $1 WHERE codice_lobby = $2',
            [nuovoGiocatore.username, codiceLobby], (error, results) => {
                if (error) {
                    console.log(error);
                    return response.status(400).send("Non è stato possibile aggiornare il Giocatore Corrente!");
                }
                return response.status(200).send({ 'esito': "1" });
            })
    })
}

exports.cercaPartitaByCodiceLobby = (codiceLobby, cb) => {
    db.pool.query('SELECT * FROM public.partite WHERE codice_lobby=$1',
        [codiceLobby], (error, results) => {
            cb(error, results);
        })
}

exports.creaPartita = (codiceLobby, giocatoreCorrente, response) => {
    //TODO controllare che la condizione dei giocatore minimi sia rispettata

    this.cercaPartitaByCodiceLobby(codiceLobby, (error, results) => {
        if (error) return response.status(400).send("Non è stato possibile creare la partita!");

        if (controller.controllaRisultatoQuery(results)) {
            db.pool.query('INSERT INTO public.partite (codice, codice_lobby, giocatore_corrente) VALUES ($1, $2, $3)',
                [creaCodice(), codiceLobby, giocatoreCorrente], (error, results) => {
                    if (error) return response.status(400).send("Non è stato possibile creare la partita!");
                    return response.status(200).send({ 'esito': "1" });
                })
        } else {
            db.pool.query('UPDATE public.partite SET codice = $1, giocatore_corrente = $2 WHERE codice_lobby = $3',
                [creaCodice(), giocatoreCorrente, codiceLobby], (error, results) => {
                    if (error) {
                        console.log(error);
                        return response.status(400).send("Non è stato possibile creare la partita!");
                    }
                    return response.status(200).send({ 'esito': "1" });
                })
        }
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

        var tmp = JSON.parse(JSON.stringify(results.rows));
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