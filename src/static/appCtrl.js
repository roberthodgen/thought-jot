(function() {

	var app = angular.module('app.appCtrl', []);

	app.controller('app.appCtrl', ['$scope', 'app.appFactory', 'ndb_users.userFactory', function($scope, appFactory, userFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.appCtrl] $scope.init(): call');

			$scope.config = appFactory.config();

			$scope.user = {};
			$scope.hasUser = false;
			$scope.userLoaded = false;

			$scope.$watch(function() {
				return userFactory.user();
			}, function() {
				console.log('[app.appCtrl] $scope.$watch: userFactory.user() changed');

				userFactory.user().then(function(response) {
					$scope.userLoaded = true;
					if (response.hasOwnProperty('user')) {
						$scope.user = response.user;
						$scope.hasUser = true;
					}
				});
			});
		};


		// Init
		$scope.init();
	}]);

})();