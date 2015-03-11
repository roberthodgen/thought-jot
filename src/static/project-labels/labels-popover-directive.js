(function() {

	var app = angular.module('app.labelsPopover', []);

	/*
	*	selectLabelsPopover
	*	Directive
	*
	*	Usage: <div select-labels-popover="destinationLabels" [issue="issue"]></div>
	*
	*	Loads Labels according to the $stateParams' `projectId`
	*
	*	@param {Object} destinationLabels - An object of Keyed Label Objects (where the root key is a Label's ID);
	*		inserts objects into `destinationLabels` if no `issue` argument is supplied.
	*
	*	@param {Object} issue - Optional - The Issue to add/remove Labels from;
	*		if missing: Labels will be inserted/removed from the `destinationLabels` object.
	*
	*	Required an `ngShow` directive be present;
	*	Uses the value passed to `ngShow` to hide the Popover when the "X" is clicked.
	*/
	app.directive('selectLabelsPopover', ['$compile', function($compile) {
		return {
			restrict: 'A',	// Only match attribute name
			replace: true,
			require: 'ngShow',	// Require ngShow
			scope: {	// Isolate the directive's scope...
				destinationLabels: '=selectLabelsPopover',
				issue: '=issue',
				showPopover: '=ngShow'
			}, controller: ['$scope', '$stateParams', 'app.dataFactory', function($scope, $stateParams, dataFactory) {
				$scope.init = function() {

					$scope.labels = {};

					dataFactory.labelsForProject($stateParams.projectId).then(function(response) {
						$scope.labels = response;
					});

				};

				$scope.labelSelected = function(label) {
					return $scope.destinationLabels.hasOwnProperty(label.id);
				};

				$scope.toggleLabel = function(label) {
					// The Label was clicked...

					// See if our `destinationLabels` contains the clicked label
					if ($scope.destinationLabels.hasOwnProperty(label.id)) {	// Find it by ID...
						// `destinationLabels` contains `label`...

						// Determine if we're setting to an Issue...
						if (angular.isObject($scope.issue)) {
							// Involve the `dataFactory`...
							dataFactory.milestoneLabelRemove(label.id, $scope.issue.id, $stateParams.projectId).then(function(response) {
								if (response.error) {
									alert('Error removing label.');
								}
							});
						} else {
							// Just remove it from our `destinationLabels` object
							delete $scope.destinationLabels[label.id];
						}
					} else {
						// `destinationLabels` does not contain `label...

						// Determine if we're setting to an Issue...
						if (angular.isObject($scope.issue)) {
							// Involve the `dataFactory`...
							dataFactory.milestoneLabelAdd(label.id, $scope.issue.id, $stateParams.projectId).then(function(response) {
								if (response.error) {
									alert('Error adding label.');
								}
							});
						} else {
							// Just add it to our `destinationLabels` object
							$scope.destinationLabels[label.id] = label;
						}
					}
				};


				// Init
				$scope.init();
			}], templateUrl: '/project-labels/select-labels-popover.html'
		};
	}]);

})();