var gen = require('./generation.js');

var bomb = 'b';
var unknown = 'u';
var tile = 't';
var empty = 'e';

var io;

exports.init = function(_io) {
	io = _io;

	var map = gen.generate(30, 16, 99);

	var progress = {
		tiles: {
			total: map.total,
			cleared: map.cleared,
		},
		bombs: map.bombs,
		percentage: Math.round(map.cleared / map.total * 100)
	};

	console.log(progress);

	io.on('connection', function(socket) {
		socket.emit('init map', { map: map.current, progress: progress });

		socket.on('click unknown', function (tile) {
			click(map, tile);
		});
	});

	return map;
};

function update(map) {
	var progress = {
		tiles: {
			total: map.total,
			cleared: map.cleared,
		},
		bombs: map.bombs,
		percentage: Math.round(map.cleared / map.total * 1000) / 10
	};

	io.emit('update map', { map: map.current, progress: progress });
};

var click = function(map, tile) {
	if (!map.original) {
		map.original = gen.generateField(map, tile);
	}

	if (map.original[tile.x][tile.y].type === bomb) {
		map.current = map.original;
	}

	if (map.original[tile.x][tile.y].value === 0) {
		clearEmpty(tile, map);
	}

	if (map.current[tile.x][tile.y] !== map.original[tile.x][tile.y]) {
		map.cleared++;
		map.current[tile.x][tile.y] = map.original[tile.x][tile.y];
	}

	if (map.cleared === map.total) {
		io.emit('compelete', { state: true });
	}

	update(map);
};

function clearEmpty(tile, map) {
	around(tile.x, tile.y, map.original, function(x, y, tile) {
		if (map.current[x][y].type === unknown && map.original[x][y].value === 0) {
			if (map.current[x][y] !== map.original[x][y]) {
				map.cleared++;
				map.current[x][y] = map.original[x][y];
			}

			clearEmpty(map.current[x][y], map);
		}

		if (map.current[x][y] !== map.original[x][y]) {
			map.cleared++;
			map.current[x][y] = map.original[x][y];
		}
	});
};

function around(x, y, map, cb) {
	for (var _x = -1; _x <= 1; _x++) {
		for (var _y = -1; _y <= 1; _y++) {
			var X = _x + x;
			var Y = _y + y;

			if (X >= 0 && Y >= 0 &&
				X < map.length && Y < map[X].length) {

			cb(X, Y, map[X][Y]);
		}
		}
	}
};