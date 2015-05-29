/**
 * Transform will dynamically modify and create an object from an incoming object
 */
// var _ = require('underscore')._;
/* Regular expression matching the {{ }} and extracting the value in between the brackets */
var literal = /^(?:{{)([a-zA-z0-9]*)(?:}})$/;
var ArrayProto = Array.prototype;
var nativeKeys = Object.keys,
  nativeMap = ArrayProto.map,
  nativeSome = ArrayProto.some,
  nativeForEach = ArrayProto.forEach,
  nativeIndexOf = ArrayProto.indexOf;
var breaker = {};

function each(obj, iterator, context) {
  if (obj == null) return obj;
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  }
  else if (obj.length === +obj.length) {
    for (var i = 0, length = obj.length; i < length; i++) {
      if (iterator.call(context, obj[i], i, obj) === breaker) return;
    }
  }
  else {
    var keys = Object.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
    }
  }
  return obj;
};

function any(obj, predicate, context) {
  var result = false;
  if (obj == null) return result;
  if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
  each(obj, function (value, index, list) {
    if (result || (result = predicate.call(context, value, index, list))) return breaker;
  });
  return !!result;
};

function contains(obj, target) {
  if (obj == null) return false;
  if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
  return any(obj, function (value) {
    return value === target;
  });
};
/**
 * [type takes in an obj and determines the type it is. This is better than using the typeof command because it detects Arrays whereas typeof does not]
 * @param  {[Object]} obj [incoming Object to be tested for type]
 * @return {[String]} [The string representation of the Object's type]
 */
function type(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
  }
  /**
   * [newElement takes in a string describing the object's type and returns the proper empty object (an Object {} or an Array [])]
   * @param  {[String]} type [the string  of the Object type being evaluated]
   * @return {[Object | Array]} [Depending on the input it will either return an Object or an Array]
   */
function newElement(type) {
    return type === 'Object' ? {} : [];
  }
  /**
   * [literalTest take in a property, line, and Optional regular expression and return the line[property] if a match is found (because it is interpreted as
   * 	a literal data match in the Object transformation. Otherwise return the property it is just a string)]
   * @param  {[String]} property   [The property being tested]
   * @param  {[Object]} line       [The source line to extract literal matches from]
   * @param  {[RegExp]} expression [The optional regular expression to pass in]
   * @return {[String]}            [The correctly interpreted property]
   */
function literalTest(property, line, expression) {
  if (!expression) {
    var expression = /^(?:{{)([a-zA-z0-9]*)(?:}})$/;
  }
  var literalFunction = /^(?:function\()([a-zA-Z0-0 ,{}]*)(?:\){)((.*))([}]+)$/;
  var literalFunc = literalFunction.exec(property);
  if (literalFunc) {
    var tempObj = {};
    var params = literalFunc[1].split(',');
    // for(i in params){
    // 	tempObj[params[i]] = line[params[i]] ? line[params[i]] : '';
    // }
    tempObj = line;
    var tempFunc = new Function("obj", literalFunc[2]);
    var retProp = tempFunc(tempObj);
    return retProp;
  }
  if (type(property) != 'Function') {
    var tempProperty = property.split('+');
    var complexProperty = '';
    for (i in tempProperty) {
      var literalProp = expression.exec(tempProperty[i]);
      complexProperty = literalProp ? complexProperty + line[literalProp[1]] : complexProperty +
        tempProperty[i];
    }
    var prop = complexProperty;
    return literalProp ? prop : property;
  }
}
module.exports = {
  /**
   * [transform will dynamically create an object based off of a template and an input line]
   * @param  {[Object]} template [JSON markup designating the result you wish to create]
   * @param  {[Object]} inLine   [The input line of data that is a JavaScript Object]
   * @param  {[Object]} retObj   [The passed in object to populate ]
   * @return {[Object]}
   */
  transform: function (template, inLine, retObj) {
    for (var k in template) {
      var currentKey = literalTest(k, inLine, literal, template);
      /*if template[k] is an object*/
      if (typeof template[k] == 'object' && template[k] !== null) {
        /* First make sure the property exists in the return object, if it doesn't create it by calling the newElement function to return the proper type*/
        if (currentKey != 'undefined') {
          retObj.hasOwnProperty(currentKey) ? true : retObj[currentKey] = newElement(type(
            template[k]));
          /* if the current value is an Array let's handle it here*/
          if (type(template[k]) === 'Array' && template[k][0]) {
            /* If the first value in the array is a string simply push it after extracting it's value  */
            if (type(template[k][0]) === 'String') {
              retObj[currentKey].push(literalTest(template[k][0], inLine));
              retObj[currentKey].sort();
            }
            /* If the first vlaue in the Array is an Object, call transform recursively to add it to the current array*/
            if (type(template[k][0]) === 'Object') {
              var newObj = {};
              // transform(template[k][0],inLine,newObj);
              this.transform(template[k][0], inLine, newObj);
              retObj[currentKey].push(newObj);
            }
          }
          /* Then make the recursive call with the appropriate object int he return object(this designates the level of the current node)*/
          // transform(template[k],inLine,retObj[currentKey]);
          this.transform(template[k], inLine, retObj[currentKey]);
        }
      } /* /if template[k] is an object*/

      /* Else the obj is a simple data type so simply handle it down here*/
      else {
        if (template[k]) {
          var currentProperty = literalTest(template[k], inLine);
          if (currentProperty != 'undefined') {
            retObj.hasOwnProperty(currentKey) ? true : retObj[currentKey] = currentProperty;
          }
        }

      }
    }
    return (retObj);
  }
};
