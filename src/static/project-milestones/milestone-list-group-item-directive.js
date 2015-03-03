(function() {

	var app = angular.module('app.milestoneListGroupItem', []);

	app.directive('milestoneListGroupItem', ['$compile', function($compile) {

		// Directive definition object
		return {
			restrict: 'A',	// Only match attribute name
			scope: {	// Isolate the directive's scope...
				milestone: '=milestone'	// We need the Time Record as `milestone`
			}, controller: ['$scope', '$routeParams', 'app.dataFactory', function($scope, $routeParams, dataFactory) {
				/*
					Controller for milestoneListGroupItem directive
				*/

				$scope.init = function() {

					$scope.comments = {};
					$scope.commentsLoaded = false;
					$scope.commentsError = false;

					dataFactory.comments($scope.milestone.id).then(function(response) {
						$scope.commentsLoaded = true;
						if (!response.error) {
							$scope.comments = response;
						} else {
							$scope.commentsError = true;
						}
					});
				};

				$scope.complete = function() {
					dataFactory.completeMilestone($scope.milestone).then(function(response) {
						if (response.error) {
							alert('Error completing Time Record: '+response.message);
						}
					});
				};



				$scope.update = function() {
					dataFactory.updateMilestone($scope.milestone).then(function(response) {
						if (!response.error) {
							$scope.milestone._name = response.name;
							$scope.editForm.$setPristine();
						} else {
							alert('Error updating Time Record: '+response.message);
						}
					});
				};

				$scope.addComment = function(milestone) {
					var options = {
						'project_id': $routeParams.projectId,
						'parent_id': milestone.id,
						'comment': milestone._new_comment
					};
					dataFactory.createComment(options).then(function(response) {
						if (!response.error) {
							$scope.milestone._new_comment = '';
						} else {
							alert('Error adding Comment: '+response.message);
						}
					});
				};


				// Init
				$scope.init();
			}],
			templateUrl: '/project-milestones/milestone-list-group-item.html'
		};
	}]);

})();