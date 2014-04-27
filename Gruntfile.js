module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
		
		/*
			versioning via bump: https://github.com/vojtajina/grunt-bump
			
			grunt bump:patch	1.0.0 -> 1.0.1
			grunt bump:minor	1.0.1 -> 1.1.0
			grunt bump:major	1.1.0 -> 2.0.0
			grunt bump --setversion=1.0.0
		*/
		
		bump: {
		  options: {
			files: ['package.json'],
			updateConfigs: [],
			commit: false,
			push: false,
		  }
		},
		
		uglify: {
			yerslider_js: {
				files: {
					'core/yerslider.min.js': 'core/yerslider.js',
				},
				options: {
					compress: true,
					mangle: true,
					report: 'gzip',
					banner: '/*\r\n' +
					' * @package		<%= pkg.name %>\r\n' +
					' * @version		<%= pkg.version %>\r\n' +
					' * @date		<%= grunt.template.today("yyyy-mm-dd") %>\r\n' +
					' * @time		<%= grunt.template.today("H:MM:ss") %>\r\n' +
					' * @license		<%= pkg.license %>\r\n' + 
					' * @repository	<%= pkg.repository.url %>\r\n' + 
					' * @homepage	<%= pkg.homepage %>\r\n' + 
					' */\r\n',
				}
			}
		},

		sass: {
			expanded: {
				options: {
					style: 'expanded',
					banner: '/*\r\n' +
					' * @package		<%= pkg.name %>\r\n' +
					' * @version		<%= pkg.version %>\r\n' +
					' * @date		<%= grunt.template.today("yyyy-mm-dd") %>\r\n' +
					' * @time		<%= grunt.template.today("H:MM:ss") %>\r\n' +
					' * @license		<%= pkg.license %>\r\n' + 
					' * @repository	<%= pkg.repository.url %>\r\n' + 
					' * @homepage	<%= pkg.homepage %>\r\n' + 
					' */\r\n',
				},
				files: [{
					expand: true,
					cwd: 'themes/',
					src: ['**/*.scss'],
					dest: 'themes/',
					ext: '.css',
					extDot: 'first'
				}]
			},
			min: {
				options: {
					style: 'compressed',
					banner: '/*\r\n' +
					' * @package		<%= pkg.name %>\r\n' +
					' * @version		<%= pkg.version %>\r\n' +
					' * @date		<%= grunt.template.today("yyyy-mm-dd") %>\r\n' +
					' * @time		<%= grunt.template.today("H:MM:ss") %>\r\n' +
					' * @license		<%= pkg.license %>\r\n' + 
					' * @repository	<%= pkg.repository.url %>\r\n' + 
					' * @homepage	<%= pkg.homepage %>\r\n' + 
					' */\r\n',
				},
				files: [{
					expand: true,
					cwd: 'themes/',
					src: ['**/*.scss'],
					dest: 'themes/',
					ext: '.min.css',
					extDot: 'first'
				}]
			}
		},

		watch: {
			yerslider_production: {
				files: ['themes/**/*.scss','core/yerslider.js'],
				tasks: ['uglify:yerslider_js','sass'],
			},
		},

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-bump');

	grunt.registerTask('default', ['watch']);

};