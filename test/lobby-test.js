require('dotenv').config();
var assert = require('assert');

const db = require('../backend/database');
const lobby = require('../backend/multiplayer/lobby');
const utente = require('../backend/utente');
const game = require('../backend/multiplayer/game');
const messaggi = require('../backend/messaggi');

var idGiocoTurni, codiceLobby, idGiocoMax;

describe('Lobby.js', function () {
    before(function () {
        const promises = [];
        promises.push(utente.creaOspite("guest-t"));
        promises.push(utente.creaOspite("guest-t2"));
        promises.push(utente.creaOspite("guest-t3"));
        promises.push(utente.creaOspite("guest-t4"));
        promises.push(utente.creaOspite("guest-t5"));
        promises.push(utente.creaOspite("guest-t6"));
        promises.push(game.creaGioco("Gioco Test Turni", "TURNI", 1, 4, "link", true, {}, "regolamento"));
        promises.push(game.creaGioco("Gioco Test MAX", "TURNI", 1, 1, "link", true, {}, "regolamento"));
        return Promise.all(promises);
    });

    before(function (done) {
        db.pool.query('SELECT * FROM public.giochi WHERE nome=$1', ["Gioco Test Turni"], (error, results) => {
            if (error) return done(error);
            idGiocoTurni = results.rows[0].id;
            return done();
        });
    });

    before(function (done) {
        db.pool.query('SELECT * FROM public.giochi WHERE nome=$1', ["Gioco Test MAX"], (error, results) => {
            if (error) return done(error);
            idGiocoMax = results.rows[0].id;
            return done();
        });
    });

    before(function () {
        return lobby.creaLobby("guest-t3", idGiocoTurni, false);
    });

    after(function () {
        return lobby.abbandonaLobby("guest-t3");
    });

    after(function () {
        const promises = [];
        promises.push(utente.eliminaOspite("guest-t"));
        promises.push(utente.eliminaOspite("guest-t2"));
        promises.push(utente.eliminaOspite("guest-t3"));
        promises.push(utente.eliminaOspite("guest-t4"));
        promises.push(utente.eliminaOspite("guest-t5"));
        promises.push(utente.eliminaOspite("guest-t6"));
        promises.push(game.deleteGame(idGiocoTurni));
        return Promise.all(promises);
    });

    describe('#creaLobby()', function () {
        it('should throw an error because the username of the admin lobby has an invalid value', async function () {
            await assert.rejects(lobby.creaLobby("", idGiocoTurni, true), { message: messaggi.USERNAME_VUOTO_ERROR });
            await assert.rejects(lobby.creaLobby("user-tLobb", idGiocoTurni, true), { message: "L'Utente 'user-tLobb' non esiste!" });
        });

        it('should throw an error because the game does not exist in the database', async function () {
            await assert.rejects(lobby.creaLobby("guest-t", 10000, true), { message: messaggi.GIOCO_NON_TROVATO_ERROR });
        });

        it('should create a lobby and save it to the database', function () {
            return new Promise((resolve, reject) => {
                lobby.creaLobby("guest-t", idGiocoTurni, true)
                    .then(_ => {
                        db.pool.query('SELECT * FROM public.lobby WHERE admin_lobby=$1', ["guest-t"], (error, results) => {
                            if (error) throw new Error(error);

                            codiceLobby = results.rows[0].codice;
                            const expected = {
                                codice: codiceLobby,
                                pubblica: true,
                                admin_lobby: "guest-t",
                                data_creazione: results.rows[0].data_creazione,
                                id_gioco: idGiocoTurni,
                                partita_iniziata: false,
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

    describe('#cercaLobbyByAdmin()', function () {
        it('should throw an error because the username of the admin lobby has an invalid value', async function () {
            await assert.rejects(lobby.cercaLobbyByAdmin(""), { message: messaggi.USERNAME_VUOTO_ERROR });
            await assert.rejects(lobby.cercaLobbyByAdmin("user-tLobb"), { message: "L'Utente 'user-tLobb' non esiste!" });
        });

        it('should return the lobby information (codice, creation_date, admin_lobby, id_game, min_players, max_players and public) saved to the database', function () {
            return new Promise((resolve, reject) => {
                lobby.cercaLobbyByAdmin("guest-t")
                    .then(results => {
                        const expected = {
                            codice: codiceLobby,
                            data_creazione: results.rows[0].data_creazione,
                            admin_lobby: 'guest-t',
                            id_gioco: idGiocoTurni,
                            min_giocatori: '1',
                            max_giocatori: '4',
                            pubblica: true
                        }

                        assert.strictEqual(results.rows.length, 1);
                        assert.deepStrictEqual(results.rows[0], expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#cercaLobbyByCodice()', function () {
        it('should return the lobby information (codice, creation_date, admin_lobby, min_players, max_players and public) saved to the database', function () {
            return new Promise((resolve, reject) => {
                lobby.cercaLobbyByCodice(codiceLobby)
                    .then(results => {
                        const expected = {
                            codice: codiceLobby,
                            data_creazione: results.rows[0].data_creazione,
                            admin_lobby: 'guest-t',
                            min_giocatori: '1',
                            max_giocatori: '4',
                            pubblica: true
                        }

                        assert.strictEqual(results.rows.length, 1);
                        assert.deepStrictEqual(results.rows[0], expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#getNumeroGiocatoriLobby()', function () {
        it('should return the number of players in a lobby', function () {
            return new Promise((resolve, reject) => {
                lobby.getNumeroGiocatoriLobby(codiceLobby)
                    .then(results => {
                        assert.strictEqual(Number(results.rows[0].count), 1);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#getLobbyPubbliche()', function () {
        it('should return all public lobbies except the one in which the username passed is admin', function () {
            return new Promise((resolve, reject) => {
                lobby.getLobbyPubbliche("guest-t3")
                    .then(results => {
                        for (let i = 0; i < results.rows.length; i++)
                            assert.notStrictEqual(results.rows[i].admin_lobby, "guest-t3")
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });

        it('should return all public lobbies', function () {
            return new Promise((resolve, reject) => {
                lobby.getLobbyPubbliche("guest-t2")
                    .then(results => {
                        var toControl;
                        for (let i = 0; i < results.rows.length; i++) {
                            assert.notStrictEqual(results.rows[i].admin_lobby, "guest-t3")
                            if (results.rows[i].admin_lobby == "guest-t")
                                toControl = results.rows[i];
                        }

                        const expected = {
                            admin_lobby: "guest-t",
                            codice: codiceLobby,
                            id_gioco: idGiocoTurni,
                            min_giocatori: "1",
                            max_giocatori: "4",
                            data_creazione: toControl.data_creazione,
                            nome: "Gioco Test Turni"
                        }
                        assert.deepStrictEqual(toControl, expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#partecipaLobby()', function () {
        it('should throw an error because the lobby id does not exist in the database', async function () {
            await assert.rejects(lobby.partecipaLobby("guest-t2", 000001), { message: "Non è stata trovata alcuna lobby corrispondente al codice inserito!" });
        });

        it('should throw an error if the lobby is already full', function () {
            return new Promise((resolve, reject) => {
                lobby.creaLobby("guest-t5", idGiocoMax, true)
                    .then(_ => { return lobby.cercaLobbyByAdmin("guest-t5") })
                    .then(results => { return lobby.partecipaLobby("guest-t6", results.rows[0].codice); })
                    .then(_ => { return reject(); })
                    .catch(error => {
                        assert.strictEqual(error.message, 'La lobby selezionata è già al completo!');
                        return resolve();
                    })
            })
        });

        it('should allow a player to join a lobby', function () {
            return new Promise((resolve, reject) => {
                lobby.partecipaLobby("guest-t2", codiceLobby)
                    .then(_ => { return lobby.getNumeroGiocatoriLobby(codiceLobby); })
                    .then(results => {
                        assert.strictEqual(Number(results.rows[0].count), 2);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });

        it('should allow a player to join a lobby and guarantee that, if he was the admin of another lobby, either the admin role is given to another participant or the lobby is deleted if it has no participants', function () {
            return new Promise((resolve, reject) => {
                lobby.cercaLobbyByAdmin("guest-t3")
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);
                        return lobby.partecipaLobby("guest-t3", codiceLobby);
                    })
                    .then(_ => { return lobby.cercaLobbyByAdmin("guest-t3"); })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 0);
                        return lobby.abbandonaLobby("guest-t3");
                    })
                    .then(_ => { return resolve(); })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#getGiocatoriLobby()', function () {
        it('should throw an error if the player is not part of a lobby', async function () {
            await assert.rejects(lobby.getGiocatoriLobby("guest-t4"), { message: messaggi.PARTECIPAZIONE_LOBBY_ERROR });
        });

        it('should return the information of the players of a lobby', function () {
            return new Promise((resolve, reject) => {
                lobby.getGiocatoriLobby("guest-t2")
                    .then(results => {
                        assert.strictEqual(results.rows.length, 2);

                        const expected1 = {
                            username: "guest-t",
                            codice_lobby: codiceLobby,
                            ruolo: null,
                            ping: null,
                            data_ingresso: results.rows[0].data_ingresso,
                            info: null
                        }
                        assert.deepStrictEqual(results.rows[0], expected1);

                        const expected2 = {
                            username: "guest-t2",
                            codice_lobby: codiceLobby,
                            ruolo: null,
                            ping: null,
                            data_ingresso: results.rows[1].data_ingresso,
                            info: null
                        }
                        assert.deepStrictEqual(results.rows[1], expected2);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#modificaLobby()', function () {
        it('should throw an error because only the lobby admin can change the value', async function () {
            await assert.rejects(lobby.modificaLobby("guest-t2", { message: "Solo l'admin può modificare la lobby" }));
        });

        it('should change a lobby from private to public or vice versa', function () {
            return new Promise((resolve, reject) => {
                lobby.modificaLobby("guest-t", false)
                    .then(_ => { return lobby.cercaLobbyByAdmin("guest-t"); })
                    .then(results => {
                        assert.strictEqual(results.rows[0].pubblica, false);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#impostaAdminLobby()', function () {
        it('should throw an error because the username of the new admin does not exist in the database', async function () {
            await assert.rejects(lobby.impostaAdminLobby("guest-t500", codiceLobby), { message: "Il giocatore 'guest-t500' non esiste!" })
        });
    });

    describe('#eliminaPartecipante()', function () {
        it('should throw an error because only the admin can expel a player from a lobby', async function () {
            await assert.rejects(lobby.eliminaPartecipante("guest-t2", "guest-t4"), { message: "Solo l'admin può eliminare i partecipanti della lobby" });
        });

        it('should expel a player from a lobby', function () {
            return new Promise((resolve, reject) => {
                lobby.partecipaLobby("guest-t4", codiceLobby)
                    .then(_ => { return lobby.getNumeroGiocatoriLobby(codiceLobby); })
                    .then(results => {
                        assert.strictEqual(Number(results.rows[0].count), 3);
                        return lobby.eliminaPartecipante("guest-t", "guest-t4");
                    })
                    .then(_ => { return lobby.getNumeroGiocatoriLobby(codiceLobby); })
                    .then(results => {
                        assert.strictEqual(Number(results.rows[0].count), 2);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });
    });

    describe('#abbandonaLobby()', function () {
        it('should allow a player to leave a lobby and change the admin (in case there are more players and who wants to leave is the admin of the lobby)', function () {
            return new Promise((resolve, reject) => {
                lobby.abbandonaLobby("guest-t")
                    .then(_ => { return lobby.getNumeroGiocatoriLobby(codiceLobby) })
                    .then(results => {
                        assert.strictEqual(Number(results.rows[0].count), 1);
                        return lobby.cercaLobbyByAdmin("guest-t");
                    })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 0);
                        return lobby.cercaLobbyByCodice(codiceLobby);
                    })
                    .then(results => {
                        const expected = {
                            codice: codiceLobby,
                            pubblica: false,
                            admin_lobby: "guest-t2",
                            data_creazione: results.rows[0].data_creazione,
                            min_giocatori: "1",
                            max_giocatori: "4",
                        }

                        assert.strictEqual(results.rows.length, 1);
                        assert.deepStrictEqual(results.rows[0], expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        });

        it('should allow a player to leave a lobby and if there are no more players then delete the lobby from the database', function () {
            return new Promise((resolve, reject) => {
                lobby.abbandonaLobby("guest-t2")
                    .then(_ => { return lobby.getNumeroGiocatoriLobby(codiceLobby) })
                    .then(results => {
                        assert.strictEqual(Number(results.rows[0].count), 0);
                        return lobby.cercaLobbyByAdmin("guest-t2");
                    })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 0);
                        return lobby.cercaLobbyByCodice(codiceLobby);
                    })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 0);
                        return resolve();
                    })
                    .catch(error => { return reject(error); });
            })
        })
    });
});