var _ = require('highland'),
	fs = require('fs');

/**
 * _mapToJson
 * Map a flat array against a mapping definition based on the array length, so index 1 is key Account, etc..
 * @param  {[type]} data [description]
 * @param  {[type]} map  [description]
 * @return {[type]}      [description]
 */
module.exports = function(data, map) {
	var csvMap = map;
	return _(data).map(function(row) {
		var conf = csvMap[row.length] ? Object.keys(csvMap[row.length]) : false;
		if (conf) {
			ret = {};
			conf.map(function(val, index) {
				ret[val] = row[index];
			});
			return ret;
		}
	});
}
