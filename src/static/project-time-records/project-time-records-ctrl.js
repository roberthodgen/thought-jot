(function() {

	var app = angular.module('app.projectTimeRecordsCtrl', []);

	app.controller('app.projectTimeRecordsCtrl', ['$scope', '$state', '$location', 'app.appFactory', 'app.dataFactory', 'timeRecords', function($scope, $state, $location, appFactory, dataFactory, timeRecords) {

		$scope.timeRecords = timeRecords;

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectTimeRecordsCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'Time Records: ' + $scope.project.name
			});

			$scope.search = {
				name: ''
			};

			$scope.inProgressTimeRecords = [];
			$scope.inProgressResults = [];

			$scope.activeResults = [];

			// Search for uncompleted Time Records (to start the counter)
			var _search = $location.search();
			if (angular.isDefined(_search.edit)) {
				var _keys = Object.keys($scope.timeRecords);
				for (var i = _keys.length - 1; i >= 0; i--) {

					// Delete our temp `_edit` property
					if ($scope.timeRecords[_keys[i]].id === _search.edit) {
						$scope.timeRecords[_keys[i]]._edit = true;
						$scope.timeRecords[_keys[i]]._name = angular.copy($scope.timeRecords[_keys[i]].name);
					} else {
						delete $scope.timeRecords[_keys[i]]._edit;
					}
				}
			}

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


		// Init
		$scope.init();
	}]);

})();