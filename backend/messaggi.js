/**
 * Messagio di errore:
 * * il JWT non è valido per effettuare la richiesta REST.
 */
const ERRORE_JWT = "Errore, JWT non valido! Rieffettua il login.";

/**
 * Messaggio di errore generico.
 */
const SERVER_ERROR = "Server Error!";

/**
 * Messaggio di errore:
 * * l'Utente non è stato trovato.
 */
const UTENTE_NON_TROVATO_ERROR = "Utente non trovato";

//--------------------------------- LOBBY ---------------------------------

/**
 * Messaggio di errore:
 * * per effettuare l'azione desiderata l'Utente deve partecipare ad una Lobby.
 */
const PARTECIPAZIONE_LOBBY_ERROR = "Errore: Devi partecipare ad una Lobby!";

/**
 * Messaggio di errore:
 * * la creazione di una Lobby ha determinato un errore.
 */
const CREAZIONE_LOBBY_ERROR = "Non è stato possibile creare la lobby!";

//--------------------------------- PARTITA ---------------------------------

/**
 * Messaggio di errore:
 * * la creazione di una Partita ha determinato un errore.
 */
const CREAZIONE_PARTITA_ERROR = "Non è stato possibile creare la partita!";

/**
 * Messaggio di errore:
 * * la Partita non è stata trovata.
 */
const PARTITA_NON_TROVATA_ERROR = "Nessuna partita trovata!";

module.exports = {
    ERRORE_JWT,
    SERVER_ERROR,
    UTENTE_NON_TROVATO_ERROR,
    PARTECIPAZIONE_LOBBY_ERROR,
    CREAZIONE_LOBBY_ERROR,
    CREAZIONE_PARTITA_ERROR,
    PARTITA_NON_TROVATA_ERROR
}