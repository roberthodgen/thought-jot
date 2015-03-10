(function() {

	var app = angular.module('app.issueDirectives', []);

	app.directive('issueListItem', ['$compile', function($compile) {

		// Directive definition object
		return {
			restrict: 'A',
			scope: {
				issue: '=issueListItem'
			}, controller: ['$scope', 'app.dataFactory', function($scope, dataFactory) {
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
			}],
			templateUrl: '/project-issues/issue-list-item.html'
		};
	}]);

})();