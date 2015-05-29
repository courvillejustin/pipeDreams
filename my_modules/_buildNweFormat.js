var __ = require('highland'),
	_ = require('lodash');


/**
 * [createEcapFormat description]
 * Go through and create the EnergyCap header format template. So, if the row is an electric meter the gas and lighting
 * columns should be zeroed out and vice versa
 * @param {[type]} obj [description]
 */
function createEcapFormat(obj) {
		if (obj.utility === 'G') {
			obj.gUse = obj.usage;
			obj.gCost = obj.useCost;
			obj.eUse = 0;
			obj.eCost = 0;
			obj.eDemandUse = 0;
			obj.eDemandCost = 0;
			obj.lUse = 0;
			obj.lCost = 0;
		}
		if (obj.utility === 'P' || obj.utility === 'R') {
			obj.gUse = 0;
			obj.gCost = obj.useCost;
			obj.eUse = 0;
			obj.eCost = 0;
			obj.eDemandUse = 0;
			obj.eDemandCost = 0;
			obj.lUse = 0;
			obj.lCost = 0;
			obj.socket = '';
		}
		if (obj.utility === 'E' && obj.rate[0] !== 'L') {
			obj.gUse = 0;
			obj.gCost = 0;
			obj.eUse = obj.usage;
			obj.eCost = obj.useCost;
			obj.eDemandUse = obj.demandUsage;
			obj.eDemandCost = obj.demandCost;
			obj.lUse = 0;
			obj.lCost = 0;
		}
		if (obj.utility === 'L' && obj.rate[0] === 'L') {
			obj.gUse = 0;
			obj.gCost = 0;
			obj.eUse = 0;
			obj.eCost = 0;
			obj.eDemandUse = 0;
			obj.eDemandCost = 0;
			obj.lUse = obj.usage;
			obj.lCost = obj.useCost;
		}
		return obj;
	}
	/**
	 * [build description]
	 * Assemble the object into an array of values. Remove the falsey values and return
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
function build(obj) {
	if (obj.account != 'ACT_NBR') {

		obj['demandUsage'] = obj['demandUsage'] === '!EMPTY!demandUsage' ? 0 : obj[
			'demandUsage'];
		obj['usage'] = obj['usage'] === '!EMPTY!demandUsage' ? 0 : obj['usage'];
		obj.useCost = Number(obj.useCost).toFixed(2)
		obj.demandCost = Number(obj.demandCost).toFixed(2)

		obj = createEcapFormat(obj);
		obj.vendor = 'NWEnergy';
		var arr = [
			obj.account,
			obj.startDate,
			obj.endDate,
			'A',
			obj.socket,
			obj.vendor,
			obj.gUse,
			obj.gCost,
			obj.eUse,
			obj.eCost,
			obj.eDemandUse,
			obj.eDemandCost,
			obj.lUse,
			obj.lCost,
			'X'
		];
		arr = _.without(arr, "", null, undefined, false);
		if (arr.length === 15) {
			return arr.join(',') + '\n';
		} else {
			return '';
		}
	} else {
		return '';
	}
}


module.exports = function(s) {
	return s.map(function(data) {
		return build(data);

	});



}
