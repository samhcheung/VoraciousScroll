var alchemyKeys = require('../../keys.js').alchemy;

var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI(alchemyKeys.apiKey);

var getKeywords = function(websites, res) {

  var results = {};

  websites.forEach(function(url) {
    alchemy.keywords(url, {}, function(err, response) {
      if (err) { throw err; }

      // See http://www.alchemyapi.com/api/keyword/htmlc.html for format of returned object
      var keywords = response.keywords;

      keywords.forEach(function(key) {
        if (!results[key]) { results[key] = 0; }
        results[key]++;
      });
      
    });
  });

  return results;
};