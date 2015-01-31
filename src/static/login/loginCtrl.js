(function() {

	var app = angular.module('app.loginCtrl', []);

	app.controller('app.loginCtrl', ['$scope', 'app.pageTitleFactory', 'ndb_users.userFactory', function($scope, pageTitleFactory, userFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.loginCtrl] $scope.init(): call');
			pageTitleFactory.setPageTitle('Log in');

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
			console.log('[app.loginCtrl] $scope.login: called');
		};


		// Init
		$scope.init();
	}]);

})();