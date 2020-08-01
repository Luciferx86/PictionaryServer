var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

var numUsers = 0;

io.on('connection', function (socket) {
    console.log("Someone connected");

    socket.emit("connected");

    socket.on("touch", function (x, y){
        console.log("Touch event happened somewhere");
        console.log(x+", "+y);
        socket.broadcast.emit("touch", {
            touchX: x,
            touchY: y
        });
    });


    socket.on("move", function (x, y){
        console.log("Move event happened somewhere");
        console.log(x+", "+y);
        socket.emit("move", {
            touchX: x,
            touchY: y 
        });
    });
});