var mongoose = require('mongoose');
var prefetchWorker = require('../news-apis/workers.js');

mongoose.connect('mongodb://localhost/voraciousscroll');
if (process.env.NODE_ENV === 'production') {
  prefetchWorker();
  setInterval(function() {
      console.log('<<<<<<<<<<<<<<<<<<<<worker!>>>>>>>>>>>>>>>>>>>')
      prefetchWorker();
    }, 3600000);
}

module.exports = mongoose;