require('dotenv').config();
var assert = require('assert');

const { it } = require('mocha');
const giocatore = require('../backend/multiplayer/giocatore');
const lobby = require('../backend/multiplayer/lobby');
const utente = require('../backend/utente');
const game = require('../backend/multiplayer/game');
const db = require('../backend/database');
const partita = require('../backend/multiplayer/partita');
const { rejects } = require('assert');
const { info } = require('console');

function eliminaGioco() {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE FROM public.giochi WHERE nome = $1;', ["game_test"], (error, results) => {
            if (error) return reject(error);
            else return resolve();
        })
    })
}

describe('Partita.js', function () {

    /**
     * --------------------------------- METODI BEFORE ---------------------------------
     */

    /**
    * Crea un ospite
    */
    before(function () {
        return utente.creaOspite("guest-t");
    });

    /**
    * Crea un ospite
    */
    before(function () {
        return utente.creaOspite("guest2-t");
    });

    /**
     * Crea un gioco
     */
    before(function () {
        return game.creaGioco("game_test", "NORMALE", 1, 3, "gameTest", false, {}, "");
    });

    var idGiocoTest;
    /**
     * Prende l'id del gioco creato
     */
    before(function (done) {
        db.pool.query('SELECT id FROM public.giochi WHERE nome = $1', ["game_test"], (error, results) => {
            if (error) {
                return done(error);
            } else {
                idGiocoTest = results.rows[0].id;
                return done();
            }
        });
    });

    /**
     * Crea una lobby
     */
    before(function () {
        return lobby.creaLobby("guest-t", idGiocoTest, false);
    });

    /**
     * Prende il codice della lobby creata
     */
    before(function (done) {
        db.pool.query('SELECT codice FROM public.lobby WHERE admin_lobby = $1', ["guest-t"], (error, results) => {
            if (error) {
                return done(error);
            } else {
                codiceLobby = results.rows[0].codice;
                return done();
            }
        });
    });

    /**
    * Aggiunge l'ospite nella lobby
    */
    before(function () {
        return lobby.partecipaLobby("guest2-t", codiceLobby);
    })

    /**
     * --------------------------------- METODI AFTER ---------------------------------
     */

    /**
     * Terminati i test elimina l'utente temporaneo.
     */
    after(function () {
        return utente.eliminaOspite("guest-t");
    });

    after(function () {
        return utente.eliminaOspite("guest2-t");
    });

    /**
     * Terminati i test elimina il gocatore temporaneo.
     */
    after(function () {
        return lobby.abbandonaLobby("guest-t")
    });
    after(function () {
        return eliminaGioco();
    });

    /**
     * --------------------------------- METODI TEST ---------------------------------
     */

    var codicePartita;
    describe('#creaPartita()', function () {
        it('should create a new match', function () {
            return new Promise((resolve, reject) => {
                partita.creaPartita("guest-t")
                    .then(_ => { return partita.cercaPartitaByCodiceLobby(codiceLobby) })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);
                        return resolve()
                    })
                    .then(_ => { return partita.getInfoPartita("guest-t"); })
                    .then(results => { codicePartita = results.codice; })
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
                        const giocatore_corrente = results.giocatore_corrente;
                        assert.strictEqual(giocatore_corrente, "guest-t")
                        return resolve();
                    })
                    .then(_ => { return partita.cambiaGiocatoreCorrente("guest-t") })
                    .then(_ => { return partita.getInfoPartita("guest-t") })
                    .then(results => {
                        const giocatore_corrente = results.rows[0].giocatore_corrente;
                        assert.strictEqual(giocatore_corrente, "guest2-t");
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
                        assert.strictEqual(results.rows.length, 1)
                        return resolve();
                    })
                    .then(_ => { return partita.terminaPartita("guest-t") })
                    .then(_ => { assert.rejects(partita.cercaPartitaByCodiceLobby(codiceLobby)); })
                    .catch(error => { return reject(error) })
            })
        })
    });
    
});