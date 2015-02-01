(function() {

	var app = angular.module('app.loginCtrl', []);

	app.controller('app.loginCtrl', ['$scope', '$location', 'app.appFactory', 'ndb_users.userFactory', function($scope, $location, appFactory, userFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.loginCtrl] $scope.init(): call');
			appFactory.config({
				'pageTitle': 'Log in',
				'navActive': 'login'
			});

			$scope.user = {};
			$scope.userLoaded = false;
			$scope.hasUser = false;

			userFactory.user().then(function(response) {
				$scope.userFactory = true;
				if (response.hasOwnProperty('user')) {
					$scope.user = response.user;
					$scope.hasUser = true;

					$location.path('/projects')
				}
			});
		};

		$scope.login = function() {
			console.log('[app.loginCtrl] $scope.login(): called');
			userFactory.userLogin($scope.login.email, $scope.login.password, true).then(function(response) {
				$scope.userLoaded = true;
				if (response.hasOwnProperty('user')) {
					$scope.user = response.user;
					$scope.hasUser = true;

					// Redirect...
					$location.path('/projects');
				}
			});
		};

		$scope.create = function() {
			console.log('[app.loginCtrl] $scope.create(): called');
			userFactory.userCreate($scope.newUser.email, $scope.newUser.password).then(function(response) {

			});
		};


		// Init
		$scope.init();
	}]);

})();