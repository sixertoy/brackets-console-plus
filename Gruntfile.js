module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        compress: {
            main: {
                options: {
                    archive: 'build/Releases/malas34.brackets-console-plus_<%= pkg.version %>.zip'
                },
                files: [
                    {
                        src: '<%= pkg.files %>',
                        dest: 'malas34.brackets-console-plus/'
                    }
                ]
            }
        },
        qunit: {
            files: []
        },
        jshint: {
            file: ['Gruntfile.js', 'main.js', 'strings.js', 'lib/regex-utils.js', 'lib/circular-json.js', 'nls/strings.js', 'nls/fr/strings.js', 'nls/root/strings.js', 'nls/it/strings.js']
        }
    });

    // grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('package', ['jshint', 'compress']);
    grunt.registerTask('default', ['jshint']);

};
