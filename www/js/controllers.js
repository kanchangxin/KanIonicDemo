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

    .controller('ScreenOrientationLock', function ($scope ) {
        $scope.$on('$ionicView.enter', function( ){
            try{
                alert("当前屏幕朝向："+screen.orientation)
            }catch(e){
                alert(e);
            }
        });

    })
    .controller('Landscape', function ($scope, $ionicModal, $ionicPopup) {

        $scope.$on('$ionicView.enter', function( ){
            try{
                screen.lockOrientation('landscape');
                alert(screen.orientation)
            }catch(e){
                alert(e);
            }
        });
        $scope.$on('$ionicView.beforeLeave', function( ){
            try{
                screen.unlockOrientation();
            }catch(e){
                alert(e);
            }
        });
    })
    .controller('Portrait', function ($scope, $ionicPopup) {
        $scope.$on('$ionicView.enter', function( ){
            try{
                screen.lockOrientation('portrait');
                alert(screen.orientation)
            }catch(e){
                alert(e);
            }
        });
        $scope.$on('$ionicView.beforeLeave', function( ){
            try{
                 screen.unlockOrientation();
            }catch(e){
                alert(e);
            }
        });
    })