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

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;
					$hasUser = true;
				} else {
					alert('Error loading User.');
				}
			});
		};


		// Init
		$scope.init();
	}]);

})();