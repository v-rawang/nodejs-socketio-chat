var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _redis = require("redis");
var redisClient = null; //_redis.createClient(6379, "118.194.132.112");
//redisClient.auth("begin@2015");
//redisClient.select(1);
var os = require('os');

app.get('/', function(req, res){
	res.send('<h1>Welcome to Realtime Server-:)</h1>');
});

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

function getRedisClient() 
{
	var client = _redis.createClient(6379, "118.194.132.112");
	client.auth("begin@2015");

	return client;
}

io.on('connection', function(socket){
	console.log('a user connected');
	
	//监听新用户加入
	socket.on('login', function(obj){
		//将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
		socket.name = obj.userid;
		
		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			//在线人数+1
			onlineCount++;
		}
		
		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		//console.log(obj.username+'加入了聊天室');
		console.log(obj.username + ' joins the chat.');
		
		//redisClient = _redis.createClient(6379, "118.194.132.112");
		//redisClient.auth("begin@2015");
		
		redisClient = getRedisClient();

		redisClient.select(1, function (error) 
	    {
			if (error) {
				console.log(error);
			} else {
				// set
				redisClient.set(obj.username, os.hostname(), function (error, res) {
					if (error) {
						console.log(error);
					} else {
						console.log(res);
					}
					
					// 关闭链接
					redisClient.end(true);
				});
			}
		});

		//redisClient.set(obj.username, os.hostname());
	});
	
	//监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//退出用户的信息
			var obj = {userid:socket.name, username:onlineUsers[socket.name]};
			
			//删除
			delete onlineUsers[socket.name];
			//在线人数-1
			onlineCount--;
			
			//向所有客户端广播用户退出
			io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
			//console.log(obj.username+'退出了聊天室');
			//redisClient.del(obj.username);
			//redisClient.end();
			//redisClient = _redis.createClient(6379, "118.194.132.112");
			//redisClient.auth("begin@2015");
			
			redisClient = getRedisClient();

			redisClient.select(1, function (error) {
				if (error) {
					console.log(error);
				} else {
					// set
					redisClient.del(obj.username, function (error, res) {
						if (error) {
							console.log(error);
						} else {
							console.log(res);
						}
						
						// 关闭链接
						redisClient.end(true);
					});
				}
			});
			console.log(obj.username + ' leaves the chat.');
		}
	});
	
	//监听用户发布聊天内容
	socket.on('message', function(obj){
		//向所有客户端广播发布的消息
		io.emit('message', obj);
		//console.log(obj.username+'说：'+obj.content);
		console.log(obj.username + ' says: ' + obj.content);
	});
  
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});