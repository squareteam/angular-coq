// Generated on 2014-06-08 using generator-angular 0.8.0
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.loadNpmTasks('grunt-karma-coveralls');

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      lib: require('./bower.json').appPath || 'lib',
      dist: 'dist'
    },

    // Release settings
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        push: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json'], // '-a' for all files
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        pushTo: 'origin'
        // gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
      }
    },

    coveralls: {
      options: {
        debug: false,
        'coverage_dir': 'coverage/',
        dryRun: false,
        force: true,
        recursive: true
      }
    },

    // Build settings
    clean : {
      dist : ['.tmp', 'dist']
    },

    concat : {
      dist : {
        src: ['<%= yeoman.lib %>/module.js', '<%= yeoman.lib %>/coq.js', '<%= yeoman.lib %>/directives/coq-form-services.js', '<%= yeoman.lib %>/directives/coq-model-attribute.js', '<%= yeoman.lib %>/directives/coq-model.js'],
        dest: '.tmp/angular-coq.js',
      }
    },

    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '*.js',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/angular-coq.min.js': [
            '<%= yeoman.dist %>/angular-coq.js'
          ]
        }
      }
    },

    // Test settings
    watch: {
      jsTest: {
        files: ['test/spec/{,**/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,**/}*.js']
      }
    }
  });


  grunt.registerTask('test', [
    'karma',
    'coveralls'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'concat:dist',
    'ngmin:dist',
    'uglify:dist'
  ]);

};
