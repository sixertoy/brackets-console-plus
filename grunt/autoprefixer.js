/*jslint indent: 4 */
/*global module */
module.exports = {
    options: {
        remove: true,
        cascade: false,
        browsers: ['last 2 versions', 'ie 8', 'ie 9']
    },
    dev: {
        expand: true,
        flatten: true,
        dest: './styles/',
        src: './styles/*.css'
    }
};
