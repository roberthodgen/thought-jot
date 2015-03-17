(function() {

	var app = angular.module('app.projectsHomeCtrl', []);

	app.controller('app.projectsHomeCtrl', ['$scope', '$location', '$filter', '$interval', 'app.appFactory', 'projects', function($scope, $location, $filter, $interval, appFactory, projects) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectsHomeCtrl] $scope.init(): Called.');
			appFactory.config({
				'pageTitle': 'Projects'
			});

			$scope.search = {
				'name': ''
			};

			$scope.projects = projects;
			$scope.activeResults = [];
			$scope.inProgressProjects = [];
			$scope.inProgressResults = [];
			
		};

		

		// Watch for changes in $scope.inProgressResults (an alias from an ngRepeat), to update our inProgressProjects (used for count; hiding the section)
		// $scope.$watch(function() {
		// 	return $scope.inProgressResults;
		// }, function(newValue, oldValue) {
		// 	$scope.inProgressProjects = $filter('filterInProgressProjects')($scope.projects);
		// });


		// Init
		$scope.init();


	}]);

})();