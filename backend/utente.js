const controller = require('./controller');
const db = require('./database');
const bcrypt = require('bcrypt');

//TODO
const SECRET_PWD = "secret";
const SECRET_KEY = "secret_jwt";

//TODO da commentare
exports.cercaUtenteByUsername = (username, cb) => {
    controller.controllaNotNull(username, "L'username non deve essere vuoto!");
    return db.pool.query('SELECT * FROM public.utenti WHERE username = $1', [username], (error, results) => {
        cb(error, results)
    });
}


/**
 * TODO
 * @param {*} username 
 * @param {*} password 
 * @param {*} response 
 */
exports.creaUtente = (username, password, response) => {
    controller.controllaNotNull(username, "L'username non deve essere vuoto!");
    controller.controllaPassword(password);

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password + SECRET_PWD, salt);

    db.pool.query('INSERT INTO public.utenti (username, password, salt, tipo) VALUES ($1, $2, $3, $4)',
        [username, hash, salt, "GIOCATORE"], (error, results) => {
            if (error) return response.status(400).send("NON E' STATO POSSIBILE CREARE L'UTENTE!");
            return response.status(200).send({ 'esito': "1" });
        })
}