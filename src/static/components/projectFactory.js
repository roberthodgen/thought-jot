(function(){

	var app = angular.module('app.projectFactory', []);

	app.factory('app.projectFactory', ['$http', '$q', function($http, $q) {

		// `projects` object caches all our Projects
		var projects;

		// Data refresh intervals
		var projects_last_fetched;
		var projects_max_life = 30; 	// seconds
		var project_max_life = 10;		// seconds
		var projects_force_refetch = true;

		var refreshIntervalPassed = function() {

			var now = new Date().getTime() / 1000;
			if (projects_last_fetched) {
				var last_fetch = projects_last_fetched.getTime() / 1000;
			}

			if (!last_fetch) {
				console.log('[app.projectFactory] refreshIntervalPassed(): No last fetch value.');
				return true;
			}

			var seconds = now - last_fetch;
			console.log('[app.projectFactory] refreshIntervalPassed(): Seconds since last fetch: '+seconds);

			return seconds > projects_max_life;
		};


		// Service object
		var service =  {
			projects: function() {
				console.log('[app.projectFactory] service.projects(): call')
				if (!projects || projects_force_refetch || refreshIntervalPassed()) {
					return service.fetchProjects();
				}
				return projects;
			}, fetchProjects: function() {
				console.log('[app.projectFactory] service.fetchProjects(): call')
				projects_force_refetch = false;
				projects = $http({
					method: 'GET',
					url: '/api/projects/list.json',
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
							projects_last_fetched = new Date();

							for (var i = response.data.projects.length - 1; i >= 0; i--) {

								keyedById[response.data.projects[i].id] = response.data.projects[i];
								keyedById[response.data.projects[i].id]._lastFetch = projects_last_fetched;
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
					console.log('[app.projectFactory] service.fetchProjects(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return projects;
			}, create: function(options) {

				var data = {
					'name': options.name,
					'description': options.description
				};

				return $http({
					method: 'POST',
					url: '/api/projects/create.json',
					params: {
						't': new Date().getTime()
					}, data: data
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('project')) {
							// Success!!!

							var _projects = $q.defer();
							var allProjects = {};


							if (!projects) {
								projects = _projects.promise;
								projects_force_refetch = true; 	// Force refetch of all projects
							} else {
								projects.then(function(currentProjects) {
									allProjects = currentProjects;
								});
							}

							allProjects[response.data.project.id] = response.data.project;
							allProjects[response.data.project.id]._lastFetch = new Date();

							_projects.resolve(allProjects);	// Resolve projects
							return allProjects[response.data.project.id];
						}
					}
					console.log('[app.projectFactory] service.create(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					console.log('[app.projectFactory] service.create(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
			}, project: function(projectId) {
				console.log('[app.projectFactory] service.project(): call, projectId: '+projectId);

				// Check to see if we have this Project in `projects` with the correct data, and it's not too old...

				var _project = $q.defer();

				service.projects().then(function(response) {
					if (response.hasOwnProperty(projectId)) {

						// Check age...
						_project.resolve(response[projectId]);
					}
				});

				return _project.promise;
			}
		};

		// Return the service object
		return service;
	}]);

})();