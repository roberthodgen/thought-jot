(function() {

	var app = angular.module('app.projectIssuesCtrl', []);

	app.controller('app.projectIssuesCtrl', ['$scope', '$state', '$stateParams', 'app.appFactory', 'app.dataFactory', 'issues', function($scope, $state, $stateParams, appFactory, dataFactory, issues) {

		$scope.issues = issues;

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectIssuesCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'Issues: ' + $scope.project.name
			});

			$scope.searchOptions = {
				open: 'open',
				text: {
					name: ''
				}, labels: []
			};

			$scope.inProgressissues = [];
			$scope.inProgressResults = [];

			$scope.issueResults = [];

			$scope.issuesPluralizeWhen = {
				'0': 'No {{ (searchOptions.open == "all" ? "" : searchOptions.open) }} issues',
				'1': '1 {{ (searchOptions.open == "all" ? "" : searchOptions.open) }} issue',
				'other': '{} {{ (searchOptions.open == "all" ? "" : searchOptions.open) }} issues'
			};

			if (angular.isDefined($state.params.milestoneId)) {
				if (angular.isDefined($scope.issues[$state.params.milestoneId])) {
					$scope.issues[$state.params.milestoneId]._view = true;

					if ($state.name == 'app.project.issues.project-issues.edit-issue') {
						$scope.issues[$state.params.milestoneId]._edit = true;
					}
				}
			}
		};

		$scope.$on('backgroundClick', function() {
			var params = angular.extend({ milestoneId: '' }, $stateParams);
			$state.go('app.project.issues.project-issues', params);
		});

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

			if (angular.isDefined(toParams.f)) {
				if (toParams.f == 'closed') {
					$scope.searchOptions.open = 'closed';
				} else {
					$scope.searchOptions.open = 'all';
				}
			} else {
				$scope.searchOptions.open = 'open';
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

		// Cleanup
		$scope.$on('$destroy', function() {
			// Loop through all Issues...
			var _keys = Object.keys($scope.issues);
			for (var i = _keys.length - 1; i >= 0; i--) {
				// Delete the `_view` and `_edit` properties;
				// Fixes an bug where an Issue will appear open after naviging away from this controller and back.
				delete $scope.issues[_keys[i]]._view;
				delete $scope.issues[_keys[i]]._edit;
			};
		});
	}]);

})();