// var cookies = require('angular-cookies');

angular.module('smartNews', [
  'ui.router',
  'smartNews.profile',
  'smartNews.home',
  'smartNews.results',
  'ngCookies',
  'smartNews.timeline',
  'smartNews.services',
  'ngSanitize',
  'ui.bootstrap'
])

.config(function($urlRouterProvider, $stateProvider, $httpProvider) {

  $stateProvider
    .state('main', {
      url: '/main',
      templateUrl: 'features/main/main.html',
      authenticate: false
    })
    .state('main.home', {
      url: '/home',
      templateUrl: 'features/home/home.html',
      controller: 'HomeCtrl',
      authenticate: false,
      resolve: {
        getFrontPage : function ($http) {
          console.log('hi')
          return $http({
              method: 'GET',
              url: '/api/news/fetchData'
            }).then(function (results) {
              for(var i = 0; i < results.data.data.length; i++){
                //Trim keywords to top 20 for wordCloud sizing/spacing
                results.data.data[i].keywords = results.data.data[i].keywords.slice(0,20);
              }
              return results.data.data;
            });
        


        }
      }
    })

    .state('main.results', {
      url: '/results/:input',
      templateUrl: 'features/results/results.html',
      controller: 'ResultsCtrl',
      authenticate: false
    })

    .state('profile', {
      url: '/profile',
      templateUrl: 'features/profile/profile.html',
      controller: 'ProfileCtrl',
      authenticate: false
    });

  $urlRouterProvider.otherwise('/main/home');
  $httpProvider.interceptors.push('requestCookie');
})
.factory('requestCookie', function ($document, $cookies) {
  // console.log('this factory');
  return {
    request: function (request) {
      // var parsedCookie = $cookies.get('authenticate');
      // console.log(parsedCookie, 'This is my document');
      // // config.headers['x-session-token'] = SessionService.token
      // // request.session.passport = parsedCookie;
      request.xsrfCookieName = 'authenticate';
      // console.log(request, 'My request object');
      return request;
    }
  };
})

.directive('navbar', function(){
  return {
    templateUrl: 'features/nav/nav.html',
    controller: 'NavCtrl'
  };
})

.controller('SearchCtrl', function($scope, $state, $http, renderGraph, $rootScope){
  $scope.searchinput = '';

  $scope.getDropdown = function(val){
    return $http({
      method: 'GET',
      url: '/input/' + val
    })
    .then(function(response){
      var dropdown = [];
      var pages = response.data.query.pages;
      for (var i in pages){
        dropdown.push({
          title: pages[i].title,
          image: pages[i].thumbnail ? pages[i].thumbnail.source : ""
        });
      }
      return dropdown;
    });
  };

  $scope.renderView = function(topic) {
    //let renderView take in the topic when called from home scope
    if(topic !== undefined) {
      $scope.searchinput = topic;
    }
    var url = '/results/' + $scope.searchinput;
    if ($scope.searchinput) {
      $http({
        method: 'GET',
        url: url
      })
      .then(
        function(obj){
          // console.log('obj:', obj);
          $state.go('main.results', {input: $scope.searchinput, articleReceived: false})
          .then(function() {
            window.objWin = obj;
            window.renderGraphWin = renderGraph.renderGraph;
            renderGraph.renderGraph(obj);
            renderGraph.renderSources(obj.data.trends);
            //renderGraph.renderCloud(obj.data.keywords);
          });
        },
        function(error){
          console.log('Error', error);
        }
      );
    } else {
      $state.go('main.home');
    }
  };
  //Pass the renderView function to rootScope
  $rootScope.renderView = $scope.renderView;

});
