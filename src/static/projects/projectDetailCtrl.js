(function() {

	var app = angular.module('app.projectDetailCtrl', []);

	app.controller('app.projectDetailCtrl', ['$scope', '$location', '$routeParams', '$interval', 'app.appFactory', 'ndb_users.userFactory', 'app.projectFactory', function($scope, $location, $routeParams, $interval, appFactory, userFactory, projectFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectDetailCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'Project',
				'navActive': 'projects'
			});

			$scope.projectId = $routeParams.projectId;

			$scope.search = '';

			$scope.user = {};
			$scope.userLoaded = false;
			$scope.hasUser = false;

			$scope.project = {};
			$scope.projectLoaded = true;

			$scope.timeRecords = [];
			$scope.timeRecordsLoaded = false;

			$scope.activeResults = [];

			$scope.uncompletedSecondsInterval = null;

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

					projectFactory.timeRecords($scope.projectId).then(function(response) {
						$scope.timeRecordsLoaded = true;
						if (!response.error) {
							// Success
							$scope.timeRecords = response;

							// Search for uncompleted Time Records (to start the counter)
							for (var i = response.length - 1; i >= 0; i--) {
								if (response[i].end == null) {
									$scope.startUncompletedSecondsCount();
								}
							}
						} else {
							alert('Error loading Time Records.');
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

					// Loop through all our uncompleted Time Records, calculate their uncompleted seconds and pass this along...
					$scope.project._uncompleted = $scope.project.completed;

					for (var i = $scope.timeRecords.length - 1; i >= 0; i--) {
						if ($scope.timeRecords[i].end == null) {

							var uncompletedSeconds = nowSeconds - (Date.parse($scope.timeRecords[i].start) / 1000);
							$scope.timeRecords[i]._uncompleted = uncompletedSeconds;
							$scope.project._uncompleted += uncompletedSeconds;
						}
					};
				}, 333);
			}
		};

		$scope.stopUncompletedSecondsCount = function() {
			console.log('Uncompleted Seconds Interval: Stop');
			$interval.cancel($scope.uncompletedSecondsInterval);
			$scope.uncompletedSecondsInterval = null;
		};

		$scope.createTimeRecord = function() {
			projectFactory.createTimeRecord($scope.projectId).then(function(response) {
				if (response.hasOwnProperty('project')) {
					$scope.project = response.project;
				}
				if (response.hasOwnProperty('time_record')) {
					$scope.timeRecords.push(response.time_record);
				}
			});
		};

		$scope.editTimeRecord = function(timeRecord) {
			timeRecord._edit = true;
			timeRecord._name = timeRecord.name;
		};

		$scope.cancelTimeRecordEdit = function(timeRecord) {
			timeRecord._edit = false;
			timeRecord._name = '';
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