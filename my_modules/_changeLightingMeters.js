var _ = require('highland');


/**
 * _changeLightingMetes
 * Go through the NWE row data and change the meters to L depending on if the first letter of the utility code is an L
 * If the utility code is L then change the meter number to the proper format
 * @param  {[type]} row [description]
 * @return {[type]}     [description]
 */
module.exports = function(row) {
	return _(row).map(function(row) {
		row.utilityCode = !row.utilityCode ? 'L' : row.utilityCode;
		row.rate = !row.rate ? 'L' : row.rate;
		row.utilityCode = row.rate[0] === 'L' ? 'L' : row.utilityCode;
		row.serviceId = row.utilityCode === 'L' ? '-' + row.accountNumber : row.serviceId;
		row.meter = row.utilityCode === 'L' ? '-' + row.accountNumber : row.meter;
		return row;
	});
}
