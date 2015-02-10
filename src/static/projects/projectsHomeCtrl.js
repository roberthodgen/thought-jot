(function() {

	var app = angular.module('app.projectsHomeCtrl', []);

	app.controller('app.projectsHomeCtrl', ['$scope', '$location', '$filter', '$interval', 'app.appFactory', 'ndb_users.userFactory', 'app.projectFactory', function($scope, $location, $filter, $interval, appFactory, userFactory, projectFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectsHomeCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'Projects',
				'navActive': 'projects'
			});

			$scope.search = '';

			$scope.user = {};
			$scope.userLoaded = false;
			$scope.hasUser = false;

			$scope.projects = {};
			$scope.projectsLoaded = true;
			$scope.activeProjects = [];
			$scope.activeResults = [];	// After search
			$scope.inProgressProjects = [];
			$scope.inProgressResults = [];	// After search

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

							// Filter active and in progress projects
							$scope.activeProjects = $filter('filterActiveProjects')(response);
							$scope.inProgressProjects = $filter('filterInProgressProjects')(response);

							// Search for uncompleted Time Records (to start the counter)
							var keys = Object.keys(response);
							for (var i = keys.length - 1; i >= 0; i--) {
								if (response[keys[i]].has_uncompleted_time_records) {
									$scope.startUncompletedSecondsCount();
								}
							}
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

		$scope.startUncompletedSecondsCount = function() {
			/*

				Uncompleted Second counts are stored as a `_uncompleted` property on the Project and each Time Record.

				The `_uncompleted` property is updated as necessary by this internval and its function.

			*/

			if ($scope.uncompletedSecondsInterval == null) {

				console.log('Uncompleted Seconds Interval: Start')
				$scope.uncompletedSecondsInterval = $interval(function() {

					// The number of seconds since the UNIX Epoch
					var nowSeconds = (Date.now() / 1000);

					var keys = Object.keys($scope.projects);
					var ki;
					for (ki = keys.length - 1; ki >= 0; ki--) {
						if ($scope.projects[keys[ki]].has_uncompleted_time_records) {

							projectFactory.projectUncompletedUpdate(keys[ki]);
							
						}
					}
				}, 333);
			}
		};

		$scope.stopUncompletedSecondsCount = function() {
			console.log('Uncompleted Seconds Interval: Stop');
			$interval.cancel($scope.uncompletedSecondsInterval);
			$scope.uncompletedSecondsInterval = null;
		};


		// Init
		$scope.init();

		// Destroy
		$scope.$on('$destroy',  function() {
			// Stop the uncompleted seconds interval, if it's running
			$scope.stopUncompletedSecondsCount();
		});
	}]);

})();