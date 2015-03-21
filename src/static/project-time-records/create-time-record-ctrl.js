(function() {

	var app = angular.module('app.createTimeRecordCtrl', []);

	app.controller('app.createTimeRecordCtrl', ['$scope', '$state', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $state, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.createTimeRecordCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'New time record: ' + $scope.project.name
			});

			$scope.timeRecord = {
				name: '',
				completed: 5 * 60
			};

			$scope.dateNow = new Date();	// Simply used for a preview, e.g. "Saturday afternoon"

		};

		$scope.create = function() {
			console.log('[app.create] $scope.create(): Called.');

			dataFactory.createTimeRecord($scope.projectId, angular.copy($scope.timeRecord.name), angular.copy($scope.timeRecord.completed)).then(function(response) {
				if (!response.error) {
					$state.go('app.project.time-records.project-time-records.view-time-record', { timeRecordId: response.id });	// Don't forget to link to the NEW Issue!
				} else {
					alert('Error creating Time Record.');
				}
			});
		};


		// Init
		$scope.init();
	}]);

})();