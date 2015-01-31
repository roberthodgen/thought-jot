(function() {

	var app = angular.module('app.appCtrl', []);

	app.controller('app.appCtrl', ['$scope', 'app.pageTitleFactory', 'ndb_users.userFactory', function($scope, pageTitleFactory, userFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.appCtrl] $scope.init(): call');

			$scope.user = {};
			$scope.userLoaded = false;
			$scope.hasUser = false;

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (response.hasOwnProperty('user')) {
					$scope.user = response.user;
					$scope.hasUser = true;
				}
			});
		};

		$scope.pageTitle = function() {
			return pageTitleFactory.pageTitle();
		};


		// Init
		$scope.init();
	}]);

})();