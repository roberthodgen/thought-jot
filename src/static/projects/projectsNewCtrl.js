(function() {

	var app = angular.module('app.projectsNewCtrl', []);

	app.controller('app.projectsNewCtrl', ['$scope', 'app.appFactory', 'ndb_users.userFactory', function($scope, appFactory, userFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectsNewCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'New Project',
				'navActive': 'projects'
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
			console.log('[app.projectsNewCtrl] $scope.login: called');
		};


		// Init
		$scope.init();
	}]);

})();