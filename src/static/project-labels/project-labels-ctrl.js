(function() {

	var app = angular.module('app.projectLabelsCtrl', []);

	app.controller('app.projectLabelsCtrl', ['$scope', '$location', '$routeParams', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, $location, $routeParams, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.projectLabelsCtrl] $scope.init(): Called.');
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
					selection: 'labels'
				}
			});

			$scope.colors = [
				'#da4453',
				'#e9573f',
				'#ffce54',
				'#8cc152',
				'#37bc9b',
				'#3bafda',
				'#4a89dc',
				'#967acd',
				'#d770ad',
				'#e6e9ed',
				'#aab2bd',
				'#434a54'
			];

			$scope.user = {};
			$scope.userLoaded = false;

			$scope.labels = {};
			$scope.labelsLoaded = false;

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
								pageTitle: 'Labels: ' + response.name,
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
					})
				} else {
					alert('Error loading User.');
				}
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

			var _label = {
				id: angular.copy(label.id),
				name: angular.copy(label._name),
				color: angular.copy(label._color)
			};

			dataFactory.updateLabel(_label, $scope.projectId).then(function(response) {
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