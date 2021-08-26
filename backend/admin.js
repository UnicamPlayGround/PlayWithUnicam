const db = require('./database');
const utente = require('./utente');
const controller = require('./controller');

/**
 * Ritorna la lista degli Utenti che hanno tipo diverso da "ADMIN".
 * @param {*} username L'username del admin che fa la richiesta
 * @param {*} cb Callback
 * @returns il risultato della query
 */
exports.getUtenti = (username, cb) => {
    return db.pool.query('select username, nome, cognome, tipo from public.utenti where username <> $1',
        [username], (error, results) => {
            cb(error, results)
        });
}

//TODO: capire perché vuole per forza String()
exports.eliminaUtenti = (utenti, response) => {
    const users_to_delete = utenti.split(",");

    users_to_delete.forEach(username => {
        db.pool.query('delete from public.utenti where username = $1',
            [String(username)], (error, results) => {
                if (error) return response.status(400).send('Errore nella query');
            });
    });
    return response.status(200).send({ 'esito': "1" });
}

exports.modificaNomeCognome = (username, new_nome, new_cognome, response) => {
    utente.cercaUtenteByUsername(username, (err, results) => {
        if (err) return response.status(500).send('Server Error!');
        if (controller.controllaRisultatoQuery(results)) return response.status(404).send('Utente non trovato!');

        db.pool.query('UPDATE public.utenti SET nome = $1, cognome = $2 WHERE username = $3',
            [new_nome, new_cognome, username], (error, results) => {
                if (error){
                    console.log(error);
                    return response.status(400).send('Errore dati query');
                } 
                return response.status(200).send({ 'esito': "1" });
            })
    })
}

//TODO controllare se si puo usare lo stesso metodo di utente
exports.modificaUsername = (username, new_username, new_nome, new_cognome, response) => {
    utente.cercaUtenteByUsername(username, (err, results) => {
        if (err) return response.status(500).send('Server Error!');
        if (controller.controllaRisultatoQuery(results)) return response.status(404).send('Utente non trovato!');

        utente.cercaUtenteByUsername(new_username, (err, results) => {
            if (err){
                console.log(error);
                return response.status(500).send('Server Error!');
            } 
            if (!controller.controllaRisultatoQuery(results)) return response.status(404).send("L'username inserito è già stato usato!");

            db.pool.query('UPDATE public.utenti SET username = $1, nome = $2, cognome = $3 WHERE username = $4',
                [new_username, new_nome, new_cognome, username], (error, results) => {
                    if (error){
                        console.log(error);
                        return response.status(400).send('Errore dati query');
                    }
                    return response.status(200).send({ 'esito': "1" });
                })
        });
    });
}

//TODO: se non modifichi l'username da errore. Guardare la modifica dell'utente
exports.modificaUtente = (username, new_username, new_nome, new_cognome, response) => {
    controller.controllaString(username, "L'username non è valido");
    controller.controllaDatiAccount(new_username, new_nome, new_cognome);

    if (username === new_username) {
        this.modificaNomeCognome(username, new_nome, new_cognome, response);
    } else {
        this.modificaUsername(username, new_username, new_nome, new_cognome, response);
    }
}

//TODO: fare metodo e REST che modifica il tipo