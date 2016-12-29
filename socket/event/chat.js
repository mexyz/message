var redis = require("../../redis/RedisUtil");
function init(socket,io,cluster) {
	socket.on('group', function(data) {
		io.emit('group', data);
	});
	socket.on('private', function(data) {
		redis.getArray(data.to,function(array){
			process.send({cmd:"notify-private",data:{socketIds:array,content:data}});
		});
	});
}

module.exports.init = init;