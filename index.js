var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

var allGames = {};

var checkPlayerExists = (gameCode, playerName) => {
    var retVal = false;
    var game = allGames[gameCode];
    console.log(game);
    var gamePlayers = game["players"];
    gamePlayers.forEach((player) => {
        console.log("existing player:" + player["playerName"]);
        console.log("new player:" + playerName);
        if (player["playerName"] == playerName) {
            retVal = true;
        }
    });
    return retVal;
}

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

    socket.on("createGame", function (playerName, callback) {
        var val = Math.floor(1000 + Math.random() * 9000);
        allGames[val] = { players: [] };
        allGames[val].players.push({ playerName, score: 0, rank: allGames[val].players.length + 1 });
        console.log("Creating new game");
        console.log(allGames);
        console.log(val);
        callback({ gameState: allGames[val], code: val });
        // socket.broadcast.emit("createGame", {
        //     code: val
        // });
    });

    socket.on("joinGame", function (playerName, code, callback) {
        console.log(code);
        console.log(playerName);

        if (!checkPlayerExists(code, playerName)) {

            allGames[code].players.push({ playerName, score: 0, rank: allGames[code].players.length + 1 });
            console.log("Join game happened somewhere");
            console.log(code);
            console.log("game status : ")
            console.log(allGames[code]);
            callback({ gameState: allGames[code], code })
            socket.broadcast.emit("joinGame", {
                newPlayer: { playerName, score: 0, rank: allGames[code].players.length }
            });

            socket.broadcast.emit("newMessage", {
                newMessage: { messageBody: playerName + " joined!", messageFrom: "Game" }
            });
        } else {
            console.log("player already exists");
        }
    });
    socket.on("newMessage", function (messageBody, messageFrom, callback) {
        console.log("New Message happened somewhere");
        console.log(messageBody);
        console.log(messageFrom)
        callback();
        socket.broadcast.emit("newMessage", {
            newMessage: { messageBody, messageFrom }
        });
    });

    socket.on("getGames", function (callback) {
        console.log(allGames);
        callback();
    })
});