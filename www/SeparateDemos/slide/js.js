angular.module('ionicApp', ['ionic'])
    .config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
        $ionicConfigProvider.backButton.previousTitleText(false).text('');

        $stateProvider
            //.state('tabs', {
            //    url: "/tab",
            //    abstract: true,
            //    templateUrl: "templates/tabs.html"
            //})
            .state('home', {
                url: "/home",
                views: {
                    'aaa': {
                        templateUrl: "templates/home.html",
                        controller: 'Welcome'
                    }
                }
            })
        $urlRouterProvider.otherwise("/home");
    })
    .controller('Welcome', function($scope, $ionicModal, $state, $timeout,$ionicLoading) {

      $scope.guideFlag = 'a';
      $scope.guideSure = function() {
        $state.go('tab.index');
        window.localStorage['first'] = '1';
      };

      $scope.onSwipeLeft = function() {
        //$ionicLoading.show({ template: '这是个onSwipeLeft 2 ', noBackdrop: true, duration: 2000 });
        var obj = document.getElementById('guide-wrapper');
        var ulObj = document.getElementById('guide-arrow');
        var w = obj.children[0].offsetWidth;
        var totalW = w * (obj.children.length - 1);
        var totalWe = w * (obj.children.length - 2)
        if (Math.abs(obj.dataset.value) >= totalW) {
          return;
        };
        if (Math.abs(obj.dataset.value) >= totalWe) {
          $scope.guideFlag = 'b';
        };
        var g = obj.dataset.value - w;
        obj.style.webkitTransform = 'translateX(' + g + 'px)' + 'translateZ(0)';
        obj.style.transform = 'translateX(' + g + 'px)' + 'translateZ(0)';
        ulObj.children[Math.abs(g / w) - 1].className = '';
        ulObj.children[Math.abs(g / w)].className = 'active';
        obj.dataset.value = g;
      };

      $scope.onSwipeRight = function() {
        //$ionicLoading.show({ template: 'onSwipeRight 2', noBackdrop: true, duration: 2000 });
        $scope.guideFlag = 'a';
        var obj = document.getElementById('guide-wrapper');
        var w = obj.children[0].offsetWidth;
        var totalW = w * (obj.children.length - 1);
        if (Math.abs(obj.dataset.value) == 0) {
          return;
        };
        var g = parseInt(obj.dataset.value) + parseInt(w);
        obj.style.webkitTransform = 'translateX(' + g + 'px)' + 'translateZ(0)';
        obj.style.transform = 'translateX(' + g + 'px)' + 'translateZ(0)';
        $timeout(function() {
          var ulObj = document.getElementById('guide-arrow');
          ulObj.children[Math.abs(g / w) + 1].className = '';
          ulObj.children[Math.abs(g / w)].className = 'active';
          if (Math.abs(g / w) == ulObj.children.length - 2) {
            ulObj.children[0].className = '';
          }
        });
        obj.dataset.value = g;
      };

    });
