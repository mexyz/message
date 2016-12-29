var ioredis = require('ioredis');
var config = require('../config/Config');
var redis = new ioredis.Cluster(config.redisConfig);

//redis.set("test2",querystring.stringify({foo:'bar',cool:['xux', 'yys']}));
//var getString=function(key,callback){
//	redis.get(key,function (err, res) {
//		callback(res);
//	});
//}

var getObject=function(key,callback){
	redis.get(key,function (err, res) {
		callback(res);
	});
}

var setObject=function(key,value,ttl){
	if(ttl==-1){
		redis.set(key,value);
	}else{
		redis.set(key,value,"EX",ttl);
	}
	
}

module.exports.getArray=function (key,callback){
	getObject(key,function(value){
		if(value){
			callback(JSON.parse(value));
		}else{
			callback(new Array());
		}
		
	});	
}

module.exports.getObject=function (key,callback){
	getObject(key,function(value){
		if(value){
			callback(JSON.parse(value));
		}else{
			callback({});
		}
		
	});	
}

//module.exports.getString=function (key,callback){
//	getString(key,function(value){
//		if(value){
//			callback(value);
//		}else{
//			callback("");
//		}
//		
//	});	
//}

module.exports.setArray=function (key,array,ttl){
	setObject(key,JSON.stringify(array),ttl);	
}

module.exports.setObject=function (key,object,ttl){
	setObject(key,JSON.stringify(object),ttl);	
}

module.exports.delObject=function (key){
	setObject(key,"",1);	
}

//module.exports.setString=function (key,string,ttl){
//	setString(key,string,ttl);	
//}