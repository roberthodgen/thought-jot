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

					$scope.projectId = $routeParams.projectId;

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
						dataFactory.milestoneLabelRemove(label.id, $scope.milestone.id, $scope.projectId).then(function(response) {
							if (response.error) {
								alert('Error removing label.');
							}
						});
						// delete $scope.milestoneLabels[label.id];
					} else {
						dataFactory.milestoneLabelAdd(label.id, $scope.milestone.id, $scope.projectId).then(function(response) {
							if (response.error) {
								alert('Error adding label.');
							}
						});
						// $scope.milestoneLabels[label.id] = label;
					}
				};


				// Init
				$scope.init();
			}],
			templateUrl: '/project-labels/add-labels-popover.html'
		};
	}]);

})();