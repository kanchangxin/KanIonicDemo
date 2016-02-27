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

    .controller('IndexCtrl', function ($scope,$http,$ionicPopup) {


        $scope.checkUpdate=function(){
            //检查更新
            checkUpdate();
        }

        function checkUpdate() {
            cordova.getAppVersion.getVersionCode(function(versionCode) {
                $http.get('http://192.168.21.194:8081/examples/a.txt').success(function(data) {
                    alert(JSON.stringify(data));
                    console.log(JSON.stringify(data));
                    if (data.error == 0) {
                        if (versionCode < data.version) {
                            showUpdateConfirm(data.desc, data.apk);
                        }else{
                            alert("当前已经是最新版本");
                        }
                    }
                }).error(function (err) {
                    alert(err);
                    console.log(JSON.stringify(err));
                })
            });
        };

        function showUpdateConfirm(desc, url) {
            var confirmPopup = $ionicPopup.confirm({
                title: '有新版本了！是否要升级？',
                template: desc,
                cancelText: '下一次',
                okText: '确定'
            });
            var url = url;
            confirmPopup.then(function(res) {
                if (res) {
                    // //调用浏览器打开下载链接，需要安装inappbrowser插件
                    window.open(url, '_system', 'location=yes');
                };
            });
        }

        /**检查网络状态*/
        $scope.checkConnection=function(){
            var networkState = navigator.connection.type;
            var states = {};
            states[Connection.UNKNOWN]  = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI]     = 'WiFi connection';
            states[Connection.CELL_2G]  = 'Cell 2G connection';
            states[Connection.CELL_3G]  = 'Cell 3G connection';
            states[Connection.CELL_4G]  = 'Cell 4G connection';
            states[Connection.CELL]     = 'Cell generic connection';
            states[Connection.NONE]     = 'No network connection';

            alert('Connection type: ' + states[networkState]);
        }
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

        $scope.playPolyVideo = function () {
            var player = polyvObject('#player_sdfpaoij4es').videoPlayer({
                'width': '600',
                'height': '337',
                'vid': 'ca1d097c8a1a4c65592f7fd341d97104_c'
            });
        }
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

    .controller('Plugin', function ($scope, $timeout) {
        $scope.showInfo=function(){
            try{
                    var extraInfo = cordova.require('cn.qtone.video.Video');
                    extraInfo.player('aa',function (suMsg){
                        alert(suMsg);
                    },function(erMsg){
                        alert(erMsg);
                    });

            }catch(e){
                alert(e);
            }
        }

        $scope.statusbar=function(){
            alert("好多方法android不支持")
            StatusBar.overlaysWebView();// #On iOS 7,

            $timeout(function() {
                StatusBar.styleDefault();//iOS 状态栏默认样式，也就是电池信号黑色；
            }, 3000);
            $timeout(function() {
                StatusBar.styleLightContent();//Use the lightContent statusbar (light text, for dark backgrounds).
            }, 6000);
            $timeout(function() {
                StatusBar.styleBlackTranslucent();// 半透明的
            }, 9000);
            $timeout(function() {
                StatusBar.styleBlackOpaque();//状态栏黑色不透明
            }, 12000);
            $timeout(function() {
                StatusBar.backgroundColorByName("red");//Android 5+
            }, 15000);
            $timeout(function() {
                StatusBar.backgroundColorByHexString("#C0C0C0");//Android 5+
            }, 18000);
            $timeout(function() {
                StatusBar.hide() ;//状态栏隐藏；  Android
            }, 21000);
            $timeout(function() {
                StatusBar.show();// 状态栏显示； Android
            }, 24000);
        }


    })
