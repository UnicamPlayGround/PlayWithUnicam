
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

exports.controllaDatiAccount = function (new_nome, new_cognome, new_username) {
    this.controllaString(new_username, "Il nuovo username non è valido");
    this.controllaString(new_nome,"Il nuovo nome non è valido");
    this.controllaString(new_cognome,"Il nuovo cognome non è valido");
}

exports.controllaDatiAccountAsAdmin = function(new_nome, new_cognome, new_username, new_tipo){
    this.controllaDatiAccount(new_nome, new_cognome, new_username);
    //TODO: controlla bene
    this.controllaString(new_tipo,"Il nuovo tipo non è valido");


}