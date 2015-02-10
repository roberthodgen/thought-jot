(function() {

	var app = angular.module('app.projectListGroupItem', []);

	app.directive('projectListGroupItem', function() {

		// Directive definition object
		return {
			// restrict: 'E',
			templateUrl: '/projects/project-list-group-item.html'
		}
	});

})();