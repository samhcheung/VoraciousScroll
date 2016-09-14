var aylienKeys = require('../../keys.js').aylien;
var AylienNewsApi = require('aylien-news-api');

/************* AYLIEN API HELPERS ********************/

// Instantiate AylienNewsApi model
var api = new AylienNewsApi.DefaultApi();

// Configure API ID: app_id
var app_id = api.apiClient.authentications['app_id'];
app_id.apiKey = aylienKeys.app_id;

// Configure API key: app_key
var app_key = api.apiClient.authentications['app_key'];
app_key.apiKey = aylienKeys.app_key;

var timelineData = function(input, res) {

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
    if (err) {
      console.log('<------ERROR--------->', err);
    } else {
      console.log('API called successfully. Returned data: ' + data);
      getSources(input, res, data);

      // res.send(data);
    }
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
    if (err) {
      console.log('<------ERROR--------->', err);
    } else {
      console.log('API called successfully. Returned data: ' + data);
      res.send(data);
    }
  });

};

// Get list of news sources and number of articles in past 175 days BY TITLE

var getSources = function(input, res, stories) {
  stories = stories || {};
  var opts = {
    'title': input,
    'field': 'source.name',
    'language': ['en'],
    'sourceLocationsCountry': ['US'],
    'publishedAtStart': 'NOW-175DAYS',
    'publishedAtEnd': 'NOW'
  };

  api.listTrends(opts, function(err, data) {
    if (err) {
      console.log('error getting sources', err);
    } else {
      console.log('sources returned successfully: ' + data);
      // console.log( data.trends.slice(0, 4));
      stories.trends = data.trends.slice(0, 10);
      res.send(stories);
    }
  });
};

var topicKeywords = function(input, start, end, cb) {
  var opts = {
    'title': '"' + input + '"',
    'language': ['en'],
    'sortBy': 'relevance',
    'publishedAtStart': start,
    'publishedAtEnd': end,
    'perPage': 100,
    'field': 'keywords'
  };

  var keywords = {};

  api.listTrends(opts, function(err, data) {
    if (err) { throw err; }
    keywords = data.trends;
    cb(keywords);
  });
};

var topicSentiment = function(input, start, end, cb) {
  var opts = {
    'title': '"' + input + '"',
    'language': ['en'],
    'publishedAtStart': start,
    'publishedAtEnd': end,
    'sortBy': 'relevance',
    'perPage': 100,
    'field': 'sentiment.body.polarity'
  };

  var sentiment = {};

  api.listTrends(opts, function(err, data) {
    if (err) { throw err; }
    sentiment = data.trends;
    cb(sentiment);
  });
};

module.exports = {
  timelineData: timelineData,
  articleImport: articleImport,
  getSources: getSources,
  topicKeywords: topicKeywords,
  topicSentiment: topicSentiment
};