/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, require, exports, module, brackets */
define(function (require, exports, module) {
    'use strict';
    var _ = brackets.getModule('thirdparty/lodash');
    module.exports = {
        serialize: function () {
            var seen = [],
                keys = [];
            return function(key, value) {
                if (_.isPlainObject(value) && !_.isEmpty(key)) {
                    return '[~]';
                } else {
                    return value;
                }
            }
        },
        stringify :function (obj) {
            return JSON.stringify(obj, this.serialize(), 4);
        }
    };
});
