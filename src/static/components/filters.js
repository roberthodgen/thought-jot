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

	app.filter('timeOfDay', ['$filter', function($filter) {
		return function(date) {

			if (angular.isDate(date)) {

				var _hours =  date.getHours();

				if (_hours >=0 && _hours < 6) {
					return 'early morning';
				} else if (_hours >= 6 && _hours < 12) {
					return 'morning';
				} else if (_hours >= 12 && _hours < 17) {
					return 'afternoon';
				} else if (_hours >= 17 && _hours < 21) {
					return 'evening'
				} else if (_hours >= 21) {
					return 'night'
				}
			} else {
				return 'undefined';
			}
		};
	}]);

	// Return a day and time of day, e.g.: 'Wednesday afternoon'
	app.filter('friendlyStartTime', ['$filter', function($filter) {
		return function(startDate) {
			return $filter('date')(startDate, 'EEEE') + ' ' + $filter('timeOfDay')(startDate);
		};
	}]);

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

	// Return Objects that have an `id` property
	app.filter('filterDisplayObjects', function() {
		return function(objects) {
			// Return an array of Objects that are valid (have an `id` property)
			var _filter = [];

			if (angular.isArray(objects) || angular.isObject(objects)) {
				var _keys = Object.keys(objects);
				for (var i = _keys.length - 1; i >= 0; i--) {
					if (objects[_keys[i]].hasOwnProperty('id')) {
						_filter.push(objects[_keys[i]]);
					}
				}
			}
			return _filter;
		};
	});

	app.filter('timeGroupingToday', function() {
		return function(timeRecords) {

			var _filter = [];

			if (angular.isArray(timeRecords) || angular.isObject(timeRecords)) {
				var _keys = Object.keys(timeRecords);
				var date = new Date();
				for (var i = _keys.length - 1; i >= 0; i--) {
					
					// Only inspect Objects with `_created` as a Date object...
					if (angular.isDate(timeRecords[_keys[i]]._created)) {
						if (date.getDate() == timeRecords[_keys[i]]._created.getDate() && date.getMonth() == timeRecords[_keys[i]]._created.getMonth() && date.getYear() == timeRecords[_keys[i]]._created.getYear()) {
							_filter.push(timeRecords[_keys[i]]);
						}
					}
				}
			}

			return _filter;
		};
	});

	app.filter('timeGroupingYesterday', function() {
		return function(timeRecords) {

			var _filter = [];

			if (angular.isArray(timeRecords) || angular.isObject(timeRecords)) {
				var _keys = Object.keys(timeRecords);
				var date = new Date();
				date.setDate(date.getDate() -1);
				for (var i = _keys.length - 1; i >= 0; i--) {
					
					// Only inspect Objects with `_created` as a Date object...
					if (angular.isDate(timeRecords[_keys[i]]._created)) {
						if (date.getDate() == timeRecords[_keys[i]]._created.getDate() && date.getMonth() == timeRecords[_keys[i]]._created.getMonth() && date.getYear() == timeRecords[_keys[i]]._created.getYear()) {
							_filter.push(timeRecords[_keys[i]]);
						}
					}
				}
			}

			return _filter;
		};
	});

	app.filter('timeGroupingThisMonth', function() {
		return function(timeRecords) {

			var _filter = [];

			if (angular.isArray(timeRecords) || angular.isObject(timeRecords)) {
				var _keys = Object.keys(timeRecords);
				var date = new Date();
				date.setDate(date.getDate() -1);
				for (var i = _keys.length - 1; i >= 0; i--) {
					
					// Only inspect Objects with `_created` as a Date object...
					if (angular.isDate(timeRecords[_keys[i]]._created)) {
						if (date.getDate() > timeRecords[_keys[i]]._created.getDate() && date.getMonth() == timeRecords[_keys[i]]._created.getMonth() && date.getYear() == timeRecords[_keys[i]]._created.getYear()) {
							_filter.push(timeRecords[_keys[i]]);
						}
					}
				}
			}

			return _filter;
		};
	});

	app.filter('timeGroupingWhileAgo', function() {
		return function(timeRecords) {

			var _filter = [];

			if (angular.isArray(timeRecords) || angular.isObject(timeRecords)) {
				var _keys = Object.keys(timeRecords);
				var date = new Date();
				date.setDate(0);
				for (var i = _keys.length - 1; i >= 0; i--) {
					
					// Only inspect Objects with `_created` as a Date object...
					if (angular.isDate(timeRecords[_keys[i]]._created)) {
						if (date.getDate() > timeRecords[_keys[i]]._created.getDate() && date.getMonth() == timeRecords[_keys[i]]._created.getMonth() && date.getYear() == timeRecords[_keys[i]]._created.getYear()) {
							_filter.push(timeRecords[_keys[i]]);
						}
					}
				}
			}

			return _filter;
		};
	});

	// Return a light or dark color depending upon the background color
	app.filter('textColorGivenBackgroundColor', function() {
		/*
		*	Takes a HEX color string (`backgroundColorString`) and return a foreground (text) HEX color string.
		*	@param {String} backgroundColorString
		*	@returns {String}
		*/
		return function(backgroundColorString) {

			if (!angular.isString(backgroundColorString)) {
				return '#fff';
			}

			var _r = -1;
			var _b = -1;
			var _g = -1;

			var m;

			// "#ccc" format
			m = backgroundColorString.match(/^#([0-9a-f]{3})$/i);
			if (angular.isArray(m) && angular.isDefined(m[1])) {
				// in three-character format, each value is multiplied by 0x11 to give an
				// even scale from 0x00 to 0xff
				_r = parseInt(m[1].charAt(0),16)*0x11;
				_b = parseInt(m[1].charAt(1),16)*0x11;
				_g = parseInt(m[1].charAt(2),16)*0x11;
			}

			// "#cccccc" format
			m = backgroundColorString.match(/^#([0-9a-f]{6})$/i);
			if (angular.isArray(m) && angular.isDefined(m[1])) {
				_r = parseInt(m[1].substr(0,2),16);
				_g = parseInt(m[1].substr(2,2),16);
				_b = parseInt(m[1].substr(4,2),16);
			}

			if (_r == -1 || _b == -1 || _g == -1) {
				// Unable to determine, default to white
				return '#fff';
			}

			// Color brightness algorithm: http://www.w3.org/TR/AERT#color-contrast
			backgroundColorBrightness = ((_r * 299) + (_g * 587) + (_b * 114)) / 1000;
			return (backgroundColorBrightness > 175) ? '#000' : '#fff';
		};
	});

	app.filter('issueOpen', function() {
		return function(issues, open) {

			if (open == 'all') {
				return issues;
			}

			if (open == 'open') {
				open = true;
			}

			if (open == 'closed') {
				open = false;
			}

			var _filter = [];

			if (angular.isArray(issues) || angular.isObject(issues)) {
				var _keys = Object.keys(issues);
				for (var i = _keys.length - 1; i >= 0; i--) {
					if (issues[_keys[i]].open == open) {
						_filter.push(issues[_keys[i]]);
					} else if (issues[_keys[i]]._view) {
						_filter.push(issues[_keys[i]]);
					}
				}
			}
			return _filter;
		};
	});

	app.filter('issueLabels', ['app.dataFactory', function(dataFactory) {
		return function(issues, labels) {

			var _label_keys = Object.keys(labels);

			// If we have no Labels by which to filter;
			if (_label_keys.length < 1) {
				// Return `issues` "as is"
				return issues;
			}

			var _filter = [];

			if (angular.isArray(issues) || angular.isObject(issues)) {
				var _issue_keys = Object.keys(issues);
				for (var i = _issue_keys.length - 1; i >= 0; i--) {
					// Hit the cache for a list of Labels belonging to this Issue...
					var issue_labels = dataFactory._labels(issues[_issue_keys[i]].id);

					// Keep track of the matches
					var _found_count = 0;

					// Loop through all `labels`...
					for (var i_label = _label_keys.length - 1; i_label >= 0; i_label--) {

						// If our Issue contains this Label;
						if (issue_labels.hasOwnProperty(_label_keys[i_label])) {
							// Increatement the found counter by 1
							_found_count++;
						}
					}

					// If we found the same number of Labels in this Issue as belong in `labels`;
					if (_found_count == _label_keys.length) {
						// add this Issue to `_filter`
						_filter.push(issues[_issue_keys[i]]);
					}
				}
			}
			return _filter;
		};
	}]);

	app.filter('capitalize', function() {
		// FROM: http://codepen.io/WinterJoey/pen/sfFaK
		return function(input, all) {
			if (!!input) {
				return input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				});
			} else {
				return '';
			}
		};
	});


})();