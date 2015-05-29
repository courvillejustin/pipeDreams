var _ = require('highland'),
	fs = require('fs'),
	__ = require('lodash');

/**
 * [changeEmptyStrings description]
 * Remove empty strings and replace them with !EMPTY! name
 * @param {[type]} key [description]
 * @param {[type]} val [description]
 */
function changeEmptyStrings(key, val) {
		return val === "" ? '!EMPTY!' + key : val;
	}
	/**
	 * _cleanData
	 * Change empty strings for all pieces in the row, set the record type, and omit unecessary fields
	 * @param  {[type]} data [description]
	 * @param  {[type]} map  [description]
	 * @return {[type]}      [description]
	 */
module.exports = function(data, map) {
	var csvMap = map;
	return _(data).map(function(row) {
		for (key in row) {
			row[key] = row[key].trim();
			row[key] = changeEmptyStrings(key, row[key]);
		}
		row['recordType'] = Object.keys(row).length === 26 ? 'usageDollar' : (
			Object.keys(row).length === 20 ? 'usageOnly' : 'fixCharge');
		row = __.omit(row, ['customerName', 'mailAttentionTo', 'mailAddress',
			'mailCity', 'mailState', 'mailZip', 'serviceAddress',
			'additionalAddress', 'serviceCity', 'serviceState', 'serviceZip',
			'mailStateCode', 'mailZipCode'
		]);
		return row;
	});
}
