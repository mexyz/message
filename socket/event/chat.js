var redis = require("../../redis/RedisUtil");
function init(socket,io,cluster) {
	socket.on('group', function(data) {
		
		var url=socket.handshake.headers.referer;
		   var urls=url.split("/");
		   if(isNaN(urls[urls.length-1])){
		       io.to(0).emit('group', data);
		   }else{
		       io.to(urls[urls.length-1]).emit('group', data);
		   }
		
	});
	socket.on('private', function(data) {
		redis.getObject(data.to,function(obj){
			process.send({cmd:"notify-private",data:{socketIds:obj.socketId,content:data}});
		});
	});
}

module.exports.init = init;