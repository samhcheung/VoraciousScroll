var aylien = require('../news-apis/aylien-helpers.js');
var googleTrends = require('../news-apis/google-trends-helpers.js');
var memStore = require('../db/memStore.js');
var async = require('async');

module.exports = prefetchWorker = function() {
  googleTrends.hotTrendsDetail(null, 5, 'US', function(list) {
    memStore.list = list;
    // memStore.date = current;
    // memStore.count = 0;
    console.log(memStore);
    
    async.parallel({
      one: function(callback) {
        memStore.data[0].img = 'http://' + memStore.list[0]['ht:picture'][0].slice(2);
        memStore.data[0].traffic = memStore.list[0]['ht:approx_traffic'][0];
        aylien.getAnalysis(memStore.data[0], list[0].title[0], callback);
      },
      two: function(callback) {
        memStore.data[1].img = 'http://' + memStore.list[1]['ht:picture'][0].slice(2);
        memStore.data[1].traffic = memStore.list[1]['ht:approx_traffic'][0];
        aylien.getAnalysis(memStore.data[1], list[1].title[0], callback);
      },
      three: function(callback) {
        memStore.data[2].img = 'http://' + memStore.list[2]['ht:picture'][0].slice(2);
        memStore.data[2].traffic = memStore.list[2]['ht:approx_traffic'][0];
        aylien.getAnalysis(memStore.data[2], list[2].title[0], callback);
      },
      four: function(callback) {
        memStore.data[3].img = 'http://' + memStore.list[3]['ht:picture'][0].slice(2);
        memStore.data[3].traffic = memStore.list[3]['ht:approx_traffic'][0];
        aylien.getAnalysis(memStore.data[3], list[3].title[0], callback);
      },
      five: function(callback) {
        memStore.data[4].img = 'http://' + memStore.list[4]['ht:picture'][0].slice(2);
        memStore.data[4].traffic = memStore.list[4]['ht:approx_traffic'][0];
        aylien.getAnalysis(memStore.data[4], list[4].title[0], callback);
      }
    }, function(err, results) {
      console.log(results, 'asyncresults');
    });


    // // for each topic get keywords, sentiment, sources, timeline
    // for (var i = 0; i < 5; i++) {
    //   // memStore.data[i].topic = memStore.list[i].title[0];
    //   memStore.data[i].img = 'http://' + memStore.list[i]['ht:picture'][0].slice(2);
    //   memStore.data[i].traffic = memStore.list[i]['ht:approx_traffic'][0];
    //   aylien.getAnalysis(memStore.data[i], list[i].title[0], function (data) {
    //     //back from getAnalysis - memStore is populated(?)
    //     memStore.count = memStore.count + 1;
    //   });
    
  });

  // get new data each hour

  
};