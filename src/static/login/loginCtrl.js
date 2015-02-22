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

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;

					// Redirect if logged in
					if (response.email) {
						$location.path('/projects');
					}
				}
			});

			$scope.email = '';
			$scope.password = '';
			$scope.password2 = '';
		};

		$scope.login = function() {
			console.log('[app.loginCtrl] $scope.login(): called');
			userFactory.userLogin($scope.email, $scope.password, true).then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;

					// Redirect...
					$location.path('/projects');
				} else {
					if (response.message) {
						alert(response.message);
					} else if (response.status) {
						alert('Error processing login: HTTP/1.1 '+response.status);
					}
				}
			});
		};

		$scope.create = function() {
			console.log('[app.loginCtrl] $scope.create(): called');
			userFactory.userCreate($scope.email, $scope.password).then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {

					if (response.hasOwnProperty('email')) {
						// Redirect
						$location.path('/projects');
					} else {
						// Success
						$location.path('/login/login-create-success');
					}
					
				} else {
					alert('Error creating your account: '+response.message);
				}
			});
		};


		// Init
		$scope.init();
	}]);

})();