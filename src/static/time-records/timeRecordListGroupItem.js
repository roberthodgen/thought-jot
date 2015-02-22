(function() {

	var app = angular.module('app.timeRecordListGroupItem', []);

	app.directive('timeRecordListGroupItem', ['$compile', function($compile) {

		// Directive definition object
		return {
			restrict: 'A',	// Only match attribute name
			scope: {	// Isolate the directive's scope...
				timeRecord: '=timeRecord'	// We need the Time Record as `timeRecord`
			}, controller: ['$scope', 'app.dataFactory', function($scope, dataFactory) {
				/*
					Controller for timeRecordListGroupItem directive
				*/

				$scope.complete = function() {
					dataFactory.completeTimeRecord($scope.timeRecord).then(function(response) {
						if (response.error) {
							alert('Error completing Time Record: '+response.message);
						}
					});
				};

				$scope.showEditControls = function(timeRecord, show) {
					if (show) {
						timeRecord._edit = true;
						timeRecord._name = timeRecord.name;
					} else {
						timeRecord._edit = false;
						timeRecord._name = '';
					}
				};
			}],
			templateUrl: '/time-records/time-record-list-group-item.html'
		};
	}]);

})();