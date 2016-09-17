angular.module('smartNews')

.controller('NavCtrl', function($scope, $http, $cookies, $location, isAuth) {

  $scope.isAuth = function(){
    $scope.user = isAuth();
    return !!isAuth();
  };

  $scope.goToProfile = function(){

  }

  $scope.logout = function() {
    $cookies.remove('authenticate');
    $location.url('/');
  };

});