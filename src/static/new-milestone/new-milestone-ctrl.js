(function() {

	var app = angular.module('app.newMilestoneCtrl', []);

	app.controller('app.newMilestoneCtrl', ['$scope', '$location', '$routeParams', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, $routeParams, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.newMilestoneCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'Loading...',
				navbar: {
					title: 'Loading...',
					link: '/projects/' + $routeParams.projectId
				},
				sidebar: {
					selection: $routeParams.projectId
				}, projectsNav: {
					selection: 'milestones'
				}
			});

			$scope.user = {};
			$scope.userLoaded = false;

			$scope.milestone = {
				'name': '',
				'description': ''
			};
			$scope.milestoneLoaded = true;	// Simply indicates FALSE when a request to create a project is in progress

			$scope.projectDescriptionPreview = false;

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;

					// Redirect if not logged in
					if (!response.email) {
						$location.path('/login');
					}

					dataFactory.project($routeParams.projectId).then(function(response) {
						$scope.projectLoaded = true;
						if (!response.error) {
							// Success
							$scope.project = response;

							appFactory.config({
								pageTitle: response.name,
								navbar: {
									title: response.name
								}, sidebar: {
									selection: response.id
								}
							});
						} else {
							// Error
						}
					});
				} else {
					alert('Error loading User.');
				}
			});
		};

		$scope.create = function() {
			console.log('[app.newMilestoneCtrl] $scope.create(): Called.');
			$scope.milestoneLoaded = false;
			dataFactory.createMilestone($scope.milestone, $routeParams.projectId).then(function(response) {
				$scope.milestoneLoaded = true;
				if (!response.error) {
					$location.path('/projects/'+$routeParams.projectId+'/milestones').search({'view': response.id});
				} else {
					alert('Error creating Milestone.');
				}
			});
		};


		// Init
		$scope.init();
	}]);

})();