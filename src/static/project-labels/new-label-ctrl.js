(function() {

	var app = angular.module('app.newLabelCtrl', []);

	app.controller('app.newLabelCtrl', ['$scope', '$location', '$routeParams', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, $routeParams, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.newLabelCtrl] $scope.init(): Called.');
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
					selection: 'settings'
				}
			});

			$scope.colors = [
				'#da4453',
				'#e9573f',
				'#ffce54',
				'#8cc152',
				'#37bc9b',
				'#3bafda',
				'#4a89dc',
				'#967acd',
				'#d770ad',
				'#e6e9ed',
				'#aab2bd',
				'#434a54'
			];

			$scope.user = {};
			$scope.userLoaded = false;

			$scope.labels = {};
			$scope.labelsLoaded = false;

			$scope.label = {
				'name': '',
				'color': $scope.colors[Math.floor(Math.random() * ($scope.colors.length - 0))]
			};
			$scope.labelLoaded = true;	// Simply indicates FALSE when a request to create a project is in progress

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
								pageTitle: 'New labe: ' + response.name,
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

				} else {
					alert('Error loading User.');
				}
			});
		};

		$scope.create = function() {
			console.log('[app.newLabelCtrl] $scope.create(): Called.');
			$scope.labelLoaded = false;
			dataFactory.createLabel($scope.label, $scope.projectId).then(function(response) {
				$scope.labelLoaded = true;
				if (!response.error) {
					$location.path('/projects/'+$scope.projectId+'/labels');
				} else {
					alert('Error creating Milestone.');
				}
			});
		};


		// Init
		$scope.init();
	}]);

})();