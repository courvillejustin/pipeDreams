var _ = require('highland'),
  parse = require('csv').parse;

var parser = parse({
  delimiter: ',',
  trim: true
});


module.exports = function(data){
   return _(data).through(parser);
}
