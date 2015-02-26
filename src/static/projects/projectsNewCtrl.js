(function() {

	var app = angular.module('app.projectsNewCtrl', []);

	app.controller('app.projectsNewCtrl', ['$scope', '$location', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectsNewCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'New Project',
				'navbar': {
					'title': 'New Project',
					'link': $location.path()
				},
				'sidebar': {
					'selection': 'new-project'
				}
			});

			$scope.user = {};
			$scope.userLoaded = false;

			$scope.project = {
				'name': '',
				'description': ''
			};
			$scope.projectLoaded = true;	// Simply indicates FALSE when a request to create a project is in progress

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;

					// Redirect if not logged in
					if (!response.email) {
						$location.path('/login');
					}
				} else {
					alert('Error loading User.');
				}
			});
		};

		$scope.create = function() {
			console.log('[app.projectsNewCtrl] $scope.create(): called');
			$scope.projectLoaded = false;
			dataFactory.create($scope.project).then(function(response) {
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