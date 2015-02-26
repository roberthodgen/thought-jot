(function(){

	var app = angular.module('app.appFactory', []);

	app.factory('app.appFactory', [function() {

		var fixedConfig = {
			'pageTitleSuffix': 'ThoughtJot!'		// The suffix of the page title
		}

		var configFilters = {
			pageTitle: function(pageTitle) {
				if (angular.isString(pageTitle)) {
					currentConfiguration.pageTitle = pageTitle + ' - ' + fixedConfig.pageTitleSuffix;
				}
				currentConfiguration.pageTitle = fixedConfig.pageTitleSuffix;
			}, sidebar: function(sidebar) {

				// Loop through each property and copy if it's available
				var _keys = Object.keys(sidebar);
				for (var i = _keys.length - 1; i >= 0; i--) {
					currentConfiguration.sidebar[_keys[i]] = sidebar[_keys[i]];
				}
			}, navbar: function(navbar) {

				// Loop through each property and copy if it's available
				var _keys = Object.keys(navbar);
				for (var i = _keys.length - 1; i >= 0; i--) {
					currentConfiguration.navbar[_keys[i]] = navbar[_keys[i]];
				}
			}
		}

		/*
	
		Only set configuration via:
			appFactory.config({ key: value })

		Retrieve common attributes like page title via their getters.

		*/


		var currentConfiguration = {
			'pageTitle': '',			// The current page title, if any
			'sidebar': {
				'show': false			// A Boolean indicating whether the Sidebar should be visible
		//		'selection': ''			// A String used to compare which item is currently selected
			},
			'navbar': {
				'title': ''				// The name that should appear in the navbar
		//		'link': ''				// The href attribute of the main navbar link
			}
		//	'project': {},				// A Project object representing the currently active/viewed project
		};

		var service = {
			config: function(newConfig) {
				console.log('[app.appFactory] service.config(): called');

				if (angular.isDefined(newConfig)) {
					// Update our current configuration...
					console.log('[app.appFactory] service.config(): New configuration.');

					// Get all of `newConfig`'s keys...
					var _newKeys = Object.keys(newConfig);

					// Delete these keys from the `currentConfiguration` property if they're not set in `newConfig`
					var _keysToDelete = ['project'];

					// Loop through our `_newKeys` and replace or set them on `currentConfiguration` as necessary
					for (var i = _newKeys.length - 1; i >= 0; i--) {

						// If this key is being set (it's in our `newConfig`), remove it from our `_keysToDelete` array...
						var _keysToDeleteIndex = _keysToDelete.indexOf(_newKeys[i])
						if (_keysToDeleteIndex > -1) {
							_keysToDelete.splice(_keysToDeleteIndex, 1)
						}

						// If `configFilters` responds for this configuration key...
						if (configFilters.hasOwnProperty(_newKeys[i])) {
							// Use the filter to update the current configuration value...
							console.log('[app.appFactory] service.config(): New config via filter, key: '+_newKeys[i]);
							(configFilters[_newKeys[i]])(newConfig[_newKeys[i]]);
						} else {
							// ... otherwise set directly
							console.log('[app.appFactory] service.config(): New config key: '+_newKeys[i]);
							currentConfiguration[_newKeys[i]] = newConfig[_newKeys[i]];
						}
					}

					// Delete keys that were left in `_keysToDelete` from `currentConfiguration`
					for (var i = _keysToDelete.length - 1; i >= 0; i--) {
						delete currentConfiguration[_keysToDelete[i]];
					}
				}

				return currentConfiguration;
			}
		};

		// Return the service object
		return service;
	}]);

})();