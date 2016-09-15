angular.module('smartNews.results', [])

.controller('ResultsCtrl', function($scope, $stateParams, $http, isAuth, saveArticle, renderGraph) {

  $scope.articleReceived = $stateParams.articleReceived;

  $scope.selectedDate = renderGraph.selectedDate;

  $scope.isAuth = function() {
    $scope.user = isAuth();
    return !!isAuth();
  };


  $scope.clickSave = function(el){
    var now = new Date();

    var article = {
      title: el.title,
      author: el.author.name,
      publishDate: el.publishedAt,
      savedDate: now,
      articleLink: el.links.permalink,
      articleSource: el.source.name,
      img: el.media[0].url,
      body: el.body
    };
    saveArticle(article);
  };

  $scope.getArticle = function() {
    //Load the chart if taken to this results area
    var input = $stateParams.input;

    var chartUrl = '/results/' + input;
    if (input) {
      $http({
        method: 'GET',
        url: chartUrl
      })
      .then(
        function(obj){
          renderGraph.renderGraph(obj.data.timeline);

          // render source donut
          console.log(obj, 'obj');
          renderGraph.renderSources(obj.data.sources);
        },
        function(error){
          console.log('Error', error);
        }
      );
    } else {
      $state.go('main.home');
    }

    var publishStart = $scope.selectedDate.startDate;
    var publishEnd = $scope.selectedDate.endDate;

    var articleUrl = '/seearticle?input=' + '"'+ input +'"' + '&start=' + publishStart + '&end=' + publishEnd;

    $http({
      method: 'GET',
      url: articleUrl
    }).then(
      function(data) {
        $scope.articleReceived = true;
        $scope.articles = data.data.stories;
        $scope.trends = data.data.trends;
      },
      function(err) {
        console.log('THERE WAS AN ERROR RECEIVING DATA FROM SEEARTICLE', err);
      }
    );
  };
  // Render article
  $scope.getArticle();
  // Render new articles on graph click
  $scope.$on('user:clickDate', function(event, data) {
    $scope.getArticle();
    //$scope.getWords();
  });

})
.directive('resultarticle', function() {
  return {
    templateUrl: 'features/results/article.html'
  };
});

