/**
 * Controlla che la Query abbia ritornato almeno un riga.
 * @param {*} results Risultato della query da controllare
 * @returns true se la query non ha ritornato nulla, false altrimenti
 */
exports.controllaRisultatoQuery = (results) => {
    const toControl = JSON.parse(JSON.stringify(results.rows));
    return (toControl.length == 0);
}

/** 
 * Controlla che il parametro passato sia diverso da null.
 * @param {*} toControl Dato da controllare
 * @param {String} errorText Errore da stampare
 */
exports.controllaNotNull = function (toControl, errorText) {
    if (toControl == null) throw errorText;
}

/**
 * Controlla che la password sia compresa tra 8 e 16 caratteri.
 * @param {String} password password da controllare
 */
exports.controllaPassword = function (password) {
    if (password.trim() == "" || password.length < 8 || password.length > 16)
        throw "La password deve essere compresa tra 8 e 16 caratteri.";
}

/**
 * Controlla che il parametro passato sia diverso da null o dalla stringa vuota.
 * @param {String} toControl Dato da controllare
 * @param {String} errorText Errore da stampare
 */
exports.controllaString = function (toControl, errorText) {
    if (toControl == null || toControl.trim() == "") throw errorText;
}

/**
 * Controlla il nome, cognome e username di un Account
 * @param {String} newNome il nuovo nome dell'account
 * @param {String} newCognome il nuovo cognome dell'account
 * @param {String} newUsername il nuovo username dell'account
 */
exports.controllaDatiAccount = function (newNome, newCognome, newUsername) {
    this.controllaString(newUsername, "Il nuovo username non è valido");
    this.controllaString(newNome, "Il nuovo nome non è valido");
    this.controllaString(newCognome, "Il nuovo cognome non è valido");
}

/**
 * Controlla i dati di un account compreso il tipo
 * @param {String} newNome  il nuovo nome dell'account
 * @param {String} newCognome  il nuovo cognome dell'account
 * @param {String} newUsername  il nuovo username nome dell'account
 * @param {String} newTipo  il nuovo tipo dell'account
 */
exports.controllaDatiAccountAsAdmin = function (newNome, newCognome, newUsername, newTipo) {
    this.controllaDatiAccount(newNome, newCognome, newUsername);
    //TODO: controlla bene
    this.controllaString(newTipo, "Il nuovo tipo non è valido");
}

/**
 * Controlla i dati di un gioco
 * @param {String} nome 
 * @param {String} tipo 
 * @param {*} minGiocatori 
 * @param {*} maxGiocatori 
 * @param {String} link 
 * @param {boolean} attivo 
 * @param {String} regolamento 
 */
exports.controllaDatiGioco = function (nome, tipo, minGiocatori, maxGiocatori, link, attivo, regolamento) {
    this.controllaString(nome, "Il nome del gioco non è valido");
    this.controllaString(link, "Il link del gioco non è valido");
    if (regolamento) this.controllaString(regolamento, "Il regolamento del gioco non è valido");

    if (Number.isInteger(minGiocatori) && Number.isInteger(maxGiocatori)) {
        if (minGiocatori < 1 || maxGiocatori < 1) throw "Il numero minimo o massimo dei giocatori non può essere minore di uno!";
        else if (minGiocatori > maxGiocatori) throw "Il numero minimo dei giocatori non può essere maggiore del numero massimo!";
    } else throw "Il numero minimo o massimo dei giocatori deve essere un intero!";

    if (tipo != 'TURNI' && tipo != 'NORMALE') throw "Il tipo di gioco non è valido!";
    if (typeof attivo != "boolean") throw "Il parametro attivo non è valido!";
}