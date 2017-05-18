/**
 * To debug gruntfile:
 * node-debug $(which grunt) task
 */	

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		mochaTest: {
			test: {
				options: {
					ui : 'bdd',
					reporter: 'spec',
				},
				//We require all our tests in the conf file, so we
				//can do some pre-test functions before they are run.
				src: ['./test/test.js']
			},
			generate: {
				options: {
					ui : 'bdd',
					require: [
						function(){ global.save = 1; } //pass save as true when generating/saving test output
					],
					reporter: 'spec',
				},
				src: ['./test/test.js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('test', [
		'mochaTest:test'
	]);

	grunt.registerTask('test-gen', [
		'mochaTest:generate'
	]);

};
