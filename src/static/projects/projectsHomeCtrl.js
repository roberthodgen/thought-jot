(function() {

	var app = angular.module('app.projectsHomeCtrl', []);

	app.controller('app.projectsHomeCtrl', ['$scope', 'app.appFactory', 'ndb_users.userFactory', 'app.projectFactory', function($scope, appFactory, userFactory, projectFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectsHomeCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'Projects',
				'navActive': 'projects'
			});

			$scope.user = {};
			$scope.userLoaded = false;
			$scope.hasUser = false;

			$scope.projects = {};
			$scope.projectsLoaded = true;

			userFactory.user().then(function(response) {
				$scope.userFactory = true;
				if (response.hasOwnProperty('user')) {
					$scope.user = response.user;
					$scope.hasUser = true;

					projectFactory.projects().then(function(response) {
						$scope.projectsLoaded = true;
						if (!response.error) {
							// Success
							$scope.projects = response;
						} else {
							// Error
						}
					});
				}
			});
		};

		$scope.login = function() {
			console.log('[app.projectsHomeCtrl] $scope.login: called');
		};


		// Init
		$scope.init();
	}]);

})();