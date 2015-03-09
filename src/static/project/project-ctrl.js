(function() {

	var app = angular.module('app.projectCtrl', []);

	app.controller('app.projectCtrl', ['$scope', '$location', '$state', 'app.appFactory', 'app.dataFactory', 'project', 'projectId', function($scope, $location, $state, appFactory, dataFactory, project, projectId) {

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
		};

		$scope.backgroundClick = function() {
			// Remove the edit search property
			var _search = $location.search();
			$location.search({
				edit: null,
				view: null
			});
		};


		// Init
		$scope.init();

		// Destroy
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