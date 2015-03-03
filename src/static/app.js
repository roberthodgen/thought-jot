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

		// Directives
		'app.projectsNav',

		'app.appCtrl',

		// Controllers
		'app.homeCtrl',
		'app.errorCtrl',
		'app.loginCtrl',
		'app.newProjectCtrl',
		'app.projectTimeRecordsCtrl',
		'app.projectMilestonesCtrl',
		'app.newMilestoneCtrl',
		'app.projectLabelsCtrl',
		'app.newLabelCtrl',
		
		'app.projectsHomeCtrl',
		'app.projectDetailCtrl',
		'app.projectSettingsCtrl',

		// Directives
		'app.projectListGroupItem',
		'app.timeRecordListGroupItem',
		'app.projectsSidebar',
		'app.milestoneListGroupItem',
		'app.label',


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
			templateUrl: '/new-project/new-project.html',
			controller: 'app.newProjectCtrl'
		}).when('/projects/:projectId', {
			templateUrl: '/project-overview/project-overview.html',
			controller: 'app.projectDetailCtrl',
			reloadOnSearch: false
		}).when('/projects/:projectId/time-records', {
			templateUrl: '/project-time-records/project-time-records.html',
			controller: 'app.projectTimeRecordsCtrl',
			reloadOnSearch: false
		}).when('/projects/:projectId/milestones', {
			templateUrl: '/project-milestones/project-milestones.html',
			controller: 'app.projectMilestonesCtrl',
			reloadOnSearch: false
		}).when('/projects/:projectId/milestones/new-milestone', {
			templateUrl: '/new-milestone/new-milestone.html',
			controller: 'app.newMilestoneCtrl'
		}).when('/projects/:projectId/labels', {
			templateUrl: '/project-labels/project-labels.html',
			controller: 'app.projectLabelsCtrl'
		}).when('/projects/:projectId/labels/new-label', {
			templateUrl: '/project-labels/new-label.html',
			controller: 'app.newLabelCtrl'
		}).when('/projects/:projectId/comments', {
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