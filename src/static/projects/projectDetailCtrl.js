(function() {

	var app = angular.module('app.projectDetailCtrl', []);

	app.controller('app.projectDetailCtrl', ['$scope', '$location', '$routeParams', '$interval', '$filter', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, $routeParams, $interval, $filter, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectDetailCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'Project',
				'navActive': 'projects'
			});

			$scope.projectId = $routeParams.projectId;

			$scope.search = {
				'name': ''
			};

			$scope.user = {};
			$scope.userLoaded = false;

			$scope.project = {};
			$scope.projectLoaded = true;

			$scope.timeRecords = {};
			$scope.timeRecordsLoaded = false;
			$scope.inProgressTimeRecords = [];
			$scope.inProgressResults = [];

			$scope.activeResults = [];

			$scope.uncompletedSecondsInterval = null;

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;

					// Redirect if not logged in
					if (!response.email) {
						$location.path('/login');
					}

					dataFactory.timeRecords($scope.projectId).then(function(response) {
						$scope.timeRecordsLoaded = true;
						if (!response.error) {
							// Success
							$scope.timeRecords = response;

							// Search for uncompleted Time Records (to start the counter)
							var _keys = Object.keys(response);
							for (var i = _keys.length - 1; i >= 0; i--) {

								// Delete our temp `_edit` property
								delete response[_keys[i]]._edit;

								// Go ahead and start the click IF there's not `end` property								
								if (response[_keys[i]].end == null && response[_keys[i]].start) {
									$scope.startUncompletedSecondsCount();
								}
							}
						} else {
							alert('Error loading Time Records.');
						}
					});

					dataFactory.project($scope.projectId).then(function(response) {
						$scope.projectLoaded = true;
						if (!response.error) {
							// Success
							$scope.project = response;

							appFactory.config({
								'pageTitle': response.name,
								'project': response
							});
						} else {
							// Error
						}
					});

					
				} else {
					alert('Error loading User.');
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
					
					dataFactory.projectUncompletedUpdate($scope.project.id);
				}, 333);
			}
		};

		$scope.stopUncompletedSecondsCount = function() {
			console.log('Uncompleted Seconds Interval: Stop');
			$interval.cancel($scope.uncompletedSecondsInterval);
			$scope.uncompletedSecondsInterval = null;
		};

		$scope.createTimeRecord = function() {
			dataFactory.createTimeRecord($scope.projectId).then(function(response) {
				if (!response.error) {
					// $scope.timeRecords[response.id] = response;
					$scope.startUncompletedSecondsCount();
				} else {
					alert('Error creating Time Record: '+response.message);
				}
			});
		};

		$scope.timeRecordShowEditControls = function(timeRecord, show) {
			if (show) {
				timeRecord._edit = true;
				timeRecord._name = timeRecord.name;
			} else {
				timeRecord._edit = false;
				timeRecord._name = '';
			}
		};

		$scope.timeRecordClick = function(timeRecord) {
			$location.search('edit', timeRecord.id);

			if (!timeRecord._edit) {
				timeRecord._edit = true;
				timeRecord._name = angular.copy(timeRecord.name);
				
				// Loop through and set all not equal to this timeRecord to false
				var _keys = Object.keys($scope.timeRecords);
				for (var i = _keys.length - 1; i >= 0; i--) {
					if ($scope.timeRecords[_keys[i]] != timeRecord) {
						delete $scope.timeRecords[_keys[i]]._edit;
						delete $scope.timeRecords[_keys[i]]._name;
					}
				}
			}
		};

		$scope.backgroundClick = function() {
			// Remove the edit search property
			var _search = $location.search();
			if (_search.hasOwnProperty('edit')) {
				// End the Time Record edit
				delete $scope.timeRecords[_search.edit]._edit;
				delete $scope.timeRecords[_search.edit]._name;
			}
			$location.search('edit', null);
		};

		// Watch for changes in $scope.inProgressResults (an alias from an ngRepeat), to update our inProgressTimeRecords (used for count; hiding the section)
		// $scope.$watch(function() {
		// 	return $scope.inProgressResults;
		// }, function(newValue, oldValue) {
		// 	$scope.inProgressTimeRecords = $filter('filterInProgressTimeRecords')($scope.timeRecords);
		// });


		// Init
		$scope.init();

		// Destroy
		$scope.$on('$destroy',  function() {
			// Stop the uncompleted seconds interval, if it's running
			$scope.stopUncompletedSecondsCount();
		});
	}]);

})();