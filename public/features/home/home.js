angular.module('smartNews.home', ['smartNews.services', 'smartNews.timeline'])

// Sub-Views
.directive('primaryarticle', function(){
  return {
    templateUrl: 'features/home/primaryArticle.html',
    controller: 'PrimaryArticleCtrl'
  };
})
.directive('toptrends', function(){
  return {
    templateUrl: 'features/home/trends.html',
    controller: 'TopTrendsCtrl'
  };
})

// Home Controller
.controller('HomeCtrl', function($scope, newTopTrends) {
  $scope.test = 'Home View';
  d3.select('.sources').remove();
  console.log('insidehomectrl', newTopTrends);
  $scope.$parent.newTopTrends = newTopTrends;


});
