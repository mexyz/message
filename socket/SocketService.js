var chat = require("./event/chat");
var join = require("./event/join");
var disconnect = require("./event/disconnect");
function init(io,cluster) {

	io.on('connection', function(socket) {
		chat.init(socket, io,cluster);
		join.init(socket, io,cluster);
		disconnect.init(socket, io);
	});
}
module.exports.init = init;