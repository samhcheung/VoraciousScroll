var aylienKeys = require('../../keys.js').aylien;
var AylienNewsApi = require('aylien-news-api');
var async = require('async');

/************* AYLIEN API HELPERS ********************/

// Instantiate AylienNewsApi model
var api = new AylienNewsApi.DefaultApi();

// Configure API ID: app_id
var app_id = api.apiClient.authentications['app_id'];
app_id.apiKey = aylienKeys.app_id;

// Configure API key: app_key
var app_key = api.apiClient.authentications['app_key'];
app_key.apiKey = aylienKeys.app_key;

var timelineData = function(input, cb) {

  // more options here: https://newsapi.aylien.com/docs/endpoints/time_series/nodejs
  // date/time formatting: https://newsapi.aylien.com/docs/working-with-dates
  // if period !== 1, start and/or end date should probably be adjusted to result in an even multiple of period. i.e. if period=7days, end minus start should be some multiple of 7 so that data is not skewed by a partial period.
  // values prior to about 3/15/2016 are consistently much lower, reason currently unknown

  var opts = {
    'title': '"' + input + '"',
    'language': ['en'],
    // 'publishedAtStart': '2016-03-15T00:00:00Z',
    'publishedAtStart': 'NOW-175DAYS',
    'publishedAtEnd': 'NOW',
    'sortBy': 'relevance',
    // 'period': '+1DAYS'
  };

  api.listTimeSeries(opts, function(err, data) {
    if (err) { throw err; }
    console.log('TimeSeries returned successfully: ' + data);
    cb(null, data);
  });
};

var articleImport = function(input, res, start, end, limit) {
  limit = 5;
  var opts = {
    'title': input,
    // 'text': input,
    'language': ['en'],
    'sortBy': 'relevance',
    'publishedAtStart': start,
    'publishedAtEnd': end,
    'perPage': limit,
  };

  api.listStories(opts, function(err, data) {
    if (err) { throw err; }
    console.log('Stories returned successfully: ' + data);
    res.send(data);
  });

};

var getMedia = function(input, start, end, cb) {
  limit = 5;
  var opts = {
    'title': input,
    // 'text': input,
    'language': ['en'],
    'sortBy': 'relevance',
    '_return': ['media'],
    'perPage': limit,
  };
  api.listStories(opts, function(err, data) {
    if (err) { throw err; }
    var url = data.stories[0] ? data.stories[0].media[0].url : 'http://www.designjenesis.com/web120/a6/images/unavailable.png'
    console.log('media returned successfully: ' + url);
    

    cb(null, url);
  });

}

// Get list of news sources and number of articles in past 175 days BY TITLE

var getSources = function(input, start, end, cb) {
  start = start || 'NOW-175DAYS';
  end = end || 'NOW';
  // stories = stories || {};

  var opts = {
    'title': input,
    'field': 'source.name',
    'language': ['en'],
    'sourceLocationsCountry': ['US'],
    'publishedAtStart': start,
    'publishedAtEnd': end
  };

  api.listTrends(opts, function(err, data) {
    if (err) {
      console.log('error getting sources', err);
    } else {
      console.log('Sources returned successfully: ' + data);
      // console.log( data.trends.slice(0, 4));
      var sources = data.trends.slice(0, 10);
      cb(null, sources);
    }
  });
};

var getKeywords = function(input, start, end, cb) {
  start = start || 'NOW-175DAYS';
  end = end || 'NOW';

  var opts = {
    'title': '"' + input + '"',
    'language': ['en'],
    'sortBy': 'relevance',
    'publishedAtStart': start,
    'publishedAtEnd': end,
    'perPage': 100,
    'field': 'keywords'
  };

  api.listTrends(opts, function(err, data) {
    if (err) { throw err; }
    console.log('Keywords returned successfully: ' + data);
    var keywords = data.trends;
    cb(null, keywords);
  });
};

var getSentiment = function(input, start, end, cb) {
  start = start || 'NOW-175DAYS';
  end = end || 'NOW';

  var opts = {
    'title': '"' + input + '"',
    'language': ['en'],
    'publishedAtStart': start,
    'publishedAtEnd': end,
    'sortBy': 'relevance',
    'perPage': 100,
    'field': 'sentiment.body.polarity'
  };

  api.listTrends(opts, function(err, data) {
    if (err) { throw err; }
    console.log('Sentiment returned successfully: ' + data);
    var sentiment = data.trends;
    cb(null, sentiment);
  });
};

var getAnalysis = function(data, input, start, end, cb) {
  data.topic = input;
  async.parallel({
    timeline: function(callback) {
      timelineData(input, callback);
    },
    sources: function(callback) {
      getSources(input, start, end, callback);
    },
    keywords: function(callback) {
      getKeywords(input, start, end, callback);
    },
    sentiment: function(callback) {
      getSentiment(input, start, end, callback);
    },
    img: function(callback) {
      getMedia(input, start, end, callback)
    }
  }, function(err, results) {
    if (err) { throw err; }
    for (var key in results) {
      data[key] = results[key];
    }
    cb(data);
  });
};

module.exports = {
  timelineData: timelineData,
  articleImport: articleImport,
  getAnalysis: getAnalysis
};