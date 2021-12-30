require('dotenv').config();
var assert = require('assert');

const lobby = require('../backend/multiplayer/lobby');
const utente = require('../backend/utente');
const game = require('../backend/multiplayer/game');
const db = require('../backend/database');
const partita = require('../backend/multiplayer/partita');
const messaggi = require('../backend/messaggi');

var idGiocoTest;
var codiceLobby;
var codiceLobby2;
var codicePartita;

describe('Partita.js', function () {
    /**
     * --------------------------------- METODI BEFORE ---------------------------------
     */

    before(function () {
        const promises = [];
        promises.push(utente.creaOspite("guest-t"));
        promises.push(utente.creaOspite("guest2-t"));
        promises.push(utente.creaOspite("guest4-t"));
        promises.push(utente.creaOspite("guest5-t"));
        promises.push(game.creaGioco("game_test", "TURNI", 2, 2, "gameTest", false, {}, ""));
        return Promise.all(promises);
    });

    /**
     * Prende l'id del gioco creato
     */
    before(function (done) {
        db.pool.query('SELECT id FROM public.giochi WHERE nome = $1', ["game_test"], (error, results) => {
            if (error)
                return done(error);
            else {
                idGiocoTest = results.rows[0].id;
                return done();
            }
        });
    });

    before(function (done) {
        lobby.creaLobby("guest-t", idGiocoTest, false)
            .then(_ => { return lobby.cercaLobbyByAdmin("guest-t"); })
            .then(results => { codiceLobby = results.rows[0].codice; })
            .then(_ => { return done(); })
            .catch(error => { return done(error); });
    });

    before(function (done) {
        lobby.creaLobby("guest4-t", idGiocoTest, false)
            .then(_ => { return lobby.cercaLobbyByAdmin("guest4-t"); })
            .then(results => { codiceLobby2 = results.rows[0].codice; })
            .then(_ => { return done(); })
            .catch(error => { return done(error); });
    });

    after(function () {
        return new Promise((resolve, reject) => {
            lobby.abbandonaLobby("guest-t")
                .then(_ => { return lobby.abbandonaLobby("guest2-t") })
                .then(_ => { return lobby.abbandonaLobby("guest4-t") })
                .then(_ => { return resolve(); })
                .catch(error => { return reject(error); });
        })
    });

    after(function () {
        const promises = [];
        promises.push(game.deleteGame(idGiocoTest));
        promises.push(utente.eliminaOspite("guest-t"));
        promises.push(utente.eliminaOspite("guest2-t"));
        promises.push(utente.eliminaOspite("guest4-t"));
        promises.push(utente.eliminaOspite("guest5-t"));
        return Promise.all(promises);
    });

    /**
     * --------------------------------- METODI TEST ---------------------------------
     */
    describe('#creaPartita()', function () {
        it('should throw an error because the user who was creating the match doesn\'t corresponding with the admin of the lobby', async function () {
            await assert.rejects(partita.creaPartita("guest2-t"), { message: "Devi essere l'admin della lobby per creare una partita!" });
        });
        it('should throw an error because there are not enough players', async function () {
            await assert.rejects(partita.creaPartita("guest-t"), { message: "Non ci sono abbastanza giocatori per iniziare!" });
        });
        it('should create a new match', function () {
            return new Promise((resolve, reject) => {
                lobby.partecipaLobby("guest2-t", codiceLobby)
                    .then(_ => { return partita.creaPartita("guest-t") })
                    .then(_ => { return partita.cercaPartitaByCodiceLobby(codiceLobby) })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);
                        return partita.getInfoPartita("guest-t");
                    })
                    .then(results => {
                        codicePartita = results.codice;
                        return resolve();
                    })
                    .catch(error => { return reject(error) })
            })
        })
    });

    describe('#cercaPartitaByCodiceLobby()', function () {
        it('should return the informations of a match', function () {
            return new Promise((resolve, reject) => {
                partita.cercaPartitaByCodiceLobby(codiceLobby)
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);
                        return resolve();
                    })
                    .catch(error => { return reject(error) })
            })
        })
    });

    describe('#cambiaGiocatoreCorrente()', function () {
        it('should throw an error because the username not corresponding to the current player', async function () {
            await assert.rejects(partita.cambiaGiocatoreCorrente("guest2-t"), { message: 'Devi aspettare il tuo turno!' });
        });
        it('should change the current player of the match', function () {
            return new Promise((resolve, reject) => {
                partita.getInfoPartita("guest-t")
                    .then(results => {
                        assert.strictEqual(results.giocatore_corrente, "guest-t");
                        return partita.cambiaGiocatoreCorrente("guest-t");
                    })
                    .then(_ => { return partita.getInfoPartita("guest-t"); })
                    .then(results => {
                        assert.strictEqual(results.giocatore_corrente, "guest2-t");
                        return resolve();
                    })
                    .catch(error => { return reject(error) })
            })
        })
    });

    describe('#salvaInfoGiocatore()', function () {
        it('should throw an error because the player who wants save informations doesn\'t correspond to the current player', async function () {
            await assert.rejects(partita.salvaInfoGiocatore("guest-t"), { message: 'Devi aspettare il tuo turno!' });
        });
        it('should save the player info into the database', function () {
            return new Promise((resolve, reject) => {
                var newInfo = { test: "//test" }
                partita.salvaInfoGiocatore("guest2-t", newInfo)
                    .then(_ => {
                        var info_salvate;
                        db.pool.query('SELECT info FROM public.giocatori WHERE username = $1', ["guest2-t"], (error, results) => {
                            if (error) {
                                return reject(error);
                            } else {
                                info_salvate = results.rows[0].info;
                                assert.deepStrictEqual(info_salvate.info_giocatore, newInfo);
                                return resolve();
                            }
                        });
                    })
                    .catch(error => { return reject(error) })
            })
        })
    });


    describe('#getInfoPartita()', function () {
        it('should return an error because the username is empty', async function () {
            await assert.rejects(partita.getInfoPartita(""), { message: messaggi.PARTECIPAZIONE_LOBBY_ERROR });
        });
        it('should throw an error because there are not enough players', async function () {
            return new Promise((resolve, reject) => {
                lobby.partecipaLobby("guest5-t", codiceLobby2)
                    .then(_ => { return partita.creaPartita("guest4-t") })
                    .then(_ => { return lobby.abbandonaLobby("guest5-t") })
                    .then(_ => { return partita.getInfoPartita("guest4-t") })
                    .then(_ => { return reject(); })
                    .catch(error => { assert.strictEqual(error.message, messaggi.MINIMO_GIOCATORI_ERROR); return resolve(); })
            })
        });
        it('should return all the info of each player of the match ', function () {
            return new Promise((resolve, reject) => {
                partita.getInfoPartita("guest-t")
                    .then(results => {
                        const expected = {
                            codice: codicePartita,
                            codice_lobby: codiceLobby,
                            giocatore_corrente: "guest2-t",
                            id_gioco: idGiocoTest,
                            info: {
                                giocatori: [
                                    {
                                        info_giocatore: { test: "//test" },
                                        username: "guest2-t"
                                    }
                                ]
                            },
                            terminata: false
                        }
                        assert.deepStrictEqual(results, expected)
                        return resolve();
                    })
                    .catch(error => { return reject(error) })
            })
        })
    });

    describe('#terminaPartita()', function () {
        it('should ends the match ', function () {
            return new Promise((resolve, reject) => {
                partita.cercaPartitaByCodiceLobby(codiceLobby)
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);
                        return partita.terminaPartita("guest-t");
                    })
                    .then(_ => {
                        assert.rejects(partita.cercaPartitaByCodiceLobby(codiceLobby));
                        return resolve();
                    })
                    .catch(error => { return reject(error) })
            })
        })
    });

});