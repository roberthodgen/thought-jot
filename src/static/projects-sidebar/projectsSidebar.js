(function() {

	var app = angular.module('app.projectsSidebar', []);

	app.directive('projectsSidebar', function() {

		// Directive definition object
		return {
			restrict: 'A',	// Only match attribute name
			scope: {	// Isolate the directive's scope...
				projects: '=projects',	// We need the projects as `projects`
				activeProject: '=activeProject',
				projectClick: '&projectClick'
			},
			templateUrl: '/projects-sidebar/projects-sidebar.html'
		};
	});

})();