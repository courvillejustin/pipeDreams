var svn = require('svn-interface');
/**
 * getSvnFiles takes in the SVN URL and the destination folder to grab the files from and dump into a folder.
 * @param  {String} url the url of the SVN repository
 * @param  {String} wc  the working copy folder, i.e the destination of the folder being copied from the SVN
 * @return {String}     on end the stream will emit the working directory to pass along to another stream
 */
module.exports =  function(url,wc,next) {
  var self = this;
  svn.checkout(url,wc,function(){
    next(wc);
  });

};
