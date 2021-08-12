
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
    if (password == null || password.length < 8 || password.length > 16)
        throw "La password deve essere compresa tra 8 e 16 caratteri.";
}

/**
 * Controlla che il parametro passato sia diverso da null o dalla stringa vuota.
 * @param {String} toControl Dato da controllare
 * @param {String} errorText Errore da stampare
 */
 exports.controllaString = function (toControl, errorText) {
    if (toControl == null || toControl == "") throw errorText;
}

exports.controllaDatiAccount = function (dati) {
    this.controllaString(dati.username, "Il nuovo username non è valido");
    this.controllaString(dati.nome,"Il nuovo nome non è valido");
    this.controllaString(dati.cognome,"Il nuovo cognome non è valido");
}

exports.controllaDatiAccountAsAdmin = function(dati){
    this.controllaDatiAccount(dati);
    //TODO: controlla bene
    this.controllaString(dati.new_tipo,"Il nuovo tipo non è valido");


}