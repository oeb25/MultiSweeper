var bomb = 'b';
var unknown = 'u';
var tile = 't';
var empty = 'e';

exports.generate = function(height, width, bombs) {
	var map = {
		width: width,
		height: height,
		bombs: bombs,

		original: false,
		current: [],
		total: width * height - bombs,
		cleared: 0
	};

	var n = 0;

	for (var x = 0; x < width; x++) {
		map.current[x] = [];
		for (var y = 0; y < height; y++) {
			map.current[x][y] = {
				number: n++,
				x: x,
				y: y,
				value: 0,
				type: unknown
			};
		}
	}

	return map;
};

exports.generateField = function(map, a) {
	var feild = [];

	var n = 0;

	var bombArray = generateBombArray(map.width * map.height, map.bombs, getArroundNumbers(a.x, a.y, map.width, map.height));

	for (var x = 0; x < map.width; x++) {
		feild[x] = [];
		for (var y = 0; y < map.height; y++) {
			feild[x][y] = {
				number: n++,
				x: x,
				y: y,
				value: 0,
				type: tile
			};

			if (bombArray[x * map.width + y]) {
				feild[x][y].type = bomb;
			}
		};
	};

	for (var x = 0; x < feild.length; x++) {
		for (var y = 0; y < feild[x].length; y++) {
			if (feild[x][y].type === bomb) {
				around(x, y, feild, function(x, y, tile) {
					if (tile.type !== bomb) {
						feild[x][y].value++;
					}
				})
			}
		};
	};

	return feild;
};

function generateBombArray(size, bombs, avoid) {
	var pos = 0;
	var currentBombs = 0;
	var bombArray = [];

	while (currentBombs < bombs) {
		pos += Math.floor(Math.random() * size);

		if (pos >= size)
			pos -= size;

		if (!bombArray[pos] && avoid.indexOf(pos) === -1) {
			bombArray[pos] = true;
			currentBombs++;
		}
	}

	return bombArray;
};

function getArroundNumbers(x, y, width, height) {
	var numbers = [];
	var size = width * height;

	for (var _x = -1; _x <= 1; _x++) {
		for (var _y = -1; _y <= 1; _y++) {
			var X = _x + x;
			var Y = _y + y;

			numbers.push(Y + X * width);
		}
	}

	return numbers;
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