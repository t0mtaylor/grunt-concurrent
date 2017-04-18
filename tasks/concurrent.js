'use strict';
var os = require('os'),
    padStream = require('pad-stream'),
    async = require('async'),
    arrify = require('arrify'),
    indentString = require('indent-string'),

    cpCache = [];

module.exports = function (grunt) {
	grunt.registerMultiTask('concurrent', 'Run grunt tasks concurrently', function () {
		var cb = this.async(),
            opts = this.options({
                limit: Math.max((os.cpus().length || 1) * 2, 2)
            }),
            tasks = this.data.tasks || this.data,
            flags = grunt.option.flags();

		if (flags.indexOf('--no-color') === -1 &&
			flags.indexOf('--no-colors') === -1 &&
			flags.indexOf('--color=false') === -1) {
			// append the flag so that support-colors won't return false
			// see issue #70 for details
			flags.push('--color');
		}

		if (opts.limit < tasks.length) {
			grunt.log.oklns(
				'Warning: There are more tasks than your concurrency limit. After ' +
				'this limit is reached no further tasks will be run until the ' +
				'current tasks are completed. You can adjust the limit in the ' +
				'concurrent task options'
			);
		}

        // resolve path issue with an override
        if (opts.pathOverride) {
            var storeBase = process.cwd();

            //grunt.file.setBase(opts.pathOverride);
        }

		async.eachLimit(tasks, opts.limit, function (task, next) {
			var cp = grunt.util.spawn({
				grunt: true,
				args: arrify(task).concat(flags),
				opts: {
					stdio: ['ignore', 'pipe', 'pipe']
				}
			}, function (err, result) {
				if (!opts.logConcurrentOutput) {
					grunt.log.writeln('\n' + indentString(result.stdout + result.stderr, ' ', 4));
				}

				next(err);
			});

			if (opts.logConcurrentOutput) {
				cp.stdout.pipe(padStream(' ', 4)).pipe(process.stdout);
				cp.stderr.pipe(padStream(' ', 4)).pipe(process.stderr);
			}

			cpCache.push(cp);
		}, function (err) {
			if (err) {
				grunt.warn(err);
			}

			cb();
		});

        // restore path to previous state
        if (opts.pathOverride && storeBase) {
            //grunt.file.setBase(storeBase);
        }

	});
};

function cleanup() {
	cpCache.forEach(function (el) {
		el.kill('SIGKILL');
	});
}

// make sure all child processes are killed when grunt exits
process.on('exit', cleanup);
process.on('SIGINT', function () {
	cleanup();
	process.exit(); // eslint-disable-line xo/no-process-exit
});
