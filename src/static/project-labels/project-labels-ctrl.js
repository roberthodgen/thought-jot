(function() {

	var app = angular.module('app.projectLabelsCtrl', []);

	app.controller('app.projectLabelsCtrl', ['$scope', '$location', '$routeParams', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, $routeParams, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectLabelsCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'Loading...',
				navbar: {
					title: 'Loading...',
					link: '/projects/' + $routeParams.projectId
				},
				sidebar: {
					selection: $routeParams.projectId
				}, projectsNav: {
					selection: 'settings'
				}
			});

			$scope.user = {};
			$scope.userLoaded = false;

			$scope.labels = {};
			$scope.labelsLoaded = false;

			$scope.label = {
				'name': '',
				'color': ''
			};
			$scope.labelLoaded = true;	// Simply indicates FALSE when a request to create a project is in progress
			$scope.showNewLabelForm = false;

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;

					// Redirect if not logged in
					if (!response.email) {
						$location.path('/login');
					}

					dataFactory.project($routeParams.projectId).then(function(response) {
						$scope.projectLoaded = true;
						if (!response.error) {
							// Success
							$scope.project = response;

							appFactory.config({
								pageTitle: response.name,
								navbar: {
									title: response.name
								}, sidebar: {
									selection: response.id
								}
							});
						} else {
							// Error
						}
					});

					dataFactory.labelsForProject($routeParams.projectId).then(function(response) {
						$scope.labelsLoaded = true;
						if (!response.error) {
							// Success
							$scope.labels = response;
						} else {
							// Error
						}
					})
				} else {
					alert('Error loading User.');
				}
			});
		};

		$scope.create = function() {
			console.log('[app.projectLabelsCtrl] $scope.create(): Called.');
			$scope.labelLoaded = false;
			dataFactory.createLabel($scope.label, $routeParams.projectId).then(function(response) {
				$scope.labelLoaded = true;
				if (!response.error) {
					// Success
				} else {
					alert('Error creating Label.');
				}
			});
		};


		// Init
		$scope.init();
	}]);

})();