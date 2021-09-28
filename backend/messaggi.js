/**
 * Messagio di errore:
 * * il JWT non è valido per effettuare la richiesta REST.
 */
const ERRORE_JWT = "Errore, JWT non valido! Rieffettua il login.";

/**
 * Messaggio di errore generico.
 */
const SERVER_ERROR = "Server Error!";

//--------------------------------- UTENTE ---------------------------------

/**
 * Messaggio di errore:
 * * l'Utente non è stato trovato.
 */
const UTENTE_NON_TROVATO_ERROR = "Utente non trovato";

/**
 * Messaggio di errore:
 * * la password non è valida per effettuare il login.
 */
const PASSWORD_NON_VALIDA_ERROR = "Password non valida!";

//--------------------------------- LOBBY ---------------------------------

/**
 * Messaggio di errore:
 * * per effettuare l'azione desiderata l'Utente deve partecipare ad una lobby.
 */
const PARTECIPAZIONE_LOBBY_ERROR = "Errore: devi partecipare ad una lobby!";

/**
 * Messaggio di errore:
 * * la creazione di una lobby ha determinato un errore.
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

/**
 * Messaggio di errore:
 * * Non ci sono abbastanza giocatori per completare la partita.
 */
const MINIMO_GIOCATORI_ERROR = "Non ci sono abbastanza giocatori per completare la partita!";

//--------------------------------- GIOCO ---------------------------------

/**
 * Messaggio di errore:
 * * la creazione di un Gioco ha determinato un errore.
 */
const CREAZIONE_GIOCO_ERROR = "Non è stato possibile creare il gioco!";

module.exports = {
    ERRORE_JWT,
    SERVER_ERROR,
    UTENTE_NON_TROVATO_ERROR,
    PASSWORD_NON_VALIDA_ERROR,
    PARTECIPAZIONE_LOBBY_ERROR,
    CREAZIONE_LOBBY_ERROR,
    CREAZIONE_PARTITA_ERROR,
    PARTITA_NON_TROVATA_ERROR,
    MINIMO_GIOCATORI_ERROR,
    CREAZIONE_GIOCO_ERROR
}