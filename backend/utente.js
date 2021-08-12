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

//TODO
exports.modificaCredenziali = (old_username, request, response) => {
    console.log(old_username);
    //controller.controllaString(old_username, "L'username non è valido");
    controller.controllaDatiAccount(request.body);

    this.cercaUtenteByUsername(old_username, (err, results) => {
        if (err) return response.status(500).send('Server Error!');
        if (controller.controllaRisultatoQuery(results)) return response.status(404).send('Utente non trovato!');

        this.cercaUtenteByUsername(request.body.username, (err, results) => {
            if (err) return response.status(500).send('Server Error!');
            if (!controller.controllaRisultatoQuery(results)) return response.status(404).send("L'username inserito è già stato usato!");

            db.pool.query('UPDATE public.utenti SET username = $1, nome = $2, cognome = $3 WHERE username = $4',
                [request.body.username, request.body.nome, request.body.cognome, old_username], (error, results) => {
                    if (error){
                        console.log(error);
                        return response.status(400).send('Errore dati query');
                    } 
                    return response.status(200).send({ 'esito': "1" });
                })
        });
    });
}

exports.cambiaPassword =  (request, response, results, username) => {
    var query, errorText;
    query = 'UPDATE public.utenti SET password = $1 WHERE username = $2';
    errorText = 'Utente non trovato!';


    const risultati = JSON.parse(JSON.stringify(results.rows));
    if (risultati.length == 0) return response.status(404).send(errorText);

    const data = risultati[0];
    const hash = bcrypt.hashSync(request.body.old_password + process.env.SECRET_PWD, data.salt);

    if (hash == data.password) {
        const new_hash = bcrypt.hashSync(request.body.new_password + process.env.SECRET_PWD, data.salt);

        db.pool.query(query, [new_hash, username], (error, results) => {
            if (error) return response.status(400).send(db.ERRORE_DATI_QUERY);
            return response.status(200).send({ 'esito': "1" });
        });
    } else return response.status(401).send('La vecchia password non è corretta');
}

exports.getUserInfo = (username, cb) => {
    return db.pool.query('select username, nome, cognome from public.utenti where username=$1',
        [username], (error, results) => {
            cb(error, results)
        });
}