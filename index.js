var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Mine = require('./lib/mine.js').init(io);

server.listen(3000);

app.set('view engine', 'jade')

app.use(express.static('app'));

app.get('/', function(req, res) {
	var hostname = req.headers.host.split(':')[0];

	res.render('index', { 'socket': hostname });
});