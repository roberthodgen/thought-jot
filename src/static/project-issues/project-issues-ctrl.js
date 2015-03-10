(function() {

	var app = angular.module('app.projectIssuesCtrl', []);

	app.controller('app.projectIssuesCtrl', ['$scope', '$state', 'app.appFactory', 'app.dataFactory', 'issues', function($scope, $state, appFactory, dataFactory, issues) {

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

			if (angular.isDefined($state.params.milestoneId)) {
				if (angular.isDefined($scope.issues[$state.params.milestoneId])) {
					$scope.issues[$state.params.milestoneId]._view = true;

					if ($state.name == 'app.project.issues.project-issues.edit-issue') {
						$scope.issues[$state.params.milestoneId]._edit = true;
					}
				}
			}

		};

		// When `$stateChangeSuccess` is emitted;
		// used instead of `$stateChangeStart` so Directives have a chance to call `preventDefault()`
		$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

			// Delete the `_view` property of the old issue; if present.
			if (angular.isDefined(fromParams.milestoneId)) {
				if (angular.isDefined($scope.issues[fromParams.milestoneId])) {
					delete $scope.issues[fromParams.milestoneId]._view;

					if (fromState.name == 'app.project.issues.project-issues.edit-issue') {
						delete $scope.issues[fromParams.milestoneId]._edit;
					}
				}
			}

			// Add the `_view` property of the currently viewed issue;
			if (angular.isDefined(toParams.milestoneId)) {
				if (angular.isDefined($scope.issues[toParams.milestoneId])) {
					$scope.issues[toParams.milestoneId]._view = true;

					if (toState.name == 'app.project.issues.project-issues.edit-issue') {
						$scope.issues[toParams.milestoneId]._edit = true;
					}
				}
			}
		});

		$scope.issueClick = function(issue) {
			if (!issue._view) {
				console.log('[app.projectIssuesCtrl] $scope.issueClick(): Called with `issue` of id: '+issue.id);
				$state.go('app.project.issues.project-issues.view-issue', { milestoneId: issue.id });
			}
		};

		// Init
		$scope.init();
	}]);

})();