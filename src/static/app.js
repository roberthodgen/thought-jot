(function(){


	// Declare the AngularJS app-level module as `app`
	var app = angular.module('app', [
		'ngAnimate',

		// Shared components
		'app.filters',
		'app.appFactory',
		'ndb_users.userFactory',
		'app.dataFactory',

		'app.appCtrl',

		// Controllers
		'app.projectCtrl',
		'app.loginCtrl',
		'app.createProjectCtrl',
		'app.projectTimeRecordsCtrl',
		'app.projectIssuesCtrl',
		'app.createIssueCtrl',
		'app.projectLabelsCtrl',
		'app.createLabelCtrl',
		'app.projectSharingCtrl',
		'app.projectsHomeCtrl',
		'app.projectSettingsCtrl',

		// Directives
		'app.projectListGroupItem',
		'app.projectsSidebar',
		'app.labelsPopover',
		'app.label',
		'app.issueDirectives',
		'app.timeRecordDirectives',


		// Third-party
		'yaru22.md',	// Markdown via https://github.com/yaru22/angular-md
		'ui.router'		// Angular UI Router via https://github.com/angular-ui/ui-router

	]);

	app.config(['$stateProvider', function($stateProvider) {


		/*
		*	Home
		*/

		$stateProvider.state('home', {
			url: '/',
			templateUrl: '/home/home.html',
			controller: ['$state', 'app.appFactory', function($state, appFactory) {
				appFactory.config({
					pageTitle: null,
					navbar: {
						title: null,
						link: $state.href('home')
					}
				});
			}]
		});


		/*
		*	Home
		*/

		$stateProvider.state('not-found', {
			url: '/not-found',
			templateUrl: '/error/not-found.html',
			controller: ['$state', 'app.appFactory', function($state, appFactory) {
				appFactory.config({
					pageTitle: 'Not found',
					navbar: {
						title: null,
						link: $state.href('home')
					}
				});
			}]
		});


		/*
		*	Login
		*/

		$stateProvider.state('login', {
			url: '/login',
			templateUrl: '/login/login.html',
			controller: 'app.loginCtrl'
		});


		/*
		*	Login > Create Login
		*/

		$stateProvider.state('create-login', {
			url: '/login-create',
			templateUrl: '/login/login-create.html',
			controller: 'app.loginCtrl'
		});


		/*
		*	Abstract state meant to resolve users;
		*	will redirect if no user is found.
		*/

		$stateProvider.state('app', {
			url: '/app',
			abstract: true,
			template: '<div ui-view></div>',
			resolve: {
				user: ['ndb_users.userFactory', function(userFactory) {
					return userFactory.user();
				}]
			}, controller: ['$scope', '$state', 'user', function($scope, $state, user) {
				$scope.user = user;

				// Redirect if not logged in
				if (!angular.isDefined($scope.user.email)) {
					$state.go('login');
				}
			}]
		});


		/*
		*	App > Projects
		*/

		$stateProvider.state('app.projects', {
			url: '^/projects',
			templateUrl: '/projects/projects-home.html',
			resolve: {
				projects: ['app.dataFactory', function(dataFactory) {
					return dataFactory.projects();
				}]
			}, controller: 'app.projectsHomeCtrl',
		});


		/*
		*	App > Create Project
		*/

		$stateProvider.state('app.create-project', {
			url: '^/projects/create-project',
			templateUrl: '/project/create.html',
			controller: 'app.createProjectCtrl'
		});


		/*
		*	App > Project
		*/

		$stateProvider.state('app.project', {
			url: '^/projects/:projectId',
			abstract: true,
			templateUrl: '/project/project.html',
			resolve: {
				projectId: ['$stateParams', function($stateParams) {
					return $stateParams.projectId;
				}], project: ['app.dataFactory', '$stateParams', function(dataFactory, $stateParams) {
					return dataFactory.project($stateParams.projectId);
				}]
			}, controller: 'app.projectCtrl',
		});


		/*
		*	App > Project > Project Overview
		*/

		$stateProvider.state('app.project.project-overview', {
			url: '',
			templateUrl: '/project-overview/overview.html',
			resolve: {
				projectId: ['$stateParams', function($stateParams) {
					return $stateParams.projectId;
				}], project: ['$stateParams', 'app.dataFactory', function($stateParams, dataFactory) {
					return dataFactory.project($stateParams.projectId);
				}]
			}, controller: ['$scope', 'app.appFactory', function($scope, appFactory) {
				appFactory.config({
					pageTitle: $scope.project.name
				});
			}]
		});


		/*
		*	App > Project > Time Records
		*/

		$stateProvider.state('app.project.time-records', {
			url: '/time-records',
			abstract: true,
			reloadOnSearch: false,
			template: '<div ui-view></div>',
			resolve: {
				timeRecords: ['$stateParams', 'app.dataFactory', function($stateParams, dataFactory) {
					return dataFactory.timeRecords($stateParams.projectId);
				}]
			}, controller: ['$scope', 'timeRecords', function($scope, timeRecords) {
				$scope.timeRecords = timeRecords;
			}]
		});


		/*
		*	App > Project > Time Records > Project Time Records
		*/

		$stateProvider.state('app.project.time-records.project-time-records', {
			url: '',
			templateUrl: '/project-time-records/time-records.html',
			controller: 'app.projectTimeRecordsCtrl'
		});


		/*
		*	App > Project > Time Record> Project Time Record > View Time Record
		*
		*	This is essentially an abstract State in that it doesn't modify the view;
		*	view modification is done via `app.project.time-records.project-time-recordss`.
		*/

		$stateProvider.state('app.project.time-records.project-time-records.view-time-record', {
			url: '/:timeRecordId'
		});


		/*
		*	App > Project > Time Record> Project Time Record > Edit Time Record
		*
		*	This is essentially an abstract State in that it doesn't modify the view;
		*	view modification is done via `app.project.time-records.project-time-recordss`.
		*/

		$stateProvider.state('app.project.time-records.project-time-records.edit-time-record', {
			url: '/:timeRecordId/edit'
		});


		/*
		*	App > Project > Issues
		*/

		$stateProvider.state('app.project.issues', {
			url: '/issues',
			abstract: true,
			template: '<div ui-view></div>',
			resolve: {
				labels: ['$stateParams', 'app.dataFactory', function($stateParams, dataFactory) {
					return dataFactory.labelsForProject($stateParams.projectId);
				}]
			}, controller: ['$scope', 'labels', function($scope, labels) {
				$scope.labels = labels;
			}]
		});


		/*
		*	App > Project > Issues > Create Issue
		*/

		$stateProvider.state('app.project.issues.create-issue', {
			url: '/create-issue',
			templateUrl: '/project-issues/create.html',
			controller: 'app.createIssueCtrl'
		});


		/*
		*	App > Project > Issues > Project Issues
		*/

		$stateProvider.state('app.project.issues.project-issues', {
			url: '?f',
			templateUrl: '/project-issues/issues.html',
			resolve: {
				issues: ['$stateParams', 'app.dataFactory', function($stateParams, dataFactory) {
					return dataFactory.milestones($stateParams.projectId);
				}]
			}, controller: 'app.projectIssuesCtrl'
		});


		/*
		*	App > Project > Issues > Project Issues > View Issue
		*
		*	This is essentially an abstract State in that it doesn't modify the view;
		*	view modification is done via `app.project.issues.project-issues`.
		*/

		$stateProvider.state('app.project.issues.project-issues.view-issue', {
			url: '/:milestoneId'
		});


		/*
		*	App > Project > Issues > Project Issues > Edit Issue
		*
		*	This is essentially an abstract State in that it doesn't modify the view;
		*	view modification is done via `app.project.issues.project-issues`.
		*/

		$stateProvider.state('app.project.issues.project-issues.edit-issue', {
			url: '/:milestoneId/edit'
		});


		/*
		*	App > Project > Labels
		*/

		$stateProvider.state('app.project.labels', {
			url: '/labels',
			abstract: true,
			template: '<div ui-view></div>',
			resolve: {
				labels: ['$stateParams', 'app.dataFactory', function($stateParams, dataFactory) {
					return dataFactory.labelsForProject($stateParams.projectId);
				}]
			}, controller: ['$scope', 'labels', function($scope, labels) {
				$scope.labels = labels;

				$scope.colors = [
					'#da4453',
					'#e9573f',
					'#ffce54',
					'#8cc152',
					'#37bc9b',
					'#3bafda',
					'#4a89dc',
					'#967acd',
					'#d770ad',
					'#e6e9ed',
					'#aab2bd',
					'#434a54'
				];
			}]
		});


		/*
		*	App > Project > Labels > Project Labels
		*/

		$stateProvider.state('app.project.labels.project-labels', {
			url: '',
			reloadOnSearch: false,
			templateUrl: '/project-labels/labels.html',
			controller: 'app.projectLabelsCtrl'
		});


		/*
		*	App > Project > Labels > Create Label
		*/

		$stateProvider.state('app.project.labels.create-label', {
			url: '/create-label',
			templateUrl: '/project-labels/create.html',
			controller: 'app.createLabelCtrl'
		});


		/*
		*	App > Project > Project Settings
		*/

		$stateProvider.state('app.project.project-settings', {
			url: '/settings',
			templateUrl: '/project-settings/settings.html',
			controller: 'app.projectSettingsCtrl'
		});


		/*
		*	App > Project > Project Sharing
		*/

		$stateProvider.state('app.project.project-sharing', {
			url: '/sharing',
			templateUrl: '/project-sharing/sharing.html',
			controller: 'app.projectSharingCtrl'
		});

	}]);


	app.config(function($urlRouterProvider){
		// if the path doesn't match any of the urls you configured
		// otherwise will take care of routing the user to the specified url
		$urlRouterProvider.otherwise('/not-found');
	});


	// Configure the $routeProvider's routes
	// app.config(['$routeProvider', function($routeProvider) {
	// 	$routeProvider.when('/', {
	// 	}).when('/login/login-create-success', {
	// 		templateUrl: '/login/login-create-success.html',
	// 		controller: 'app.loginCtrl'
	// 		
	// 		
	// 	}).when('/projects/:projectId/labels/new-label', {
	// 		templateUrl: '/project-labels/new-label.html',
	// 		controller: 'app.newLabelCtrl'
	// 	}).when('/projects/:projectId/comments', {
	// 		templateUrl: '/projects/project-detail.html',
	// 		controller: 'app.projectDetailCtrl',
	// 		reloadOnSearch: false
	// 	}).when('/not-found', {
	// 		templateUrl: '/error/not-found.html',
	// 		controller: 'app.errorCtrl'
	// 	}).otherwise({
	// 		redirectTo: '/not-found'
	// 	})
	// }]);

	
	// Enable HTML5-mode for $locationProvider
	app.config(['$locationProvider', function($locationProvider) {
		$locationProvider.html5Mode(true);
	}]);

})();