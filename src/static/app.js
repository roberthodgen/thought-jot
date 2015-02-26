(function(){


	// Declare the AngularJS app-level module as `app`
	var app = angular.module('app', [
		'ngRoute',
		'ngAnimate',

		// Shared components
		'app.filters',
		'app.appFactory',
		'ndb_users.userFactory',
		'app.dataFactory',

		'app.appCtrl',

		// Controllers
		'app.homeCtrl',
		'app.errorCtrl',
		'app.loginCtrl',
		'app.projectsHomeCtrl',
		'app.projectsNewCtrl',
		'app.projectDetailCtrl',
		'app.projectSettingsCtrl',

		// Directives
		'app.projectListGroupItem',
		'app.timeRecordListGroupItem',
		'app.projectsSidebar',


		// Third-party
		'yaru22.md'		// Markdown via https://github.com/yaru22/angular-md

	]);


	// Configure the $routeProvider's routes
	app.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: '/home/home.html',
			controller: 'app.homeCtrl'
		}).when('/login', {
			templateUrl: '/login/login.html',
			controller: 'app.loginCtrl'
		}).when('/login/login-create', {
			templateUrl: '/login/login-create.html',
			controller: 'app.loginCtrl'
		}).when('/login/login-create-success', {
			templateUrl: '/login/login-create-success.html',
			controller: 'app.loginCtrl'
		}).when('/projects', {
			templateUrl: '/projects/projects-home.html',
			controller: 'app.projectsHomeCtrl'
		}).when('/projects/new-project', {
			templateUrl: '/projects/projects-new.html',
			controller: 'app.projectsNewCtrl'
		}).when('/projects/:projectId', {
			templateUrl: '/projects/project-detail.html',
			controller: 'app.projectDetailCtrl',
			reloadOnSearch: false
		}).when('/projects/:projectId/settings', {
			templateUrl: '/project-settings/project-settings.html',
			controller: 'app.projectSettingsCtrl'
		}).when('/not-found', {
			templateUrl: '/error/not-found.html',
			controller: 'app.errorCtrl'
		}).otherwise({
			redirectTo: '/not-found'
		})
	}]);

	
	// Enable HTML5-mode for $locationProvider
	app.config(['$locationProvider', function($locationProvider) {
		$locationProvider.html5Mode(true);
	}]);

})();