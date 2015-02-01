(function() {

	var app = angular.module('app.projectsNewCtrl', []);

	app.controller('app.projectsNewCtrl', ['$scope', '$location', 'app.appFactory', 'ndb_users.userFactory', 'app.projectFactory', function($scope, $location, appFactory, userFactory, projectFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectsNewCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'New Project',
				'navActive': 'projects'
			});

			$scope.user = {};
			$scope.userLoaded = false;
			$scope.hasUser = false;

			$scope.project = {
				'name': '',
				'description': ''
			};
			$scope.projectLoaded = true;	// Simply indicates FALSE when a request to create a project is in progress

			userFactory.user().then(function(response) {
				$scope.userFactory = true;
				if (response.hasOwnProperty('user')) {
					$scope.user = response.user;
					$scope.hasUser = true;
				} else {
					// Not logged in
					$location.path('/login');
				}
			});
		};

		$scope.create = function() {
			console.log('[app.projectsNewCtrl] $scope.create(): called');
			$scope.projectLoaded = false;
			projectFactory.create($scope.project).then(function(response) {
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