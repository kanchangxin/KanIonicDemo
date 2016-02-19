/*starry*/
angular.module('starter.controllers', [])

//自动获取焦点
    .directive('focusMe', function ($timeout, $parse) {
        return {
            link: function (scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                scope.$watch(model, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
            }
        }
    })

    .constant('ApiEndpoint', {
        url: 'http://m2.cosjii.com'
    })

    .controller('IndexCtrl', function ($scope, $ionicModal, $state, $timeout) {

    })

    .controller('Welcome', function ($scope, $ionicModal, $state, $timeout) {
        $scope.guideFlag = 'a';
        $scope.guideSure = function () {
            $state.go('tab.index');
            window.localStorage['first'] = '1';
        };

        $scope.onSwipeLeft = function () {
            var obj = document.getElementById('guide-wrapper');
            var ulObj = document.getElementById('guide-arrow');
            var w = obj.children[0].offsetWidth;
            var totalW = w * (obj.children.length - 1);
            var totalWe = w * (obj.children.length - 2)
            if (Math.abs(obj.dataset.value) >= totalW) {
                return;
            }
            ;
            if (Math.abs(obj.dataset.value) >= totalWe) {
                $scope.guideFlag = 'b';
            }
            ;
            var g = obj.dataset.value - w;
            obj.style.webkitTransform = 'translateX(' + g + 'px)' + 'translateZ(0)';
            obj.style.transform = 'translateX(' + g + 'px)' + 'translateZ(0)';
            ulObj.children[Math.abs(g / w) - 1].className = '';
            ulObj.children[Math.abs(g / w)].className = 'active';
            obj.dataset.value = g;
        };

        $scope.onSwipeRight = function () {
            $scope.guideFlag = 'a';
            var obj = document.getElementById('guide-wrapper');
            var w = obj.children[0].offsetWidth;
            var totalW = w * (obj.children.length - 1);
            if (Math.abs(obj.dataset.value) == 0) {
                return;
            }
            ;
            var g = parseInt(obj.dataset.value) + parseInt(w);
            obj.style.webkitTransform = 'translateX(' + g + 'px)' + 'translateZ(0)';
            obj.style.transform = 'translateX(' + g + 'px)' + 'translateZ(0)';
            $timeout(function () {
                var ulObj = document.getElementById('guide-arrow');
                ulObj.children[Math.abs(g / w) + 1].className = '';
                ulObj.children[Math.abs(g / w)].className = 'active';
                if (Math.abs(g / w) == ulObj.children.length - 2) {
                    ulObj.children[0].className = '';
                }
            });
            obj.dataset.value = g;
        };

    })
