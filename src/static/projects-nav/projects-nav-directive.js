(function() {

	var app = angular.module('app.projectsNav', []);

	app.directive('projectsNav', function() {
		return {
			restrict: 'A',
			controller: ['$scope', 'app.appFactory', function($scope, appFactory) {

				$scope.init = function() {
					$scope.config = appFactory.config();
				}


				// Init
				$scope.init();
			}],
			templateUrl: '/projects-nav/projects-nav.html'
		};
	});

})();