(function() {

	var app = angular.module('app.projectsHomeCtrl', []);

	app.controller('app.projectsHomeCtrl', ['$scope', '$location', 'app.appFactory', 'ndb_users.userFactory', 'app.projectFactory', function($scope, $location, appFactory, userFactory, projectFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectsHomeCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'Projects',
				'navActive': 'projects'
			});

			$scope.user = {};
			$scope.userLoaded = false;
			$scope.hasUser = false;

			$scope.projects = {};
			$scope.projectsLoaded = true;

			userFactory.user().then(function(response) {
				$scope.userFactory = true;
				if (response.hasOwnProperty('user')) {
					$scope.user = response.user;
					$scope.hasUser = true;

					projectFactory.projects().then(function(response) {
						$scope.projectsLoaded = true;
						if (!response.error) {
							// Success
							$scope.projects = response;
						} else {
							// Error
						}
					});
				} else {
					// Not logged in
					$location.path('/login');
				}
			});
		};

		$scope.login = function() {
			console.log('[app.projectsHomeCtrl] $scope.login: called');
		};


		// Init
		$scope.init();
	}]);


	app.filter('filterActive', function() {
		return function(projects) {
			// Return an array of Projects that are active
			var active_projects = [];

			var projects_keys = Object.keys(projects);
			for (var i = projects_keys.length - 1; i >= 0; i--) {
				if (projects[projects_keys[i]].hasOwnProperty('active')) {
					if (projects[projects_keys[i]].active == true) {
						active_projects.push(projects[projects_keys[i]]);
					}
				}
			};
			return active_projects;
		};
	});

})();