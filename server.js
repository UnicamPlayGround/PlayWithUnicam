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
    game.getListaGiochi((err, results) => {
        if (err) return res.status(500).send('Server error!');
        sendDataInJSON(res, results);
    });
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
        admin.getUtenti((err, results) => {
            if (err) return res.status(500).send('Server error!');
            sendDataInJSON(res, results);
        });
    } else return res.status(401).send(ERRORE_JWT);
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
            const result = (user[0].password == toControl);
            if (!result) return res.status(401).send('Password non valida!');

            const toSend = { username: user[0].username, tipo: user[0].tipo };
            sendAccessToken(res, toSend);
        })
    } catch (error) {
        return res.status(400).send(error);
    }
});

/**
 * REST - Registrazione
 */
app.post('/register/utente', (req, res) => {
    try {
        utente.cercaUtenteByUsername(req.body.username, (err, results) => {
            try {
                if (err) return res.status(500).send('Server error!');
                const users = JSON.parse(JSON.stringify(results.rows));

                if (users.length == 0)
                    utente.creaUtente(req.body.username, req.body.password, res);
                else return res.status(400).send("L'username \'" + users[0].username + "\' è già stato usato!");
            } catch (error) {
                return res.status(400).send(error);
            }
        });
    } catch (error) {
        return res.status(400).send(error);
    }
});

//TODO commentare
app.post('/lobby', (req, res) => {
    try {
        lobby.creaLobby(req.body.adminLobby, req.body.idGioco, res);
    } catch (error) {
        return res.status(400).send(error);
    }
})

//TODO
app.post('/login/ospiti', (req, res) => {
    console.log(req.body.username);
    try {
        utente.cercaUtenteByUsername(req.body.username, (err, results) => {
            
            if (err) return res.status(500).send('Server Error!');
            if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso");

            utente.cercaOspiteByUsername(req.body.username, (err, results) => {
                if (err) return res.status(500).send('Server Error!');
                if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso");

                utente.creaOspite(req.body.username, (err, results) => {
                    if (err) return res.status(400).send("NON E' STATO POSSIBILE CREARE L'OSPITE!");
                    const toSend = { username: req.body.username, tipo: "OSPITE" };
                    sendAccessToken(res, toSend);
                });
            })
        })
    } catch (error) {
        return res.status(400).send(error);
    }
})


app.get('/*', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/www' });
});

app.listen(8080);