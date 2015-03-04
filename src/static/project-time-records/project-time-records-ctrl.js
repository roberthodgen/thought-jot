(function() {

	var app = angular.module('app.projectTimeRecordsCtrl', []);

	app.controller('app.projectTimeRecordsCtrl', ['$scope', '$location', '$routeParams', '$filter', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, $routeParams, $filter, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectTimeRecordsCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'Loading...',
				navbar: {
					title: 'Loading...',
					link: $location.path()
				}, sidebar: {
					selection: $routeParams.projectId
				}, projectsNav: {
					selection: 'time-records'
				}
			});

			$scope.projectId = $routeParams.projectId;

			$scope.search = {
				name: ''
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

							var _search = $location.search();

							// Search for uncompleted Time Records (to start the counter)
							var _keys = Object.keys(response);
							for (var i = _keys.length - 1; i >= 0; i--) {

								// Delete our temp `_edit` property
								if (response[_keys[i]].id === _search.edit) {
									response[_keys[i]]._edit = true;
									response[_keys[i]]._name = angular.copy(response[_keys[i]].name);
								} else {
									delete response[_keys[i]]._edit;
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

							// Add this Project to the uncompleted seconds watcher...
							dataFactory.uncompletedSecondsWatchAddProjectId(response.id);

							appFactory.config({
								pageTitle: response.name,
								navbar: {
									title: response.name
								}, sidebar: {
									selection: response.id
								}
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

		// Watch for changes in the `edit` search parameter...
		$scope.$watch(function() {
			var _search = $location.search();
			return _search.edit;
		}, function(newValue, oldValue) {
			// Loop through and delete all not equal to this `newValue`
			console.log('[app.projectTimeRecordsCtrl] $scope.$watch(): Detected new `edit` search value: '+newValue);
			var _keys = Object.keys($scope.timeRecords);
			if (angular.isString(newValue)) {
				// Loop through and delete all but this key
				for (var i = _keys.length - 1; i >= 0; i--) {
					if ($scope.timeRecords[_keys[i]].id != newValue) {
						delete $scope.timeRecords[_keys[i]]._edit;
						delete $scope.timeRecords[_keys[i]]._name;
					} else {
						$scope.timeRecords[_keys[i]]._edit = true;
						$scope.timeRecords[_keys[i]]._name = angular.copy($scope.timeRecords[_keys[i]].name);
					}
				}
			} else {
				// Loop through all and remove `_edit` and `_name`
				for (var i = _keys.length - 1; i >= 0; i--) {
					delete $scope.timeRecords[_keys[i]]._edit;
					delete $scope.timeRecords[_keys[i]]._name;
				}
			}
		});

		$scope.createTimeRecord = function() {
			dataFactory.createTimeRecord($scope.projectId).then(function(response) {
				if (response.error) {
					alert('Error creating Time Record: '+response.message);
				}
			});
		};

		$scope.timeRecordClick = function(timeRecord) {
			$location.search('edit', timeRecord.id);
		};

		$scope.backgroundClick = function() {
			// Remove the edit search property
			var _search = $location.search();
			$location.search('edit', null);
		};


		// Init
		$scope.init();

		// Destroy
		$scope.$on('$destroy',  function() {
			// Remove this Project from the uncompleted seconds watcher...
			dataFactory.uncompletedSecondsWatchRemoveProjectId($scope.project.id);
		});
	}]);

})();