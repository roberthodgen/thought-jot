(function() {

	var app = angular.module('app.timeRecordListGroupItem', []);

	app.directive('timeRecordListGroupItem', ['$compile', function($compile) {

		// Directive definition object
		return {
			restrict: 'A',	// Only match attribute name
			scope: {	// Isolate the directive's scope...
				timeRecord: '=timeRecord'	// We need the Time Record as `timeRecord`
			}, controller: ['$scope', '$routeParams', 'app.dataFactory', function($scope, $routeParams, dataFactory) {
				/*
					Controller for timeRecordListGroupItem directive
				*/

				$scope.init = function() {

					$scope.comments = {};
					$scope.commentsLoaded = false;
					$scope.commentsError = false;

					dataFactory.comments($scope.timeRecord.id).then(function(response) {
						$scope.commentsLoaded = true;
						if (!response.error) {
							$scope.comments = response;
						} else {
							$scope.commentsError = true;
						}
					});
				};

				$scope.complete = function() {
					dataFactory.completeTimeRecord($scope.timeRecord).then(function(response) {
						if (response.error) {
							alert('Error completing Time Record: '+response.message);
						}
					});
				};

				$scope.showEditControls = function(show) {
					if (show) {
						$scope.timeRecord._edit = true;
						$scope.timeRecord._name = angular.copy($scope.timeRecord.name);
					} else {
						$scope.timeRecord._edit = false;
						$scope.timeRecord._name = '';
					}
				};

				$scope.update = function() {
					dataFactory.updateTimeRecord($scope.timeRecord).then(function(response) {
						if (!response.error) {
							$scope.timeRecord._name = response.name;
							$scope.editForm.$setPristine();
						} else {
							alert('Error updating Time Record: '+response.message);
						}
					});
				};

				$scope.addComment = function(timeRecord) {
					var options = {
						'project_id': $routeParams.projectId,
						'parent_id': timeRecord.id,
						'comment': timeRecord._new_comment
					};
					dataFactory.createComment(options).then(function(response) {
						if (!response.error) {
							$scope.timeRecord._new_comment = '';
						} else {
							alert('Error adding Comment: '+response.message);
						}
					});
				};


				// Init
				$scope.init();
			}],
			templateUrl: '/time-records/time-record-list-group-item.html'
		};
	}]);

})();