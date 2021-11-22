const messaggi = require('./messaggi');

/**
 * Gestisce l'invio dei messaggi di errore dal Server al Client.
 * @param {*} error Errore da gestire
 * @param {*} response 
 */
//TODO fare error.message
exports.handleError = (error, response) => {
    switch (error.message) {
        //ERROR 401
        case messaggi.PASSWORD_NON_VALIDA_ERROR:
        case messaggi.ERRORE_JWT:
            response.status(401).send(error.message);
            break;
        //ERROR 404
        case messaggi.UTENTE_NON_TROVATO_ERROR:
        case messaggi.PARTITA_NON_TROVATA_ERROR:
            response.status(404).send(error.message);
            break;
        //ERROR 409
        case messaggi.CREAZIONE_GIOCO_ERROR:
        case messaggi.CREAZIONE_LOBBY_ERROR:
        case messaggi.CREAZIONE_PARTITA_ERROR:
        case messaggi.MINIMO_GIOCATORI_ERROR:
        case messaggi.PARTECIPAZIONE_LOBBY_ERROR:
            response.status(409).send(error.message);
            break;
        //ERROR 500
        case messaggi.SERVER_ERROR:
            response.status(500).send(error.message);
            break;
        default:
            response.status(500).send(error.message);
            break;
    }
}