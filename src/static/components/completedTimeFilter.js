(function() {

	var app = angular.module('app.completedTimeFilter', []);

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

})();