(function() {

	var app = angular.module('app.projectsNav', []);

	app.directive('projectsNav', function() {
		return {
			restrict: 'A',
			templateUrl: '/projects-nav/projects-nav.html'
		};
	});

})();