(function() {

	var app = angular.module('app.projectDetailCtrl', []);

	app.controller('app.projectDetailCtrl', ['$scope', '$location', '$routeParams', 'app.appFactory', 'ndb_users.userFactory', 'app.projectFactory', function($scope, $location, $routeParams, appFactory, userFactory, projectFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectDetailCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'Project',
				'navActive': 'projects'
			});

			$scope.projectId = $routeParams.projectId;

			$scope.user = {};
			$scope.userLoaded = false;
			$scope.hasUser = false;

			$scope.project = {};
			$scope.projectLoaded = true;

			userFactory.user().then(function(response) {
				$scope.userFactory = true;
				if (response.hasOwnProperty('user')) {
					$scope.user = response.user;
					$scope.hasUser = true;

					projectFactory.project($scope.projectId).then(function(response) {
						$scope.projectLoaded = true;
						if (!response.error) {
							// Success
							$scope.project = response;

							appFactory.config({
								'pageTitle': response.name
							});
						} else {
							// Error
						}
					});
				} else {
					// Not logged in
					$location.path('/login');
				}
			});
		};


		// Init
		$scope.init();
	}]);

})();