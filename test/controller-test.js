const { rejects } = require('assert');
var assert = require('assert');
const controller = require('../backend/controller')

describe('Controller.js', function () {
    describe('#controllaRisultatoQuery()', function () {
        it('should return true when results.rows have length == 0', function () {
            var toControl = { rows: [] };
            assert.strictEqual(controller.controllaRisultatoQuery(toControl), true);
        });
        it('should return false when results.rows have length != 0', function () {
            var toControl = { rows: [0, 1] };
            assert.strictEqual(controller.controllaRisultatoQuery(toControl), false);
        });
        it('should return true because results is undefined', function () {
            var toControl;
            assert.strictEqual(controller.controllaRisultatoQuery(toControl), true);
        });
    });

    describe('#controllaNotNull()', function () {
        it('should return true because the param is null', function () {
            var toControl = null;
            assert.strictEqual(controller.controllaNotNull(toControl), true);
        });
        it('should return false because the param is not null', function () {
            var toControl = "test";
            assert.strictEqual(controller.controllaNotNull(toControl), false);
        });
    });

    describe('#controllaDatiGioco()', function () {
        it('should throw an error because the name of the game is not valid', async function () {
            var name = "";
            await assert.rejects(controller.controllaDatiGioco(name, "TURNI", 1, 5, "\link", false, "regolamento"), { message: "Il nome del gioco non è valido" })
        });
        it('should throw an error because the link of the game is not valid', async function () {
            var link = "";
            await assert.rejects(controller.controllaDatiGioco("nome", "TURNI", 1, 5, link, false, "regolamento"), { message: "Il link del gioco non è valido" })
        });
        it('should throw an error because the rule book of the game is not valid', async function () {
            var regolamento = " ";
            await assert.rejects(controller.controllaDatiGioco("nome", "TURNI", 1, 5, "\link", false, regolamento), { message: "Il regolamento del gioco non è valido" })
        });
        it('should throw an error because the minimum\maximum number of players can\'t be less then 1', async function () {
            await assert.rejects(controller.controllaDatiGioco("nome", "TURNI", 0, 5, "\link", false, "regolamento"), { message: "Il numero minimo o massimo dei giocatori non può essere minore di uno!" })
        });
        it('should throw an error because the minimum number of players can\'t be less then the maximum one', async function () {
            await assert.rejects(controller.controllaDatiGioco("nome", "TURNI", 2, 1, "\link", false, "regolamento"), { message: "Il numero minimo dei giocatori non può essere maggiore del numero massimo!" })
        });
        it('should throw an error because the minimum\maximum number of players must be an integer', async function () {
            await assert.rejects(controller.controllaDatiGioco("nome", "TURNI", 2.3, 5, "\link", false, "regolamento"), { message: "Il numero minimo o massimo dei giocatori deve essere un intero!" })
        });
        it('should throw an error because the minimum\maximum number of players must be an integer', async function () {
            await assert.rejects(controller.controllaDatiGioco("nome", "TIPO", 1, 5, "\link", false, "regolamento"), { message: "Il tipo di gioco non è valido!" })
        });
        it('should throw an error because the minimum\maximum number of players must be an integer', async function () {
            await assert.rejects(controller.controllaDatiGioco("nome", "TURNI", 1, 5, "\link", "stringa-test", "regolamento"), { message: "Il parametro attivo non è valido!" })
        });
    });
});