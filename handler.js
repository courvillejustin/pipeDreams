var chain = require('./my_modules/chain'),
	fs = require('fs'),
	config = require('./config'),
	program = require('commander'),
	getSvn = require('./my_modules/getSvnFiles'),
	rimraf = require('rimraf'),
	merge = require('./my_modules/mergeFilesInDir'),
	_parse = require('./my_modules/_parse'),
	_mapToJson = require('./my_modules/_mapToJson'),
	_cleanData = require('./my_modules/_cleanData'),
	_changeLightingMeters = require('./my_modules/_changeLightingMeters'),
	_templateTransform = require('./my_modules/_templateTransform'),
	_rollupTotals = require('./my_modules/_rollupTotals'),
	_mergeGasCharges = require('./my_modules/_mergeGasCharges'),
	_flatten = require('./my_modules/_flatten');
_buildNweFormat = require('./my_modules/_buildNweFormat'), csvMap = require(
		'./fileMaps/csvMap'), rateCodes = require('./fileMaps/rateCodes'), template =
	require('./fileMaps/transformMap');

var tempWorkingDir = './check';
var months = {
	'01': '01-Jan',
	'02': '02-Feb',
	'03': '03-Mar',
	'04': '04-Apr',
	'05': '05-May',
	'06': '06-Jun',
	'07': '07-Jul',
	'08': '08-Aug',
	'09': '09-Sep',
	'10': '10-Oct',
	'11': '11-Nov',
	'12': '12-Dec'
};

var csvHeader = config.csvHeader;
program
	.version('0.0.1')
	.option('-y, --year [value]', 'Checkout year')
	.option('-m, --month [value]', 'Checkout month')
	.parse(process.argv);

var url = config.svnUrl + program.year + '/' + months[program.month];

/**
 * Build a chain and run the sequence of functions passing the return value to the next in the chain
 */
chain.run(
	/**
	 * Delete temporary working directory
	 */
	function(res, next) {
		rimraf(tempWorkingDir, function(error) {
			if (error) {
				console.log(error.message);
			}
			next();
		});
	},
	/**
	 * getSvn - get files from svn and dump them into the temporary directory
	 */
	function(res, next) {
		var svn = getSvn.bind(this);
		svn(url, tempWorkingDir, next);
	},
	/**
	 * merge - merge the files in the temp directory and create a readable stream from them
	 */
	function(res, next) {
		var merged = merge.bind(this);
		merged(tempWorkingDir, next);
	},
	/**
	 * parse the readable stream values to JSON
	 */
	function(res, next) {
		next(_parse(res));
	},
	/**
	 * mapToJson - map the parsed values to key pairs based on the csvMap
	 */
	function(res, next) {
		next(_mapToJson(res, csvMap).compact());
	},
	/**
	 * cleanData - remove unwanted fields and set the record type
	 */
	function(res, next) {
		next(_cleanData(res, csvMap));
	},
	/**
	 * changeLightingMeters - changes the E utility code to L for lighting meters
	 */
	function(res, next) {
		next(_changeLightingMeters(res));
	},
	/**
	 * convert incoming values to an array
	 */
	function(res, next) {
		res.toArray(function(arr) {
			next(arr);
		});
	},
	/**
	 * templateTransform - transforms the flat data source into a strcutured JSON object based on the template passed in
	 */
	function(res, next) {
		next(_templateTransform(res, template));
	},
	/**
	 * Calculate the totals for the individual meters
	 */
	function(res, next) {
		next(_rollupTotals(res, rateCodes));
	},
	/**
	 * Merge gas charges and deal with the P and R values this is only used for older data, NWE changed this when they switched to a newer system
	 */
	function(res, next) {
		if (program.year > 2013) {
			next(res);
		} else {
			next(_mergeGasCharges(res));
		}
	},
	/**
	 * flatten - pluck the values we want and return a flat object
	 */
	function(res, next) {
		next(_flatten(res));
	},
	/**
	 * buildNWEFormat - takes an object and builds the CSV string to write to the output
	 */
	function(res, next) {
		next(_buildNweFormat(res));
	},
	/**
	 * write to the destination file
	 */
	function(res, next) {
		var log = fs.createWriteStream(config.destinationDir + program.year + '-' +
			months[program.month] + '.csv', {
				'flags': 'w'
			});
		log.write(csvHeader);
		res.pipe(log);
	}
);
