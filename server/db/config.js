var mongoose = require('mongoose');
var prefetchWorker = require('../news-apis/workers.js');

mongoose.connect('mongodb://localhost/voraciousscroll');

// setInterval(function() {
//     console.log('<<<<<<<<<<<<<<<<<<<<worker!>>>>>>>>>>>>>>>>>>>')
//     prefetchWorker();
//   }, 30000);

module.exports = mongoose;