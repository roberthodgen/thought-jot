(function() {

	var app = angular.module('app.appCtrl', []);

	app.controller('app.appCtrl', ['$scope', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.appCtrl] $scope.init(): call');

			$scope.config = appFactory.config();

			$scope.user = {};
			$scope.hasUser = false;
			$scope.userLoaded = false;

			$scope.projects = {};
			$scope.projectsLoaded = false;

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;
					$hasUser = true;

					dataFactory.projects().then(function(response) {
						$scope.projectsLoaded = true;
						if (!response.error) {
							$scope.projects = response;
						}
					});
				} else {
					alert('Error loading User.');
				}
			});

			$scope.projectsSidebarVisible = false;
		};

		$scope.showProjects = function() {
			console.log('[app.appCtrl] showProjects(): Called.');

			if ($scope.projectsLoaded) {
				$scope.projectsSidebarVisible
			}
		};

		$scope.hideProjectsSidebar = function() {
			if ($scope.projectsSidebarVisible) {
				console.log('[app.appCtrl] hideProjectsSidebar(): Called.');
				$scope.projectsSidebarVisible = false;
			}
		};


		// Init
		$scope.init();
	}]);

})();