require('dotenv').config();
var assert = require('assert');

const admin = require('../backend/admin');
const utente = require('../backend/utente');
const db = require('../backend/database');
const game = require('../backend/multiplayer/game');

function eliminaUtenteTest(username) {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE FROM public.utenti WHERE username = $1;',
            [username], (error, results) => {
                if (error) return reject(error);
                else return resolve();
            })
    })
}

function creaAdminTest() {
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.utenti (username, nome, cognome, password, salt, tipo) VALUES ($1, $2, $3, $4, $5, $6)',
            ["admin-t", "admin", "admin", "hash", "salt", "ADMIN"], (error, results) => {
                if (error) return reject(error);
                else return resolve();
            })
    })
}

describe('Admin.js', function () {
    before(function () {
        const promises = [];
        promises.push(eliminaUtenteTest("admin-t"));
        promises.push(eliminaUtenteTest("user-t"));
        promises.push(eliminaUtenteTest("user-t10"));
        return Promise.all(promises);
    });

    /**
     * Inserisce i dati degli utenti per i test.
     */
    before(function () {
        const promises = [];
        promises.push(creaAdminTest());
        promises.push(utente.creaUtente("user-t", "Mario", "Rossi", "password"));
        promises.push(utente.creaUtente("user-t10", "Test10", "Test10", "password"));
        promises.push(game.creaGioco("Gioco Test", "TURNI", 2, 2, "test", true, {}, "test regolamento"));
        return Promise.all(promises);
    });

    after(function () {
        return eliminaUtenteTest("admin-t");
    })

    describe('#getUtente()', function () {
        it('should return the list of users who are not "ADMIN"', function () {
            return new Promise((resolve, reject) => {
                admin.getUtenti("admin-t")
                    .then(results => {
                        const toControl = results.rows;
                        var toTest;
                        for (let i = 0; i < toControl.length; i++)
                            if (toControl[i].username == "user-t")
                                toTest = toControl[i];

                        assert.notEqual(results.rows.length, 0);

                        const expected = {
                            tipo: "GIOCATORE",
                            username: "user-t",
                            nome: "Mario",
                            cognome: "Rossi"
                        }

                        assert.deepStrictEqual(toTest, expected);
                        return resolve();
                    })
                    .catch(error => reject(error));
            });
        })
    });

    describe('#modificaUtente()', function () {
        it('should throw an error because the username is not valid', async function () {
            await assert.rejects(admin.modificaUtente("", "user-t2", "Luigi", "Bianchi"), { message: "L'username non è valido" })
        });
        it('should throw an error because the new username is not valid', async function () {
            await assert.rejects(admin.modificaUtente("user-t", "", "Luigi", "Bianchi"), { message: "Il nuovo username non è valido" })
        });
        it('should throw an error because the new name is not valid', async function () {
            await assert.rejects(admin.modificaUtente("user-t", "user-t2", "", "Bianchi"), { message: "Il nuovo nome non è valido" })
        });
        it('should throw an error because the new surname is not valid', async function () {
            await assert.rejects(admin.modificaUtente("user-t", "user-t2", "Luigi", ""), { message: "Il nuovo cognome non è valido" })
        });
        it('should change the account information (username, first name and last name) in the database', function () {
            return new Promise((resolve, reject) => {
                admin.modificaUtente("user-t", "user-t2", "Luigi", "Bianchi")
                    .then(_ => { return admin.getUtenti("admin-t") })
                    .then(results => {
                        const toControl = results.rows;
                        var toTest;
                        for (let i = 0; i < toControl.length; i++)
                            if (toControl[i].username == "user-t2")
                                toTest = toControl[i];

                        const expected = {
                            tipo: "GIOCATORE",
                            username: "user-t2",
                            nome: "Luigi",
                            cognome: "Bianchi"
                        }

                        assert.deepStrictEqual(toTest, expected);
                        return resolve();
                    })
                    .catch(error => reject(error));
            });
        })
    });

    describe('#eliminaUtenti()', function () {
        it('should delete one or more users from the database', function () {
            return new Promise((resolve, reject) => {
                admin.eliminaUtenti("user-t2,user-t10")
                    .then(_ => { return admin.getUtenti("admin-t") })
                    .then(results => {
                        const toControl = results.rows;
                        for (let i = 0; i < toControl.length; i++) {
                            assert.notEqual(toControl[i].username, "user-t2", "Users have not been deleted");
                            assert.notEqual(toControl[i].username, "user-t10", "Users have not been deleted");
                        }
                        return resolve();
                    })
                    .catch(error => reject(error));
            })
        })
    });

    describe('#deleteGame()', function () {
        it('should delete a game from the database', function () {
            return new Promise((resolve, reject) => {
                db.pool.query('SELECT id FROM public.giochi WHERE nome=$1',
                    ["Gioco Test"], (error, results) => {
                        if (error) return reject(error);

                        const toDelete = results.rows[0];
                        admin.deleteGame(toDelete.id)
                            .then(_ => {
                                db.pool.query('SELECT id FROM public.giochi WHERE nome=$1',
                                    ["Gioco Test"], (error, results) => {
                                        if (error) return reject(error);

                                        assert.strictEqual(results.rows.length, 0);
                                        assert.strictEqual(results.rows[0], undefined);
                                        return resolve();
                                    });
                            })
                            .catch(error => reject(error));
                    });
            })
        })
    });

})