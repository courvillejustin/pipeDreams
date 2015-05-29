var __ = require('highland'),
  _ = require('lodash'),
  objectPath = require("object-path"),
  jsonPath = require('JSONPath');

function getValuesFromKey(obj, key) {
  if (_.has(obj, key)) // or just (key in obj)
    return [obj];
  var res = [];
  _.forEach(obj, function(v) {
    if (typeof v == "object" && (v = getValuesFromKey(v, key)).length)
      res.push.apply(res, v);
  });
  return res;
}

function getPath(obj, val, path) {
  path = path || "";
  var fullpath = "";
  for (var b in obj) {
    if (obj[b] === val) {
      return (path + "/" + b);
    } else if (typeof obj[b] === "object") {
      fullpath = getPath(obj[b], val, path + "/" + b) || fullpath;
    }
  }
  return fullpath;
}

function getContext(global, path) {
  var literal = objectPath.get(global, path.split('/').slice(1, path.split('/').length).join('.'));
  return literal;
}

module.exports = function(s,rates){
  var rateCodes = rates;
  return s.map(function(data){
    var value = data;
    /*Take the  array of object made from getValuesFromKey and iterate over each value*/
    _.chain(getValuesFromKey(value.data, 'codes'))
    /* for each object, get the path from it then get the proper context and return it*/
    .map(function(val) {
      return getContext(value, getPath(value, val));
    })
    /*for each context map reduce the aCodes array */
    .each(function(val) {
      val.codes = _.mapValues(val.codes, function(val) {
        return _.reduce(val, function(memo, num) {
          return Number(memo) + Number(num);
        }, 0);
      });
      return val;
    })
    /*Tally up the total based on the meter*/
    .each(function(literal) {
      literal.totals =
        _.chain(literal.codes)
        .map(function(val, key) {
          return rateCodes[key] ? {'demand': val, 'use': 0 } : {'demand': 0, 'use': val };
        })
        .reduce(function(result, val, key) {
          result['demand'] += val.demand;
          result['use'] += val.use;
          return result; }, {'demand': 0, 'use': 0 })
        .value();
      });
    /*Take the  array of object made from getValuesFromKey and iterate over each value*/
    _.chain(getValuesFromKey(value, 'lineItems'))
    /* for each object, get the path from it then get the proper context and return it*/
    .map(function(val) {
      return getContext(value, getPath(value, val));
    })
    /*Tally up the total based on the meter*/
    .each(function(literal) {
      literal.totals =
        _.chain(literal.lineItems)
        .map(function(val, key) {
          return val.totals;
        })
        .reduce(function(result, val, key) {
          result['demand'] += val.demand;
          result['use'] += val.use;
          return result;
        }, {
          'demand': 0,
          'use': 0
        })
        .value();
    });
    return value;
  });

}
