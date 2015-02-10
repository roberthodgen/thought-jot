(function() {

	var app = angular.module('app.timeRecordListGroupItem', []);

	app.directive('timeRecordListGroupItem', function() {

		// Directive definition object
		return {
			restrict: 'A',	// Only match attribute name
			scope: {	// Isolate the directive's scope...
				timeRecord: '=timeRecord',	// We need the Time Record as `timeRecord`
				save: '&save',
				complete: '&complete',
				showEditControls: '&showEditControls'
			},
			templateUrl: '/time-records/time-record-list-group-item.html'
		};
	});

})();