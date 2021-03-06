(function() {

	var app = angular.module('app.projectTimeRecordsCtrl', []);

	app.controller('app.projectTimeRecordsCtrl', ['$scope', '$state', '$stateParams', '$filter', 'app.appFactory', 'app.dataFactory', function($scope, $state, $stateParams, $filter, appFactory, dataFactory) {

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

			$scope.activeResults = [];

			if (angular.isDefined($state.params.timeRecordId)) {
				if (angular.isDefined($scope.timeRecords[$state.params.timeRecordId])) {
					$scope.timeRecords[$state.params.timeRecordId]._view = true;

					if ($state.name == 'app.project.time-records.project-time-records.edit-time-record') {
						$scope.timeRecords[$state.params.timeRecordId]._edit = true;
					}
				}
			}

		};

		$scope.$on('backgroundClick', function() {
			var params = angular.extend({ timeRecordId: '' }, $stateParams);
			$state.go('app.project.time-records.project-time-records', params);
		});

		// When `$stateChangeSuccess` is emitted;
		// used instead of `$stateChangeStart` so Directives have a chance to call `preventDefault()`
		$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

			// Delete the `_view` property of the old Time Record; if present.
			if (angular.isDefined(fromParams.timeRecordId)) {
				if (angular.isDefined($scope.timeRecords[fromParams.timeRecordId])) {
					delete $scope.timeRecords[fromParams.timeRecordId]._view;

					if (fromState.name == 'app.project.time-records.project-time-records.edit-time-record') {
						delete $scope.timeRecords[fromParams.timeRecordId]._edit;
					}
				}
			}

			// Add the `_view` property of the currently viewed Time Record;
			if (angular.isDefined(toParams.timeRecordId)) {
				if (angular.isDefined($scope.timeRecords[toParams.timeRecordId])) {
					$scope.timeRecords[toParams.timeRecordId]._view = true;

					if (toState.name == 'app.project.time-records.project-time-records.edit-time-record') {
						$scope.timeRecords[toParams.timeRecordId]._edit = true;
					}
				}
			}
		});

		$scope.timeRecordClick = function(timeRecord) {
			if (!timeRecord._view) {
				console.log('[app.projectTimeRecordsCtrl] $scope.timeRecordClick(): Called with `timeRecord` of id: '+timeRecord.id);
				$state.go('app.project.time-records.project-time-records.view-time-record', { timeRecordId: timeRecord.id });
			}
		};

		$scope.loadMore = function() {
			// Called when the "Load more" button is clicked; should ask the `dataFactory` to load the next set of Time Records
			dataFactory.fetchMoreTimeRecords($stateParams.projectId, angular.copy($scope.timeRecords._cursor)).then(function(response) {
				if (response.error) {
					alert('Error loading more Time Records: '+response.status);
				}
			});
		};


		// Init
		$scope.init();

		// Cleanup
		$scope.$on('$destroy', function() {
			// Loop through all Issues...
			var _keys = Object.keys($scope.timeRecords);
			for (var i = _keys.length - 1; i >= 0; i--) {
				// Delete the `_view` and `_edit` properties;
				// Fixes an bug where a Time Record will appear open after naviging away from this controller and back.
				delete $scope.timeRecords[_keys[i]]._view;
				delete $scope.timeRecords[_keys[i]]._edit;
			};
		});
	}]);

})();