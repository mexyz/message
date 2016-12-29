var express = require('express'),
    cluster = require('cluster'),
    net = require('net'),
    sio = require('socket.io'),
    sio_redis = require('socket.io-redis');
var config = require('./config/Config');
var bodyParser = require("body-parser");
var port = config.port,
    num_processes = require('os').cpus().length;

if (cluster.isMaster) {
    var workers = [];
    var ios=[];
    var spawn = function(i) {
        workers[i] = cluster.fork();
        workers[i].on('exit', function(code, signal) {
            console.log('respawning worker', i);
            spawn(i);
        });
        
        workers[i].on('message', function(msg) { 
        	switch (msg.cmd) {
			case "notify-private":
				workers.forEach(function(worker){
	                  worker.send(msg);
	        		});
				break;
			case "notify-system":
				workers.forEach(function(worker){
	                  worker.send(msg);
	        		});
				break;
			default:
				break;
			}
        }); 
    };

    for (var i = 0; i < num_processes; i++) {
        spawn(i);
    }
    var worker_index = function(ip, len) {
        var s = '';
        for (var i = 0, _len = ip.length; i < _len; i++) {
            if (!isNaN(ip[i])) {
                s += ip[i];
            }
        }

        return Number(s) % len;
    };
    var server = net.createServer({ pauseOnConnect: true }, function(connection) {
        var worker = workers[worker_index(connection.remoteAddress, num_processes)];
//        var worker;
//        if(connection.remoteAddress=="::ffff:172.16.2.237"){
//        	worker = workers[0];
//        }else{
//        	worker = workers[1];
//        }
    	worker.send({cmd:"sticky-session"}, connection);
    }).listen(port);

} else if(cluster.isWorker){
    var app = new express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static('./static'));
    var server = app.listen(0, 'localhost'),
        io = sio(server);
    io.adapter(sio_redis({ host: config.redisConfig[0].host, port: config.redisConfig[0].port }));
    process.on('message', function(message, connection) {
    	switch (message.cmd) {
		case "notify-private":
			for(var i in message.data.socketIds){
    			var socket=io.sockets.sockets[message.data.socketIds[i]];
    			if(socket){
    				socket.emit('private-message',message.data.content);
    			}
    		}
			break;
		case "notify-system":
			for(var i in message.data.socketIds){
    			var socket=io.sockets.sockets[message.data.socketIds[i]];
    			if(socket){
    				socket.emit('private-system-message',message.data.content);
    			}
    		}
			break;
		case "sticky-session":
			server.emit('connection', connection);
            connection.resume();
			break;
		default:
			break;
		}
    });
    var httpService=require('./http/HttpService');
    var socketService = require("./socket/SocketService");
    socketService.init(io,cluster);
    httpService.init(app,io,cluster);

}

