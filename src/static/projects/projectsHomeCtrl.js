(function() {

	var app = angular.module('app.projectsHomeCtrl', []);

	app.controller('app.projectsHomeCtrl', ['$scope', '$location', '$filter', '$interval', 'app.appFactory', 'projects', function($scope, $location, $filter, $interval, appFactory, projects) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectsHomeCtrl] $scope.init(): Called.');
			appFactory.config({
				'pageTitle': 'Projects'
			});

			$scope.search = {
				'name': ''
			};

			$scope.projects = projects;
			$scope.activeResults = [];
			$scope.inProgressProjects = [];
			$scope.inProgressResults = [];
			
			// Search for uncompleted Time Records (to start the counter)
			var keys = Object.keys($scope.projects);
			for (var i = keys.length - 1; i >= 0; i--) {
				if ($scope.projects[keys[i]].has_uncompleted_time_records) {
					$scope.startUncompletedSecondsCount();
				}
			}
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

							dataFactory.projectUncompletedUpdate(keys[ki]);
							
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

		// Watch for changes in $scope.inProgressResults (an alias from an ngRepeat), to update our inProgressProjects (used for count; hiding the section)
		$scope.$watch(function() {
			return $scope.inProgressResults;
		}, function(newValue, oldValue) {
			$scope.inProgressProjects = $filter('filterInProgressProjects')($scope.projects);
		});


		// Init
		$scope.init();

		// Cleanup
		$scope.$on('$destroy',  function() {
			// Stop the uncompleted seconds interval, if it's running
			$scope.stopUncompletedSecondsCount();
		});
	}]);

})();