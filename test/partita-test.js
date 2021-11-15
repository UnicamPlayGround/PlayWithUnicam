require('dotenv').config();
var assert = require('assert');

const lobby = require('../backend/multiplayer/lobby');
const utente = require('../backend/utente');
const game = require('../backend/multiplayer/game');
const db = require('../backend/database');
const partita = require('../backend/multiplayer/partita');

var idGiocoTest;
var codiceLobby;
var codicePartita;

describe('Partita.js', function () {
    /**
     * --------------------------------- METODI BEFORE ---------------------------------
     */

    before(function () {
        const promises = [];
        promises.push(utente.creaOspite("guest-t"));
        promises.push(utente.creaOspite("guest2-t"));
        promises.push(game.creaGioco("game_test", "NORMALE", 1, 3, "gameTest", false, {}, ""));
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
            .then(_ => { return lobby.partecipaLobby("guest2-t", codiceLobby); })
            .then(_ => { return done(); })
            .catch(error => { return done(error); });
    });

    after(function () {
        return new Promise((resolve, reject) => {
            lobby.abbandonaLobby("guest-t")
                .then(_ => { return lobby.abbandonaLobby("guest2-t") })
                .then(_ => { return resolve(); })
                .catch(error => { return reject(error); });
        })
    });

    after(function () {
        const promises = [];
        promises.push(game.deleteGame(idGiocoTest));
        promises.push(utente.eliminaOspite("guest-t"));
        promises.push(utente.eliminaOspite("guest2-t"));
        return Promise.all(promises);
    });

    /**
     * --------------------------------- METODI TEST ---------------------------------
     */
    describe('#creaPartita()', function () {
        it('should create a new match', function () {
            return new Promise((resolve, reject) => {
                partita.creaPartita("guest-t")
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
        it('should save the player info into the database', function () {
            return new Promise((resolve, reject) => {
                var newInfo = { test: "//test" }
                partita.salvaInfoGiocatore("guest-t", newInfo)
                    .then(_ => {
                        var info_salvate;
                        db.pool.query('SELECT info FROM public.giocatori WHERE username = $1', ["guest-t"], (error, results) => {
                            if (error) {
                                return rejects(error);
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
                                        username: "guest-t"
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