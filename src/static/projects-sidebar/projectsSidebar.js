(function() {

	var app = angular.module('app.projectsSidebar', []);

	app.directive('projectsSidebar', function() {

		// Directive definition object
		return {
			restrict: 'A',	// Only match attribute name
			scope: {	// Isolate the directive's scope...
				projects: '=projects'	// We need the projects as `projects`
			}, controller: ['$scope', 'app.appFactory', 'app.dataFactory', function($scope, appFactory, dataFactory) {

				$scope.init = function() {

					$scope.projets = {};

					$scope.config = appFactory.config();
				};

				$scope.sidebarClick = function() {
					if ($scope.config.sidebar.show) {
						console.log('[app.projectsSidebar] sidebarClick(): Called.');
						$scope.config.sidebar.show = false;
					}
				};


				// Init
				$scope.init();
			}],
			templateUrl: '/projects-sidebar/projects-sidebar.html'
		};
	});

})();