var redis = require("../redis/RedisUtil");
var util = require("util");
function init(app,io,cluster) { 
	app.get('/', function(req, res) {
		res.sendFile(__dirname.substring(0,__dirname.length-4) + 'static/html/index.html');
	});

	app.get('/chatRoom', function(req, res) {
		res.sendFile(__dirname.substring(0,__dirname.length-4) + 'static/html/chatRoom.html');
	})
	
	app.get('/chatRoom/:id', function(req, res) {
		res.sendFile(__dirname.substring(0,__dirname.length-4) + 'static/html/chatRoom.html');
	});
	
	app.get('/chatRoomOnline', function(req, res) {
		redis.getObject("ChatRoomOnlineUsers",function(obj){
			res.send(obj);
		});
	});
	
	app.post('/chageNickName', function(req, res) {
		redis.getObject(req.body.nickname,function(obj){
		    if(!obj["socketId"]){
		    	res.send({
		    		code:1,
					msg:"该昵称可用"
				});
		    }else{
		    	res.send({
		    		code:0,
					msg:"该昵称已存在"
				});
		    }
		});
	});
	
	app.get('/sendMessage', function(req, res) {//推送消息
		
		redis.getObject(req.query.id,function(obj){
			process.send({cmd:"notify-system",data:{socketIds:obj.socketId,content:req.query.msg}});
		});
		
		res.send({
			data : "发送成功"
		});
	});
	
	app.post('/sysBroadcast', function(req, res) {
		io.emit('broadcast-system', {msg:req.body.msg});
	});
	
	app.get('/onlineUser', function (req, res) {
		redis.getArray("onlineUser",function(array){
			res.send({
				data :array
			});
		});
	});
}; 
module.exports.init = init;