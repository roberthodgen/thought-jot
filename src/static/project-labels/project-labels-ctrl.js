(function() {

	var app = angular.module('app.projectLabelsCtrl', []);

	app.controller('app.projectLabelsCtrl', ['$scope', '$location', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectLabelsCtrl] $scope.init(): Called.');
			appFactory.config({
				pageTitle: 'Labels: ' + $scope.project.name
			});

		};

		$scope.deleteLabel = function(label) {
			console.log('[app.projectLabelsCtrl] $scope.deleteLabel(): Called.');
			if (confirm('Delete label: '+label.name)) {
				dataFactory.deleteLabel($scope.projectId, label.id).then(function(response) {
					if (response.error) {
						alert('Error deleting label: '+response.status);
					}
				});
			}
		};

		$scope.editLabel = function(label) {
			console.log(['app.projectLabelsCtrl] $scope.editLabel(): Called.']);
			if (!label._edit) {
				label._edit = true;
				label._name = angular.copy(label.name);
				label._color = angular.copy(label.color);
			} else {
				delete label._edit;
				delete label._name;
				delete label._color;
				delete label._custom_color;
			}
		};

		$scope.saveLabel = function(label) {

			dataFactory.updateLabel({
				name: angular.copy(label._name),
				color: angular.copy(label._color)
			}, angular.copy(label.id), $scope.projectId).then(function(response) {
				if (!response.error) {
					delete label._edit;
					delete label._name;
					delete label._color;
					delete label._custom_color;
				} else {
					alert('Error saving label.');
				}
			});
		};


		// Init
		$scope.init();
	}]);

})();