angular.module('ionicApp', ['ionic'])
  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {


  })

  .controller('HomeTabCtrl', function ($scope) {
    $scope.questions=[1,2,3,4]
    $scope.$on('$ionicView.loaded', function (event, viewData) {
      console.log("test in home")

    });


    $scope.$on('$ionicView.unloaded', function (event, viewData) {
      console.log("unloaded in home")

    });
    $scope.$on('$ionicView.enter', function (event, viewData) {
      console.log("enter in home")

    });
    $scope.$on('$ionicView.leave', function (event, viewData) {
      console.log("leave in home")

    });
  });
