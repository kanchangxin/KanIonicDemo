// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            //极光推送
            window.plugins.jPushPlugin.init();

            //初始化友盟统计配置
            window.plugins.umengAnalyticsPlugin.init();
            //调试模式
            //window.plugins.umengAnalyticsPlugin.setDebugMode(true);

            //注意，这段代码是应用退出前保存统计数据，请在退出应用前调用
            //window.plugins.umengAnalyticsPlugin.onKillProcess();

            console.log("启动成功！")

        });
    })
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        //andoird 底部出现在了上部 解决方案
        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('standard');
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html",
                controller: "IndexCtrl"
            })

            .state('tab.index', {
                url: '/index',
                // cache: 'false',
                views: {
                    'tab-index': {
                        templateUrl: 'templates/tab-index.html',
                        controller: 'IndexCtrl'
                    }
                }
            })

            .state('welcome', {
                url: '/welcome',
                abstract: true,
                templateUrl: 'templates/welcome/welcome.html',
                controller: 'Welcome'
            })

            .state('welcome.w_page', {
                url: '/w_page',
                views: {
                    'welcome': {
                        templateUrl: 'templates/welcome/w_page.html',
                        controller: 'Welcome'
                    }
                }
            })

        // if none of the above states are matched, use this as the fallback
        // console.log(!window.localStorage['first']);
        if (!window.localStorage['first']) {
            $urlRouterProvider.otherwise('/welcome/w_page');
        } else {
            // $urlRouterProvider.otherwise('/tab/index');
            $urlRouterProvider.otherwise('/tab/index');
        }

    });
