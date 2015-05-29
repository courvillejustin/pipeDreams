var __ = require('highland'),
	_ = require('lodash'),
	jsonPath = require('JSONPath');
/**
 * [flatten description]
 * Flatten the nested structure bringing the Account Data down to a flat single level Object
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function flatten(obj) {
	var sockets = jsonPath.eval(obj, '$..sockets.');

	var sockets = _.map(sockets[0], function(socket, key) {
		var temp = {};
		temp[key] = socket;
		return temp;
	});

	var retObj = _.chain(sockets)
		.map(function(socket) {
			var s = _.keys(socket)[0];
			var meter = _.keys(socket[s].meters)[0];
			var sDate = socket[s].meters[meter].startDate;
			var eDate = socket[s].meters[meter].endDate;

			if (!socket[s].meters[meter].usageOnly) {
				socket[s].meters[meter].usageOnly = {
					usage: 0,
					demandUsage: 0
				};
			}
			var usage = socket[s].meters[meter].usageOnly.usage;
			var demandUsage = socket[s].meters[meter].usageOnly.demandUsage;
			if (!socket[s].meters[meter].totals) {
				socket[s].meters[meter].totals = {
					use: 0,
					demand: 0
				};
			}
			var useCost = socket[s].meters[meter].totals.use;
			var demandCost = socket[s].meters[meter].totals.demand;
			var utility = socket[s].meters[meter].utility;
			var account = socket[s].meters[meter].account;
			var billPeriod = socket[s].meters[meter].billPeriod;
			var rate = socket[s].meters[meter].rate;
			return {
				'account': account,
				'billPeriod': billPeriod,
				'socket': s,
				'startDate': sDate,
				'endDate': eDate,
				'usage': usage,
				'demandUsage': demandUsage,
				'useCost': useCost,
				'demandCost': demandCost,
				'utility': utility,
				'rate': rate
			};
		})
		.value();
	return retObj;
}


module.exports = function(s) {
	return s.map(function(data) {
		return flatten(data);

	}).flatten();



}
