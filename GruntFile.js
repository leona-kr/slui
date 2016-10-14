'use strict';

module.exports = function(grunt) {


	// Configuration
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		sass: {
			src: {
				options: {
					style: 'compressed',
					sourcemap : 'none'
				},
				files: [{
					expand: true,
					cwd: './sass/',
					src: ['**.scss'],
					dest: './src/css/',
					ext: '.css'
				}]
			}
		},

		watch: {
			sass: {
				files: ['**/*.scss'],
				tasks: ['sass'],
				options:{
					//livereload : true,
					debounceDelay : 250			//default : 500
				}
			}
		},

		concat: {
			options: {
				separator: ';',
				stripBanners : false
			},
			/* dev_files: {
				options:{
					compress:{
						drop_console: true
					}
				},
				files:{
					//'./resources/fw/plugins.min.js' : ['./fw/plugin/chosen.jquery.min.js',
					//								'./fw/plugin/jquery.nanoscroller.min.js',
					//								'./fw/plugin/jquery-ui.custom.min.js',
					//								'./fw/plugin/jquery.cookie.min.js',
					//								'./fw/plugin/jquery.dynatree.min.js']
				}
			}, */
			deploy_files: {
				options:{
					compress:{
						drop_console: true
					}
				},
				files:{
					'./dist/css/style.css' : ['./src/css/common.css', './src/css/plugins.css'],
					'./dist/css/dashboard.css' : ['./src/css/dashboard.css'],
					'./dist/css/logsearch.css' : ['./src/css/logsearch.css'],
					'./dist/css/theme-blue.css' : ['./src/css/theme-blue.css'],
					'./dist/css/theme-dark.css' : ['./src/css/theme-dark.css']
				}
			}
		},

		uglify: {
			/* dev_files : {
				options: {
					compress: {
						drop_console: true
					}
				},
				files: {
					//'./fw/plugin/timeline-api.min.js': ['./fw/plugin/timeline-api.js'],
					//'./fw/plugin/chosen.jquery.min.js': ['./fw/plugin/chosen.jquery.js'],
					//'./fw/plugin/jquery.dynatree.min.js': ['./fw/plugin/jquery.dynatree.js']
					//'./resources/fw/jqx.ecs.min.js': ['./fw/jqx/*.js'],
					//'./fw/plugin/jquery-ui.custom.min.js':['./fw/plugin/jquery-ui.custom.js']
				}
			}, */
			static_files: {
				files: [
					{src: ['./src/js/common.ui.js','./src/js/sl.ui.js'], dest: './dist/js/common.ui.min.js'},
					{src:['./src/app/dashboard/component/*.js'], dest:'./dist/app/dashboard/components.js'}
				],
			},
			dist_files: {
				// Grunt will search for "**/*.js" under "lib/" when the "uglify" task
				// runs and build the appropriate src-dest file mappings then, so you
				// don't need to update the Gruntfile when files are added or removed.
				files: [
					{
						expand: true,     // Enable dynamic expansion.
						cwd: 'src/app/',      // Src matches are relative to this path.
						src: ['**/*.js'], // Actual pattern(s) to match.
						dest: 'dist/app/',   // Destination path prefix.
						ext: '.js',   // Dest filepaths will have this extension.
						extDot: 'first'   // Extensions in filenames begin after the first dot
					},
				],
			}
		}

	});


	//로드할 tasks
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	//grunt에서 실행할 task들 정의
	grunt.registerTask('default', [
		'uglify' ,'concat'
	]);
};