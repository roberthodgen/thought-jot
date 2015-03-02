(function() {

	var app = angular.module('app.projectMilestonesCtrl', []);

	app.controller('app.projectMilestonesCtrl', ['$scope', '$location', '$routeParams', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, $routeParams, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectMilestonesCtrl] $scope.init(): call');
			appFactory.config({
				pageTitle: 'Loading...',
				navbar: {
					title: 'Loading...',
					link: '/projects/' + $routeParams.projectId
				}, sidebar: {
					selection: $routeParams.projectId
				}, projectsNav: {
					selection: 'milestones'
				}
			});

			$scope.projectId = $routeParams.projectId;

			$scope.user = {};
			$scope.userLoaded = false;

			$scope.project = {};
			$scope.projectLoaded = true;

			$scope.milestones = {};
			$scope.milestonesLoaded = false;

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;

					// Redirect if not logged in
					if (!response.email) {
						$location.path('/login');
					}

					dataFactory.milestones($scope.projectId).then(function(response) {
						$scope.milestonesLoaded = true;
						if (!response.error) {
							// Success
							$scope.milestones = response;

							var _search = $location.search();

							// Search for uncompleted Time Records (to start the counter)
							var _keys = Object.keys(response);
							for (var i = _keys.length - 1; i >= 0; i--) {

								// Delete our temp `_view` property
								if (response[_keys[i]].id === _search.view) {
									response[_keys[i]]._view = true;
									response[_keys[i]]._name = angular.copy(response[_keys[i]].name);
								} else {
									delete response[_keys[i]]._view;
								}

								// Go ahead and start the click IF there's not `end` property								
								if (response[_keys[i]].end == null && response[_keys[i]].start) {
									$scope.startUncompletedSecondsCount();
								}
							}
						} else {
							// Error
						}
					});

					dataFactory.project($scope.projectId).then(function(response) {
						$scope.projectLoaded = true;
						if (!response.error) {
							// Success
							$scope.project = response;

							appFactory.config({
								pageTitle: 'Milestones: ' + response.name,
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

		// Watch for changes in the `view` search parameter...
		$scope.$watch(function() {
			var _search = $location.search();
			return _search.view;
		}, function(newValue, oldValue) {
			// Loop through and delete all not equal to this `newValue`
			console.log('[app.projectMilestonesCtrl] $scope.$watch(): Detected new `view` search value: '+newValue);
			var _keys = Object.keys($scope.milestones);
			if (angular.isString(newValue)) {
				// Loop through and delete all but this key
				for (var i = _keys.length - 1; i >= 0; i--) {
					if ($scope.milestones[_keys[i]].id != newValue) {
						delete $scope.milestones[_keys[i]]._view;
						delete $scope.milestones[_keys[i]]._name;
					} else {
						$scope.milestones[_keys[i]]._view = true;
						$scope.milestones[_keys[i]]._name = angular.copy($scope.milestones[_keys[i]].name);
					}
				}
			} else {
				// Loop through all and remove `_view` and `_name`
				for (var i = _keys.length - 1; i >= 0; i--) {
					delete $scope.milestones[_keys[i]]._view;
					delete $scope.milestones[_keys[i]]._name;
				}
			}
		});

		$scope.save = function() {
			console.log('[app.projectMilestonesCtrl] $scope.save(): called');
			$scope.projectLoaded = false;
			dataFactory.updateProject($scope.project).then(function(response) {
				$scope.projectLoaded = true;
				if (!response.error) {
					$location.path('/projects/'+response.id);
				} else {
					alert('Error creating project.');
				}
			});
		};

		$scope.milestoneClick = function(milestone) {
			$location.search('view', milestone.id);
		};

		$scope.backgroundClick = function() {
			// Remove the view search property
			var _search = $location.search();
			$location.search('view', null);
		};


		// Init
		$scope.init();
	}]);

})();