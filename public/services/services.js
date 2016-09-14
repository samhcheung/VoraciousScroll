angular.module('smartNews.services', ['ngCookies'])

.factory('isAuth', function($cookies) {
  return function() {
    var auth = $cookies.get('authenticate');
    if (auth && auth !== 'undefined') {
      var parsedAuth = JSON.parse(auth.slice(2)).user;
      return {
        firstname: parsedAuth.firstname,
        lastname: parsedAuth.lastname,
        picture: parsedAuth.picture,
      };
    }
    return null;
  };
})

.factory('saveArticle', function($http) {
  return function(article) {
    $http({
        method: 'POST',
        data: article,
        url: '/article'
      })
      .then(function(data) {
        console.log('success posting', data);
      });
  };
})

.factory('unsaveArticle', function($http) {
  return function(article, cb) {
    var url = '/unsavearticle/' + article._id;
    $http({
      method: 'DELETE',
      url: url
    })
    .then(function(data){
      console.log('success deleting', data);
      cb();
    });
  };
})

.factory('getSavedSearches', function($http) {
  return function(cb) {
    $http({
      method: 'GET',
      url: '/profile'
    })
    .then(function(data){
      data.data.forEach(function(e){
        e.formattedPublishDate = moment(e.publishDate).format('MMM DD YYYY');
        e.formattedSavedDate = moment(e.savedDate).format('MMM DD YYYY');
      });
      cb(data.data);
    });
  };
})

.factory('TopTrendsFactory', function($http, $sanitize) {
  var topTrends = [];
  var primaryArticle = [];

  var formattedTopic = function(topic) {
    return {
      topic: topic.title[0],
      articleTitle: topic['ht:news_item'][0]['ht:news_item_title'][0],
      traffic: topic['ht:approx_traffic'][0],
      img: 'http://' + topic['ht:picture'][0].slice(2),
      articleLink: topic['ht:news_item'][0]['ht:news_item_url'][0],
      articleSource: topic['ht:news_item'][0]['ht:news_item_source'][0]
    };
  };

  var getPrimaryArticle = function(topic) {
    var publishStart = 'NOW-2DAYS';
    var publishEnd = 'NOW';

    var url = '/seearticle?input=' + topic + '&start=' + publishStart + '&end=' + publishEnd + '&limit=1';
    return $http({
        method: 'GET',
        url: url
      })
      .then(function(article) {
        return article;
      });
  };

  var topTrendsGoogleTrends = function() {
    return $http({
        method: 'GET',
        url: '/api/news/topTrendsDetail'
      })
      .then(function(response) {
        response.data.forEach(function(topic, index) {
          if (index === 0) {
            var title = sanitizeTitle(formattedTopic(topic).articleTitle);
            getPrimaryArticle(title)
              .then(function(article) {
                primaryArticle.push(article.data.stories[0]);
              });
          }
          topTrends.push(formattedTopic(topic));
        });
      });
  };

  var setPrimaryArticle = function(article) {
    primaryArticle[0] = article;
  };

  var sanitizeTitle = function(title) {
    return title.replace(/<b>/g, '')
      .replace(/<b>/g, '')
      .replace(/&#39;/g, '');
  };

  topTrendsGoogleTrends();

  return {
    topTrends: topTrends,
    primaryArticle: primaryArticle,
    setPrimaryArticle: setPrimaryArticle,
    getPrimaryArticle: getPrimaryArticle,
    sanitizeTitle: sanitizeTitle
  };
});



// window.update = update;
