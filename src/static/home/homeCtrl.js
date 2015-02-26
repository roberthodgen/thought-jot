(function() {

	var app = angular.module('app.homeCtrl', []);

	app.controller('app.homeCtrl', ['$scope', 'app.appFactory', 'ndb_users.userFactory', function($scope, appFactory, userFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.homeCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': null
			});

			$scope.user = {};
			$scope.userLoaded = false;
			$scope.hasUser = false;

			userFactory.user().then(function(response) {
				$scope.userFactory = true;
				if (response.hasOwnProperty('user')) {
					$scope.user = response.user;
					$scope.hasUser = true;
				}
			});
		};

		$scope.login = function() {
			console.log('[app.homeCtrl] $scope.login: called');
		};


		// Init
		$scope.init();
	}]);

})();