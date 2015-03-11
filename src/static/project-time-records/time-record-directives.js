(function() {

	var app = angular.module('app.timeRecordDirectives', []);

	app.directive('timeRecordListItem', ['$compile', function($compile) {
		return {
			restrict: 'A',
			scope: {
				timeRecord: '=timeRecordListItem'
			}, controller: ['$scope', 'app.dataFactory', function($scope, dataFactory) {
				$scope.init = function() {

					$scope.commentsPluralizeWhen = {
						'0': 'No comments',
						'1': '1 comment',
						'other': '{} comments'
					};
				};


				// Init
				$scope.init();
			}],
			templateUrl: '/project-time-records/time-record-list-item.html'
		};
	}]);

	app.directive('timeRecordView', ['$compile', function($compile) {
		return {
			restrict: 'A',
			scope: {
				timeRecord: '=timeRecordView'
			}, controller: ['$scope', '$stateParams', 'app.dataFactory', function($scope, $stateParams, dataFactory) {
				$scope.init = function() {
					$scope.comments = {};
					$scope.commentsLoaded = false;
					$scope.commentsError = false;

					dataFactory.comments($scope.timeRecord.id).then(function(response) {
						$scope.commentsLoaded = true;
						if (!response.error) {
							// Success
							$scope.comments = response;
						} else {
							// Error
							$scope.commentsError = true;
						}
					});

					$scope.labels = {};
					$scope.labelsLoaded = false;
					$scope.labelsError = false;
					dataFactory.labelsForMilestone($scope.timeRecord.id).then(function(response) {
						$scope.labelsLoaded = true;
						if (!response.error) {
							// Success
							$scope.labels = response;
						} else {
							// Error
							$scope.labelsError = true;
						}
					});

					$scope.showLabelsPopover = false;
				};

				$scope.commentsPluralizeWhen = {
					'0': 'No comments',
					'1': '1 comment',
					'other': '{} comments'
				};

				$scope.complete = function() {
					// Complete this Time Record
					dataFactory.completeTimeRecord($scope.timeRecord.id, $stateParams.projectId).then(function(response) {
						if (response.error) {
							alert('Error completing Time Record: '+response.message);
						}
					});
				};

				$scope.addComment = function(timeRecord) {
					var options = {
						'project_id': $stateParams.projectId,
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

				// Cleanup
				$scope.$on('$destroy', function() {
					delete $scope.timeRecord._new_comment;
				});
			}],
			templateUrl: '/project-time-records/time-record-view.html'
		};
	}]);

	app.directive('timeRecordEdit', ['$compile', function($compile) {
		return {
			restrict: 'A',
			scope: {
				timeRecord: '=timeRecordEdit'
			}, controller: ['$scope', '$state', '$stateParams', 'app.dataFactory', function($scope, $state, $stateParams, dataFactory) {
				$scope.init = function() {
					$scope.comments = {};
					$scope.commentsLoaded = false;
					$scope.commentsError = false;

					dataFactory.comments($scope.timeRecord.id).then(function(response) {
						$scope.commentsLoaded = true;
						if (!response.error) {
							// Success
							$scope.comments = response;
						} else {
							// Error
							$scope.commentsError = true;
						}
					});

					$scope.labels = {};
					$scope.labelsLoaded = false;
					$scope.labelsError = false;
					dataFactory.labelsForMilestone($scope.timeRecord.id).then(function(response) {
						$scope.labelsLoaded = true;
						if (!response.error) {
							// Success
							$scope.labels = response;
						} else {
							// Error
							$scope.labelsError = true;
						}
					});

					$scope.descriptionPreview = false;

					$scope.timeRecord._name = angular.copy($scope.timeRecord.name);
					$scope.timeRecord._description = angular.copy($scope.timeRecord.description);
				};

				$scope.commentsPluralizeWhen = {
					'0': 'No comments',
					'1': '1 comment',
					'other': '{} comments'
				};

				$scope.toggleOpen = function() {
					if ($scope.timeRecord.open) {
						// Close
						dataFactory.updateMilestone({
							id: $scope.timeRecord.id,
							open: !$scope.timeRecord.open
						}, $stateParams.projectId).then(function(response) {
							if (response.error) {
								alert('Error closing Issue.');
							}
						});
					} else {
						// Reopen
						dataFactory.updateMilestone({
							id: $scope.timeRecord.id,
							open: !$scope.timeRecord.open
						}, $stateParams.projectId).then(function(response) {
							if (response.error) {
								alert('Error opening Issue.');
							}
						});
					}
				};

				$scope.addComment = function(timeRecord) {
					var options = {
						'project_id': $stateParams.projectId,
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

				$scope.save = function() {
					dataFactory.updateMilestone({
						id: angular.copy($scope.timeRecord.id),
						name: angular.copy($scope.timeRecord._name),
						description: angular.copy($scope.timeRecord._description)
					}, $stateParams.projectId).then(function(response) {
						if (!response.error) {
							$scope.issueEditForm.$setPristine();	// Clears $dirty
							$state.go('app.project.time-records.project-time-records.view-time-record', $stateParams);
						} else {
							alert('Error saving Issue: '+response.status);
						}
					});
				};

				// On `$stateChangeStart` check to see if the form has unsaved changes, i.e. it's dirty
				$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
					if ($scope.issueEditForm.$dirty) {
						if (!confirm('Unsaved changes; continue and lose changes?')) {
							event.preventDefault();
						}
					}
				});


				// Init
				$scope.init();

				// Cleanup
				$scope.$on('$destroy', function() {
					delete $scope.timeRecord._new_comment;
					delete $scope.timeRecord._name;
					delete $scope.timeRecord._description;
				});
			}],
			templateUrl: '/project-time-records/time-record-edit.html'
		};
	}]);

})();