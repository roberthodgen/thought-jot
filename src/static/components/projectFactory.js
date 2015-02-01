(function(){

	var app = angular.module('app.projectFactory', []);

	app.factory('app.projectFactory', ['$http', '$q', function($http, $q) {

		// `projects` object caches all our Projects
		var projects;

		// Service object
		var service =  {
			projects: function() {
				console.log('[app.projectFactory] service.projects(): call')
				if (!projects) {
					return service.fetchProjects();
				}
				return projects;
			}, fetchProjects: function() {
				console.log('[app.projectFactory] service.fetchProjects(): call')
				projects = $http({
					method: 'GET',
					url: '/api/projects.json',
					params: {
						't': new Date().getTime()
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('projects')) {
							// Iterate through these projects, chang anything that must be changed...
							console.log('[app.projectFactory] service.fetchProjects(): data.response has projects, is valid');

							var keyedById = {};
							keyedById._lastFetch = new Date();

							for (var i = response.data.projects.length - 1; i >= 0; i--) {

								keyedById[response.data.projects[i].id] = response.data.projects[i];
								keyedById[response.data.projects[i].id]._lastFetch = keyedById._lastFetch;
							};
							return keyedById;
						}
					}
					console.log('[app.projectFactory] service.fetchProjects(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					console.log('[app.projectFactory] service.fetchProjects(): Error loading user: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return projects;
			}
		};

		// Return the service object
		return service;
	}]);

})();