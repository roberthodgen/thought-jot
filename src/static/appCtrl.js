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

					
				} else {
					alert('Error loading User.');
				}
			});

			$scope.config.sidebar.show = false;
		};

		$scope.toggleSidebar = function() {
			console.log('[app.appCtrl] toggleSidebar(): Called.');

			if ($scope.config.sidebar.show) {
				$scope.config.sidebar.show = false;
			} else {

				dataFactory.projects().then(function(response) {
					$scope.projectsLoaded = true;
					if (!response.error) {
						$scope.projects = response;
					}
				});

				$scope.config.sidebar.show = true;
			}
		};

		$scope.wrapperClick = function() {
			if ($scope.config.sidebar.show) {
				console.log('[app.appCtrl] wrapperClick(): Called.');
				$scope.config.sidebar.show = false;
			}
		};


		// Init
		$scope.init();
	}]);

})();