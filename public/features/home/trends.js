angular.module('smartNews.home')

.controller('TopTrendsCtrl', function($scope, $http, TopTrendsFactory, renderGraph) {
  var sanitizeTitle = TopTrendsFactory.sanitizeTitle;
  //$scope.topTrends = TopTrendsFactory.topTrends;
  console.log('inside toptrendsctrl', $scope.newTopTrends);
  //for(var i = 0; i<$scope.newTopTrends.length; i++) 
    $scope.newTopTrends.forEach(function (item,i) {
    var chartUrl = '/results/' + $scope.newTopTrends[i].topic;

    $http({
      method: 'GET',
      url: chartUrl
    })
    .then(
      function(obj){
        renderGraph.renderGraph(obj,i);
        // render source donut
        console.log(obj, 'obj');
        renderGraph.renderSources(obj.data.trends);
      },
      function(error){
        console.log('Error', error);
      }
    );
  });


  $scope.topTrends = $scope.newTopTrends;
  $scope.selectArticle = function (topic) {

    var title = sanitizeTitle(topic.articleTitle);
    TopTrendsFactory.getPrimaryArticle(title)
    .then(function (article) {
      TopTrendsFactory.primaryArticle[0] = article.data.stories[0];
    });
  };

});