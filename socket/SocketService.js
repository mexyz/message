var chat = require("./event/chat");
var join = require("./event/join");
var disconnect = require("./event/disconnect");
var redis = require("../redis/RedisUtil");
function init(io,cluster) {

	io.on('connection', function(socket) {
	   var url=socket.handshake.headers.referer;
	   var urls=url.split("/");
	   if(isNaN(urls[urls.length-1])){
	       socket.join("0");
	   }else{
	      socket.join(urls[urls.length-1]);
	   }
		chat.init(socket, io,cluster);
		join.init(socket, io,cluster);
		disconnect.init(socket, io);
	});
}
module.exports.init = init;