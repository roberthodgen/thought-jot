(function() {

	var app = angular.module('app.projectsHomeCtrl', []);

	app.controller('app.projectsHomeCtrl', ['$scope', '$location', '$filter', 'app.appFactory', 'ndb_users.userFactory', 'app.projectFactory', function($scope, $location, $filter, appFactory, userFactory, projectFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectsHomeCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'Projects',
				'navActive': 'projects'
			});

			$scope.search = '';

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

							$scope.activeProjects = $filter('filterActive')(response);
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
			// Return an array of Projects that are active and not in-progress
			var filtered_projects = [];

			var projects_keys = Object.keys(projects);
			for (var i = projects_keys.length - 1; i >= 0; i--) {
				if (projects[projects_keys[i]].hasOwnProperty('active') && projects[projects_keys[i]].hasOwnProperty('has_uncompleted_time_records')) {
					if (projects[projects_keys[i]].active == true && projects[projects_keys[i]].has_uncompleted_time_records == false) {
						filtered_projects.push(projects[projects_keys[i]]);
					}
				}
			};
			return filtered_projects;
		};
	});

	app.filter('filterInProgress', function() {
		return function(projects) {
			// Return an array of Projects that are in-progress
			var filterd_projects = [];

			var projects_keys = Object.keys(projects);
			for (var i = projects_keys.length - 1; i >= 0; i--) {
				if (projects[projects_keys[i]].hasOwnProperty('has_uncompleted_time_records')) {
					if (projects[projects_keys[i]].has_uncompleted_time_records == true) {
						filterd_projects.push(projects[projects_keys[i]]);
					}
				}
			};
			return filterd_projects;
		};
	});

})();