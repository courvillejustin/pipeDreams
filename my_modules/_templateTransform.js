var _ = require('highland'),
  __ = require('lodash'),
  t = require('./transformTemplateParser');



module.exports = function(data,temp){
  var template = temp;
var obj = {};
     data.forEach(function(row){
      if (row.recordType === 'usageDollar') {
        t.transform(template['accountBillView']['usageDollar'], row, obj);
      }
      if (row.recordType === 'usageOnly') {
        t.transform(template['accountBillView']['usageOnly'], row, obj);
      }
      if (row.recordType === 'fixCharge') {
        t.transform(template['accountBillView']['fixCharge'], row, obj);
      }
    });
    return _(__.map(obj,function(val,key){return {account: key, data: val}}));

}
