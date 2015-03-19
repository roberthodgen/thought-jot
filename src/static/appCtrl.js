(function() {

	var app = angular.module('app.appCtrl', []);

	app.controller('app.appCtrl', ['$scope', 'app.appFactory', 'ndb_users.userFactory', 'app.dataFactory', function($scope, appFactory, userFactory, dataFactory) {

		// Perform setup and reset $scope variables...
		$scope.init = function() {
			console.log('[app.appCtrl] $scope.init(): Called.');

			$scope.config = appFactory.config();

			$scope.user = {};
			$scope.hasUser = false;
			$scope.userLoaded = false;

			$scope.projects = {};
			$scope.projectsLoaded = false;

			userFactory.user().then(function(response) {
				$scope.userLoaded = true;
				if (!response.error) {
					$scope.user = response;
					$hasUser = true;

					
				} else {
					alert('Error loading User.');
				}
			});

			$scope.config.sidebar.show = false;

			// Configure Marked to insert links where `#n` appears...
			marked.defaults.renderer.paragraph = function(text) {
				// Replace any instances of a '#n' where 'n' is one or more digits...
				text = text.replace(/(:?^|[\s])(#([0-9]+))\b/g, function(string, whitespace, hash_number, number){
					// Use Link to the Milestone...
					return whitespace + '<a ui-sref="app.project.issues.project-issues.view-issue({ milestoneId: \'' + number + '\' })">' + hash_number + '</a>';
				});
				return marked.Renderer.prototype.paragraph(text);
			};

			// Configure Marked to require a space between a header and the opening '#'...
			var lexer = new marked.Lexer()
			lexer.rules.heading = /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/;
		};

		$scope.toggleSidebar = function() {
			console.log('[app.appCtrl] toggleSidebar(): Called.');

			if ($scope.config.sidebar.show) {
				$scope.config.sidebar.show = false;
			} else {

				dataFactory.projects().then(function(response) {
					$scope.projectsLoaded = true;
					if (!response.error) {
						$scope.projects = response;
					}
				});

				$scope.config.sidebar.show = true;
			}
		};

		$scope.wrapperClick = function() {
			if ($scope.config.sidebar.show) {
				console.log('[app.appCtrl] wrapperClick(): Called.');
				$scope.config.sidebar.show = false;
			}
		};


		// Init
		$scope.init();
	}]);

})();