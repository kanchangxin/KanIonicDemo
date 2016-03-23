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

        $scope.alist=[1,2,3,4,5,6,7,8];



      $scope.onSwipeLeft = function() {
        //$ionicLoading.show({ template: '这是个onSwipeLeft 2 ', noBackdrop: true, duration: 2000 });
        var obj = document.getElementById('guide-wrapper');
        var w = obj.children[0].offsetWidth; //第一个子元素宽度（是对象的可见宽度，包滚动条等边线，会随窗口的显示大小改变）
        var totalW = w * (obj.children.length - 1);//n-1个元素的宽度
        if (Math.abs(obj.dataset.value) >= totalW) {//如果当前obj 元素自定义value属性值 （从0开始）大于totalW，则表示已经是最后一个元素，则不再滚动！
          return;
        };
        var g = obj.dataset.value - w;//应该向左滚动的距离。
        obj.style.webkitTransform = 'translateX(' + g + 'px)' + 'translateZ(0)';//整体向左滚动。
        obj.style.transform = 'translateX(' + g + 'px)' + 'translateZ(0)';//整体向左滚动。
        obj.dataset.value = g;
      };

      $scope.onSwipeRight = function() {
        var obj = document.getElementById('guide-wrapper');
        var w = obj.children[0].offsetWidth;
        var totalW = w * (obj.children.length - 1);
        if (Math.abs(obj.dataset.value) == 0) {
          return;
        };
        var g = parseInt(obj.dataset.value) + parseInt(w);
        obj.style.webkitTransform = 'translateX(' + g + 'px)' + 'translateZ(0)';
        obj.style.transform = 'translateX(' + g + 'px)' + 'translateZ(0)';
        obj.dataset.value = g;
      };

    });
