const xss = require("xss");

/**
 * Controlla che la Query abbia ritornato almeno un riga.
 * @param {*} results Risultato della query da controllare
 * @returns true se la query non ha ritornato nulla, false altrimenti
 */
exports.controllaRisultatoQuery = (results) => {
    if (results) {
        const toControl = JSON.parse(JSON.stringify(results.rows));
        return (toControl.length == 0);
    } else return true;
}

/** 
 * Controlla che la variabile passata sia diversa da null.
 * @param {*} toControl Variabile da controllare
 * @returns true se la variabile è uguale a null, false altrimenti
 */
exports.controllaNotNull = function (toControl) {
    return (toControl == null);
}

/**
 * Controlla che la password sia compresa tra 8 e 16 caratteri.
 * @param {String} password password da controllare
 * @returns true se la password non è valida, false altrimenti 
 */
exports.controllaPassword = function (password) {
    return (password.trim() == "" || password.length < 8 || password.length > 16);
}

/**
 * Controlla che la stringa passata sia diversa da null o dalla stringa vuota.
 * @param {String} toControl Dato da controllare
 * @returns true se la stringa non è valida, false altrimenti
 */
exports.controllaString = function (toControl) {
    return (toControl == null || toControl.trim() == "");
}

/**
 * Controlla i dati di un gioco.
 * @param {String} nome 
 * @param {String} tipo 
 * @param {*} minGiocatori 
 * @param {*} maxGiocatori 
 * @param {String} link 
 * @param {boolean} attivo 
 * @param {String} regolamento 
 */
exports.controllaDatiGioco = function (nome, tipo, minGiocatori, maxGiocatori, link, attivo, regolamento) {
    return new Promise((resolve, reject) => {
        if (exports.controllaString(nome))
            throw new Error("Il nome del gioco non è valido");

        if (exports.controllaString(link))
            throw new Error("Il link del gioco non è valido");

        if (regolamento)
            if (exports.controllaString(regolamento))
                throw new Error("Il regolamento del gioco non è valido");

        if (Number.isInteger(minGiocatori) && Number.isInteger(maxGiocatori)) {
            if (minGiocatori < 1 || maxGiocatori < 1)
                throw new Error("Il numero minimo o massimo dei giocatori non può essere minore di uno!");
            else if (minGiocatori > maxGiocatori)
                throw new Error("Il numero minimo dei giocatori non può essere maggiore del numero massimo!");
        } else throw new Error("Il numero minimo o massimo dei giocatori deve essere un intero!");

        if (tipo != 'TURNI' && tipo != 'NORMALE')throw new Error("Il tipo di gioco non è valido!");
        if (typeof attivo != "boolean") throw new Error("Il parametro attivo non è valido!");

        return resolve();
    })
}

/**
 * Controlla e corregge la stringa "toControl" per prevenire il Cross Site Scripting.
 * @param {string} toControl Stringa da controllare
 * @returns la stringa "igenizzata"
 */
exports.xssSanitize = function (toControl) {
    return xss(toControl);
}