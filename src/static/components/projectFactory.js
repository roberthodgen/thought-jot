(function(){

	var app = angular.module('app.projectFactory', []);

	app.factory('app.projectFactory', ['$http', '$q', function($http, $q) {

		// Projects
		var projects; // `projects` object caches all our Projects
		var projects_force_refetch = true;
		var projects_last_fetched;
		var promiseForUpdatedProjects = function(existingProjects, newProjects) {
			/*
				Return a promise by merging `newProjects` into `existingProjects`.
			*/
			var _projects = $q.defer();
			for (var i = newProjects.length - 1; i >= 0; i--) {
				existingProjects[newProjects[i].id] = newProjects[i];
				existingProjects[newProjects[i].id]._lastFetch = new Date();
			}
			_projects.resolve(existingProjects);	// Resolve Projects
			return _projects.promise;
		};
		

		// Time Records
		var time_records = {};	// `time_records` object stores promises keyed to Project IDs
		var time_records_last_fetched = {};	// Keyed to a Project ID
		var time_records_force_refetch = {};


		// Timeouts/Refresh intervals
		var PROJECTS_LIFE = 30;
		var TIME_RECORDS_LIFE = 30;
		var refreshIntervalPassed = function(lastFetchDate, interval) {
			/*
				Return TRUE if `date` is outside of our max interval.
			*/
			var now_seconds = new Date().getTime() / 1000;
			if (lastFetchDate) {
				var last_fetch_seconds = lastFetchDate.getTime() / 1000;
			}
			if (!last_fetch_seconds) {
				console.log('[app.projectFactory] refreshIntervalPassed(): No last fetch value.');
				return true;
			}
			var interval_seconds = now_seconds - last_fetch_seconds;
			console.log('[app.projectFactory] refreshIntervalPassed(): Seconds since last fetch: '+interval_seconds);
			return interval_seconds > interval;
		};


		// Service object
		var service =  {
			projects: function() {
				console.log('[app.projectFactory] service.projects(): call')
				if (!projects || projects_force_refetch || refreshIntervalPassed(projects_last_fetched, PROJECTS_LIFE)) {
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
							console.log('[app.projectFactory] service.create(): data.response has project, is valid');

							var _projects = $q.defer();
							var allProjects = {};

							if (!projects) {
								projects = _projects.promise;
							} else {
								projects_force_refetch = true; 	// Force refetch of all projects
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
			}, timeRecords: function(projectId) {
				console.log('[app.projectFactory] service.timeRecords(): call, projectId: '+projectId);
				if (!time_records[projectId] || time_records_force_refetch[projectId] || refreshIntervalPassed(time_records_last_fetched[projectId], TIME_RECORDS_LIFE)) {
					return service.fetchTimeRecords(projectId);
				}
				return time_records[projectId];
			}, fetchTimeRecords: function(projectId) {
				console.log('[app.projectFactory] service.fetchTimeRecords(): call, projectId: '+projectId)
				time_records[projectId] = $http({
					method: 'GET',
					url: '/api/projects/time-records/list.json',
					params: {
						't': new Date().getTime(),
						'project_id': projectId
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('project') && response.data.hasOwnProperty('time_records')) {
							// Iterate through these projects, chang anything that must be changed...
							console.log('[app.projectFactory] service.fetchTimeRecords(): data.response has projects and time_records, is valid');

							time_records_last_fetched[response.data.project.id] = new Date();

							var _timeRecord = $q.defer();


							response.data.time_records._lastFetch = time_records_last_fetched[response.data.project.id];
							_timeRecord.resolve(response.data.time_records);

							return _timeRecord.promise;
						}
					}
					console.log('[app.projectFactory] service.fetchTimeRecords(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					console.log('[app.projectFactory] service.fetchTimeRecords(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return time_records[projectId];
			}, createTimeRecord: function(projectId) {
				return $http({
					method: 'POST',
					url: '/api/projects/time-records/create.json',
					params: {
						't': new Date().getTime()
					}, data: {
						'project_id': projectId
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('project') && response.data.hasOwnProperty('time_record')) {
							// Success!!!
							console.log('[app.projectFactory] service.createTimeRecord(): data.response has project and time_record, is valid');

							if (!projects) {
								console.log('[app.projectFactory] service.createTimeRecord(): projects not present');
								projects_force_refetch = true; 	// Force refetch of all projects
								projects = promiseForUpdatedProjects({}, [response.data.project]);
							} else {
								projects.then(function(currentProjects) {
									projects = promiseForUpdatedProjects(currentProjects, [response.data.project]);
								});
							}

							

							var _timeRecords = $q.defer();
							var allTimeRecords = {};

							if (!time_records[response.data.project.id]) {
								time_records[response.data.project.id] = _timeRecords.promise;
								time_records_force_refetch[response.data.project.id] = true;	// Force refetch of all projects
							} else {
								time_records[response.data.project.id].then(function(currentTimeRecords) {
									allTimeRecords = currentTimeRecords;
								});
							}

							if (angular.isArray(allTimeRecords[response.data.project.id])) {
								allTimeRecords[response.data.project.id].push(response.data.time_record);								
							} else {
								allTimeRecords[response.data.project.id] = [response.data.time_record];
							}

							_timeRecords.resolve(allTimeRecords);	// Resolve Time Records

							return {
								'project': response.data.project,
								'time_record': response.data.time_record
							};
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
			}
		};

		// Return the service object
		return service;
	}]);

})();