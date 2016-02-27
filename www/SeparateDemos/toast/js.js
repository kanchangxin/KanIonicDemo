
angular.module('mySuperApp', ['ionic'])
    .controller('PopupCtrl',function($scope, $ionicPopup, $timeout,$ionicLoading) {

        $ionicLoading.show({ template: 'Item Added! 这是个toastaaaaaaaaaa ', noBackdrop: true, duration: 3000 });

        // Triggered on a button click, or some other target
        $scope.showPopup = function() {
            $scope.data = {}

            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                //template: '<input type="password" ng-model="data.wifi">',
                templateUrl:'popup-template.html',
                title: 'Enter Wi-Fi Password',
                subTitle: 'Please use normal things',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.wifi) {
                                //don't allow the user to close unless he enters wifi password
                                e.preventDefault();
                            } else {
                                return $scope.data.wifi;
                            }
                        }
                    },
                ]
            });
            myPopup.then(function(res) {
                console.log('Tapped!', res);
            });
            $timeout(function() {
                myPopup.close(); //close the popup after 3 seconds for some reason
            }, 3000);
        };

    });
