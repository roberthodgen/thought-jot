(function() {

	var app = angular.module('app.createLabelCtrl', []);

	app.controller('app.createLabelCtrl', ['$scope', '$state', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $state, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.createLabelCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'New Label: ' + $scope.project.name
			});

			$scope.label = {
				'name': '',
				'color': $scope.colors[Math.floor(Math.random() * ($scope.colors.length - 0))]
			};

		};

		$scope.create = function() {
			console.log('[app.createLabelCtrl] $scope.create(): Called.');
			dataFactory.createLabel({
				name: angular.copy($scope.label.name),
				color: angular.copy($scope.label.color)
			}, $scope.projectId).then(function(response) {
				$scope.labelLoaded = true;
				if (!response.error) {
					$state.go('app.project.labels.project-labels');
				} else {
					alert('Error creating Label.');
				}
			});
		};


		// Init
		$scope.init();
	}]);

})();