var  fs = require('fs'), mergeStream =  require('merge-stream');
/**
 * mergeFilesInDir - takes a directory as input through a stream, and reads the dir merging the readStreams and outputs the merged stream
 * @return {Stream} - a stream containing all the files in the directory.
 */
module.exports=  function(data,next){
  var retVal;
      var merged = mergeStream();
      fs.readdir(data,function(err,files){
          if (err){
            console.log('Invalid year or month make sure the year is in the format YYYY and month is MM i.e -y 2014 -m 01');
            throw err;
          }
          files.forEach(function(file){
            if(file !='.svn'){
              merged.add(fs.createReadStream(data+'/'+file))
            }
          });
          next(merged);
      });
};
