require('dotenv').config();
var assert = require('assert');

const bcrypt = require('bcrypt');
const db = require('../backend/database');
const utente = require('../backend/utente');
const messaggi = require('../backend/messaggi');

function eliminaUtenteTest(username) {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE FROM public.utenti WHERE username = $1;',
            [username], (error, results) => {
                if (error) return reject(error);
                else return resolve();
            })
    })
}

function eliminaOspiteTest(username) {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE FROM public.ospiti WHERE username = $1;',
            [username], (error, results) => {
                if (error) return reject(error);
                else return resolve();
            })
    })
}

describe('Utente.js', function () {
    before(function () {
        return eliminaUtenteTest("user-t");
    });

    before(function () {
        return eliminaOspiteTest("guest-t");
    });

    after(function () {
        return eliminaUtenteTest("user-Mod");
    });

    describe('#creaUtente()', function () {
        it('should throw an error because the username field is empty', async function () {
            await assert.rejects(utente.creaUtente("", "Alberto", "Rossi", "password"), { message: "Il campo 'username' non deve essere vuoto!" });
        });

        it('should throw an error because the name field is empty', async function () {
            await assert.rejects(utente.creaUtente("user-t", "", "Rossi", "password"), { message: "Il campo 'nome' non deve essere vuoto!" });
        });

        it('should throw an error because the surname field is empty', async function () {
            await assert.rejects(utente.creaUtente("user-t", "Alberto", "", "password"), { message: "Il campo 'cognome' non deve essere vuoto!" });
        });

        it('should throw an error because the password has an invalid value', async function () {
            await assert.rejects(utente.creaUtente("user-t", "Alberto", "Rossi", ""), { message: "La password deve essere compresa tra 8 e 16 caratteri." });
            await assert.rejects(utente.creaUtente("user-t", "Alberto", "Rossi", "123456"), { message: "La password deve essere compresa tra 8 e 16 caratteri." });
            await assert.rejects(utente.creaUtente("user-t", "Alberto", "Rossi", "012345678012345678"), { message: "La password deve essere compresa tra 8 e 16 caratteri." });
        });

        it('should create a user and save it to the database', function () {
            return new Promise((resolve, reject) => {
                utente.creaUtente("user-t", "Alberto", "Rossi", "password1234")
                    .then(_ => {
                        db.pool.query('SELECT username, nome, cognome, password, salt FROM public.utenti WHERE username=$1',
                            ["user-t"], (error, results) => {
                                if (error) return reject(error);

                                const toControl = results.rows[0];
                                const hash = bcrypt.hashSync("password1234" + process.env.SECRET_PWD, toControl.salt);

                                const expected = {
                                    username: "user-t",
                                    nome: "Alberto",
                                    cognome: "Rossi",
                                    password: hash,
                                    salt: toControl.salt
                                }

                                assert.deepStrictEqual(toControl, expected);
                                return resolve();
                            });
                    })
                    .catch(error => reject(error));
            });
        });
    });

    describe('#creaOspite()', function () {
        it('should throw an error because the username field is empty', async function () {
            await assert.rejects(utente.creaOspite(""), { message: "L'username non deve essere vuoto!" });
        });

        it('should create a guest and save it to the database', function () {
            return new Promise((resolve, reject) => {
                utente.creaOspite("guest-t")
                    .then(_ => {
                        db.pool.query('SELECT username FROM public.ospiti WHERE username=$1',
                            ["guest-t"], (error, results) => {
                                if (error) return reject(error);

                                assert.strictEqual(results.rows[0].username, "guest-t");
                                return resolve()
                            });
                    })
            })
        });
    });

    describe('#getUserInfo()', function () {
        it('should return the user information (username, name and surname) saved to the database', function () {
            return new Promise((resolve, reject) => {
                utente.getUserInfo("user-t")
                    .then(results => {
                        const expected = {
                            username: "user-t",
                            nome: "Alberto",
                            cognome: "Rossi"
                        }

                        assert.strictEqual(results.rows.length, 1);
                        assert.deepStrictEqual(results.rows[0], expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error) });
            })
        });
    });

    describe('#cercaOspiteByUsername()', function () {
        it('should throw an error because the username field is empty', async function () {
            await assert.rejects(utente.cercaOspiteByUsername(""), { message: "L'username non deve essere vuoto!" });
        });

        it('should return the guest information saved to the database', function () {
            return new Promise((resolve, reject) => {
                utente.cercaOspiteByUsername("guest-t")
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);
                        assert.strictEqual(results.rows[0].username, "guest-t");
                        return resolve();
                    })
                    .catch(error => { return reject(error) });
            })
        });
    });

    describe('#cercaUtenteByUsername()', function () {
        it('should throw an error because the username field is empty', async function () {
            await assert.rejects(utente.cercaUtenteByUsername(""), { message: "L'username non deve essere vuoto!" });
        });

        it('should return the user information saved to the database', function () {
            return new Promise((resolve, reject) => {
                utente.cercaUtenteByUsername("user-t")
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);
                        assert.strictEqual(results.rows[0].username, "user-t");
                        assert.strictEqual(results.rows[0].nome, "Alberto");
                        assert.strictEqual(results.rows[0].cognome, "Rossi");
                        assert.notStrictEqual(results.rows[0].password, undefined);
                        assert.notStrictEqual(results.rows[0].salt, undefined);
                        return resolve();
                    })
                    .catch(error => { return reject(error) });
            })
        });
    });

    describe('#modificaUsername()', function () {
        before(function () {
            return utente.creaUtente("user-t50", "Test", "Modifica", "password");
        });

        after(function () {
            return eliminaUtenteTest("user-t50");
        });

        it('should throw an error because the new username field is empty', async function () {
            await assert.rejects(utente.modificaUsername("user-t", ""), { message: "Il nuovo username non è valido!" });
        });

        it('should throw an error because the username of the user to edit does not exist in the database', async function () {
            await assert.rejects(utente.modificaUsername("user-t1000", "user-Mod"), { message: messaggi.UTENTE_NON_TROVATO_ERROR });
        });

        it('should throw an error if the new username is already used', async function () {
            await assert.rejects(utente.modificaUsername("user-t", "user-t50"), { message: "Il nuovo username è già utilizzato!" });
        });

        it('should change the account information (username) in the database', function () {
            return new Promise((resolve, reject) => {
                utente.modificaUsername("user-t", "user-Mod")
                    .then(_ => { return utente.getUserInfo("user-t"); })
                    .then(results => { assert.ok(results.rows.length === 0); })
                    .then(_ => { return utente.getUserInfo("user-Mod"); })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);
                        const expected = {
                            username: "user-Mod",
                            nome: "Alberto",
                            cognome: "Rossi"
                        }
                        assert.deepStrictEqual(results.rows[0], expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error) });
            })
        });
    });

    describe('#modificaNomeCognome()', function () {
        it('should throw an error because the name field is empty', async function () {
            await assert.rejects(utente.modificaNomeCognome("user-Mod", "", "Bianchi"), { message: "Il campo 'nome' non è valido!" });
        });

        it('should throw an error because the surname field is empty', async function () {
            await assert.rejects(utente.modificaNomeCognome("user-Mod", "Luigi", ""), { message: "Il campo 'cognome' non è valido!" });
        });

        it('should throw an error because the username of the user to edit does not exist in the database', async function () {
            await assert.rejects(utente.modificaNomeCognome("user-M", "Luigi", "Bianchi"), { message: messaggi.UTENTE_NON_TROVATO_ERROR });
        });

        it('should change the account information (name, surname) in the database', function () {
            return new Promise((resolve, reject) => {
                utente.modificaNomeCognome("user-Mod", "Luigi", "Bianchi")
                    .then(_ => { return utente.getUserInfo("user-Mod"); })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);
                        const expected = {
                            username: "user-Mod",
                            nome: "Luigi",
                            cognome: "Bianchi"
                        }
                        assert.deepStrictEqual(results.rows[0], expected);
                        return resolve();
                    })
                    .catch(error => { return reject(error) });
            })
        });
    });

    describe('#cambiaPassword()', function () {
        it('should throw an error because the new password has an invalid value', async function () {
            await assert.rejects(utente.cambiaPassword("", "password1234", "user-Mod"), { message: "La nuova password deve essere compresa tra 8 e 16 caratteri." });
            await assert.rejects(utente.cambiaPassword("123456", "password1234", "user-Mod"), { message: "La nuova password deve essere compresa tra 8 e 16 caratteri." });
            await assert.rejects(utente.cambiaPassword("012345678012345678", "password1234", "user-Mod"), { message: "La nuova password deve essere compresa tra 8 e 16 caratteri." });
        });

        it('should throw an error because the username of the user to edit does not exist in the database', async function () {
            await assert.rejects(utente.cambiaPassword("1234password", "password1234", "user-t50"), { message: messaggi.UTENTE_NON_TROVATO_ERROR });
        });

        it('should throw an error because the username of the user to edit does not exist in the database', async function () {
            await assert.rejects(utente.cambiaPassword("1234password", "password", "user-Mod"), { message: "La vecchia password non è corretta" });
        });

        it('should change the password in the database', function () {
            return new Promise((resolve, reject) => {
                utente.cambiaPassword("1234password", "password1234", "user-Mod")
                    .then(_ => { return utente.cercaUtenteByUsername("user-Mod"); })
                    .then(results => {
                        assert.strictEqual(results.rows.length, 1);

                        const oldPassword = bcrypt.hashSync("password1234" + process.env.SECRET_PWD, results.rows[0].salt);
                        const newPassword = bcrypt.hashSync("1234password" + process.env.SECRET_PWD, results.rows[0].salt);

                        const expected = {
                            username: "user-Mod",
                            nome: "Luigi",
                            cognome: "Bianchi",
                            tipo: "GIOCATORE",
                            password: newPassword,
                            salt: results.rows[0].salt
                        }
                        assert.deepStrictEqual(results.rows[0], expected);
                        assert.notStrictEqual(results.rows[0].password, oldPassword);
                        return resolve();
                    })
                    .catch(error => { return reject(error) });
            })
        });
    });

    describe('#eliminaOspite()', function () {
        it('should delete the guest account from the database', function () {
            return new Promise((resolve, reject) => {
                utente.cercaOspiteByUsername("guest-t")
                    .then(results => { assert.strictEqual(results.rows.length, 1); })
                    .then(_ => { return utente.eliminaOspite("guest-t"); })
                    .then(_ => { return utente.cercaOspiteByUsername("guest-t"); })
                    .then(results => { assert.strictEqual(results.rows.length, 0); })
                    .then(_ => { return resolve(); })
                    .catch(error => { return reject(error); })
            })
        });
    });

    describe('#eliminaOspiti()', function () {
        before(function () {
            return eliminaOspiteTest("guest-DEL");
        });

        it('should delete the guest account from the database, if registration took place more than a day ago', function () {
            utente.eliminaOspiti();
            return new Promise((resolve, reject) => {
                db.pool.query('INSERT INTO public.ospiti (username, data_creazione) VALUES ($1, $2)',
                    ["guest-DEL", new Date(1636326000000 - 86400000)], (error, results) => {
                        if (error)
                            return reject(error);

                        utente.eliminaOspiti()
                            .then(_ => { return utente.cercaOspiteByUsername("guest-DEL"); })
                            .then(results => {
                                assert.strictEqual(results.rows.length, 0);
                                return resolve();
                            })
                            .catch(error => { return reject(error); });
                    });
            })
        });
    });
})