const express = require('express');
const app = express();

const admin = require('./backend/admin');
const controller = require('./backend/controller');
const game = require('./backend/multiplayer/game');
const lobby = require('./backend/multiplayer/lobby');
const partita = require('./backend/multiplayer/partita');
const utente = require('./backend/utente');
const giocatore = require('./backend/multiplayer/giocatore');

//TODO
const SECRET_PWD = "secret";
const SECRET_KEY = "secret_jwt";

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ERRORE_JWT = "Errore, JWT non valido! Rieffettua il Login."

const timerGiocatoriInattivi = setInterval(() => { controllaGiocatoriInattivi(); }, 5000);

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
    const toReturn = { 'results': data };

    response.status(200).send(toReturn);
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
 * Imposta il formato della Data delle Lobby.
 * @param {*} lobbies 
 */
function formatDataLobby(lobbies) {
    lobbies.forEach(lobby => {
        var tmp = new Date(lobby.data_creazione);
        var data = tmp.getDate() + '/' + (tmp.getMonth() + 1) + '/' + tmp.getFullYear();
        lobby.data_creazione = data;
    })
}

function controllaGiocatoriInattivi() {
    giocatore.controllaInattivi();
}

/**
 * REST - GET
 */

//TODO commentare
app.get('/games', (req, res) => {
    const token = req.headers.token;

    if (verificaJWT(token)) {
        game.getListaGiochi((err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Server error!');
            }
            sendDataInJSON(res, results);
        });
    } else return res.status(401).send(ERRORE_JWT);
})

//TODO commentare
app.get('/game/status', (req, res) => {
    const token = req.headers.token;

    //TODO controllare che il JWT sia di un giocatore
    if (verificaJWT(token)) {
        partita.getInfoPartita(jwt.decode(token).username, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Server error!');
            }
            sendDataInJSON(res, results);
        });
    } else return res.status(401).send(ERRORE_JWT);
});

app.get('/game/config', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        game.getConfigGioco(jwt.decode(req.headers.token).username, res, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Server error!');
            }
            sendDataInJSON(res, results);
        })
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
        admin.getUtenti(jwt.decode(req.headers.token).username, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Server error!');
            }
            sendDataInJSON(res, results);
        });
    } else return res.status(401).send(ERRORE_JWT);
});

/**
 * REST - Ritorna la lista delle Lobby Pubbliche
 */
app.get('/lobby/pubbliche', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        lobby.getLobbyPubbliche(jwt.decode(req.headers.token).username, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Server error!');
            }

            const lobbies = JSON.parse(JSON.stringify(results.rows));
            formatDataLobby(lobbies);
            const toReturn = { 'results': lobbies };

            res.status(200).send(toReturn);
        })
    } else return res.status(401).send(ERRORE_JWT);
});

/**
 * REST - Ritorna il numero dei Giocatori all'interno di una Lobby
 */
app.get('/lobby/giocatori/:codiceLobby', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        lobby.getNumeroGiocatoriLobby(req.params.codiceLobby, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Server error!');
            }
            sendDataInJSON(res, results);
        })
    } else return res.status(401).send(ERRORE_JWT);
});

/**
 * REST - Ritorna le Informazioni dell'Utente
 */
app.get('/info/utente', (req, res) => {
    const token = req.headers.token;
    if (verificaJWT(req.headers.token)) {
        utente.getUserInfo(jwt.decode(token).username, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Server error!');
            }
            sendDataInJSON(res, results);
        })
    } else return res.status(401).send(ERRORE_JWT);
});

/**
 * REST - Ritorna le informazioni di una Lobby
 */
app.get('/lobby/info', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        lobby.cercaLobbyByUsername(jwt.decode(req.headers.token).username, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Server error!');
            }
            sendDataInJSON(res, results);
        })
    } else return res.status(401).send(ERRORE_JWT);
});

app.get('/lobby/giocatori', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        lobby.getGiocatoriLobby(jwt.decode(req.headers.token).username, res, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Server error!');
            }
            sendDataInJSON(res, results);
        })
    } else return res.status(401).send(ERRORE_JWT);
});

app.delete('/lobby/admin/espelli', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        try {
            lobby.eliminaPartecipante(jwt.decode(req.headers.token).username, req.headers.username, res);
        } catch (error) {
            return res.status(400).send(error);
        }
    } else return res.status(401).send(ERRORE_JWT);
});

app.delete('/lobby/abbandona', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        try {
            lobby.abbandonaLobby(jwt.decode(req.headers.token).username, res);
        } catch (error) {
            return res.status(400).send(error);
        }
    } else return res.status(401).send(ERRORE_JWT);
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
            admin.modificaUtente(req.params.username, req.body.new_username, req.body.new_nome, req.body.new_cognome, res);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    } else return res.status(401).send(ERRORE_JWT);
});

/**
 * REST - Modifica nome e cognome di un utente
 */
app.put('/player/profilo', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            utente.modificaNomeCognome(jwt.decode(req.body.token).username, req.body.nome, req.body.cognome, res);
        } else return res.status(401).send(ERRORE_JWT);
    } catch (error) {
        return res.status(400).send(error);
    }
});

/**
 * REST - Modifica username di un utente
 */
app.put('/player/username', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            const decodedToken = jwt.decode(req.body.token);
            utente.modificaUsername(decodedToken.username, req.body.new_username, res, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send('Errore dati query');
                }
                sendAccessToken(res, { username: req.body.new_username, tipo: decodedToken.tipo });
            });
        } else return res.status(401).send(ERRORE_JWT);
    } catch (error) {
        return res.status(400).send(error);
    }
});

/**
 * REST - Modifica i dati della lobby
 */
app.put('/lobby', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            lobby.modificaLobby(jwt.decode(req.body.token).username, req.body.pubblica, res);
        } else return res.status(401).send(ERRORE_JWT);
    } catch (error) {
        return res.status(400).send(error);
    }
});

/**
 * REST - Modifica la Password 
 */
app.put('/modifica/password', (req, res) => {
    const token = req.body.token;
    if (verificaJWT(token)) {
        try {
            utente.cambiaPassword(req.body.new_password, req.body.old_password, res, jwt.decode(token).username);
        } catch (error) {
            return res.status(400).send(error);
        }
    } else return res.status(401).send(ERRORE_JWT);
});

/**
 * REST - Modifica le Informazioni di una Partita 
 */
app.put('/game/save', (req, res) => {
    if (verificaJWT(req.body.token)) {
        try {
            partita.salvaInfoGiocatore(jwt.decode(req.body.token).username, req.body.info_giocatore, res);
        } catch (error) {
            return res.status(400).send(error);
        }
    } else return res.status(401).send(ERRORE_JWT);
});

/**
 * REST - Finisce il turno del Giocatore
 */
app.put('/game/fine-turno', (req, res) => {
    if (verificaJWT(req.body.token)) {
        try {
            partita.cambiaGiocatoreCorrente(jwt.decode(req.body.token).username, res);
        } catch (error) {
            return res.status(400).send(error);
        }
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
            if (err) {
                console.log(err);
                return res.status(500).send('Server error!');
            }
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

/**
 * REST - Login dell'ospite
 */
app.post('/login/ospiti', (req, res) => {
    try {
        if (req.body.username.trim() != "") {
            utente.cercaUtenteByUsername(req.body.username, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Server error!');
                }
                if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");
                utente.cercaOspiteByUsername(req.body.username, (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Server error!');
                    }
                    if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");

                    utente.creaOspite(req.body.username, (err, results) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).send("NON E' STATO POSSIBILE CREARE L'OSPITE!");
                        }
                        sendAccessToken(res, { username: req.body.username, tipo: "OSPITE" });
                    });
                })
            })
        } else { return res.status(400).send("L'username deve contenere dei caratteri!"); }
    } catch (error) { return res.status(400).send(error); }
})

/**
 * REST - Registrazione dell'utente
 */
app.post('/register/utente', (req, res) => {
    try {
        if (req.body.username.trim() != "") {
            utente.cercaOspiteByUsername(req.body.username, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Server error!');
                }
                if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");

                utente.cercaUtenteByUsername(req.body.username, (err, results) => {
                    try {
                        if (err) {
                            console.log(err);
                            return res.status(500).send('Server error!');
                        }
                        const users = JSON.parse(JSON.stringify(results.rows));
                        if (users.length == 0)
                            utente.creaUtente(req.body.username, req.body.nome, req.body.cognome, req.body.password, res);
                        else return res.status(400).send("L'username \'" + users[0].username + "\' è già stato usato!");
                    } catch (error) {
                        console.log(error);
                        return res.status(400).send(error);
                    }
                });
            });
        } else { return res.status(400).send("L'username deve contenere dei caratteri!"); }
    } catch (error) {
        return res.status(400).send(error);
    }
});

//TODO commentare
app.post('/lobby', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            lobby.creaLobby(jwt.decode(req.body.token).username, req.body.idGioco, req.body.pubblica, res);
        } else return res.status(401).send(ERRORE_JWT);
    } catch (error) {
        return res.status(400).send(error);
    }
})

//TODO commentare
app.post('/lobby/partecipa', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            lobby.partecipaLobby(jwt.decode(req.body.token).username, req.body.codice_lobby, res);
        } else return res.status(401).send(ERRORE_JWT);
    } catch (error) {
        return res.status(400).send(error);
    }
})

//TODO commentare
app.post('/lobby/ping', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            giocatore.ping(jwt.decode(req.body.token).username, res, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Server Error!');
                }
                return res.status(200).send({ 'esito': "1" });
            });
        } else return res.status(401).send(ERRORE_JWT);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
})

//TODO commentare
app.post('/partita', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            partita.creaPartita(jwt.decode(req.body.token).username, res);
        } else return res.status(401).send(ERRORE_JWT);
    } catch (error) {
        return res.status(400).send(error);
    }
})

app.post('/game/crea', (req, res) => {
    try {
        if (verificaAdmin(req.body.token)) {
            game.creaGioco(req.body.nome, req.body.tipo, req.body.minGiocatori, req.body.maxGiocatori, req.body.link, req.body.attivo, req.body.config, req.body.regolamento, res);
        } else return res.status(401).send(ERRORE_JWT);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
})

app.get('/*', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/www' });
});

app.listen(8081);