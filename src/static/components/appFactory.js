(function(){

	var app = angular.module('app.appFactory', []);

	app.factory('app.appFactory', [function() {

		var fixedConfig = {
			'pageTitleSuffix': 'ThoughtJot!'		// The suffix of the page title
		}

		var configFilters = {
			pageTitle: function(pageTitle) {
				if (angular.isString(pageTitle)) {
					return pageTitle + ' - ' + fixedConfig.pageTitleSuffix;
				}
				return fixedConfig.pageTitleSuffix;
			}
		}

		/*
	
		Only set configuration via:
			appFactory.config({ key: value })

		Retrieve common attributes like page title via their getters.

		*/


		var currentConfiguration = {
			/*
			'pageTitle': '',	// The current page title, if any
			'navActive': '',	// A string aproximating the current active nav bar item
			*/
		};

		var service = {
			config: function(newConfig) {
				console.log('[app.appFactory] service.config(): called');

				if (angular.isDefined(newConfig)) {
					// Update our current configuration...
					console.log('[app.appFactory] service.config(): New configuration.');

					// Get all of `newConfig`'s keys...
					var newKeys = Object.keys(newConfig);

					for (var i = newKeys.length - 1; i >= 0; i--) {
						// Just override the key...

						// If `configFilters` responds for this configuration key...
						if (configFilters.hasOwnProperty(newKeys[i])) {
							// Use the filter to update the current configuration value...
							console.log('[app.appFactory] service.config(): New config via filter, key: '+newKeys[i]);
							currentConfiguration[newKeys[i]] = (configFilters[newKeys[i]])(newConfig[newKeys[i]]);
						} else {
							// ... otherwise set directly
							console.log('[app.appFactory] service.config(): New config key: '+newKeys[i]);
							currentConfiguration[newKeys[i]] = newConfig[newKeys[i]];
						}
					};
				}

				return currentConfiguration;
			}, pageTitle: function() {
				if (angular.isDefined(currentConfiguration.pageTitle)) {
					return currentConfiguration.pageTitle + ' - ' + fixedConfig.pageTitleSuffix;
				} else {
					return fixedConfig.pageTitleSuffix;
				}
			}, navActive: function() {

			}
		};

		// Return the service object
		return service;


		var pageTitle;
		var titleSuffix = 'ThoughtJot!';

		// Service object
		var service =  {
			pageTitle: function() {
				if (angular.isDefined(pageTitle)) {
					return pageTitle + ' - ' + titleSuffix;
				} else {
					return titleSuffix;
				}
			}, setPageTitle: function(newPageTitle) {
				console.log('[app.appFactory] service.setPageTitle(): New page title: '+newPageTitle);
				pageTitle = newPageTitle;
			}, navSelection: function() {
				if (angular.isDefined(navSelection)) {
					return navSelection;
				} else {
					return 'home';
				}
			}, setNavSelection: function() {

			}
		};

		// Return the service object
		return service;
	}]);

})();