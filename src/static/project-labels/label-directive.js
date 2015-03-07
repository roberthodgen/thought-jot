(function() {

	var app = angular.module('app.label', []);

	app.directive('label', function() {

		// Directive definition object
		return {
			restrict: 'A',	// Only match attribute name
			scope: {	// Isolate the directive's scope...
				label: '='	// We need the Label as `label`
			},
			templateUrl: '/project-labels/label.html'
		};
	});

})();