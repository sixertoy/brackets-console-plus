module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        compress: {
            main: {
                options: {
                    archive: 'releases/malas34.brackets-console-plus_<%= pkg.version %>.zip'
                },
                files: [
                    {
                        src: [
                        'main.js',
                        'package.json',

                        'README.md',
                        'HISTORY.md',

                        'lib/RegexUtils.js',

                        'htmlContent/row.html',
                        'htmlContent/panel.html',
                        'htmlContent/button.html',

                        'strings.js',
                        'nls/strings.js',
                        'nls/it/strings.js',
                        'nls/fr/strings.js',
                        'nls/root/strings.js',

                        'styles/styles.css',
                        'styles/images/button.svg',
                        'styles/images/licence.txt'
                    ],
                        dest: 'malas34.brackets-console-plus/'
                    }
                ]
            }
        },
        qunit: {
            files: []
        },
        jshint: {
            file: ['Gruntfile.js', 'main.js', 'strings.js', 'lib/RegexUtils.js', 'nls/strings.js', 'nls/fr/strings.js', 'nls/root/strings.js', 'nls/it/strings.js']
        }
    });

    // grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('package', ['jshint', 'compress']);
    grunt.registerTask('default', ['jshint']);

};
