(function(){

	var app = angular.module('app.projectFactory', []);

	app.factory('app.projectFactory', ['$http', '$q', function($http, $q) {

		// `projects` object caches all our Projects
		var projects = {};

		// Service object
		var service =  {
			projects: function() {
				console.log('[app.projectFactory] service.user: call')
				if (!user) {
					return service.fetchUser();
				}
				return user
			}, fetchUser: function() {
				console.log('[app.projectFactory] service.fetchUser: call')
				user = $http({
					method: 'GET',
					url: '/_login.json',
					params: {
						't': new Date().getTime()
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data)) {
						return response.data;
					}
					console.log('[app.projectFactory] service.fetchUser: Error reading response.');
					return {};
				}, function(response) {
					// Error
					console.log('[app.projectFactory] service.fetchUser: Error loading user: '+response.status);
					return {
						'status': response.status
					};
				});
				return user;
			}, userCreate: function(email, password) {
				console.log('[app.projectFactory] service.userCreate: call')
				return $http({
					method: 'POST',
					url: '/_login/create.json',
					params: {
						't': new Date().getTime(),
						'continue': encodeURI('/account/setup')
					}, data: {
						'email': email,
						'password': password
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data)) {
						return response.data;
					}
					console.log('[app.projectFactory] service.userCreate: Error reading response.');
					return {};
				}, function(response) {
					// Error
					console.log('[app.projectFactory] service.userCreate: Error creating user: '+response.status);
					return {};
				});
			}, userLogin: function(email, password, extended) {
				console.log('[app.projectFactory] service.fetchuserLoginUser: call')
				return $http({
					method: 'POST',
					url: '/_login.json',
					params: {
						't': new Date().getTime()
					}, data: {
						'email': email,
						'password': password,
						'extended': extended
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					if (angular.isObject(response.data)) {
						newUser = $q.defer();
						user = newUser.promise;
						newUser.resolve(response.data);

						return response.data;
					}
					console.log('[app.projectFactory] service.userLogin: Error reading response.');
					return {};
				}, function(response) {
					// Error
					console.log('[app.projectFactory] service.userLogin: Error logging in user: '+response.status);
					return {};
				});
			}
		};

		// Return the service object
		return service;
	}]);

})();