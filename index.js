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

    socket.on("touch", function (x, y) {
        console.log("Touch event happened somewhere");
        console.log(x + ", " + y);
        socket.broadcast.emit("touch", {
            touchX: x,
            touchY: y
        });
    });


    socket.on("move", function (x, y) {
        console.log("Move event happened somewhere");
        console.log(x + ", " + y);
        socket.broadcast.emit("move", {
            touchX: x,
            touchY: y
        });
    });

    socket.on("changePaint", function (color) {
        console.log("Paint change happened somewhere");
        console.log(color);
        socket.broadcast.emit("changePaint", {
            color: color
        });
    });

    socket.on("changeWidth", function (width) {
        console.log("Width change happened somewhere");
        console.log(width);
        socket.broadcast.emit("changeWidth", {
            width: width
        });
    });

    socket.on("undo", function (restore) {
        console.log("Undo change happened somewhere");
        console.log(restore);
        socket.broadcast.emit("undo", {
            restore: restore
        });
    });

    socket.on("clear", function () {
        console.log("Clear change happened somewhere");
        socket.broadcast.emit("clear");
    });

    socket.on("createGame", function () {
        var val = Math.floor(1000 + Math.random() * 9000);

        console.log("Creating new game");
        console.log(val);
        socket.broadcast.emit("createGame");
    });

    socket.on("joinGame", function (code) {
        console.log("Join game happened somewhere");
        console.log(code);
        socket.broadcast.emit("joinGame", {
            code: code
        });
    });
});