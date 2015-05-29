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
function mergeGasCharges(obj) {
  var utilities = jsonPath.eval(obj, '$..utilities.');
  _.chain(utilities)
    .map(function(path) {
      return getContext(obj, getPath(obj, path));
    })
    .each(function(data) {
      if (data['P'] || data['R']) {
        var gasSockets = _.chain(data['G'].sockets).map(function(val) {
          return val;
        }).value();
        var pSockets = _.chain(data['P'].sockets).map(function(val) {
          return val;
        }).value();
        var rSockets = _.chain(data['R'].sockets).map(function(val) {
          return val;
        }).value();
        _.chain(gasSockets)
          .each(function(val, index) {
            if (pSockets[index]) {
              val.meters[_.keys(val.meters)[0]].totals.use += pSockets[index].meters[_.keys(pSockets[index].meters)[0]].totals.use;
              val.meters[_.keys(val.meters)[0]].totals.demand += pSockets[index].meters[_.keys(pSockets[index].meters)[0]].totals.demand;
            }
            if (rSockets[index]) {
              val.meters[_.keys(val.meters)[0]].totals.use += rSockets[index].meters[_.keys(rSockets[index].meters)[0]].totals.use;
              val.meters[_.keys(val.meters)[0]].totals.demand += rSockets[index].meters[_.keys(rSockets[index].meters)[0]].totals.demand;

            }
          });
        delete data['P'];
        delete data['R'];
      }
    });
  return obj;
}


module.exports = function(s){
  return s.map(function(data){
    return mergeGasCharges(data);

  });



}
