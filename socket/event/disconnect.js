var redis = require("../../redis/RedisUtil");
function init(socket,io) {
	socket.on('disconnect', function() {
		var socketId=socket.id;
		redis.getObject(socketId,function(res){
            if(res!="{}"){
            	var key=res.userName;
            	redis.getArray(key,function(array){
    				for (var i = 0; i < array.length; i++) {
						if (array[i] == socketId) {
							array.splice(i, 1);
						}
    				}
    				if(array.length==0){
    					redis.delObject(key);
    				}else{
    					redis.setArray(key,array,600);
    				}
            	});
            	redis.getArray("onlineUser",function(array){
    				for (var i = 0; i < array.length; i++) {
						if (array[i].userName == key) {
							array.splice(i, 1);
						}
    				}
    				if(array.length==0){
    					redis.delObject("onlineUser");
    				}else{
    					redis.setArray("onlineUser",array,600);
    				}
            	});
            	redis.delObject(socketId);
            	io.emit('broadcast-quit', {userName:key});
            }
        });
	});
}

module.exports.init = init;