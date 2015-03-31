/*jslint indent: 4 */
/*global module */
module.exports = {
    options: {
        cwd: '.',
        livereload: 1337,
        livereloadOnError: false
    },
    less: {
        files: ['./styles/*.less'],
        tasks: ['less', 'autoprefixer']
    },
};
