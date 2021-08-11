const express = require('express');
const app = express();

const admin = require('./backend/admin');
const controller = require('./backend/controller');
const game = require('./backend/multiplayer/game');
const lobby = require('./backend/multiplayer/lobby');
const partita = require('./backend/multiplayer/partita');
const utente = require('./backend/utente');

//TODO
const SECRET_PWD = "secret";
const SECRET_KEY = "secret_jwt";

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ERRORE_JWT = "Errore, JWT non valido! Rieffettua il Login."

//Run the app by serving the static files in the dist directory
app.use(express.static(__dirname + '/www'));

app.use(express.json());

function verificaJWT(token) {
    try {
        if (token == null || token == '' || token == undefined) return false;
        jwt.verify(token, SECRET_KEY);
        return true;
    } catch (error) {
        return false;
    }
}

function verificaAdmin(token) {
    if (verificaJWT) {
        tipo = (jwt.decode(token)).tipo;
        return (tipo == "ADMIN");
    } else return false;
}

function verificaUtente(token) {
    if (verificaJWT) {
        tipo = (jwt.decode(token)).tipo;
        return (tipo == "UTENTE");
    } else return false;
}

/**
 * Invia il risultato di una query in formato JSON.
 * @param {*} response 
 * @param {*} results Risultato della query da inviare
 */
function sendDataInJSON(response, results) {
    const data = JSON.parse(JSON.stringify(results.rows));
    const to_return = { 'results': data };

    response.status(200).send(to_return);
}

/**
 * Invia il JWT di accesso.
 * @param {*} response 
 * @param {*} results JWT da inviare
 */
function sendAccessToken(response, toSend) {
    const expiresIn = 24 * 60 * 60;

    const accessToken = jwt.sign(toSend, SECRET_KEY, { algorithm: 'HS256', expiresIn: expiresIn });
    return response.status(201).send({ "accessToken": accessToken });
}

/**
 * REST - GET
 */

//TODO commentare
app.get('/games', (req, res) => {
    const token = req.headers.token;

    if (verificaJWT(token)) {
        game.getListaGiochi((err, results) => {
            if (err) return res.status(500).send('Server error!');
            sendDataInJSON(res, results);
        });
    } else return res.status(401).send(ERRORE_JWT);
})

//TODO commentare
app.get('/game/status', (req, res) => {
    const token = req.headers.token;

    //TODO controllare che il JWT sia di un giocatore
    if (verificaJWT(token)) {
        partita.getInfoPartita(jwt.decode(token), (err, results) => {
            if (err) return res.status(500).send('Server error!');

            const toReturn = JSON.parse(JSON.stringify(results.rows));
            res.status(200).send(toReturn[0]);
        });
    } else return res.status(401).send(ERRORE_JWT);
});

//TODO commentare
app.get('/dado/:nFacce', (req, res) => {
    try {
        const toReturn = game.lancioDado(req.params.nFacce);
        res.status(200).send({ "results": toReturn });
    } catch (error) {
        return res.status(400).send(error);
    }
})

/**
 * REST - Ritorna la lista degli Utenti
 */
app.get('/admin/utenti', (req, res) => {
    if (verificaAdmin(req.headers.token)) {
        const decoded_token = jwt.decode(req.headers.token);
        admin.getUtenti(decoded_token.username, (err, results) => {
            if (err) return res.status(500).send('Server error!');
            sendDataInJSON(res, results);
        });
    } else return res.status(401).send(ERRORE_JWT);
});

/**
 * REST - Ritorna la lista delle Lobby Pubbliche
 */
app.get('/lobby/pubbliche', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        lobby.getLobbyPubbliche((err, results) => {
            if (err) return res.status(500).send('Server error!');
            sendDataInJSON(res, results);
        })
    } else return res.status(401).send(ERRORE_JWT);
});

 /**
  * REST - Ritorna le Informazioni dell'Utente
  * 
  */
 app.get('/info/utente', (req, res) => {
    const token = req.headers.token;
    if (verificaJWT(req.headers.token)) {
        utente.getUserInfo(jwt.decode(token).username, (err, results) => {
            if (err) return res.status(500).send('Server error!');
            sendDataInJSON(res, results);
        })
    } else return res.status(401).send('JWT non valido!');
});

/**
 * //TODO riguardare commento
 * REST - Ritorna la lista degli Utenti
 */
app.delete('/admin/utenti', (req, res) => {
    if (verificaAdmin(req.headers.token)) {
        try {
            admin.eliminaUtenti(req.headers.users_to_delete, res);
        } catch (error) {
            return res.status(400).send(error);
        }
    } else return res.status(401).send(ERRORE_JWT);
});

/**
 * REST - Modifica i dati dell'utente come admin
 */
app.put('/admin/utenti/:username', (req, res) => {
    if (verificaAdmin(req.body.token)) {
        try {
            admin.modificaUtente(req, res);
        } catch (error) {
            return res.status(400).send(error);
        }
    } else return res.status(401).send(ERRORE_JWT);
});

/**
 * REST - Modifica i dati del profilo
 */
app.put('/player/profilo', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            decoded_token = jwt.decode(req.body.token);
            utente.modificaCredenziali(decoded_token.username, req, res);
        }
    } catch (error) {
        return res.status(400).send(error);
    }
});

/**
 * REST - Modifica i dati della lobby
 */
app.put('/lobby/:codiceLobby', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            decoded_token = jwt.decode(req.body.token);
            lobby.modificaLobby(req.params.codiceLobby, req.body.pubblica, decoded_token.username, res);
        } else return res.status(401).send(ERRORE_JWT);

    } catch (error) {
        return res.status(400).send(error);
    }
});

/**
 * REST - Modifica la Password 
 */
 app.put('/modifica/password/:id', (req, res) => {
    const token = req.body.token_value;
    if (utente.verificaUtente(token)) {
        try {
            utente.modificaPassword(req, res, jwt.decode(token));
        } catch (error) {
            return res.status(400).send(error);
        }
    } else return res.status(401).send('JWT non valido!');
});

/**
 * REST - POST
 */

/**
 * REST - Login dell'Utente
 */
app.post('/login/utente', (req, res) => {
    try {
        utente.cercaUtenteByUsername(req.body.username, (err, results) => {
            if (err) return res.status(500).send('Server Error!');
            if (controller.controllaRisultatoQuery(results)) return res.status(404).send('Utente non trovato!');

            const user = JSON.parse(JSON.stringify(results.rows));

            const toControl = bcrypt.hashSync(req.body.password + SECRET_PWD, user[0].salt);
            if (!(user[0].password == toControl)) return res.status(401).send('Password non valida!');

            sendAccessToken(res, { username: user[0].username, tipo: user[0].tipo });
        })
    } catch (error) {
        return res.status(400).send(error);
    }
});

//TODO
app.post('/login/ospiti', (req, res) => {
    try {
        utente.cercaUtenteByUsername(req.body.username, (err, results) => {
            if (err) return res.status(500).send('Server Error!');
            if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");

            utente.cercaOspiteByUsername(req.body.username, (err, results) => {
                if (err) return res.status(500).send('Server Error!');
                if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");

                utente.creaOspite(req.body.username, (err, results) => {
                    if (err) return res.status(400).send("NON E' STATO POSSIBILE CREARE L'OSPITE!");
                    sendAccessToken(res, { username: req.body.username, tipo: "OSPITE" });
                });
            })
        })
    } catch (error) {
        return res.status(400).send(error);
    }
})

/**
 * REST - Registrazione
 */
app.post('/register/utente', (req, res) => {
    try {
        utente.cercaOspiteByUsername(req.body.username, (err, results) => {
            if (err) return res.status(500).send('Server Error!');
            if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");



            utente.cercaUtenteByUsername(req.body.username, (err, results) => {
                try {
                    if (err) return res.status(500).send('Server error!');
                    const users = JSON.parse(JSON.stringify(results.rows));

                    if (users.length == 0)
                        utente.creaUtente(req.body, res);
                    else return res.status(400).send("L'username \'" + users[0].username + "\' è già stato usato!");
                } catch (error) {
                    console.log(error);
                    return res.status(400).send(error);
                }
            });
        });
    } catch (error) {
        return res.status(400).send(error);
    }
});

//TODO commentare
app.post('/lobby', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            decoded_token = jwt.decode(req.body.token);
            lobby.creaLobby(decoded_token.username, req.body.idGioco, req.body.pubblica, res);
        } else return res.status(401).send(ERRORE_JWT);
    } catch (error) {
        return res.status(400).send(error);
    }
})

//TODO commentare
app.post('/lobby/partecipa', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            decoded_token = jwt.decode(req.body.token);
            lobby.partecipaLobby(decoded_token.username, req.body.codice_lobby, res);
        } else return res.status(401).send(ERRORE_JWT);
    } catch (error) {
        return res.status(400).send(error);
    }
})

app.get('/*', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/www' });
});

app.listen(8080);