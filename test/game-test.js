require('dotenv').config();
var assert = require('assert');

const db = require('../backend/database');
const game = require('../backend/multiplayer/game');
const lobby = require('../backend/multiplayer/lobby');
const utente = require('../backend/utente');
const messaggi = require('../backend/messaggi');

var idGiocoTest;

describe('Game.js', function () {
    before(function () {
        const promises = [];
        promises.push(utente.creaOspite("guest-t"));
        promises.push(utente.creaOspite("guest-t2"));
        return Promise.all(promises);
    });

    after(function () {
        const promises = [];
        promises.push(utente.eliminaOspite("guest-t"));
        promises.push(utente.eliminaOspite("guest-t2"));
        return Promise.all(promises);
    });

    describe('#creaGioco()', function () {
        it('should create a game and save it to the database', function () {
            return new Promise((resolve, reject) => {
                game.creaGioco("Gioco Test", "TURNI", 1, 2, "//test", true, { game: "Gioco Test", test: "Test config" }, "Regolamento Test")
                    .then(_ => {
                        db.pool.query('SELECT * FROM public.giochi WHERE nome=$1', ["Gioco Test"], (error, results) => {
                            if (error) return reject(error);

                            idGiocoTest = results.rows[0].id;
                            const expected = {
                                id: idGiocoTest,
                                nome: "Gioco Test",
                                tipo: "TURNI",
                                min_giocatori: "1",
                                max_giocatori: "2",
                                link: "//test",
                                attivo: true,
                                config: { game: "Gioco Test", test: "Test config" },
                                regolamento: "Regolamento Test"
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

    describe('#getInfoGioco()', function () {
        it('should return the game information (id, name, type, min_players, max_players and link) saved to the database', function () {
            return new Promise((resolve, reject) => {
                game.getInfoGioco(idGiocoTest)
                    .then(results => {
                        const expected = {
                            id: idGiocoTest,
                            nome: "Gioco Test",
                            tipo: "TURNI",
                            min_giocatori: "1",
                            max_giocatori: "2",
                            link: "//test"
                        }

                        assert.strictEqual(results.rows.length, 1);
                        assert.deepStrictEqual(results.rows[0], expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#getListaGiochi()', function () {
        it('should return information of games that are "ACTIVE"', function () {
            return new Promise((resolve, reject) => {
                game.getListaGiochi()
                    .then(results => {
                        var game;
                        for (let i = 0; i < results.rows.length; i++)
                            if (results.rows[i].id == idGiocoTest)
                                game = results.rows[i];

                        assert.ok((results.rows.length >= 1));

                        const expected = {
                            id: idGiocoTest,
                            nome: "Gioco Test",
                            tipo: "TURNI",
                            min_giocatori: "1",
                            max_giocatori: "2",
                            link: "//test"
                        }
                        assert.deepStrictEqual(game, expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            });
        });
    });

    describe('#getConfigGioco()', function () {
        before(function () {
            return lobby.creaLobby("guest-t", idGiocoTest, true);
        });

        after(function () {
            return lobby.abbandonaLobby("guest-t");
        });

        it('should throw an error if the player is not part of a lobby', async function () {
            await assert.rejects(game.getConfigGioco("guest-t2"), { message: messaggi.PARTECIPAZIONE_LOBBY_ERROR });
        });

        it('should return the JSON configuration file of the game saved to the database', function () {
            return new Promise((resolve, reject) => {
                game.getConfigGioco("guest-t")
                    .then(results => {
                        const expected = {
                            config: {
                                game: "Gioco Test",
                                test: "Test config"
                            }
                        }
                        assert.deepStrictEqual(results.rows[0], expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#modificaGioco()', function () {
        it('should change the game information saved in the database', function () {
            return new Promise((resolve, reject) => {
                game.getInfoGioco(idGiocoTest)
                    .then(results => {
                        const expected = {
                            id: idGiocoTest,
                            nome: "Gioco Test",
                            tipo: "TURNI",
                            min_giocatori: "1",
                            max_giocatori: "2",
                            link: "//test"
                        }
                        assert.deepStrictEqual(results.rows[0], expected);
                        return game.modificaGioco(idGiocoTest, "Gioco Modificato", "NORMALE", 2, 4, "//new", true, { config: "new" }, "Nuovo regolamento");
                    })
                    .then(_ => { return game.getInfoGioco(idGiocoTest); })
                    .then(results => {
                        const expected = {
                            id: idGiocoTest,
                            nome: "Gioco Modificato",
                            tipo: "NORMALE",
                            min_giocatori: "2",
                            max_giocatori: "4",
                            link: "//new"
                        }
                        assert.deepStrictEqual(results.rows[0], expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#deleteGame()', function () {
        it('should delete the game from the database', function () {
            return new Promise((resolve, reject) => {
                game.deleteGame(idGiocoTest)
                    .then(_ => { return game.getInfoGioco(idGiocoTest); })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 0);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

});