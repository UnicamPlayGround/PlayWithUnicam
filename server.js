const express = require('express');
const app = express();

const utente = require('./backend/utente');
const controller = require('./backend/controller');

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

            const expiresIn = 24 * 60 * 60;

            const accessToken = jwt.sign({ id: user[0].id, tipo: user[0].tipo }, SECRET_KEY, { algorithm: 'HS256', expiresIn: expiresIn });
            return res.status(200).send({ "accessToken": accessToken });
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


app.get('/*', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/www' });
});

app.listen(8080);