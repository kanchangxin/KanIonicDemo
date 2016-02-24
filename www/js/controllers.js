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
        $scope.guideSure = function () {
            alert("goto tab.index")
            $state.go('tab.index');
            window.localStorage['first'] = '1';
        };
    })
