(function(){
	angular.module('MultiSweeper', [])
		.factory('socket', SocketFactory)
		.factory('Mine', MineFactory)
		.controller('MainCtrl', MainCtrl);

	function MainCtrl($scope, socket, Mine) {
		var vm = _.extend(this, Mine);

		$scope.$on('change', function(newVal) {
			if (newVal !== 'undefined') {
				vm = _.extend(vm, Mine);
			}
		});
	};

	function SocketFactory($rootScope) {
		var socket = io('http://' + document.getElementById('socket').outerText);

		return {
			on: function(eventName, callback) {
				socket.on(eventName, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						callback.apply(socket, args);
					});
				});
			},
			emit: function(eventName, data, callback) {
				socket.emit(eventName, data, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				});
			}
		}
	};

	function MineFactory(socket, $rootScope) {
		var mine = {
			map: []
		};

		socket.on('init map', changeMap);

		socket.on('update map', changeMap);

		socket.on('compelete', function(data) {
			console.log('COMPLETE!', data);
		});

		function changeMap(data) {
			mine.progress = data.progress;

			data.map.forEach(function(a, i) {
				if (!mine.map[i]) mine.map[i] = [];

				a.forEach(function(b, n) {
					if (mine.map[i][n]) {
						if (b.type !== mine.map[i][n].type) {
							mine.map[i][n].value = b.value;
							mine.map[i][n].type = b.type;
						}
					} else {
						mine.map[i][n] = b;
					}
				});
			});

			console.log('hi');

			$rootScope.$broadcast('change', mine);
		}

		mine.click = function(tile) {
			if (tile.type === 'u')
				socket.emit('click unknown', tile);
		};

		return mine;
	};
})();