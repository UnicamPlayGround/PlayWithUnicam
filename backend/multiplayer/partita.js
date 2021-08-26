const db = require('../database');
const controller = require('../controller');

exports.creaPartita = (username, cb) => {

}

//TODO commentare
exports.getInfoPartita = (username, cb) => {
    return db.pool.query('SELECT partite.codice, partite.codice_lobby, giocatore_corrente, vincitore, info_partita FROM' +
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

        if (partita.info_partita == null)
            partita.info_partita = { giocatori: [] };

        var index = 0;

        for (let i = 0; i < partita.info_partita.giocatori.length; i++) {
            console.log("partita.info_partita.giocatori[i].username", partita.info_partita.giocatori[i].username);
            console.log(username);

            if (partita.info_partita.giocatori[i].username == username) {
                index = i;
                break;
            }
            index++;
        }

        console.log("index", index);

        const toSave = {
            "username": username,
            "info_giocatore": infoGiocatore
        }

        partita.info_partita.giocatori[index] = toSave;

        db.pool.query('UPDATE public.partite SET info_partita = $1 WHERE codice = $2',
            [partita.info_partita, partita.codice], (error, results) => {
                if (error) {
                    console.log(error);
                    return response.status(400).send("Non è stato possibile caricare le informazioni del Giocatore!");
                }
                return response.status(200).send({ 'esito': "1" });
            })
    })
}