require('dotenv').config();
var assert = require('assert');

const db = require('../backend/database');
const game = require('../backend/multiplayer/game');
const messaggi = require('../backend/messaggi');

var idGiocoTest;

describe('Game.js', function () {
    describe('#creaGioco()', function () {
        it('should create a game and save it to the database', function () {
            return new Promise((resolve, reject) => {
                game.creaGioco("Gioco Test", "TURNI", 1, 2, "//test", true, { game: "Gioco Test" }, "Regolamento Test")
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
                                config: { game: "Gioco Test" },
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

    //TODO finire test

    describe('#deleteGame()', function () {
        it('', function () {
            // return new Promise((resolve, reject) => {
            //     //TODO finire
            //     game.deleteGame(idGiocoTest);
            // })
            return game.deleteGame(idGiocoTest);
        });
    });


});