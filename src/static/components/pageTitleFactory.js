(function(){

	var app = angular.module('app.pageTitleFactory', []);

	app.factory('app.pageTitleFactory', [function() {

		var pageTitle;
		var titleSuffix = 'Time Trail';

		// Service object
		var service =  {
			pageTitle: function() {
				if (angular.isDefined(pageTitle)) {
					return pageTitle + ' - ' + titleSuffix;
				} else {
					return titleSuffix;
				}
			}, setPageTitle: function(newPageTitle) {
				console.log('[app.pageTitleFactory] service.setPageTitle(): New page title: '+newPageTitle);
				pageTitle = newPageTitle;
			}
		};

		// Return the service object
		return service;
	}]);

})();