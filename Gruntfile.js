module.exports = function (grunt) {
	'use strict';

	var port = grunt.option('port') || 9001,
		lrPort = grunt.option('lr-port') || 35731,
		hostname = 'localhost',
		baseFolder = '.';

	// Display the elapsed execution time of grunt tasks
	require('time-grunt')(grunt);
	// Load all grunt-* packages from package.json
	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({
		// Read settings from package.json
		pkg: grunt.file.readJSON('package.json'),
		// Paths settings
		dirs: {
			src: {
				src: 'src',
				css: 'src/css',
				js: 'src/js'
			},
			dest: {
				dest: 'public',
				css: 'public/css',
				js: 'public/js'
			}
		},
		// Check that all JS files conform to our `.jshintrc` files
		jshint: {
			options: {
				jshintrc: true
			},
			target: {
				src: '<%= dirs.src.js %>/**/*.js'
			}
		},
		// Combine all JS files into one compressed file (including sub-folders)
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> ' +
					'<%= grunt.template.today("dd-mm-yyyy") %> */\n',
				compress: true,
				mangle: true,
				sourceMap: true
			},
			target: {
				src: '<%= dirs.src.src %>/**/*.js',
				dest: '<%= dirs.dest.js %>/main.min.js'
			}
		},
		// Compile the main Sass file (that loads all other Sass files)
		// Output as one compressed file
		sass: {
			options: {
				outputStyle: 'compressed',
				sourceMap: true
			},
			target: {
				src: '<%= dirs.src.css %>/main.scss',
				dest: '<%= dirs.dest.css %>/main.min.css'
			}
		},
		// Cleanup setup, used before each build
		clean: {
			all: '<%= dirs.dest.dest %>',
			css: '<%= dirs.dest.css %>',
			js: '<%= dirs.dest.js %>'
		},
		// Trigger relevant tasks when the files they watch has been changed
		// This includes adding/deleting files/folders as well
		watch: {
			// Will try to connect to a LiveReload script
			options: {
				livereload: lrPort
			},
			configs: {
				options: {
					reload: true
				},
				files: ['Gruntfile.js', 'package.json']
			},
			css: {
				files: '<%= dirs.src.css %>/**/*.scss',
				tasks: ['build-css']
			},
			js: {
				files: '<%= dirs.src.js %>/**/*.js',
				tasks: ['build-js']
			},
			index: {
				files: 'index.html'
			}
		},
		// Setup a local server (using Node) with LiveReload enabled
		connect: {
			server: {
				options: {
					port: port,
					base: baseFolder,
					hostname: hostname,
					livereload: lrPort,
					open: true
				}
			}
		}
	});

	// Setup build tasks aliases
	grunt.registerTask('build-js', ['clean:js', 'jshint', 'uglify']);
	grunt.registerTask('build-css', ['clean:css', 'sass']);
	grunt.registerTask('build', ['clean:all', 'build-js', 'build-css']);

	// Open local server and watch for file changes
	grunt.registerTask('serve', ['connect', 'watch']);

	// Default task(s).
	grunt.registerTask('default', ['build']);
};
