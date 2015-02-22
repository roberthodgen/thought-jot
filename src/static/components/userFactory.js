(function(){

	var app = angular.module('ndb_users.userFactory', []);

	app.factory('ndb_users.userFactory', ['$http', '$q', function($http, $q) {

		var cache = {};
		cache.user = {
			/*
			*	Users are considered logged in when the `email` property is set.
			*/
		};

		var mergeResponseData = function(destination, response) {
			// Assign all keys found in the response to our cache...

			var _response_keys = Object.keys(response);
			for (var i = _response_keys.length - 1; i >= 0; i--) {
				destination[_response_keys[i]] = response[_response_keys[i]];
			}

			// Delete any keys from the cache that aren't found in our response (that don't begin with an underscore)
			var _destination_keys = Object.keys(destination);
			for (var i = destination.length - 1; i >= 0; i--) {
				if (indexOf.call(b, destination[_destination_keys[i]]) === -1 && _destination_keys.charAt(0) != '_') {
					delete destination[_destination_keys[i]];
				}
			}
		};

		// Service object
		var service =  {
			user: function() {
				console.log('[ndb_users.userFactory] service.user(): call');
				if ((!cache.user._loaded || cache.user._force_fetch) && !cache.user._fetch_in_progress) {
					return service.fetchUser();
				} else if (cache.user._fetch_in_progress) {
					return cache.user._fetch_in_progress;	// return the $http promise
				}
				var _user = $q.defer();
				_user.resolve(cache.user);
				return _user.promise;
			}, fetchUser: function() {
				console.log('[ndb_users.userFactory] service.fetchUser(): call');
				cache.user._force_fetch = false;
				cache.user._fetch_in_progress = $http({
					method: 'GET',
					url: '/_login.json',
					params: {
						't': new Date().getTime()
					}
				}).then(function(response) {
					// HTTP 200-299 Status
					delete cache.user._fetch_in_progress;
					if (angular.isObject(response.data)) {
						if (response.data.hasOwnProperty('user')) {
							console.log('[app.userFactory] service.fetchUser(): data.response has `user`, is valid');

							mergeResponseData(cache.user, response.data.user);

							cache.user._loaded = new Date();
							return cache.user;
						} else {
							cache.user._loaded = new Date();
							return cache.user;
						}
					}
					console.log('[ndb_users.userFactory] service.fetchUser(): Error reading response.');
					return {
						'error': true
					};
				}, function(response) {
					// Error
					delete cache.user._fetch_in_progress;
					console.log('[ndb_users.userFactory] service.fetchUser(): Error loading user: '+response.status);
					return {
						'error': true,
						'status': response.status
					};
				});
				return cache.user._fetch_in_progress;
			}, userCreate: function(email, password) {
				console.log('[ndb_users.userFactory] service.userCreate(): call');
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
						if (response.data.hasOwnProperty('user')) {
							if (!response.data.hasOwnProperty('email_verification')) {
								mergeResponseData(cache.user, response.data.user);
								cache.user._loaded = new Date();
								return cache.user;
							} else {
								return {};
							}
						} else if (response.data.hasOwnProperty('password_too_short')) {
							return {
								'error': true,
								'message': 'Password is too short.'
							};
						} else if (response.data.hasOwnProperty('email_invalid')) {
							return {
								'error': true,
								'message': 'Email address is invalid.'
							};
						} else if (response.data.hasOwnProperty('email_in_use')) {
							return {
								'error': true,
								'message': 'Email address is already associated with an account.'
							};
						}
					}
					console.log('[ndb_users.userFactory] service.userCreate(): Error reading response.');
					return {};
				}, function(response) {
					// Error
					console.log('[ndb_users.userFactory] service.userCreate(): Error creating user: '+response.status);
					return {};
				});
			}, userLogin: function(email, password, extended) {
				console.log('[ndb_users.userFactory] service.fetchuserLoginUser(): call');
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
						if (response.data.hasOwnProperty('user')) {
							mergeResponseData(cache.user, response.data.user);
							cache.user._loaded = new Date();
						}
						return response.data;
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