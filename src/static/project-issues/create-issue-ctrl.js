(function() {

	var app = angular.module('app.createIssueCtrl', []);

	app.controller('app.createIssueCtrl', ['$scope', '$state', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $state, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.createIssueCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'New issue: ' + $scope.project.name
			});

			$scope.issue = {
				name: '',
				description: '',
				labels: {}
			};

			$scope.projectDescriptionPreview = false;

		};

		$scope.create = function() {
			console.log('[app.createIssueCtrl] $scope.create(): Called.');

			var issue = {
				name: $scope.issue.name,
				description: $scope.issue.description,
				labels: []
			};

			// Add each Label's ID...
			var _label_ids = Object.keys($scope.issue.labels);
			for (var i = _label_ids.length - 1; i >= 0; i--) {
				issue.labels.push(_label_ids[i]);
			}

			dataFactory.createMilestone(issue, $scope.projectId).then(function(response) {
				if (!response.error) {
					$state.go('app.project.issues.project-issues');	// Don't forget to link to the NEW Issue!
				} else {
					alert('Error creating Issue.');
				}
			});
		};

		$scope.labelSelected = function(label) {
			return $scope.issue.labels.hasOwnProperty(label.id);
		};

		$scope.toggleLabel = function(label) {
			if ($scope.issue.labels.hasOwnProperty(label.id)) {
				delete $scope.issue.labels[label.id];
			} else {
				$scope.issue.labels[label.id] = label;
			}
		};


		// Init
		$scope.init();
	}]);

})();