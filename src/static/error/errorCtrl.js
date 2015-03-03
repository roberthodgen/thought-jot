(function() {

	var app = angular.module('app.errorCtrl', []);

	app.controller('app.errorCtrl', ['$scope', '$route', 'app.appFactory', function($scope, $route, appFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.errorCtrl] $scope.init(): Called.');

			var errorMapping = {
				'/error/not-found.html': 'Not found'
			};

			if (errorMapping.hasOwnProperty($route.current.templateUrl)) {
				appFactory.config({
					'pageTitle': errorMapping[$route.current.templateUrl]
				});
			} else {
				appFactory.config({
					'pageTitle': null
				})
			}
		};


		// Init
		$scope.init();
	}]);

})();