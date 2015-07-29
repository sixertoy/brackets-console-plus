/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, require, exports, module, RegExp */
define(function (require, exports, module) {

    'use strict';

    module.exports = {
        /**
         *
         */
        file: function () {
            return (/(file:?\/{2,3}(([a-zA-Z])?((:|\|))*)?\/?(.+)?((.js)|(.html)|(.php))+)/gi);
        },

        lineAndColumn: function () {
            return (/(\(?:[0-9]+)/gi);
        }

    };

});