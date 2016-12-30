var redis = require("../../redis/RedisUtil");
function init(socket,io) {
	socket.on('disconnect', function() {
		var socketId=socket.id;
		redis.getObject(socketId,function(res){
            if(res!="{}"){
            	var key=res.userName;
            	redis.getObject(key,function(obj){
            		var array=obj.socketId;
    				for (var i = 0; i < array.length; i++) {
						if (array[i] == socketId) {
							array.splice(i, 1);
						}
    				}
    				if(array.length==0){
    					redis.delObject(key);
    				}else{
    					obj.socketId=array
    					redis.setObject(key,obj,600);
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
            	
            	var url=socket.handshake.headers.referer;
     		   var urls=url.split("/");
     		   var roomId=urls[urls.length-1];
     		   if(isNaN(roomId)){
     			   roomId=0;
     		   }
               io.in(roomId).emit('broadcast-quit', {userName:key});
               redis.getObject("ChatRoomOnlineUsers",function(obj){
    			   if(obj["ChatRoom-"+roomId]){
    				   var array=obj["ChatRoom-"+roomId];
    				   for (var i = 0; i < array.length; i++) {
   						if (array[i] == key) {
   							array.splice(i, 1);
   						}
       				}
    				   obj["ChatRoom-"+roomId]=array;
    			   }
    			   redis.setObject("ChatRoomOnlineUsers",obj,600);
    		   });
            }
        });
	});
}

module.exports.init = init;