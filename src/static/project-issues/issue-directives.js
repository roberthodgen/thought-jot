(function() {

	var app = angular.module('app.issueDirectives', []);

	app.directive('issueListItem', ['$compile', function($compile) {
		return {
			restrict: 'A',
			scope: {
				issue: '=issueListItem'
			}, controller: ['$scope', 'app.dataFactory', function($scope, dataFactory) {
				$scope.init = function() {
					$scope.milestoneLabels = {};
					$scope.milestoneLabelsLoaded = false;
					$scope.milestoneLabelsError = false;
					dataFactory.labelsForMilestone($scope.issue.id).then(function(response) {
						$scope.milestoneLabelsLoaded = true;
						if (!response.error) {
							// Success
							$scope.milestoneLabels = response;
						} else {
							// Error
							$scope.milestoneLabelsError = true;
						}
					});

					$scope.commentsPluralizeWhen = {
						'0': 'No comments',
						'1': '1 comment',
						'other': '{} comments'
					};
				};


				// Init
				$scope.init();
			}],
			templateUrl: '/project-issues/issue-list-item.html'
		};
	}]);

	app.directive('issueView', ['$compile', function($compile) {

		// Directive definition object
		return {
			restrict: 'A',
			scope: {
				issue: '=issueView'
			}, controller: ['$scope', '$stateParams', 'app.dataFactory', function($scope, $stateParams, dataFactory) {
				$scope.init = function() {
					$scope.comments = {};
					$scope.commentsLoaded = false;
					$scope.commentsError = false;

					dataFactory.comments($scope.issue.id).then(function(response) {
						$scope.commentsLoaded = true;
						if (!response.error) {
							// Success
							$scope.comments = response;
						} else {
							// Error
							$scope.commentsError = true;
						}
					});

					$scope.milestoneLabels = {};
					$scope.milestoneLabelsLoaded = false;
					$scope.milestoneLabelsError = false;
					dataFactory.labelsForMilestone($scope.issue.id).then(function(response) {
						$scope.milestoneLabelsLoaded = true;
						if (!response.error) {
							// Success
							$scope.milestoneLabels = response;
						} else {
							// Error
							$scope.milestoneLabelsError = true;
						}
					});
				};

				$scope.commentsPluralizeWhen = {
					'0': 'No comments',
					'1': '1 comment',
					'other': '{} comments'
				};

				$scope.toggleOpen = function() {
					if ($scope.issue.open) {
						// Close
						dataFactory.updateMilestone({
							id: $scope.issue.id,
							open: !$scope.issue.open
						}, $stateParams.projectId).then(function(response) {
							if (response.error) {
								alert('Error closing Issue.');
							}
						});
					} else {
						// Reopen
						dataFactory.updateMilestone({
							id: $scope.issue.id,
							open: !$scope.issue.open
						}, $stateParams.projectId).then(function(response) {
							if (response.error) {
								alert('Error opening Issue.');
							}
						});
					}
				};

				$scope.addComment = function(issue) {
					var options = {
						'project_id': $stateParams.projectId,
						'parent_id': issue.id,
						'comment': issue._new_comment
					};
					dataFactory.createComment(options).then(function(response) {
						if (!response.error) {
							$scope.issue._new_comment = '';
						} else {
							alert('Error adding Comment: '+response.message);
						}
					});
				};


				// Init
				$scope.init();

				// Cleanup
				$scope.$on('$destroy', function() {
					delete $scope.issue._new_comment;
				});
			}],
			templateUrl: '/project-issues/issue-view.html'
		};
	}]);

})();