require('dotenv').config();
var assert = require('assert');

const giocatore = require('../backend/multiplayer/giocatore');
const lobby = require('../backend/multiplayer/lobby');
const utente = require('../backend/utente');
const game = require('../backend/multiplayer/game');
const db = require('../backend/database');
const partita = require('../backend/multiplayer/partita');

var codiceLobby, idGiocoTest;

describe('Giocatore.js', function () {
    /**
     * --------------------------------- METODI BEFORE ---------------------------------
     */

    before(function () {
        const promises = [];
        promises.push(utente.creaOspite("guest_test"));
        promises.push(utente.creaOspite("guest2-t"));
        promises.push(utente.creaOspite("guest3-t"));
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
        lobby.creaLobby("guest_test", idGiocoTest, false)
            .then(_ => { return lobby.cercaLobbyByAdmin("guest_test"); })
            .then(results => { codiceLobby = results.rows[0].codice; })
            .then(_ => { return lobby.partecipaLobby("guest2-t", codiceLobby); })
            .then(_ => { return lobby.partecipaLobby("guest3-t", codiceLobby); })
            .then(_ => { return partita.creaPartita("guest_test"); })
            .then(_ => { return done(); })
            .catch(error => { return done(error); });
    });

    after(function () {
        return new Promise((resolve, reject) => {
            lobby.abbandonaLobby("guest_test")
                .then(_ => { return lobby.abbandonaLobby("guest2-t") })
                .then(_ => { return lobby.abbandonaLobby("guest3-t") })
                .then(_ => { return resolve(); })
                .catch(error => { return reject(error); });
        })
    });

    after(function () {
        const promises = [];
        promises.push(game.deleteGame(idGiocoTest));
        promises.push(utente.eliminaOspite("guest_test"));
        promises.push(utente.eliminaOspite("guest2-t"));
        promises.push(utente.eliminaOspite("guest3-t"));
        return Promise.all(promises);
    });

    /**
     * --------------------------------- METODI TEST ---------------------------------
     */

    describe('#creaGiocatore()', function () {
        it('should create a player and save it to the database', function () {
            return new Promise((resolve, reject) => {
                giocatore.creaGiocatore("guest_test", codiceLobby)
                    .then(_ => {
                        db.pool.query('SELECT * FROM public.giocatori WHERE username=$1', ["guest_test"], (error, results) => {

                            if (error) throw new Error(error);

                            dataIngresso = results.rows[0].data_ingresso;
                            const expected = {
                                username: "guest_test",
                                codice_lobby: codiceLobby,
                                ruolo: null,
                                ping: null,
                                data_ingresso: dataIngresso,
                                info: null
                            }
                            assert.strictEqual(results.rows.length, 1);
                            assert.deepStrictEqual(results.rows[0], expected);
                            return resolve();
                        });
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#cercaGiocatore()', function () {
        it('should return the player username saved into the database', function () {
            return new Promise((resolve, reject) => {
                giocatore.cercaGiocatore("guest_test")
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);
                        assert.strictEqual(results.rows[0].username, "guest_test")
                        return resolve();
                    })
                    .catch(error => { return reject(error) })
            })
        });
    });

    //TODO: controlla se scritta bene
    describe('#ping', function () {
        it('should do the ping operation about the player', function () {
            return new Promise((resolve, reject) => {
                db.pool.query('SELECT ping FROM public.giocatori WHERE username=$1', ["guest_test"], (error, results) => {
                    if (error) return reject(error);

                    ping = results.rows[0];
                    const expected = { ping: null }
                    assert.strictEqual(results.rows.length, 1);
                    assert.deepStrictEqual(results.rows[0], expected);

                    giocatore.ping("guest_test")
                        .then(_ => {
                            assert.notDeepStrictEqual(null, ping)
                            return resolve();
                        })
                        .catch(error => { return reject(error) });

                })
                //TODO: manca return reject/throw error?????
            })
        })
    });


    //TODO: non ho inserito niente dentro il campo info?
    describe('#getInfoGiocatori', function () {
        it('should return info field of each player', function () {
            return new Promise((resolve, reject) => {
                giocatore.getInfoGiocatori(codiceLobby)
                    .then(results => {
                        const info = results.rows[0];
                        const expected = { info: null };
                        assert.strictEqual(results.rows.length, 3);
                        assert.deepStrictEqual(info, expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error) })
            })
        })
    });

    describe('#eliminaGiocatore', function () {
        it('should delete a player using his username', function () {
            return new Promise((resolve, reject) => {
                giocatore.cercaGiocatore("guest2-t")
                    .then(results => { assert.strictEqual(results.rows.length, 1); })
                    .then(_ => { return giocatore.eliminaGiocatore("guest2-t"); })
                    .then(_ => { return giocatore.cercaGiocatore("guest2-t"); })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 0);
                        return resolve();
                    })
                    .catch(error => { return reject(error); })
            })
        })
    });

    describe('#espelliGiocatore', function () {
        it('should delete the player selected by the admin', function () {
            return new Promise((resolve, reject) => {
                giocatore.cercaGiocatore("guest3-t")
                    .then(results => { assert.strictEqual(results.rows.length, 1); })
                    .then(_ => { return giocatore.espelliGiocatore("guest3-t", codiceLobby); })
                    .then(_ => { return giocatore.cercaGiocatore("guest3-t"); })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 0);
                        return resolve();
                    })
                    .catch(error => { return reject(error); })
            })
        })
    });


})
