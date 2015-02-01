(function(){

	var app = angular.module('ndb_users.userFactory', []);

	app.factory('ndb_users.userFactory', ['$http', '$q', function($http, $q) {

		// Deferred user object
		var user;

		// Service object
		var service =  {
			user: function() {
				console.log('[ndb_users.userFactory] service.user(): call')
				if (!user) {
					return service.fetchUser();
				}
				return user
			}, fetchUser: function() {
				console.log('[ndb_users.userFactory] service.fetchUser(): call')
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
					console.log('[ndb_users.userFactory] service.fetchUser(): Error reading response.');
					return {};
				}, function(response) {
					// Error
					console.log('[ndb_users.userFactory] service.fetchUser(): Error loading user: '+response.status);
					return {
						'status': response.status
					};
				});
				return user;
			}, userCreate: function(email, password) {
				console.log('[ndb_users.userFactory] service.userCreate(): call')
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
					console.log('[ndb_users.userFactory] service.userCreate(): Error reading response.');
					return {};
				}, function(response) {
					// Error
					console.log('[ndb_users.userFactory] service.userCreate(): Error creating user: '+response.status);
					return {};
				});
			}, userLogin: function(email, password, extended) {
				console.log('[ndb_users.userFactory] service.fetchuserLoginUser(): call')
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
						var newUser = $q.defer();
						user = newUser.promise;
						newUser.resolve(response.data);

						return user;
					}
					console.log('[ndb_users.userFactory] service.userLogin(): Error reading response.');
					return {};
				}, function(response) {
					// Error
					console.log('[ndb_users.userFactory] service.userLogin(): Error logging in user: '+response.status);
					return {};
				});
			}
		};

		// Return the service object
		return service;
	}]);

})();