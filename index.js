var express = require('express');
var randomPictionaryWords = require('word-pictionary-list');
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
        allGames[val].isStarted = false;
        allGames[val].currentWord = "";
        console.log("Creating new game");
        console.log(allGames);
        console.log(val);
        callback({
            gameState: allGames[val], code: val,
            newPlayer: { playerName, score: 0, rank: allGames[val].players.length }
        });
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
            callback({
                gameState: allGames[code],
                code,
                newPlayer: { playerName, score: 0, rank: allGames[code].players.length }
            })
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
    socket.on("newMessage", function (messageBody, messageFrom, gameCode, callback) {
        console.log("New Message happened somewhere");
        console.log(messageBody);
        console.log(messageFrom);
        if (messageBody == allGames[gameCode].currentWord) {
            callback({ wordGuessed: true });
            socket.broadcast.emit("newMessage", {
                newMessage: { messageBody: messageFrom + " guessed the word!", messageFrom: "Game" }
            });
        } else {
            callback({ wordGuessed: false });
            socket.broadcast.emit("newMessage", {
                newMessage: { messageBody, messageFrom }
            });
        }


    });

    socket.on("genRandomWords", function (callback) {
        console.log("Random Word Gen happened somewhere");
        var newWords = randomPictionaryWords(3);
        console.log(newWords);
        callback({ randomWords: newWords });

    });

    socket.on("turnChange", function (rank, gameCode, callback) {
        console.log("Turn Change happened somewhere");
        console.log(rank);
        console.log(allGames[gameCode].players.length);

        var whoseTurn = parseInt(rank) == allGames[gameCode].players.length ? 1 : parseInt(rank) + 1
        console.log(whoseTurn);
        callback({ whoseTurn });
        socket.broadcast.emit("turnChange", {
            whoseTurn
        })
    });

    socket.on("startGame", function (gameCode, callback) {
        console.log("Game Start happened somewhere");
        console.log(gameCode);
        allGames[gameCode].isStarted = true;

        callback();
        socket.broadcast.emit("startGame");
    });

    socket.on("wordSelect", function (word, gameCode, callback) {
        console.log("Word Select happened somewhere");
        console.log(word);
        allGames[gameCode].currentWord = word;

        callback();
        socket.broadcast.emit("startGame");
    });

    socket.on("getGames", function (callback) {
        console.log(allGames);
        callback();
    })
});