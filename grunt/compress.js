/*jslint indent: 4 */
/*global module */
module.exports = function (grunt, options) {
    return {
        main: {
            options: {
                archive: 'build/Releases/malas34.brackets-console-plus_<%= package.version %>.zip'
            },
            files: [{
                src: '<%= package.files %>',
                dest: 'malas34.brackets-console-plus/'
            }]
        }
    };
};