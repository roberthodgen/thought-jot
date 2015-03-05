(function() {

	var app = angular.module('app.projectLabelsCtrl', []);

	app.controller('app.projectLabelsCtrl', ['$scope', '$location', '$routeParams', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, $routeParams, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectLabelsCtrl] $scope.init(): Called.');
			$scope.projectId = $routeParams.projectId;
			appFactory.config({
				pageTitle: 'Loading...',
				navbar: {
					title: 'Loading...',
					link: '/projects/' + $scope.projectId
				},
				sidebar: {
					selection: $scope.projectId
				}, projectsNav: {
					selection: 'labels'
				}
			});



			$scope.user = {};
			$scope.userLoaded = false;

			$scope.labels = {};
			$scope.labelsLoaded = false;

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

							appFactory.config({
								pageTitle: 'Labels: ' + response.name,
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

					dataFactory.labelsForProject($scope.projectId).then(function(response) {
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
			dataFactory.createLabel($scope.label, $scope.projectId).then(function(response) {
				$scope.labelLoaded = true;
				if (!response.error) {
					// Success
				} else {
					alert('Error creating Label.');
				}
			});
		};

		$scope.deleteLabel = function(label) {
			console.log('[app.projectLabelsCtrl] $scope.deleteLabel(): Called.');
			if (confirm('Delete label: '+label.name)) {
				dataFactory.deleteLabel($scope.projectId, label.id).then(function(response) {
					if (response.error) {
						alert('Error deleting label: '+response.status);
					}
				});
			}
		};


		// Init
		$scope.init();
	}]);

})();