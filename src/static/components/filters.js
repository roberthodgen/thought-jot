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
				return_string = hours + ' hour';
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

	// Return all Active (not in-progress) Projects
	app.filter('filterActiveProjects', function() {
		return function(projects) {
			// Return an array of Projects that are active and not in-progress
			var filtered_projects = [];

			var projects_keys = Object.keys(projects);
			for (var i = projects_keys.length - 1; i >= 0; i--) {
				if (projects[projects_keys[i]].hasOwnProperty('active') && projects[projects_keys[i]].hasOwnProperty('has_uncompleted_time_records')) {
					if (projects[projects_keys[i]].active == true && projects[projects_keys[i]].has_uncompleted_time_records == false) {
						filtered_projects.push(projects[projects_keys[i]]);
					}
				}
			};
			return filtered_projects;
		};
	});

	// Return all In-progress Projects
	app.filter('filterInProgressProjects', function() {
		return function(projects) {
			// Return an array of Projects that are in-progress
			var filterd_projects = [];

			var projects_keys = Object.keys(projects);
			for (var i = projects_keys.length - 1; i >= 0; i--) {
				if (projects[projects_keys[i]].hasOwnProperty('has_uncompleted_time_records')) {
					if (projects[projects_keys[i]].has_uncompleted_time_records == true) {
						filterd_projects.push(projects[projects_keys[i]]);
					}
				}
			};
			return filterd_projects;
		};
	});

	// Return all Time Records that are not in-progress
	app.filter('filterActiveTimeRecords', function() {
		return function(timeRecords) {
			// Return an array of Time Records that are not in-progress
			var filtered_projects = [];

			for (var i = timeRecords.length - 1; i >= 0; i--) {
				if (timeRecords[i].hasOwnProperty('end')) {
					if (timeRecords[i].end != null) {
						filtered_projects.push(timeRecords[i]);
					}
				}
			};
			return filtered_projects;
		};
	});

	// Return all In-progress Time Records
	app.filter('filterInProgressTimeRecords', function() {
		return function(timeRecords) {
			// Return an array of Time Records that are in-progress
			var filterd_projects = [];

			for (var i = timeRecords.length - 1; i >= 0; i--) {
				if (timeRecords[i].hasOwnProperty('end')) {
					if (timeRecords[i].end == null) {
						filterd_projects.push(timeRecords[i]);
					}
				}
			};
			return filterd_projects;
		};
	});

})();