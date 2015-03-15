(function(){

	var app = angular.module('app.dataFactory', []);

	app.factory('app.dataFactory', ['$http', '$q', '$interval', function($http, $q, $interval) {

		var cache = {};
		cache.projects = {
			/*
			*	Stores all the Projects and information about each...
			*/
		};

		/*
		*	Merges Projects into the Cache
		*	@param {Array} newOrUpdatedProjects - The new or updated Project objects
		*/
		var cacheProjects = function(newOrUpdatedProjects, fetchAll) {

			// Get the current time these Projects are being processed...
			var _date = new Date();

			// Get an Object that we'll later pass to `mergeResponseData()`
			var _keyed = {};

			// Set the `_loaded` property ONLY IF we fetched all (via `fetchAll`)
			if (fetchAll) {
				_keyed._loaded = _date;
			};

			// Loop through all `newOrUpdatedProjects` and perform any necessary tasks...
			for (var i = newOrUpdatedProjects.length - 1; i >= 0; i--) {

				// Perform necessary tasks, like Date objects...
				newOrUpdatedProjects[i]._loaded = _date;
				newOrUpdatedProjects[i]._updated = new Date(newOrUpdatedProjects[i].updated);
				newOrUpdatedProjects[i]._created = new Date(newOrUpdatedProjects[i].created);

				// Add this Project to `_keyed`
				_keyed[newOrUpdatedProjects[i].id] = newOrUpdatedProjects[i];
			}

			// Merge our Projects into the cache
			mergeResponseData(service.cachedOrPlaceholderProjects(), _keyed);
		};

		cache.timeRecords = {
			/*
			*	Stores all the Time Records and information for each keyed to a Project.
			*/
		};

		/*
		*	Merges Time Records into the Cache
		*	@param {Array} newOrUpdatedTimeRecords		- The new or updated Time Record objects
		*	@param {String} cacheKey					- The Key in which new or updated Time Record objects will be added in the global `cache.timeRecords` object
		*	@param {String|NULL} fetchSourceKey			- The Key from which the information is complete (the Fetch source)
		*/
		var cahceTimeRecords = function(newOrUpdatedTimeRecords, cacheKey, fetchSourceKey) {

			// Get the current time these Projects are being processed...
			var _date = new Date();

			// Get an Object that we'll later pass to `mergeResponseData()`
			var _keyed = {};

			// Set the `_loaded` property ONLY IF this cacheKey was our fetchSourceKey
			if (cacheKey == fetchSourceKey) {
				_keyed._loaded = _date;
			}

			// Loop through all `newOrUpdatedTimeRecords` and perform any necessary tasks...
			for (var i = newOrUpdatedTimeRecords.length - 1; i >= 0; i--) {
				
				// Perform necessary tasks, like Date objects...
				newOrUpdatedTimeRecords[i]._loaded = _date;
				newOrUpdatedTimeRecords[i]._created = new Date(newOrUpdatedTimeRecords[i].created);
				newOrUpdatedTimeRecords[i]._start = new Date(newOrUpdatedTimeRecords[i].start);
				newOrUpdatedTimeRecords[i]._end = new Date(newOrUpdatedTimeRecords[i].end);
				newOrUpdatedTimeRecords[i]._updated = new Date(newOrUpdatedTimeRecords[i].updated);

				// Copy this Time Record's Comments into the Comments Cache
				cacheComments(newOrUpdatedTimeRecords[i].comments, [cacheKey, newOrUpdatedTimeRecords[i].id], newOrUpdatedTimeRecords[i].id);
				delete newOrUpdatedTimeRecords[i].comments;

				// Add this Time Record to `_keyed`
				_keyed[newOrUpdatedTimeRecords[i].id] = newOrUpdatedTimeRecords[i];
			}

			// Merge our Time Records into the cache
			mergeResponseData(service.cachedOrPlaceholderTimeRecords(cacheKey), _keyed);
		};

		cache.comments = {
			/*
			*	Stores all Comments keyed to both Project and Parent IDs.
			*/
		};

		/*
		*	Merges Comments into the Cache
		*	@param {Array} newOrUpdatedComments		- The new or updated Comment objects
		*	@param {Array} cacheKeys				- The Keys in which new or updated Comment objects will be added in the global `cache.comments` object
		*	@param {String} fetchSourceKey			- The Key from which the information is complete (the Fetch source)
		*/
		var cacheComments = function(newOrUpdatedcomments, cacheKeys, fetchSourceKey) {

			// Get the current time these Labels are being processed...
			var _date = new Date();

			// Loop through the cacheKeys and keep separate objects in `_keyed`
			var _keyed = [];
			for (var i_keyed = cacheKeys.length - 1; i_keyed >= 0; i_keyed--) {

				// Get an Object we'll later pass to `mergeResponseData()`
				_keyed[i_keyed] = {};

				// Set the `_loaded` property ONLY IF this cacheKey was our fetchSourceKey
				if (cacheKeys[i_keyed] == fetchSourceKey) {
					_keyed[i_keyed]._loaded = _date;
				}

				// Loop through all `newOrUpdatedcomments` and perform any necessary tasks...
				for (var i = newOrUpdatedcomments.length - 1; i >= 0; i--) {

					// Perform necessary tasks, like Date objects...
					newOrUpdatedcomments[i]._laded = _date;
					newOrUpdatedcomments[i]._updated = new Date(newOrUpdatedcomments[i].updated);
					newOrUpdatedcomments[i]._created = new Date(newOrUpdatedcomments[i].created);

					// Add this Label to `_keyed`
					_keyed[i_keyed][newOrUpdatedcomments[i].id] = newOrUpdatedcomments[i];
				}

				// Merge our Labels into the cache
				// console.log('[app.dataFactory] cacheComments(): calling `mergeResponseData()` with destination key: '+cacheKeys[i]);
				mergeResponseData(service._comments(cacheKeys[i_keyed]), _keyed[i_keyed]);	// Use `service._comments()` so we get the actual Array
			}
		};

		cache.milestones = {
			/*
			*	Stores all Milestones keyed to the Project ID.
			*/
		};

		/*
		*	Merges Milestones into the Cache
		*	@param {Array} newOrUpdatedMilestones	- The new or updated Milestone objects
		*	@param {String} cacheKey 				- The Key in which new or updated Milestone objects will be added in the global `cache.milestones` object
		*	@param {String|Boolean} fetchSourceKey	- The Key from which the information is complete (the Fetch source)
		*/
		var cacheMilestones = function(newOrUpdatedMilestones, cacheKey, fetchSourceKey) {

			// Get the current time these Milestones are being processed...
			var _date = new Date();

			// Get an Object we'll later pass to `mergeResponseData()`
			var _keyed = {};

			// Set the `_loaded` property ONLY IF `fetchSourceKey` matches `cacheKey`
			if (cacheKey == fetchSourceKey) {
				_keyed._loaded = _date;
			}

			// Loop through all `newOrUpdatedMilestones` and perform any necessary tasks...
			for (var i = newOrUpdatedMilestones.length - 1; i >= 0; i--) {
				
				// Perform necessary tasks, like Date objects...
				newOrUpdatedMilestones[i]._loaded = _date;
				newOrUpdatedMilestones[i]._updated = new Date(newOrUpdatedMilestones[i].updated);
				newOrUpdatedMilestones[i]._created = new Date(newOrUpdatedMilestones[i].created);

				// Copy this Milestone's Comments into the Comments Cache
				cacheComments(newOrUpdatedMilestones[i].comments, [cacheKey, newOrUpdatedMilestones[i].id], newOrUpdatedMilestones[i].id);
				delete newOrUpdatedMilestones[i].comments;

				// Copy this Milestone's Labels into the Labels Cache
				cacheLabels(newOrUpdatedMilestones[i].labels, [cacheKey, newOrUpdatedMilestones[i].id], newOrUpdatedMilestones[i].id);
				delete newOrUpdatedMilestones[i].labels;

				// Add this Milestone to `_keyed`
				_keyed[newOrUpdatedMilestones[i].id] = newOrUpdatedMilestones[i];
			}

			// Merge our Milestones into the cache
			mergeResponseData(service.cachedOrPlaceholderMilestones(cacheKey), _keyed);
		};

		cache.labels = {
			/*
			*	Stores all Labels keyed to a Project ID or Milestone ID.
			*/
		};

		/*
		*	Merges Labels into the Cache
		*	@param {Array} newOrUpdatedLabels		- The new or updated Label objects
		*	@param {Array} cacheKeys				- The Key in which new or updated Label objects will be added in the global `cache.labels` object
		*	@param {String|Boolean} fetchSourceKey	- The Key from which the information is complete (the Fetch source)
		*/
		var cacheLabels = function(newOrUpdatedLabels, cacheKeys, fetchSourceKey) {

			// Get the current time these Labels are being processed...
			var _date = new Date();

			// Loop through the cacheKeys and keep separate objects in `_keyed`
			var _keyed = [];
			for (var i_keyed = cacheKeys.length - 1; i_keyed >= 0; i_keyed--) {

				// Get an Object we'll later pass to `mergeResponseData()`
				_keyed[i_keyed] = {};

				// Set the `_loaded` property ONLY IF this cacheKey was our fetchSourceKey
				if (cacheKeys[i_keyed] == fetchSourceKey) {
					_keyed[i_keyed]._loaded = _date;
				}

				// Loop through all `newOrUpdatedLabels` and perform any necessary tasks...
				for (var i = newOrUpdatedLabels.length - 1; i >= 0; i--) {

					// Perform necessary tasks, like Date objects...
					newOrUpdatedLabels[i]._laded = _date;
					newOrUpdatedLabels[i]._updated = new Date(newOrUpdatedLabels[i].updated);
					newOrUpdatedLabels[i]._created = new Date(newOrUpdatedLabels[i].created);

					// Add this Label to `_keyed`
					_keyed[i_keyed][newOrUpdatedLabels[i].id] = newOrUpdatedLabels[i];
				}

				// Merge our Labels into the cache
				// console.log('[app.dataFactory] cacheLabels(): calling `mergeResponseData()` with destination key: '+cacheKeys[i]);
				mergeResponseData(service._labels(cacheKeys[i_keyed]), _keyed[i_keyed]);	// Use `service._labels()` so we get the actual Array
				// Replace all instances where `newOrUpdatedLabels` (as `_keyed[i_keyed]` now) appear in `cache.labels`;
				// this searches beyond the scope of `cacheKeys`
				searchandReplaceResponseData(cache.labels, _keyed[i_keyed]);
			}
		};

		/*
		*	Determines if `key` is an Internal key (not from the API)
		*	@param {String} key
		*	@returns {Boolean}
		*/
		var internalKey = function(key) {
			if (angular.isString(key)) {
				// ThoughtJot! keys are prefixed with `_`;
				// Angular uses `$$` prefix for hash indexes (me thinks)
				return (key.charAt(0) == '_' || key.substring(0, 2) == '$$');
			}

			return false;
		};

		/*
		*	Merge two Objects
		*	@param {Object} destination		- The Object to copy into
		*	@param {Object} response		- The source Object from which to copy
		*/
		var mergeResponseData = function(destination, response) {   // TODO: Look are replacing this with angular.merge()
			// Assign all keys found in the response to our cache...

			if (!angular.isDefined(destination)) {
				destination = {};
			}

			var _response_keys = Object.keys(response);
			for (var i = _response_keys.length - 1; i >= 0; i--) {
				if (response[_response_keys[i]] instanceof Object  && angular.isDefined(destination[_response_keys[i]]) && !internalKey(_response_keys[i])) {
					mergeResponseData(destination[_response_keys[i]], response[_response_keys[i]]);
				} else {
					destination[_response_keys[i]] = response[_response_keys[i]];
				}
			}

			// Delete any keys/indexes from the cache that aren't found in our response (that aren't internal)
			if (angular.isArray(destination)) {
				for (var i = destination.length - 1; i >= 0; i--) {
					if (response.indexOf(destination[i]) !== i) {

						console.log('deleting index: '+i);
						destination.splice(i, 1);
					}
				};
			} /* // Disabled to fix tj29, where labels were merged and deleted.
			else if (angular.isObject(destination)) {
				var _destination_keys = Object.keys(destination);
				for (var i = _destination_keys.length - 1; i >= 0; i--) {
					if (_response_keys.indexOf(_destination_keys[i]) === -1 && !internalKey(_destination_keys[i])) {
						console.log('deleting key: '+_destination_keys[i]);
						delete destination[_destination_keys[i]];
					}
				}
			} */
		};

		/*
		*	Searches `destination` for all objects found in `response`;
		*	replaces any such vales by referencing those in `response`.
		*	@param {Object} destination
		*	@param {Object} response
		*/
		var searchandReplaceResponseData = function(destination, response) {
			// Cycle through a root (like Labels) and replace any references if the object.id matches

			// Ensure the `destination` is an Object...
			if (angular.isObject(destination)) {

				// Get all keys found in our `destination`; this *should* be Project IDs, Milestone IDs, and Time Records
				var _destination_keys = Object.keys(destination);
				for (var i_dest = _destination_keys.length - 1; i_dest >= 0; i_dest--) {

					// Now get all child IDs (think Label IDs or Comment IDs) from this Project, Milestone, or Time Record
					var _destination_label_keys = Object.keys(destination[_destination_keys[i_dest]]);
					for (var i_dest_label = _destination_label_keys.length - 1; i_dest_label >= 0; i_dest_label--) {

						// Now loop through the destination's keys...
						var _response_keys = Object.keys(response);
						for (var i_resp = _response_keys.length - 1; i_resp >= 0; i_resp--) {

							// ... and see if any children match a response key (Label or Comment)
							if (_destination_label_keys[i_dest_label] == _response_keys[i_resp]) {

								// One of our `response` keys were found in the `destination`... Assign!
								destination[_destination_keys[i_dest]][_destination_label_keys[i_dest_label]] = response[_response_keys[i_resp]]
							}
						}
					}
				}
			}
		};

		// Timeouts/Refresh intervals
		var PROJECTS_LIFE = 30;
		var TIME_RECORDS_LIFE = 15;
		var LABELS_LIFE = 30;
		var ISSUES_LIFE = 30;
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


		/*
		*	Uncompleted Seconds Watch
		*/

		var uncompletedWatchProjectIds = [
			/*
			*	Stores an Array of Project IDs as Strings.
			*/
		];
		var uncompletedWatchProjectsInterval = $interval(function() {
			// Simply call `uncompletedSecondsUpdate()`, let it do it's magic!
			uncompletedSecondsUpdate();
		}, 333);

		/*
		*	Runs on a loop throughout the duration the SPA is open.
		*	Will loop through all Project IDs stored in `uncompletedWatchProjectIds` Array.
		*	Will update the `_uncompleted` value of both Projects and Time Records.
		*/
		var uncompletedSecondsUpdate = function() {
			if (uncompletedWatchProjectIds.length > 0) {

				var nowSeconds = (Date.now() / 1000);

				// Loop though all Projects in `uncompletdWatchProjects`...
				for (var i = uncompletedWatchProjectIds.length - 1; i >= 0; i--) {

					var project = service.cachedOrPlaceholderProject(uncompletedWatchProjectIds[i]);

					// If this Project has uncompleted Time Records...
					if (project.has_uncompleted_time_records) {

						// Set this Project's `_uncompleted` to it's current `completed` value, will be added to later
						project._uncompleted = project.completed;

						// Get this Project's Time Records
						var time_records = service.cachedOrPlaceholderTimeRecords(project.id);

						// Loop through this Project's Time Records...
						var _keys = Object.keys(time_records);
						for (var i = _keys.length - 1; i >= 0; i--) {

							// If we find one that is incomplete...
							if (time_records[_keys[i]].end == null && time_records[_keys[i]]._start instanceof Date) {

								// Update this Time Record's uncompleted seconds
								var uncompletedSeconds = nowSeconds - (time_records[_keys[i]]._start.getTime() / 1000);
								time_records[_keys[i]]._uncompleted = uncompletedSeconds;

								// Add this Time Record's uncompleted seconds to our Project's
								project._uncompleted += uncompletedSeconds;
							}
						}

						// Refresh timeRecords
						service.timeRecords(project.id);
					} else {
						service.project(project.id);
					}
				}
			}
		};


		/*
		*	Service Object
		*/

		var service =  {
			uncompletedSecondsWatchAddProjectId: function(projectId) {
				if (uncompletedWatchProjectIds.indexOf(projectId) === -1) {
					console.log('[app.dataFactory] service.uncompletedSecondsWatchAddProjectId(): Adding Project with `id`: '+projectId);
					uncompletedWatchProjectIds.push(projectId);
				}
				return projectId;
			}, uncompletedSecondsWatchRemoveProjectId: function(projectId) {
				var _index = uncompletedWatchProjectIds.indexOf(projectId);
				if (_index !== -1) {
					console.log('[app.dataFactory] service.uncompletedSecondsWatchRemoveProjectId(): Removing Project with `id`: '+projectId);
					return uncompletedWatchProjectIds.splice(_index, 1);
				}
				return null;
			}, cachedOrPlaceholderProjects: function() {
				return cache.projects;
			}, projects: function() {
				console.log('[app.dataFactory] service.projects(): call');

				var _cache = service.cachedOrPlaceholderProjects();

				if ((!_cache || _cache._force_fetch || refreshIntervalPassed(_cache._loaded, PROJECTS_LIFE)) && !_cache._fetch_in_progress && !_cache._last_fetch_error) {
					return service.fetchProjects();
				} else if (_cache._fetch_in_progress) {
					return _cache._fetch_in_progress;	// return the $http promise
				}
				var _projects = $q.defer();
				_projects.resolve(_cache);
				return _projects.promise;
			}, fetchProjects: function() {
				console.log('[app.dataFactory] service.fetchProjects(): call')

				var _cache = service.cachedOrPlaceholderProjects();

				_cache._force_fetch = false;
				_cache._fetch_in_progress = $http({
					method: 'GET',
					url: '/api/projects/list.json',
					params: {
						't': new Date().getTime()
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					delete _cache._fetch_in_progress;
					delete _cache._last_fetch_error;
					if (angular.isObject(response.data) && response.status == 200) {
						if (response.data.hasOwnProperty('projects')) {
							// Iterate through these projects, chang anything that must be changed...
							console.log('[app.dataFactory] service.fetchProjects(): response.data has `projects`, is valid');

							// Cache these Projects
							cacheProjects(response.data.projects, true);
							return _cache;
						}
					} else {
						_cache._last_fetch_error = true;
						console.log('[app.dataFactory] service.fetchProjects(): Error reading response.');
						return {
							'error': true
						};
					}
				}, function(response) {
					// Error
					delete _cache._fetch_in_progress;
					_cache._last_fetch_error = response.status;
					console.log('[app.dataFactory] service.fetchProjects(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return _cache._fetch_in_progress;
			}, createProject: function(options) {
				console.log('[app.dataFactory] service.createProject(): Called.');
				return $http({
					method: 'POST',
					url: '/api/v2/projects',
					params: {
						't': new Date().getTime()
					}, data: options
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						// Success!!!
						console.log('[app.dataFactory] service.createProject(): Success.');

						// Cache this Project
						cacheProjects([response.data], false);
						return response.data;
					} else {
						console.log('[app.dataFactory] service.createProject(): Error reading response.');
						return {
							error: true
						};
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.createProject(): Request error: '+response.status);
					return {
						error: true,
						status: response.status
					};
				});
			}, cachedOrPlaceholderProject: function(projectId) {
				if (!angular.isDefined(cache.projects[projectId])) {
					cache.projects[projectId] = {};
				}
				return cache.projects[projectId];
			}, project: function(projectId) {
				console.log('[app.dataFactory] service.project(): call, `projectId`: '+projectId);

				var _cache = service.cachedOrPlaceholderProject(projectId);

				if ((!_cache || _cache._force_fetch || refreshIntervalPassed(_cache._loaded, PROJECTS_LIFE)) && !_cache._fetch_in_progress && !_cache._last_fetch_error) {
					return service.fetchProject(projectId);
				} else if (_cache._fetch_in_progress) {
					return _cache._fetch_in_progress;	// return the $http promise
				}
				var _projects = $q.defer();
				_projects.resolve(_cache);
				return _projects.promise;
			}, fetchProject: function(projectId) {
				console.log('[app.dataFactory] service.fetchProject(): Called, `projectId`: '+projectId);

				var _cache = service.cachedOrPlaceholderProject(projectId);

				_cache._force_fetch = false;
				_cache._fetch_in_progress = $http({
					method: 'GET',
					url: '/api/v2/projects/'+projectId
				}).then(function(response) {
					// HTTP 200-299 Status
					delete _cache._fetch_in_progress;
					delete _cache._last_fetch_error;
					if (angular.isObject(response.data) && response.status == 200) {
						// Success
						console.log('[app.dataFactory] service.fetchProject(): response.data has `projects`, is valid');

						// Cache these Projects
						cacheProjects([response.data], false);
						return _cache;
					} else {
						_cache._last_fetch_error = true;
						console.log('[app.dataFactory] service.fetchProject(): Error reading response.');
						return {
							'error': true
						};
					}
				}, function(response) {
					// Error
					delete _cache._fetch_in_progress;
					_cache._last_fetch_error = response.status;
					console.log('[app.dataFactory] service.fetchProject(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return _cache._fetch_in_progress;
			}, updateProject: function(project) {
				project._update_in_progress = true;
				var options = {
					'project_id': project.id
				};

				if (project.hasOwnProperty('_name')) {
					if (project._name) {
						options.name = angular.copy(project._name);
					}
				}

				if (project.hasOwnProperty('_description')) {
					if (project._description) {
						options.description = angular.copy(project._description);
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
							console.log('[app.dataFactory] service.updateProject(): response.data has `project`, is valid');

							// Cache this Project
							cacheProjects([response.data.project], false);
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
			}, projectContributorsAdd: function(email, projectId) {
				return $http({
					method: 'POST',
					url: '/api/v2/projects/'+projectId+'/contributors/'+encodeURIComponent(email)
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						// Success!
						console.log('[app.dataFactory] service.projectContributorsAdd(): response.data is Object, response.status: 200');

						// Cache this Project
						cacheProjects([response.data], projectId, null);

						return response.data;
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.projectContributorsAdd(): Request error: '+response.status);
					return {
						error: true,
						status: response.status
					};
				});
			}, projectContributorsRemove: function(email, projectId) {
				return $http({
					method: 'DELETE',
					url: '/api/v2/projects/'+projectId+'/contributors/'+encodeURIComponent(email)
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						// Success!
						console.log('[app.dataFactory] service.projectContributorsRemove(): response.data is Object, response.status: 200');

						// Cache this Project
						cacheProjects([response.data], projectId, null);

						return response.data;
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.projectContributorsRemove(): Request error: '+response.status);
					return {
						error: true,
						status: response.status
					};
				});
			}, projectObserversAdd: function(email, projectId) {
				return $http({
					method: 'POST',
					url: '/api/v2/projects/'+projectId+'/observers/'+encodeURIComponent(email)
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						// Success!
						console.log('[app.dataFactory] service.projectObserversAdd(): response.data is Object, response.status: 200');

						// Cache this Project
						cacheProjects([response.data], projectId, null);

						return response.data;
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.projectObserversAdd(): Request error: '+response.status);
					return {
						error: true,
						status: response.status
					};
				});
			}, projectObserversRemove: function(email, projectId) {
				return $http({
					method: 'DELETE',
					url: '/api/v2/projects/'+projectId+'/observers/'+encodeURIComponent(email)
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						// Success!
						console.log('[app.dataFactory] service.projectObserversRemove(): response.data is Object, response.status: 200');

						// Cache this Project
						cacheProjects([response.data], projectId, null);

						return response.data;
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.projectObserversRemove(): Request error: '+response.status);
					return {
						error: true,
						status: response.status
					};
				});
			}, projectUncompletedUpdate: function(projectId) {
				// The number of seconds since the UNIX Epoch
				var nowSeconds = (Date.now() / 1000);

				var project = service.cachedOrPlaceholderProject(projectId);

				if (project.has_uncompleted_time_records) {

					var time_records = service.cachedOrPlaceholderTimeRecords(projectId);

					var _keys = Object.keys(time_records);
					for (var i = _keys.length - 1; i >= 0; i--) {
						if (time_records[_keys[i]].end == null && time_records[_keys[i]]._start instanceof Date) {

							var uncompletedSeconds = nowSeconds - (time_records[_keys[i]]._start.getTime() / 1000);
							time_records[_keys[i]]._uncompleted = uncompletedSeconds;
							project._uncompleted += uncompletedSeconds;
						}
					};

					// Refresh timeRecords
					service.timeRecords(projectId);

					// Reschedule this check
					// return $timeout(function() {
					// 	console.log('[app.dataFactory] projectUncompletedUpdate(): Reschedule for `projectId`: '+projectId);
					// 	service.projectUncompletedUpdate(projectId);
					// }, 333);
				}
				return null;
			}, cachedOrPlaceholderTimeRecords: function(projectId) {
				if (!angular.isDefined(cache.timeRecords[projectId])) {
					cache.timeRecords[projectId] = {};
				}
				return cache.timeRecords[projectId];
			}, timeRecords: function(projectId) {
				console.log('[app.dataFactory] service.timeRecords(): call, projectId: '+projectId);

				var _cache = service.cachedOrPlaceholderTimeRecords(projectId);

				if ((!_cache._loaded || _cache._force_fetch || refreshIntervalPassed(_cache._loaded, TIME_RECORDS_LIFE)) && !_cache._fetch_in_progress && !_cache._last_fetch_error) {
					return service.fetchTimeRecords(projectId);
				} else if (_cache._fetch_in_progress) {
					return _cache._fetch_in_progress;
				}
				var _timeRecords = $q.defer();
				_timeRecords.resolve(_cache);
				return _timeRecords.promise;
			}, fetchTimeRecords: function(projectId) {
				console.log('[app.dataFactory] service.fetchTimeRecords(): call, projectId: '+projectId)
				var _cache = service.cachedOrPlaceholderTimeRecords(projectId);
				_cache._force_fetch = false;
				_cache._fetch_in_progress = $http({
					method: 'GET',
					url: '/api/projects/time-records/list.json',
					params: {
						't': new Date().getTime(),
						'project_id': projectId
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					delete _cache._fetch_in_progress;
					delete _cache._last_fetch_error;
					if (angular.isObject(response.data) && response.status == 200) {
						if (response.data.hasOwnProperty('project') && response.data.hasOwnProperty('time_records')) {
							// Iterate through these projects, chang anything that must be changed...
							console.log('[app.dataFactory] service.fetchTimeRecords(): response.data has `project` and `time_records`, is valid');

							// Cache this Project
							cacheProjects([response.data.project], false);

							// Cache these Time Records
							cahceTimeRecords(response.data.time_records, projectId, projectId);

							return _cache;
						}
					} else {
						_cache._last_fetch_error = true;
						console.log('[app.dataFactory] service.fetchTimeRecords(): Error reading response.');
						return {
							'error': true
						};
					}
				}, function(response) {
					// Error
					delete _cache._fetch_in_progress;
					_cache._last_fetch_error = response.status;
					console.log('[app.dataFactory] service.fetchTimeRecords(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return _cache._fetch_in_progress;
			}, createTimeRecord: function(projectId) {
				return $http({
					method: 'POST',
					url: '/api/v2/projects/'+projectId+'/time-records',
					params: {
						't': new Date().getTime()
					}, data: {
						'project_id': projectId
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						// Success!!!
						console.log('[app.dataFactory] service.createTimeRecord(): response.data is Object, response.status: 200');

						// Cache this Time Record
						cahceTimeRecords([response.data], projectId, null);

						// Force a refetch of the Project...
						var project = service.cachedOrPlaceholderProject(projectId);
						project._force_fetch = true;
						service.project(projectId);

						return response.data;
					} else {
						console.log('[app.dataFactory] service.createTimeRecord(): Error reading response.');
						return {
							'error': true
						};
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.createTimeRecord(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
			}, completeTimeRecord: function(timeRecordId, projectId) {
				return $http({
					method: 'PUT',
					url: '/api/v2/projects/'+projectId+'/time-records/'+timeRecordId,
					data: {
						end: true
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						// Success!!!
						console.log('[app.dataFactory] service.completeTimeRecord(): response.data is Object, response.status: 200');

						// Cache this Time Record
						cahceTimeRecords([response.data], projectId, null);

						// Force a refetch of the Project...
						var project = service.cachedOrPlaceholderProject(projectId);
						project._force_fetch = true;
						service.project(projectId);

						return response.data;
					} else {
						console.log('[app.dataFactory] service.completeTimeRecord(): Error reading response.');
						return {
							'error': true
						};
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.completeTimeRecord(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
			}, updateTimeRecord: function(timeRecord, projectId) {
				return $http({
					method: 'PUT',
					url: '/api/v2/projects/'+projectId+'/time-records/'+timeRecord.id,
					data: timeRecord
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						// Success
						console.log('[app.dataFactory] service.updateTimeRecord(): response.data is Object, response.status: 200');

						// Cache this Time Record
						cahceTimeRecords([response.data], projectId, null);

						return response.data;
					} else {
						console.log('[app.dataFactory] service.updateTimeRecord(): Error reading response.');
						return {
							'error': true
						};
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.updateTimeRecord(): Request error: '+response.status);

					return {
						'error': true,
						'status': response.status
					};
				});
			}, createComment: function(options) {

				var data = {
					'project_id': angular.copy(options.project_id),
					'parent_id': angular.copy(options.parent_id),
					'comment': angular.copy(options.comment)
				};

				return $http({
					method: 'POST',
					url: '/api/projects/comments/create.json',
					params: {
						't': new Date().getTime()
					}, data: data
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('comment')) {
							// Success!!!
							console.log('[app.dataFactory] service.createComment(): response.data has `comment`, is valid');

							// Cache these Comments
							cacheComments([response.data.comment], [data.project_id, data.parent_id], null);
							return response.data.comment;
						}
					}
					console.log('[app.dataFactory] service.createComment(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.createComment(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
			}, _comments: function(parentId) {
				if (!angular.isDefined(cache.comments[parentId])) {
					cache.comments[parentId] = {};
				}
				return cache.comments[parentId];
			}, comments: function(parentId) {
				console.log('[app.dataFactory] service.comments(): call, parentId: '+parentId);

				var _cache = service._comments(parentId);

				if ((!_cache._loaded || _cache._force_fetch || refreshIntervalPassed(_cache._loaded, TIME_RECORDS_LIFE)) && !_cache._fetch_in_progress && !_cache._last_fetch_error) {
					return service.fetchComments(parentId);
				} else if (_cache._fetch_in_progress) {
					return _cache._fetch_in_progress;
				}
				var _timeRecords = $q.defer();
				_timeRecords.resolve(_cache);
				return _timeRecords.promise;
			}, fetchComments: function(parentId, projectId) {
				console.log('[app.dataFactory] service.fetchComments(): Called, `parentId`: '+parentId+', `projectId`: 'projectId);

				var _cache = service.cacheOrPlaceholderComments(parentId);
				_cache._force_fetch = false;
				_cache._fetch_in_progress = $http({
					method:' GET',
					url: '/api/v2/projects/'+projectId+'/comments/'+parentId
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						console.log('[app.dataFactory] service.fetchComments(): response.data is Object, response.status: 200');

						// Cache the comments
						cacheComments(response.data, [parentId], parentId);

						return response.data;
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.fetchComments(): Request error: '+response.status);
					return {
						error: true,
						status: response.status
					};
				});
				return _cache._fetch_in_progress;

				// Temp function, just return a promise-wrapped version of `service._comments`
				// Update once API is written to fetch Comments for a particular parent object

				var _comments = $q.defer();
				_comments.resolve(service._comments(parentId));
				return _comments.promise;
			}, cachedOrPlaceholderMilestones: function(projectId) {
				/*
				*	Return all Milestones (found in `projectId`) or an empty Object.
				*/

				if (!angular.isDefined(cache.milestones[projectId])) {
					cache.milestones[projectId] = {};
				}
				return cache.milestones[projectId];
			}, cachedOrPlaceholderMilestone: function(projectId, milestoneId) {
				/*
				*	Return an individual Milestone (found in `projectId`) or an empty Object.
				*/

				var _project_cache = service.cachedOrPlaceholderMilestones(projectId);
				if (!angular.isDefined(_project_cache[milestoneId])) {
					_project_cache[milestoneId] = {};
				}
				return _project_cache[milestoneId];
			}, milestones: function(projectId) {
				console.log('[app.dataFactory] service.milestones(): call, `projectId`: '+projectId);

				var _cache = service.cachedOrPlaceholderMilestones(projectId);

				if ((!_cache._loaded || _cache._force_fetch || refreshIntervalPassed(_cache._loaded, ISSUES_LIFE)) && !_cache._fetch_in_progress && !_cache._last_fetch_error) {
					return service.fetchMilestones(projectId);
				} else if (_cache._fetch_in_progress) {
					return _cache._fetch_in_progress;
				}
				var _milestones = $q.defer();
				_milestones.resolve(_cache);
				return _milestones.promise;
			}, fetchMilestones: function(projectId) {
				console.log('[app.dataFactory] service.fetchMilestones(): call, projectId: '+projectId)
				var _cache = service.cachedOrPlaceholderMilestones(projectId);
				_cache._force_fetch = false;
				_cache._fetch_in_progress = $http({
					method: 'GET',
					url: '/api/projects/milestones/list.json',
					params: {
						't': new Date().getTime(),
						'project_id': projectId
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					delete _cache._fetch_in_progress;
					delete _cache._last_fetch_error;
					if (angular.isObject(response.data) && response.status == 200) {
						if (response.data.hasOwnProperty('project') && response.data.hasOwnProperty('milestones')) {
							// Iterate through these projects, chang anything that must be changed...
							console.log('[app.dataFactory] service.fetchMilestones(): response.data has `project` and `milestones`, is valid');

							// Cache this Project
							cacheProjects([response.data.project], false);

							// Cache these Milestones
							cacheMilestones(response.data.milestones, projectId, projectId)

							return _cache;
						}
					} else {
						_cache._last_fetch_error = true;
						console.log('[app.dataFactory] service.fetchMilestones(): Error reading response.');
						return {
							'error': true
						};
					}
				}, function(response) {
					// Error
					delete _cache._fetch_in_progress;
					_cache._last_fetch_error = response.status;
					console.log('[app.dataFactory] service.fetchMilestones(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return _cache._fetch_in_progress;
			}, milestone: function(projectId, milestoneId) {
				console.log('[app.dataFactory] service.milestone(): Called, `projectId`: '+projectId+', `milestoneId`: '+milestoneId);

				var _cache = service.cachedOrPlaceholderMilestone(projectId, milestoneId);

				if ((!_cache._loaded || _cache._force_fetch || refreshIntervalPassed(_cache._loaded, ISSUES_LIFE)) && !_cache._fetch_in_progress && !_cache._last_fetch_error) {
					return service.fetchMilestone(projectId, milestoneId);
				} else if (_cache._fetch_in_progress) {
					return _cache._fetch_in_progress;
				}
				var _milestone = $q.defer();
				_milestone.resolve(_cache);
				return _milestone.promise;
			}, fetchMilestone: function(projectId, milestoneId) {
				console.log('[app.dataFactory] service.fetchMilestone(): Called, `projectId`: '+projectId+', `milestoneId`: '+milestoneId);
				var _cache = service.cachedOrPlaceholderMilestone(projectId, milestoneId);
				_cache._force_fetch = false;
				_cache._fetch_in_progress = $http({
					method: 'GET',
					url: '/api/v2/projects/'+projectId+'/milestones/'+milestoneId
				}).then(function(response) {
					// HTTP 200-299 Status
					delete _cache._fetch_in_progress;
					delete _cache._last_fetch_error;
					if (angular.isObject(response.data) && response.status == 200) {
						console.log('[app.dataFactory] service.fetchMilestone(): response.data has `project` and `milestones`, is valid');

						// Cache these Milestones
						cacheMilestones([response.data], projectId, false)

						return _cache;
					} else {
						_cache._last_fetch_error = true;
						console.log('[app.dataFactory] service.fetchMilestone(): Error reading response.');
						return {
							error: true
						};
					}
				}, function(response) {
					// Error
					delete _cache._fetch_in_progress;
					_cache._last_fetch_error = response.status;
					console.log('[app.dataFactory] service.fetchMilestone(): Request error: '+response.status);
					return {
						error: true,
						status: response.status
					};
				});
				return _cache._fetch_in_progress;
			}, createMilestone: function(milestone, projectId) {

				milestone['project_id'] = projectId;

				return $http({
					method: 'POST',
					url: '/api/projects/milestones/create.json',
					params: {
						't': new Date().getTime()
					}, data: milestone
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('project') && response.data.hasOwnProperty('milestone')) {
							// Success!!!
							console.log('[app.dataFactory] service.createMilestone(): response.data has `project` and `milestone`, is valid');

							// Cache this Project
							cacheProjects([response.data.project], false);

							// Cache this Milestone
							cacheMilestones([response.data.milestone], projectId, false);

							return response.data.milestone;
						}
					}
					console.log('[app.dataFactory] service.createMilestone(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.createMilestone(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
			}, updateMilestone: function(milestone, projectId) {
				return $http({
					method: 'PUT',
					url: '/api/v2/projects/'+projectId+'/milestones/'+milestone.id,
					data: milestone
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						// Success!
						console.log('[app.dataFactory] service.updateMilestone(): response.data is Object, response.status: 200');

						// Cache this Milestone
						cacheMilestones([response.data], projectId, false);

						return response.data;
					} else {
						console.log('[app.dataFactory] service.updateMilestone(): Error reading response.');
						return {
							error: true
						};
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.updateMilestone(): Request error: '+response.error);
					return {
						error: true,
						status: response.status
					};
				})
			}, milestoneLabelAdd: function(labelId, milestoneId, projectId) {

				var data = {
					'label_id': labelId
				};

				return $http({
					method: 'POST',
					url: '/api/v2/projects/'+projectId+'/milestones/'+milestoneId+'/labels',
					data: data
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {

						// Cache this Label
						cacheLabels([response.data], [projectId, milestoneId], '');

						return response.data;
					}
					console.log('[app.dataFactory] service.milestoneLabelAdd(): Error reading response;')
					return {
						error: true
					};
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.milestoneLabelAdd(): Request error: '+response.status);
					return {
						error: true,
						status: response.status
					};
				});
			}, milestoneLabelRemove: function(labelId, milestoneId, projectId) {
				console.log('[app.dataFactory] service.milestoneLabelRemove(): Called: `labelId`: '+labelId+', `milestoneId`: '+milestoneId+', `projectId`: '+projectId);

				return $http({
					method: 'DELETE',
					url: '/api/v2/projects/'+projectId+'/milestones/'+milestoneId+'/labels/'+labelId
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {

						// Delete the Label from this Milestone's Labels cache (only)
						var milestoneLabels = service._labels(milestoneId);
						var _keys = Object.keys(milestoneLabels)
						for (var i = _keys.length - 1; i >= 0; i--) {
							if (milestoneLabels[_keys[i]].id == labelId) {
								delete milestoneLabels[_keys[i]];
							}
						}

						return response.data;
					}
					console.log('[app.dataFactory] service.milestoneLabelRemove(): Error reading response.');
					return {
						error: true
					};
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.milestoneLabelRemove(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
			}, _labels: function(projectId) {
				if (!angular.isDefined(cache.labels[projectId])) {
					cache.labels[projectId] = {};
				}
				return cache.labels[projectId];
			}, labelsForProject: function(projectId) {
				console.log('[app.dataFactory] service.labelsForProject(): call, `projectId`: '+projectId);

				var _cache = service._labels(projectId);

				if ((!_cache._loaded || _cache._force_fetch || refreshIntervalPassed(_cache._loaded, LABELS_LIFE)) && !_cache._fetch_in_progress && !_cache._last_fetch_error) {
					return service.fetchLabelsForProject(projectId);
				} else if (_cache._fetch_in_progress) {
					return _cache._fetch_in_progress;
				}
				var _labels = $q.defer();
				_labels.resolve(_cache);
				return _labels.promise;
			}, fetchLabelsForProject: function(projectId) {
				console.log('[app.dataFactory] service.fetchLabelsForProject(): call, projectId: '+projectId)
				var _cache = service._labels(projectId);
				_cache._force_fetch = false;
				_cache._fetch_in_progress = $http({
					method: 'GET',
					url: '/api/projects/labels/list.json',
					params: {
						't': new Date().getTime(),
						'project_id': projectId
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					delete _cache._fetch_in_progress;
					delete _cache._last_fetch_error;
					if (angular.isObject(response.data) && response.status == 200) {
						if (response.data.hasOwnProperty('project') && response.data.hasOwnProperty('labels')) {
							// Iterate through these projects, chang anything that must be changed...
							console.log('[app.dataFactory] service.fetchLabelsForProject(): response.data has `project` and `labels`, is valid');

							// Cache this Project
							cacheProjects([response.data.project], false);

							// Cache these Labels
							cacheLabels(response.data.labels, [projectId], projectId);

							return _cache;
						}
					} else {
						_cache._last_fetch_error = true;
						console.log('[app.dataFactory] service.fetchLabelsForProject(): Error reading response.');
						return {
							'error': true
						};
					}
				}, function(response) {
					// Error
					delete _cache._fetch_in_progress;
					_cache._last_fetch_error = response.status;
					console.log('[app.dataFactory] service.fetchLabelsForProject(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return _cache._fetch_in_progress;
			}, labelsForMilestone: function(milestoneId) {
				console.log('[app.dataFactory] service.labelsForMilestone(): call, `milestoneId`: '+milestoneId);

				var _cache = service._labels(milestoneId);

				if ((!_cache._loaded || _cache._force_fetch || refreshIntervalPassed(_cache._loaded, LABELS_LIFE)) && !_cache._fetch_in_progress && !_cache._last_fetch_error) {
					return service.fetchLabelsForMilestone(milestoneId);
				} else if (_cache._fetch_in_progress) {
					return _cache._fetch_in_progress;
				}
				var _labels = $q.defer();
				_labels.resolve(_cache);
				return _labels.promise;
			}, fetchLabelsForMilestone: function(milestoneId) {
				// Temp function, just return a promise-wrapped version of `service._labels`
				// Update once API is written to fetch Labels for a particular Milestone

				var _labels = $q.defer();
				_labels.resolve(service._labels(milestoneId));
				return _labels.promise;
			}, deleteLabel: function(projectId, labelId) {
				console.log('[app.dataFactory] service.deleteLabel(): Called, `projectId`: '+projectId+', `labelId`: '+labelId);
				return $http({
					method: 'DELETE',
					url: '/api/v2/projects/'+projectId+'/labels/'+labelId,
					params: {
						t: new Date().getTime()
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {

						// Loop through the Label cache and delete any that reference this value
						var _keys = Object.keys(cache.labels)
						for (var i = _keys.length - 1; i >= 0; i--) {
							if (angular.isObject(cache.labels[_keys[i]])) {
								delete cache.labels[_keys[i]][labelId];	// Delete this Label's ID, if it exists
							}
						}

						return true;
					}
					console.log('[app.dataFactory] service.deleteLabel(): Error reading response.');
					return {
						error: true
					};
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.deleteLabel(): Request error: '+response.status);
					return {
						error: true,
						status: response.status
					};
				});
			}, createLabel: function(label, projectId) {

				label['project_id'] = projectId;

				return $http({
					method: 'POST',
					url: '/api/projects/labels/create.json',
					params: {
						't': new Date().getTime()
					}, data: label
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('project') && response.data.hasOwnProperty('label')) {
							// Success!!!
							console.log('[app.dataFactory] service.createLabel(): response.data has `project` and `label`, is valid');

							// Cache this Project
							cacheProjects([response.data.project], false);

							// Cache this Label
							cacheLabels([response.data.label], [projectId], projectId);

							return response.data.label;
						}
					}
					console.log('[app.dataFactory] service.createLabel(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.createLabel(): Request error: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
			}, updateLabel: function(label, projectId) {

				label['project_id'] = projectId;

				return $http({
					method: 'PUT',
					url: '/api/v2/projects/'+projectId+'/labels/'+label.id,
					data: label
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data) && response.status == 200) {
						console.log('[app.dataFactory] service.updateLabel(): `response.data`: is Object, `response.status`: 200');

						// Cache this Label
						cacheLabels([response.data], [projectId], false);

						return response.data;
					} else {
						console.log('[app.dataFactory] service.updateLabel(): Error reading response.');
						return {
							error: true
						};
					}
				}, function(response) {
					// Error
					console.log('[app.dataFactory] service.updateLabel(): Request error: '+response.status);
					return {
						error: true,
						status: response.status
					};
				});
			}
		};

		// Return the service object
		return service;
	}]);

})();