(function() {

	var app = angular.module('app.projectListGroupItem', []);

	app.directive('projectListGroupItem', function() {

		// Directive definition object
		return {
			restrict: 'A',	// Only match attribute name
			scope: {	// Isolate the directive's scope...
				project: '=project'	// We need the project as `project`
			},
			templateUrl: '/projects/project-list-group-item.html'
		};
	});

})();