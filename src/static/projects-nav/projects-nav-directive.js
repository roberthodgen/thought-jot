(function() {

	var app = angular.module('app.projectsNav', []);

	app.directive('projectsNav', function() {
		return {
			restrict: 'A',
			scope: {},
			controller: ['$scope', '$routeParams', 'app.appFactory', function($scope, $routeParams, appFactory) {

				$scope.init = function() {
					
					$scope.config = appFactory.config();

					$scope.projectId = $routeParams.projectId;
				}


				// Init
				$scope.init();
			}],
			templateUrl: '/projects-nav/projects-nav.html'
		};
	});

})();