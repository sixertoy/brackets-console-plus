/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4 */
/*global define, brackets, describe, it, xit, expect, beforeEach, afterEach, afterLast */
define(function (require, exports, module) {

    'use strict';

    var SpecRunnerUtils = brackets.getModule("spec/SpecRunnerUtils");

    describe('[Console Plus]', function () {

        var brackets,
            testWindow;

        beforeEach(function () {
            SpecRunnerUtils.createTestWindowAndRun(this, function (w) {
                testWindow = w;
                brackets = testWindow.brackets;
            });
        });

        afterEach(function () {
            brackets = null;
            testWindow = null;
            SpecRunnerUtils.closeTestWindow();
        });

        // Starts Unit Tests

    });

});
