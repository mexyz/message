var redis = require("../../redis/RedisUtil");
function init(socket,io,cluster) {
	socket.on('join', function(data) {
		var socketId = socket.id;
		
		redis.getArray(data.userName,function(res){
		    res.push(socketId);
		    redis.setArray(data.userName,res,600);
		});
		redis.getObject(socketId,function(res){
            redis.setObject(socketId,{"userName":data.userName},600);
        });
		
		redis.getArray("onlineUser",function(res){
			for(var i in res){
				if(res[i].userName==data.userName){
					return;
				}
			}
			res.push({"userName":data.userName});
			redis.setArray("onlineUser",res,-1);
        });
		io.emit('broadcast-join', data);
	});
}


module.exports.init = init;