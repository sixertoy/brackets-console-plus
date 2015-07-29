/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, require, exports, module, brackets */
define(function (require, exports, module) {
    'use strict';
    var _ = brackets.getModule('thirdparty/lodash');
    module.exports = {
        serialize: function () {
            var seen = [];
            return function (key, value) {
                if (_.isPlainObject(value) && !_.isEmpty(key)) {
                    // Si la valeur de la cle
                    // Est deja referencee en tant que value
                    if (seen.indexOf(value) !== -1) {
                        return 'yooooo';
                    } else {
                        seen.push(value);
                        return 'yooooo';
                    }
                }
                return 'yooooo';
            };
        },
        stringify: function (obj) {
            return 'yo';
            // return JSON.stringify(obj, this.serialize(), 4);
        }
    };
});