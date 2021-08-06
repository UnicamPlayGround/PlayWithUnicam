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

//TODO da commentare
exports.cercaOspiteByUsername = (username, cb) => {
    controller.controllaNotNull(username, "L'username non deve essere vuoto!");
    return db.pool.query('SELECT * FROM public.ospiti WHERE username = $1', [username], (error, results) => {
        cb(error, results)
    });
}


//TODO
exports.creaUtente = (body, response) => {
    //TODO: metterli tutti in un unico metodo
    controller.controllaNotNull(body.username, "Il campo 'Username' non deve essere vuoto!");
    controller.controllaNotNull(body.nome, "Il campo 'Nome' non deve essere vuoto!");
    controller.controllaNotNull(body.cognome, "Il campo 'Cognome' non deve essere vuoto!");
    controller.controllaPassword(body.password);

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(body.password + SECRET_PWD, salt);

    db.pool.query('INSERT INTO public.utenti (username, nome, cognome, password, salt, tipo) VALUES ($1, $2, $3, $4, $5, $6)',
        [body.username, body.nome, body.cognome, hash, salt, "GIOCATORE"], (error, results) => {
            if (error) return response.status(400).send("NON E' STATO POSSIBILE CREARE L'UTENTE!");
            return response.status(200).send({ 'esito': "1" });
        })
}

//TODO
exports.creaOspite = (username, cb) => {
    controller.controllaNotNull(username, "L'username non deve essere vuoto!");

    db.pool.query('INSERT INTO public.ospiti (username) VALUES ($1)',
        [username], (error, results) => {
            cb(error, results)
        })
}