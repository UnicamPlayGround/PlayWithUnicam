require('dotenv').config();

const express = require('express');
const app = express();

const admin = require('./backend/admin');
const controller = require('./backend/controller');
const game = require('./backend/multiplayer/game');
const lobby = require('./backend/multiplayer/lobby');
const partita = require('./backend/multiplayer/partita');
const utente = require('./backend/utente');
const giocatore = require('./backend/multiplayer/giocatore');
const messaggi = require('./backend/messaggi');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const timerGiocatoriInattivi = setInterval(() => { controllaGiocatoriInattivi(); }, 5000);
const timerOspiti = setInterval(() => { controllaOspiti(); }, 3600000); //3600000 millis corrispondono ad un'ora

//Run the app by serving the static files in the dist directory
app.use(express.static(__dirname + '/www'));

app.use(express.json());

/**
 * Controlla la correttezza del JWT.
 * @param {JSON} token JSON Web Token da controllare
 */
function verificaJWT(token) {
    try {
        if (token == null || token == '' || token == undefined) return false;
        jwt.verify(token, process.env.SECRET_KEY_JWT);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Controlla che il JWT corrisponda ad un Admin.
 * @param {JSON} token JWT da controllare
 */
function verificaAdmin(token) {
    if (verificaJWT) {
        tipo = (jwt.decode(token)).tipo;
        return (tipo == "ADMIN");
    } else return false;
}

/**
 * Controlla che il JWT corrisponda ad un Ospite.
 * @param {JSON} token JWT da controllare
 */
function verificaOspite(token) {
    if (verificaJWT) {
        tipo = (jwt.decode(token)).tipo;
        return (tipo == "OSPITE");
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

    const accessToken = jwt.sign(toSend, process.env.SECRET_KEY_JWT, { algorithm: 'HS256', expiresIn: expiresIn });
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

/**
 * Controlla se sono presenti Giocatori che risultani inattivi,
 * in caso positivo vengono eliminati dalla Tabella *"giocatori"*.
 */
function controllaGiocatoriInattivi() {
    giocatore.controllaInattivi();
}

/**
 * Controlla se sono presenti Ospiti registrati da più di 24 ore,
 * in caso positivo vengono eliminati dalla Tabella *"ospiti"*.
 */
function controllaOspiti() {
    utente.eliminaOspiti();
}

/**
 * REST ------------------------- GET -------------------------
 */

/**
 * REST - Ritorna la lista dei Giochi
 */
app.get('/games', (req, res) => {
    const token = req.headers.token;

    if (verificaJWT(token)) {
        game.getListaGiochi((err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send(messaggi.SERVER_ERROR);
            }
            sendDataInJSON(res, results);
        });
    } else return res.status(401).send(messaggi.ERRORE_JWT);
})

/**
 * REST - Ritorna all'Admin della Piattaforma la lista dei Giochi
 */
app.get('/games/admin', (req, res) => {
    const token = req.headers.token;

    if (verificaAdmin(token)) {
        game.getListaGiochiAsAdmin((err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send(messaggi.SERVER_ERROR);
            }
            sendDataInJSON(res, results);
        });
    } else return res.status(401).send(messaggi.ERRORE_JWT);
})

/**
 * REST - Ritorna le Informazioni della Partita
 */
app.get('/game/status', (req, res) => {
    const token = req.headers.token;
    if (verificaJWT(token)) {
        partita.getInfoPartita(jwt.decode(token).username, (err, data) => {
            if (err) {
                if (err == messaggi.MINIMO_GIOCATORI_ERROR)
                    return res.status(403).send(messaggi.MINIMO_GIOCATORI_ERROR);

                console.log(err);
                return res.status(500).send(messaggi.SERVER_ERROR);
            }
            // sendDataInJSON(res, results);

            const toReturn = { 'results': data };
            res.status(200).send(toReturn);
        });
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Ritorna il JSON di Configurazione del Gioco
 */
app.get('/game/config', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        game.getConfigGioco(jwt.decode(req.headers.token).username, res, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send(messaggi.SERVER_ERROR);
            }
            sendDataInJSON(res, results);
        })
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Ritorna all'Admin la lista degli Utenti
 */
app.get('/admin/utenti', (req, res) => {
    if (verificaAdmin(req.headers.token)) {
        admin.getUtenti(jwt.decode(req.headers.token).username, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send(messaggi.SERVER_ERROR);
            }
            sendDataInJSON(res, results);
        });
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Ritorna la lista delle Lobby Pubbliche
 */
app.get('/lobby/pubbliche', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        lobby.getLobbyPubbliche(jwt.decode(req.headers.token).username, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send(messaggi.SERVER_ERROR);
            }

            const lobbies = JSON.parse(JSON.stringify(results.rows));
            formatDataLobby(lobbies);
            const toReturn = { 'results': lobbies };

            res.status(200).send(toReturn);
        })
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Ritorna il numero dei Giocatori all'interno di una Lobby
 */
app.get('/lobby/giocatori/:codiceLobby', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        lobby.getNumeroGiocatoriLobby(req.params.codiceLobby, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send(messaggi.SERVER_ERROR);
            }
            sendDataInJSON(res, results);
        })
    } else return res.status(401).send(messaggi.ERRORE_JWT);
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
                return res.status(500).send(messaggi.SERVER_ERROR);
            }
            sendDataInJSON(res, results);
        })
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Ritorna le informazioni di una Lobby
 */
app.get('/lobby/info', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        lobby.cercaLobbyByUsername(jwt.decode(req.headers.token).username, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send(messaggi.SERVER_ERROR);
            }
            if (controller.controllaRisultatoQuery(results))
                return res.status(400).send(messaggi.PARTECIPAZIONE_LOBBY_ERROR);

            sendDataInJSON(res, results);
        })
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Ritorna le Informazioni dei Giocatori all'interno di una Lobby
 */
app.get('/lobby/giocatori', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        lobby.getGiocatoriLobby(jwt.decode(req.headers.token).username, res, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send(messaggi.SERVER_ERROR);
            }
            sendDataInJSON(res, results);
        })
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST ------------------------- DELETE -------------------------
 */

/**
 * REST - Come Admin della Lobby, espelle un Giocatore dalla Lobby
 */
app.delete('/lobby/admin/espelli', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        try {
            lobby.eliminaPartecipante(jwt.decode(req.headers.token).username, req.headers.username, res);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Abbandona la Lobby
 */
app.delete('/lobby/abbandona', (req, res) => {
    if (verificaJWT(req.headers.token)) {
        try {
            lobby.abbandonaLobby(jwt.decode(req.headers.token).username, res, (error, errorText) => {
                if (error) {
                    console.log(error);
                    return res.status(400).send(error);
                }
                return res.status(200).send({ 'esito': "1" });
            });
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Come Admin della Piattaforma, elimina un gruppo di Utenti
 */
app.delete('/admin/utenti', (req, res) => {
    if (verificaAdmin(req.headers.token)) {
        try {
            admin.eliminaUtenti(req.headers.users_to_delete, res);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST ------------------------- PUT -------------------------
 */

/**
 * REST - Modifica i dati dell'Utente come Admin
 */
app.put('/admin/utenti/:username', (req, res) => {
    if (verificaAdmin(req.body.token)) {
        try {
            admin.modificaUtente(req.params.username, req.body.new_username, req.body.new_nome, req.body.new_cognome, res);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Modifica nome e cognome di un Utente
 */
app.put('/player/profilo', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            utente.modificaNomeCognome(jwt.decode(req.body.token).username, req.body.nome, req.body.cognome, res);
        } else return res.status(401).send(messaggi.ERRORE_JWT);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

/**
 * REST - Modifica username di un Utente
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
        } else return res.status(401).send(messaggi.ERRORE_JWT);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

/**
 * REST - Modifica i dati della Lobby
 */
app.put('/lobby', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            lobby.modificaLobby(jwt.decode(req.body.token).username, req.body.pubblica, res);
        } else return res.status(401).send(messaggi.ERRORE_JWT);
    } catch (error) {
        console.log(error);
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
            console.log(error);
            return res.status(400).send(error);
        }
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Modifica le Informazioni di una Gioco 
 */
app.put('/game/modifica', (req, res) => {
    if (verificaAdmin(req.body.token)) {
        try {
            game.modificaGioco(req.body.id, req.body.nome, req.body.tipo, req.body.minGiocatori,
                req.body.maxGiocatori, req.body.link, req.body.attivo, req.body.config, req.body.regolamento, res);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Modifica le Informazioni di una Partita 
 */
app.put('/game/save', (req, res) => {
    if (verificaJWT(req.body.token)) {
        try {
            partita.salvaInfoGiocatore(jwt.decode(req.body.token).username, req.body.info_giocatore, res);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Finisce il turno del Giocatore
 */
app.put('/game/fine-turno', (req, res) => {
    if (verificaJWT(req.body.token)) {
        try {
            partita.cambiaGiocatoreCorrente(jwt.decode(req.body.token).username, res);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST - Termina la Partita
 */
app.put('/partita/termina', (req, res) => {
    if (verificaJWT(req.body.token)) {
        try {
            partita.terminaPartita(jwt.decode(req.body.token).username, res);
        } catch (error) {
            console.log(error);
            return res.status(400).send(error);
        }
    } else return res.status(401).send(messaggi.ERRORE_JWT);
});

/**
 * REST ------------------------- POST -------------------------
 */

/**
 * REST - Login dell'Utente
 */
app.post('/login/utente', (req, res) => {
    try {
        utente.cercaUtenteByUsername(req.body.username, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send(messaggi.SERVER_ERROR);
            }
            if (controller.controllaRisultatoQuery(results)) return res.status(404).send(messaggi.UTENTE_NON_TROVATO_ERROR);

            const user = JSON.parse(JSON.stringify(results.rows));

            const toControl = bcrypt.hashSync(req.body.password + process.env.SECRET_PWD, user[0].salt);
            if (!(user[0].password == toControl)) return res.status(401).send('Password non valida!');

            sendAccessToken(res, { username: user[0].username, tipo: user[0].tipo });
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

/**
 * REST - Login dell'Ospite
 */
app.post('/login/ospiti', (req, res) => {
    try {
        if (req.body.username.trim() != "") {
            utente.cercaUtenteByUsername(req.body.username, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send(messaggi.SERVER_ERROR);
                }
                if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");
                utente.cercaOspiteByUsername(req.body.username, (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(messaggi.SERVER_ERROR);
                    }
                    if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");

                    utente.creaOspite(req.body.username, (err, results) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).send("Non è stato possibile creare l'ospite!");
                        }
                        sendAccessToken(res, { username: req.body.username, tipo: "OSPITE" });
                    });
                })
            })
        } else { return res.status(400).send("L'username deve contenere dei caratteri!"); }
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
})

/**
 * REST - Registrazione dell'Utente
 */
app.post('/register/utente', (req, res) => {
    try {
        if (req.body.username.trim() != "") {
            utente.cercaOspiteByUsername(req.body.username, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send(messaggi.SERVER_ERROR);
                }
                if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");

                utente.cercaUtenteByUsername(req.body.username, (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(messaggi.SERVER_ERROR);
                    }
                    if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");

                    utente.creaUtente(req.body.username, req.body.nome, req.body.cognome, req.body.password, res);
                });
            });
        } else { return res.status(400).send("L'username deve contenere dei caratteri!"); }
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

/**
 * REST - Registrazione dell'Utente
 * //TODO
 */
app.post('/register/ospite-to-utente', (req, res) => {
    try {
        if (verificaOspite(req.body.token)) {
            utente.eliminaOspite(jwt.decode(req.body.token).username, (error, results) => {
                if (error) {
                    console.log(error);
                    return res.status(400).send(error);
                }

                utente.cercaOspiteByUsername(req.body.username, (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(messaggi.SERVER_ERROR);
                    }
                    if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");

                    utente.cercaUtenteByUsername(req.body.username, (err, results) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(messaggi.SERVER_ERROR);
                        }
                        if (!controller.controllaRisultatoQuery(results)) return res.status(404).send("L'username " + req.body.username + " è già in uso!");

                        utente.creaUtente(req.body.username, req.body.nome, req.body.cognome, req.body.password, res);
                    });
                });
            })
        } else return res.status(401).send(messaggi.ERRORE_JWT);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

/**
 * REST - Crea una Lobby
 */
app.post('/lobby', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            lobby.creaLobby(jwt.decode(req.body.token).username, req.body.idGioco, req.body.pubblica, res);
        } else return res.status(401).send(messaggi.ERRORE_JWT);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

/**
 * REST - Partecipazione ad una Lobby
 */
app.post('/lobby/partecipa', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            lobby.partecipaLobby(jwt.decode(req.body.token).username, req.body.codice_lobby, res);
        } else return res.status(401).send(messaggi.ERRORE_JWT);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

/**
 * REST - Effettua l'operazione di Ping
 */
app.post('/lobby/ping', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            giocatore.ping(jwt.decode(req.body.token).username, res, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send(messaggi.SERVER_ERROR);
                }
                return res.status(200).send({ 'esito': "1" });
            });
        } else return res.status(401).send(messaggi.ERRORE_JWT);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

/**
 * REST - Crea una Partita
 */
app.post('/partita', (req, res) => {
    try {
        if (verificaJWT(req.body.token)) {
            partita.creaPartita(jwt.decode(req.body.token).username, res);
        } else return res.status(401).send(messaggi.ERRORE_JWT);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

/**
 * REST - Crea un Gioco
 */
app.post('/game/crea', (req, res) => {
    try {
        if (verificaAdmin(req.body.token)) {
            game.creaGioco(req.body.nome, req.body.tipo, req.body.minGiocatori, req.body.maxGiocatori, req.body.link, req.body.attivo, req.body.config, req.body.regolamento, res);
        } else return res.status(401).send(messaggi.ERRORE_JWT);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

app.get('/*', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/www' });
});

app.listen(8081);