(function(){


	// Declare the AngularJS app-level module as `app`
	var app = angular.module('app', [
		'ngRoute',

		'app.appFactory',
		'ndb_users.userFactory',

		'app.appCtrl',

		'app.homeCtrl',
		'app.loginCtrl',
		'app.projectsHomeCtrl',
		'app.projectsNewCtrl'

	]);


	// Configure the $routeProvider's routes
	app.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: '/home/home.html',
			controller: 'app.homeCtrl'
		}).when('/login', {
			templateUrl: '/login/login.html',
			controller: 'app.loginCtrl'
		}).when('/projects', {
			templateUrl: '/projects/projects-home.html',
			controller: 'app.projectsHomeCtrl'
		}).when('/projects/new-project', {
			templateUrl: '/projects/projects-new.html',
			controller: 'app.projectsNewCtrl'
		}).when('/not-found', {
			templateUrl: '/error/not-found.html'
		}).otherwise({
			redirectTo: '/not-found'
		})
	}]);

	
	// Enable HTML5-mode for $locationProvider
	app.config(['$locationProvider', function($locationProvider) {
		$locationProvider.html5Mode(true);
	}]);

})();