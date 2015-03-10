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

			// Search for uncompleted Issues (to start the counter)
			var _search = $location.search();
			if (angular.isDefined(_search.view)) {
				var _keys = Object.keys($scope.issues);
				for (var i = _keys.length - 1; i >= 0; i--) {

					// Delete our temp `_view` property
					if ($scope.issues[_keys[i]].id === _search.view) {
						$scope.issues[_keys[i]]._view = true;
						$scope.issues[_keys[i]]._name = angular.copy($scope.issues[_keys[i]].name);
					} else {
						delete $scope.issues[_keys[i]]._view;
					}
				}
			}

		};

		// Watch for changes in the `view` search parameter...
		$scope.$watch(function() {
			var _search = $location.search();
			return _search.view;
		}, function(newValue, oldValue) {
			// Loop through and delete all not equal to this `newValue`
			console.log('[app.projectIssuesCtrl] $scope.$watch(): Detected new `view` search value: '+newValue);
			var _keys = Object.keys($scope.issues);
			if (angular.isString(newValue)) {
				// Loop through and delete all but this key
				for (var i = _keys.length - 1; i >= 0; i--) {
					if ($scope.issues[_keys[i]].id != newValue) {
						delete $scope.issues[_keys[i]]._view;
						delete $scope.issues[_keys[i]]._name;
					} else {
						$scope.issues[_keys[i]]._view = true;
						$scope.issues[_keys[i]]._name = angular.copy($scope.issues[_keys[i]].name);
					}
				}
			} else {
				// Loop through all and remove `_view` and `_name`
				for (var i = _keys.length - 1; i >= 0; i--) {
					delete $scope.issues[_keys[i]]._view;
					delete $scope.issues[_keys[i]]._name;
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