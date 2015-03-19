(function() {

	var app = angular.module('app.projectCtrl', []);

	app.controller('app.projectCtrl', ['$scope', '$state', 'app.appFactory', 'app.dataFactory', 'project', 'projectId', function($scope, $state, appFactory, dataFactory, project, projectId) {

		$scope.projectId = projectId;
		$scope.project = project;

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: $scope.project.name,
				navbar: {
					title: $scope.project.name,
					link: $state.href('app.project')
				}, sidebar: {
					selection: $scope.projectId
				}, projectsNav: {
					selection: 'overview'
				}
			});

			// Add this Project to the uncompleted seconds watcher...
			dataFactory.uncompletedSecondsWatchAddProjectId($scope.projectId);

			// The Project stores temporary search parameters for the Issues controller;
			// this way some settings (namely the `showLabelsPopover` persists through reloads).
			$scope.searchOptions = {
				open: 'open',
				text: {
					name: ''
				}, labels: {},
				showLabelsPopover: false
			};
		};

		$scope.createTimeRecord = function() {
			dataFactory.createTimeRecord($scope.projectId).then(function(response) {
				if (!response.error) {
					$state.go('app.project.time-records.project-time-records.view-time-record', { timeRecordId: response.id });
				} else {
					alert('Error creating Time Record: '+response.message);
				}
			});
		};

		$scope.backgroundClick = function() {
			console.log('[app.projectCtrl] $scope.backgroundClick(): Called.');

			$scope.$broadcast('backgroundClick', {});
		};


		// Init
		$scope.init();

		// Cleanup
		$scope.$on('$destroy',  function() {
			// Remove this Project from the uncompleted seconds watcher...
			dataFactory.uncompletedSecondsWatchRemoveProjectId($scope.projectId);
		});
	}]);


	/*
	*	projects-nav directive
	*/

	app.directive('projectsNav', function() {
		return {
			restrict: 'A',
			templateUrl: '/project/nav.html',
			controller: ['$scope', '$state', function($scope, $state) {
				$scope.stateIncludes = function(state_name) {
					return $state.includes(state_name);
				};
			}]
		};
	});

})();