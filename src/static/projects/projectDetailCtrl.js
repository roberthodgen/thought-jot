(function() {

	var app = angular.module('app.projectDetailCtrl', []);

	app.controller('app.projectDetailCtrl', ['$scope', '$location', '$state', '$filter', 'app.appFactory', 'app.dataFactory', 'project', 'projectId', function($scope, $location, $state, $filter, appFactory, dataFactory, project, projectId) {

		$scope.projectId = projectId;
		$scope.project = project;

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectDetailCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: $scope.project.name,
				navbar: {
					title: $scope.project.name,
					link: $state.href('app.project', { projectId: $scope.projectId })
				}, sidebar: {
					selection: $scope.projectId
				}, projectsNav: {
					selection: 'overview'
				}
			});

			$scope.search = {
				name: ''
			};

			$scope.timeRecords = {};
			$scope.timeRecordsLoaded = false;
			$scope.inProgressTimeRecords = [];
			$scope.inProgressResults = [];

			$scope.activeResults = [];

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

						// Go ahead and start the click IF there's not `end` property								
						if (response[_keys[i]].end == null && response[_keys[i]].start) {
							$scope.startUncompletedSecondsCount();
						}
					}
				} else {
					alert('Error loading Time Records.');
				}
			});

		};

		// Watch for changes in the `edit` search parameter...
		$scope.$watch(function() {
			var _search = $location.search();
			return _search.edit;
		}, function(newValue, oldValue) {
			// Loop through and delete all not equal to this `newValue`
			console.log('[app.projectDetailCtrl] $scope.$watch(): Detected new `edit` search value: '+newValue);
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
				if (!response.error) {
					// $scope.timeRecords[response.id] = response;
					$scope.startUncompletedSecondsCount();
				} else {
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
	}]);

})();