(function() {

	var app = angular.module('app.projectSharingCtrl', []);

	app.controller('app.projectSharingCtrl', ['$scope', '$state', 'app.appFactory', 'app.dataFactory', function($scope, $state, appFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectSharingCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'Settings: ' + $scope.project.name
			});

			$scope.newContributor = '';

		};

		$scope.addContributor = function() {
			dataFactory.projectContributorsAdd($scope.newContributor, $scope.projectId).then(function(response) {
				if (!response.error) {
					$scope.newContributor = '';
					$scope.contributorForm.$setPristine();	// Clears $dirty
				} else {
					alert('Error adding contributor.');
				}
			});
		};

		$scope.removeContributor = function(contributor_email) {
			if (confirm('Remove contributor: '+contributor_email)) {
				dataFactory.projectContributorsRemove(contributor_email, $scope.projectId).then(function(response) {
					if (response.error) {
						alert('Error removing contributor.');
					}
				});
			}
		};


		// Init
		$scope.init();

		// Cleanup
		$scope.$on('$destroy', function() {
			// Delete the variables configured during `init()`
			delete $scope.project._name;
			delete $scope.project._description;
		})
	}]);

})();