(function() {

	var app = angular.module('app.filters', []);


	// Convert `completed_seconds` into a string similar to: "1 hour 35 minutes"
	app.filter('completedTime', function() {
		return function(completed_seconds) {

			if (Math.floor(completed_seconds) == 0) {
				return '0 seconds';
			}

			var hours = Math.floor(completed_seconds / 3600);
			var minutes = Math.floor((completed_seconds - hours * 3600) / 60);
			var seconds = Math.floor(completed_seconds - (hours * 3600) - (minutes * 60));

			var return_string = '';

			if (hours == 1) {
				return_string = hours + ' hour';
			} else if (hours > 1) {
				return_string = hours + ' hours';
			}

			if (minutes == 1) {
				if (hours > 0) {
					return_string += ' ';
				}
				return_string += minutes + ' minute';
			} else if (minutes > 1) {
				if (hours > 0) {
					return_string += ' ';
				}
				return_string += minutes + ' minutes';
			}

			if (seconds == 1) {
				if (hours > 0 || minutes > 0) {
					return_string += ' ';
				}
				return_string += seconds + ' second';
			} else if (seconds > 1) {
				if (hours > 0 || minutes > 0) {
					return_string += ' ';
				}
				return_string += seconds + ' seconds';
			}

			return return_string;
		};
	});

	// Return a rough estimate of time, e.g.: '+3 hours'
	app.filter('aproximateCompletedTime', function() {
		return function(completed_seconds) {

			if (Math.floor(completed_seconds) == 0) {
				return '0 seconds';
			}

			var hours = Math.floor(completed_seconds / 3600);
			var minutes = Math.floor((completed_seconds - hours * 3600) / 60);
			var seconds = Math.floor(completed_seconds - (hours * 3600) - (minutes * 60));

			var return_string = '';

			if (hours == 1) {
				return '1+ hour';
			} else if (hours > 1) {
				return '' + hours + '+ hours';
			}

			if (minutes == 1) {
				return '1+ minute';
			} else if (minutes > 1) {
				return minutes + '+ minutes';
			}

			if (seconds == 1) {
				if (hours > 0 || minutes > 0) {
					return_string += ' ';
				}
				return_string += seconds + ' second';
			} else if (seconds > 1) {
				if (hours > 0 || minutes > 0) {
					return_string += ' ';
				}
				return_string += seconds + ' seconds';
			}

			return return_string;
		};
	});

	// Return all Active (not in-progress) Projects
	app.filter('filterActiveProjects', function() {
		return function(projects) {
			// Return an array of Projects that are active and not in-progress
			var _filter = [];

			var _keys = Object.keys(projects);
			for (var i = _keys.length - 1; i >= 0; i--) {
				if (projects[_keys[i]].hasOwnProperty('active') && projects[_keys[i]].hasOwnProperty('has_uncompleted_time_records')) {
					if (projects[_keys[i]].active == true && projects[_keys[i]].has_uncompleted_time_records == false) {
						_filter.push(projects[_keys[i]]);
					}
				}
			};
			return _filter;
		};
	});

	// Return all In-progress Projects
	app.filter('filterInProgressProjects', function() {
		return function(projects) {
			// Return an array of Projects that are in-progress
			var _filter = [];

			var _keys = Object.keys(projects);
			for (var i = _keys.length - 1; i >= 0; i--) {
				if (projects[_keys[i]].hasOwnProperty('has_uncompleted_time_records')) {
					if (projects[_keys[i]].has_uncompleted_time_records == true) {
						_filter.push(projects[_keys[i]]);
					}
				}
			};
			return _filter;
		};
	});

	// Return time records for a given day
	app.filter('filterProjects', function() {
		return function(projects) {
			// Return an array of Time Records that are valid
			var _filter = [];

			var _keys = Object.keys(projects);
			for (var i = _keys.length - 1; i >= 0; i--) {
				if (projects[_keys[i]].hasOwnProperty('id')) {
					_filter.push(projects[_keys[i]]);
				}
			}
			return _filter;
		}
	});

	// Return all Time Records that are not in-progress
	app.filter('filterActiveTimeRecords', function() {
		return function(timeRecords) {
			// Return an array of Time Records that are not in-progress
			var _filter = [];

			var _keys = Object.keys(timeRecords);
			for (var i = _keys.length - 1; i >= 0; i--) {
				if (timeRecords[_keys[i]].hasOwnProperty('end')) {
					if (timeRecords[_keys[i]].end != null) {
						_filter.push(timeRecords[_keys[i]]);
					}
				}
			};
			return _filter;
		};
	});

	// Return all In-progress Time Records
	app.filter('filterInProgressTimeRecords', function() {
		return function(timeRecords) {
			// Return an array of Time Records that are in-progress
			var _filter = [];

			var _keys = Object.keys(timeRecords);
			for (var i = _keys.length - 1; i >= 0; i--) {
				if (timeRecords[_keys[i]].hasOwnProperty('end')) {
					if (timeRecords[_keys[i]].end == null) {
						_filter.push(timeRecords[_keys[i]]);
					}
				}
			};
			return _filter;
		};
	});

	// Return time records for a given day
	app.filter('filterTimeRecords', function() {
		return function(timeRecords) {
			// Return an array of Time Records that are valid
			var _filter = [];

			var _keys = Object.keys(timeRecords);
			for (var i = _keys.length - 1; i >= 0; i--) {
				if (timeRecords[_keys[i]].hasOwnProperty('id')) {
					_filter.push(timeRecords[_keys[i]]);
				}
			}
			return _filter;
		}
	});



})();