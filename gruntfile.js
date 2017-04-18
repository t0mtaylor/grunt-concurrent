'use strict';
var supportsColor = require('supports-color');


module.exports = function (grunt) {
    
        
    var pathtest = grunt.option('pathtest') || false;
    
    
    grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-nodemon');
    
        
    //if (pathtest) {
        
        grunt.file.write('test/tmp/pathtest1');
    
        grunt.file.setBase('test/tmp');
        
    //}
    
    
	grunt.initConfig({
		concurrent: {
			test: ['test1', 'test2', 'test3'],
			testSequence: ['test4', ['test5', 'test6']],
			testargs: ['testargs1', 'testargs2'],
			log: {
				options: {
					logConcurrentOutput: true
				},
				tasks: ['nodemon', 'watch']
			},
            path: {
				options: {
					//pathOverride: '../'
				},
				tasks: ['testargs1', 'nodemon', 'test3', 'watch']
			},
			colors: ['colorcheck']
		},
		simplemocha: {
			test: {
				src: 'test/*.js',
				options: {
					timeout: 6000
				}
			}
		},
		clean: {
			test: ['test/tmp']
		},
		watch: {
			scripts: {
				files: ['tasks/*.js'],
				tasks: ['default']
			}
		},
		nodemon: {
			dev: {
				options: {
					file: 'test/fixtures/server.js'
				}
			}
		}
	});


    

	grunt.registerTask('test1', function () {
		console.log('test1');
		grunt.file.write('test/tmp/1');
	});

	grunt.registerTask('test2', function () {
		var cb = this.async();
		setTimeout(function () {
			console.log('test2');
			grunt.file.write('test/tmp/2');
			cb();
		}, 1000);
	});

	grunt.registerTask('test3', function () {
		console.log('test3');
		grunt.file.write('test/tmp/3');
	});

	grunt.registerTask('test4', function () {
		console.log('test4');
		grunt.file.write('test/tmp/4');
	});

	grunt.registerTask('test5', function () {
		console.log('test5');
		grunt.file.write('test/tmp/5');
		sleep(1000);
	});

	grunt.registerTask('test6', function () {
		console.log('test6');
		grunt.file.write('test/tmp/6');
	});

	grunt.registerTask('testargs1', function () {
		var args = grunt.option.flags().join();
		grunt.file.write('test/tmp/args1', args);
	});

	grunt.registerTask('testargs2', function () {
		var args = grunt.option.flags().join();
		grunt.file.write('test/tmp/args2', args);
	});

	grunt.registerTask('colorcheck', function () {
		// writes 'true' or 'false' to the file
		var supports = String(Boolean(supportsColor));
		grunt.file.write('test/tmp/colors', supports);
	});
    
    grunt.registerTask('pathtest1', function () {
		console.log('pathtest1-1', process.cwd());
		grunt.file.write('test/tmp/pathtest1');
        grunt.file.setBase('test/tmp');
        console.log('pathtest1-2', process.cwd());
	});

    grunt.registerTask('pathtestrun', [
		'pathtest1',
        'concurrent:path'
	]);
    
    
    grunt.registerTask('default', 'Run tests for concurrent depending on mode', function(target, type, build) {
        
        if (pathtest) {
        
			return grunt.task.run([
                'clean',
                'pathtestrun',
                'clean'              
            ]);
        
		} else {

            grunt.task.run([
                'clean',
                'concurrent:test',
                'concurrent:testSequence',
                'simplemocha',
                'clean'
            ]);
		}
    });

};

function sleep(milliseconds) {
	var start = new Date().getTime(),
        i = 0;

	for (; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}
