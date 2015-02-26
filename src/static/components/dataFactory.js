(function(){

	var app = angular.module('app.dataFactory', []);

	app.factory('app.dataFactory', ['$http', '$q', function($http, $q) {

		var cache = {};
		cache.projects = {
			/*
			*	Stores all the Projects and information about each...
			*/
		};
		cache.timeRecords = {
			/*
			*	Stores all the Time Records and information for each keyed to a Project.
			*/
		};

		var internalKey = function(key) {
			if (angular.isString(key)) {
				return key.charAt(0) == '_';
			}

			return false;
		};

		var mergeResponseData = function(destination, response) {
			// Assign all keys found in the response to our cache...

			var _response_keys = Object.keys(response);
			for (var i = _response_keys.length - 1; i >= 0; i--) {
				if (response[_response_keys[i]] instanceof Object  && angular.isDefined(destination[_response_keys[i]]) && !internalKey(_response_keys[i])) {
					mergeResponseData(destination[_response_keys[i]], response[_response_keys[i]]);
				} else {
					destination[_response_keys[i]] = response[_response_keys[i]];
				}
			}

			// Delete any keys from the cache that aren't found in our response (that don't begin with an underscore)
			var _destination_keys = Object.keys(destination);
			for (var i = destination.length - 1; i >= 0; i--) {
				if (indexOf.call(b, destination[_destination_keys[i]]) === -1 && !internalKey(_destination_keys[i])) {
					delete destination[_destination_keys[i]];
				}
			}
		};

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
				console.log('[app.dataFactory] refreshIntervalPassed(): No last fetch value.');
				return true;
			}
			var interval_seconds = now_seconds - last_fetch_seconds;
			console.log('[app.dataFactory] refreshIntervalPassed(): Seconds since last fetch: '+interval_seconds);
			return interval_seconds > interval;
		};


		// Service object
		var service =  {
			projects: function() {
				console.log('[app.dataFactory] service.projects(): call')
				if ((!cache.projects || cache.projects._force_fetch || refreshIntervalPassed(cache.projects._loaded, PROJECTS_LIFE)) && !cache.projects._fetch_in_progress) {
					return service.fetchProjects();
				} else if (cache.projects._fetch_in_progress) {
					return cache.projects._fetch_in_progress;	// return the $http promise
				}
				var _projects = $q.defer();
				_projects.resolve(cache.projects);
				return _projects.promise;
			}, fetchProjects: function() {
				console.log('[app.dataFactory] service.fetchProjects(): call')
				cache.projects._force_fetch = false;
				cache.projects._fetch_in_progress = $http({
					method: 'GET',
					url: '/api/projects/list.json',
					params: {
						't': new Date().getTime()
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					delete cache.projects._fetch_in_progress;
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('projects')) {
							// Iterate through these projects, chang anything that must be changed...
							console.log('[app.dataFactory] service.fetchProjects(): data.response has `projects`, is valid');

							var _date = new Date();
							response.data.projects._loaded = _date;
							for (var i = response.data.projects.length - 1; i >= 0; i--) {
								response.data.projects[i]._loaded = _date;
								response.data.projects[i]._loaded = new Date();
								response.data.projects[i]._updated = new Date(response.data.projects[i].updated);
								response.data.projects[i]._created = new Date(response.data.projects[i].created);
								response.data.projects[response.data.projects[i].id] = response.data.projects[i];
								delete response.data.projects[i];
							}

							mergeResponseData(cache.projects, response.data.projects);
							return cache.projects;
						}
					}
					console.log('[app.dataFactory] service.fetchProjects(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					delete cache.projects._fetch_in_progress;
					console.log('[app.dataFactory] service.fetchProjects(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return cache.projects._fetch_in_progress;
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
							console.log('[app.dataFactory] service.create(): data.response has `project`, is valid');

							response.data.project._loaded = new Date();
							response.data.project._updated = new Date(response.data.project.updated);
							response.data.project._created = new Date(response.data.project.created);

							var _project_keyed = {};
							_project_keyed[response.data.project.id] = response.data.project;
							mergeResponseData(cache.projects, _project_keyed);
							return response.data.project;
						}
					}
					console.log('[app.dataFactory] service.create(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					delete cache.projects._create_in_progress;
					console.log('[app.dataFactory] service.create(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
			}, project: function(projectId) {
				console.log('[app.dataFactory] service.project(): call, projectId: '+projectId);

				// Check to see if we have this Project in `projects` with the correct data, and it's not too old...

				var _project = $q.defer();

				service.projects().then(function(response) {
					if (response.hasOwnProperty(projectId)) {

						// Check age...
						_project.resolve(response[projectId]);
					} else {
						_project.resolve({
							'error': true,
							'status': 404,
							'message': 'Project not found.'
						});
					}
				});

				return _project.promise;
			}, updateProject: function(project) {
				project._update_in_progress = true;
				var options = {
					'project_id': project.id
				};

				if (project.hasOwnProperty('_name')) {
					if (project._name) {
						options.name = project._name;
					}
				}

				if (project.hasOwnProperty('_description')) {
					if (project._description) {
						options.description = project._description;
					}
				}
				return $http({
					method: 'POST',
					url: '/api/projects/update.json',
					params: {
						't': new Date().getTime()
					}, data: options
				}).then(function(response) {
					// HTTP 200-299 Status
					delete project._update_in_progress;
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('project')) {
							// Success!!
							console.log('[app.dataFactory] service.updateProject(): data.response has `project`, is valid');

							var _date = new Date();

							// Project
							response.data.project._loaded = _date;
							response.data.project._updated = new Date(response.data.project.updated);
							response.data.project._created = new Date(response.data.project.created);
							var _project_keyed = {};
							_project_keyed[response.data.project.id] = response.data.project;
							mergeResponseData(cache.projects, _project_keyed);

							return response.data.project;
						}
					}
					console.log('[app.dataFactory] service.updateProject(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					delete timeRecord._update_in_progress;
					console.log('[app.dataFactory] service.updateProject(): Request error: '+response.status);

					return {
						'error': true,
						'status': response.status
					};
				});
			}, projectUncompletedUpdate: function(projectId) {
				// The number of seconds since the UNIX Epoch
				var nowSeconds = (Date.now() / 1000);

				service.project(projectId).then(function(project) {

					if (project.has_uncompleted_time_records) {
						service.timeRecords(projectId).then(function(timeRecords) {

							// Loop through all our uncompleted Time Records, calculate their uncompleted seconds and pass this along...
							project._uncompleted = angular.copy(project.completed);

							var _keys = Object.keys(timeRecords);
							for (var i = _keys.length - 1; i >= 0; i--) {
								if (timeRecords[_keys[i]].end == null && timeRecords[_keys[i]]._start instanceof Date) {

									var uncompletedSeconds = nowSeconds - (timeRecords[_keys[i]]._start.getTime() / 1000);
									timeRecords[_keys[i]]._uncompleted = uncompletedSeconds;
									project._uncompleted += uncompletedSeconds;
								}
							}
						});
					}
				});
			}, timeRecords: function(projectId) {
				console.log('[app.dataFactory] service.timeRecords(): call, projectId: '+projectId);

				// Because this project may be undefined...
				if (!angular.isObject(cache.timeRecords[projectId])) {
					cache.timeRecords[projectId] = {};
				}

				if ((!cache.timeRecords[projectId]._loaded || cache.timeRecords[projectId]._force_fetch || refreshIntervalPassed(cache.timeRecords[projectId]._loaded, TIME_RECORDS_LIFE)) && !cache.timeRecords[projectId]._fetch_in_progress) {
					return service.fetchTimeRecords(projectId);
				} else if (cache.timeRecords[projectId]._fetch_in_progress) {
					return cache.timeRecords[projectId]._fetch_in_progress;
				}
				var _timeRecords = $q.defer();
				_timeRecords.resolve(cache.timeRecords[projectId]);
				return _timeRecords.promise;
			}, fetchTimeRecords: function(projectId) {
				console.log('[app.dataFactory] service.fetchTimeRecords(): call, projectId: '+projectId)
				cache.timeRecords[projectId]._force_fetch = false;
				cache.timeRecords[projectId]._fetch_in_progress = $http({
					method: 'GET',
					url: '/api/projects/time-records/list.json',
					params: {
						't': new Date().getTime(),
						'project_id': projectId
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					delete cache.timeRecords[projectId]._fetch_in_progress;
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('project') && response.data.hasOwnProperty('time_records')) {
							// Iterate through these projects, chang anything that must be changed...
							console.log('[app.dataFactory] service.fetchTimeRecords(): data.response has `project` and `time_records`, is valid');

							var _date = new Date();

							// Project
							response.data.project._loaded = _date;
							response.data.project._updated = new Date(response.data.project.updated);
							response.data.project._created = new Date(response.data.project.created);
							var _project_keyed = {};
							_project_keyed[response.data.project.id] = response.data.project;
							mergeResponseData(cache.projects, _project_keyed);

							// Time Records
							response.data.time_records._loaded = _date;
							for (var i = response.data.time_records.length - 1; i >= 0; i--) {
								response.data.time_records[i]._loaded = _date;
								response.data.time_records[i]._created = new Date(response.data.time_records[i].created);
								response.data.time_records[i]._start = new Date(response.data.time_records[i].start);
								response.data.time_records[i]._end = new Date(response.data.time_records[i].end);
								response.data.time_records[i]._updated = new Date(response.data.time_records[i].updated);
								response.data.time_records[response.data.time_records[i].id] = response.data.time_records[i];
								delete response.data.time_records[i];
							}

							mergeResponseData(cache.timeRecords[projectId], response.data.time_records);
							return cache.timeRecords[projectId];
						}
					}
					console.log('[app.dataFactory] service.fetchTimeRecords(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					delete cache.timeRecords[projectId]._fetch_in_progress;
					console.log('[app.dataFactory] service.fetchTimeRecords(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return cache.timeRecords[projectId]._fetch_in_progress;
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
							console.log('[app.dataFactory] service.createTimeRecord(): data.response has `project` and `time_record`, is valid');

							var _date = new Date();
							
							// Project
							response.data.project._loaded = _date;
							response.data.project._updated = new Date(response.data.project.updated);
							response.data.project._created = new Date(response.data.project.created);
							var _project_keyed = {};
							_project_keyed[response.data.project.id] = response.data.project;
							mergeResponseData(cache.projects, _project_keyed);

							// Time Record
							response.data.time_record._loaded = _date;
							response.data.time_record._created = new Date(response.data.time_record.created);
							response.data.time_record._start = new Date(response.data.time_record.start);
							response.data.time_record._end = new Date(response.data.time_record.end);
							response.data.time_record._updated = new Date(response.data.time_record.updated);
							var _time_record_keyed = {};
							_time_record_keyed[response.data.time_record.id] = response.data.time_record;
							mergeResponseData(cache.timeRecords[projectId], _time_record_keyed);

							return response.data.time_record;
						}
					}
					console.log('[app.dataFactory] service.createTimeRecord(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.createTimeRecord(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
			}, completeTimeRecord: function(timeRecord) {
				timeRecord._complete_in_progress = true;
				var options = {
					'time_record_id': timeRecord.id
				};

				if (timeRecord.hasOwnProperty('_name')) {
					if (timeRecord._name) {
						options.name = timeRecord._name;						
					}
				}
				return $http({
					method: 'POST',
					url: '/api/projects/time-records/complete.json',
					params: {
						't': new Date().getTime()
					}, data: options
				}).then(function(response) {
					// HTTP 200-299 Status
					delete timeRecord._complete_in_progress;
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('project') && response.data.hasOwnProperty('time_record')) {
							// Success!!!
							console.log('[app.dataFactory] service.completeTimeRecord(): data.response has `project` and `time_record`, is valid');

							var _date = new Date();
							
							// Project
							response.data.project._loaded = _date;
							response.data.project._updated = new Date(response.data.project.updated);
							response.data.project._created = new Date(response.data.project.created);
							var _project_keyed = {};
							_project_keyed[response.data.project.id] = response.data.project;
							mergeResponseData(cache.projects, _project_keyed);

							// Time Record
							response.data.time_record._loaded = _date;
							response.data.time_record._created = new Date(response.data.time_record.created);
							response.data.time_record._start = new Date(response.data.time_record.start);
							response.data.time_record._end = new Date(response.data.time_record.end);
							response.data.time_record._updated = new Date(response.data.time_record.updated);
							var _time_record_keyed = {};
							_time_record_keyed[response.data.time_record.id] = response.data.time_record;
							mergeResponseData(cache.timeRecords[response.data.project.id], _time_record_keyed);

							return response.data.time_record;
						}
					}
					console.log('[app.dataFactory] service.completeTimeRecord(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					delete timeRecord._complete_in_progress;
					console.log('[app.dataFactory] service.completeTimeRecord(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
			}, updateTimeRecord: function(timeRecord) {
				timeRecord._update_in_progress = true;
				var options = {
					'time_record_id': timeRecord.id
				};

				if (timeRecord.hasOwnProperty('_name')) {
					if (timeRecord._name) {
						options.name = timeRecord._name;
					}
				}
				return $http({
					method: 'POST',
					url: '/api/projects/time-records/update.json',
					params: {
						't': new Date().getTime()
					}, data: options
				}).then(function(response) {
					// HTTP 200-299 Status
					delete timeRecord._update_in_progress;
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('project') && response.data.hasOwnProperty('time_record')) {
							// Success!!
							console.log('[app.dataFactory] service.updateTimeRecord(): data.response has `project` and `time_record`, is valid');

							var _date = new Date();

							// Project
							response.data.project._loaded = _date;
							response.data.project._updated = new Date(response.data.project.updated);
							response.data.project._created = new Date(response.data.project.created);
							var _project_keyed = {};
							_project_keyed[response.data.project.id] = response.data.project;
							mergeResponseData(cache.projects, _project_keyed);

							// Time Record
							response.data.time_record._loaded = _date;
							response.data.time_record._created = new Date(response.data.time_record.created);
							response.data.time_record._start = new Date(response.data.time_record.start);
							response.data.time_record._end = new Date(response.data.time_record.end);
							response.data.time_record._updated = new Date(response.data.time_record.updated);
							var _time_record_keyed = {};
							_time_record_keyed[response.data.time_record.id] = response.data.time_record;
							mergeResponseData(cache.timeRecords[response.data.project.id], _time_record_keyed);

							return response.data.time_record;
						}
					}
					console.log('[app.dataFactory] service.updateTimeRecord(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					delete timeRecord._update_in_progress;
					console.log('[app.dataFactory] service.updateTimeRecord(): Request error: '+response.status);

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