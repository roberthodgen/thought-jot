(function() {

	var app = angular.module('app.projectSettingsCtrl', []);

	app.controller('app.projectSettingsCtrl', ['$scope', '$location', '$routeParams', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, $routeParams, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectSettingsCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'Project',
				'navbar': {
					'title': 'Loading...',
					'link': '/projects/' + $routeParams.projectId
				}, 'sidebar': {
					'selection': $routeParams.projectId
				}
			});

			$scope.projectId = $routeParams.projectId;

			$scope.user = {};
			$scope.userLoaded = false;

			$scope.project = {};
			$scope.projectLoaded = true;

			$scope.projectDescriptionPreview = false;

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;

					// Redirect if not logged in
					if (!response.email) {
						$location.path('/login');
					}

					dataFactory.project($scope.projectId).then(function(response) {
						$scope.projectLoaded = true;
						if (!response.error) {
							// Success
							$scope.project = response;

							// Copy variables we'll be editing...
							$scope.project._name = angular.copy(response.name);
							$scope.project._description = angular.copy(response.description);

							appFactory.config({
								'pageTitle': 'Edit ' + response.name,
								'navbar': {
									'title': response.name
								}, 'sidebar': {
									'selection': response.id
								}
							});
						} else {
							// Error
						}
					});
				} else {
					alert('Error loading User.');
				}
			});
		};

		$scope.save = function() {
			console.log('[app.projectSettingsCtrl] $scope.save(): called');
			$scope.projectLoaded = false;
			dataFactory.updateProject($scope.project).then(function(response) {
				$scope.projectLoaded = true;
				if (!response.error) {
					$location.path('/projects/'+response.id);
				} else {
					alert('Error creating project.');
				}
			});
		};


		// Init
		$scope.init();
	}]);

})();