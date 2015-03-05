(function() {

	var app = angular.module('app.addLabelsPopover', []);

	app.directive('addLabelsPopover', ['$compile', function($compile) {

		// Directive definition object
		return {
			restrict: 'A',	// Only match attribute name
			scope: {	// Isolate the directive's scope...
				milestone: '='	// We need the Time Record as `milestone`
			}, controller: ['$scope', '$routeParams', 'app.dataFactory', function($scope, $routeParams, dataFactory) {
				/*
					Controller for addLabelsPopover directive
				*/

				$scope.init = function() {
					console.log('[app.addLabelsPopover] $scope.init(): Called.');

					$scope.milestoneLabels = {};
					$scope.milestoneLabelsLoaded = false;
					$scope.milestoneLabelsError = false;
					dataFactory.labelsForMilestone($scope.milestone.id).then(function(response) {
						$scope.milestoneLabelsLoaded = true;
						if (!response.error) {
							// Success
							$scope.milestoneLabels = response;
						} else {
							// Error
							$scope.milestoneLabelsError = true;
						}
					});

					$scope.projectLabels = {};
					$scope.projectLabelsLoaded = false;
					$scope.projectLabelsError = false;
					dataFactory.labelsForProject($routeParams.projectId).then(function(response) {
						$scope.projectLabelsLoaded = true;
						if (!response.error) {
							// Success
							$scope.projectLabels = response;
						} else {
							// Error
							$scope.projectLabelsError = true;
						}
					});
				};

				$scope.labelSelected = function(label) {
					return $scope.milestoneLabels.hasOwnProperty(label.id);
				};

				$scope.toggleLabel = function(label) {
					if ($scope.milestoneLabels.hasOwnProperty(label.id)) {
						delete $scope.milestoneLabels[label.id];
					} else {
						$scope.milestoneLabels[label.id] = label;
					}
				};


				// Init
				$scope.init();
			}],
			templateUrl: '/project-labels/add-labels-popover.html'
		};
	}]);

})();