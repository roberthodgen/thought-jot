(function() {

	var app = angular.module('app.projectIssuesCtrl', []);

	app.controller('app.projectIssuesCtrl', ['$scope', '$state', '$location', '$timeout', 'app.appFactory', 'app.dataFactory', 'issues', function($scope, $state, $location, $timeout, appFactory, dataFactory, issues) {

		$scope.issues = issues;

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectIssuesCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'Issues: ' + $scope.project.name
			});

			$scope.search = {
				name: ''
			};

			$scope.inProgressissues = [];
			$scope.inProgressResults = [];

			$scope.openIssues = true;

			$scope.activeResults = [];

		};

		// When `$stateChangeStart` is emitted;
		$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
			
			// Add the `_view` property of the currently viewed issue;
			if (angular.isDefined(toParams.milestoneId)) {
				if (angular.isDefined($scope.issues[toParams.milestoneId])) {
					$scope.issues[toParams.milestoneId]._view = true;
				}
			}

			// Delete the `_view` property of the old issue; if present.
			if (angular.isDefined(fromParams.milestoneId)) {
				if (angular.isDefined($scope.issues[fromParams.milestoneId])) {
					delete $scope.issues[fromParams.milestoneId]._view;
				}
			}
		});

		$scope.issueClick = function(issue) {
			console.log('[app.projectIssuesCtrl] $scope.issueClick(): Called with `issue` of id: '+issue.id);
			$state.go('app.project.issues.project-issues.view-issue', { milestoneId: issue.id });
		};

		// Init
		$scope.init();
	}]);

})();