(function() {

	var app = angular.module('app.newMilestoneCtrl', []);

	app.controller('app.newMilestoneCtrl', ['$scope', '$location', '$routeParams', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, $routeParams, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.newMilestoneCtrl] $scope.init(): Called.');
			$scope.projectId = $routeParams.projectId;
			appFactory.config({
				pageTitle: 'Loading...',
				navbar: {
					title: 'Loading...',
					link: '/projects/' + $scope.projectId
				},
				sidebar: {
					selection: $scope.projectId
				}, projectsNav: {
					selection: 'milestones'
				}
			});

			$scope.user = {};
			$scope.userLoaded = false;

			$scope.project = {};
			$scope.projectLoaded = false;

			$scope.labels = {};
			$scope.labelsLoaded = false;

			$scope.milestone = {
				name: '',
				description: '',
				labels: {}
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

					dataFactory.project($scope.projectId).then(function(response) {
						$scope.projectLoaded = true;
						if (!response.error) {
							// Success
							$scope.project = response;

							appFactory.config({
								pageTitle: 'New milestone: ' + response.name,
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

					dataFactory.labelsForProject($scope.projectId).then(function(response) {
						$scope.labelsLoaded = true;
						if (!response.error) {
							// Success
							$scope.labels = response;
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

			var milestone = {
				name: $scope.milestone.name,
				description: $scope.milestone.description,
				labels: []
			};

			// Add each Label's ID...
			var _label_ids = Object.keys($scope.milestone.labels);
			for (var i = _label_ids.length - 1; i >= 0; i--) {
				milestone.labels.push(_label_ids[i]);
			}

			dataFactory.createMilestone(milestone, $scope.projectId).then(function(response) {
				$scope.milestoneLoaded = true;
				if (!response.error) {
					$location.path('/projects/'+$scope.projectId+'/milestones').search({'view': response.id});
				} else {
					alert('Error creating Milestone.');
				}
			});
		};

		$scope.labelSelected = function(label) {
			return $scope.milestone.labels.hasOwnProperty(label.id);
		};

		$scope.toggleLabel = function(label) {
			if ($scope.milestone.labels.hasOwnProperty(label.id)) {
				delete $scope.milestone.labels[label.id];
			} else {
				$scope.milestone.labels[label.id] = label;
			}
		};


		// Init
		$scope.init();
	}]);

})();