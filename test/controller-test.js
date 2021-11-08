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
        //TODO controllare con results undefined
    });
});