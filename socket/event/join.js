var redis = require("../../redis/RedisUtil");
function init(socket,io,cluster) {
	socket.on('join', function(data) {
		var socketId = socket.id;
		
		redis.getObject(data.userName,function(res){
		    if(res["socketId"]){
		    	res["socketId"].push(socketId);
		    }else{
		    	res["socketId"]=new Array(socketId);
		    }
		    redis.setObject(data.userName,res,600);
		    
		    
		   var url=socket.handshake.headers.referer;
		   var urls=url.split("/");
		   var roomId=urls[urls.length-1];
		   if(isNaN(roomId)){
			   roomId=0;
		   }
		   io.in(roomId).emit('broadcast-join', data);
		   redis.getObject("ChatRoomOnlineUsers",function(obj){
			   if(obj["ChatRoom-"+roomId]){
				   var t=true;
				   for(var i in obj["ChatRoom-"+roomId]){
					   if(obj["ChatRoom-"+roomId][i]==data.userName){
						   t=false;
						   break;
					   }
				   }
				   if(t){
					   obj["ChatRoom-"+roomId].push(data.userName);
				   }
				  
			   }else{
				   obj["ChatRoom-"+roomId]=new Array(data.userName);
			   }
			   redis.setObject("ChatRoomOnlineUsers",obj,600);
			   
			   
		   });
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
		// io.emit('broadcast-join', data);
	});
}


module.exports.init = init;