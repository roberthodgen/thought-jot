(function() {

	var app = angular.module('app.projectSettingsCtrl', []);

	app.controller('app.projectSettingsCtrl', ['$scope', '$state', 'app.appFactory', 'app.dataFactory', function($scope, $state, appFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectSettingsCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'Settings: ' + $scope.project.name
			});

			$scope.projectDescriptionPreview = false;

			// Copy variables we'll be editing...
			$scope.project._name = angular.copy($scope.project.name);
			$scope.project._description = angular.copy($scope.project.description);

		};

		$scope.save = function() {
			console.log('[app.projectSettingsCtrl] $scope.save(): Called.');
			dataFactory.updateProject($scope.project).then(function(response) {
				if (!response.error) {
					$state.go('app.project.project-overview');
				} else {
					alert('Error creating project.');
				}
			});
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