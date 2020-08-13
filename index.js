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
        allGames[val].players.push({ playerName, score: 0, rank: allGames[val].players.length, hasGuessedCurrent: false });
        allGames[val].isStarted = false;
        allGames[val].currentWord = "";
        allGames[val].whoseDrawing = 0;
        console.log("Creating new game");
        console.log(allGames);
        console.log(val);
        callback({
            gameState: allGames[val], code: val,
            newPlayer: { playerName, score: 0, rank: allGames[val].players.length - 1 }
        });
        // socket.broadcast.emit("createGame", {
        //     code: val
        // });
    });

    socket.on("joinGame", function (playerName, code, callback) {
        console.log(code);
        console.log(playerName);

        if (allGames[code] != null) {

            if (!checkPlayerExists(code, playerName)) {

                allGames[code].players.push({ playerName, score: 0, rank: allGames[code].players.length, hasGuessedCurrent: false });
                console.log("Join game happened somewhere");
                console.log(code);
                console.log("game status : ")
                console.log(allGames[code]);
                callback({
                    gameState: allGames[code],
                    code,
                    newPlayer: { playerName, score: 0, rank: allGames[code].players.length - 1 }
                })
                socket.broadcast.emit("joinGame", {
                    newPlayer: { playerName, score: 0, rank: allGames[code].players.length - 1 }
                });

                socket.broadcast.emit("newMessage", {
                    newMessage: { messageBody: playerName + " joined!", messageFrom: "Game" }
                });
            } else {
                console.log("player already exists");
            }
        } else {
            console.log("Invalid Game code");
            callback({ gameState: null });
        }
    });
    socket.on("newMessage", function (messageBody, messageFromIndex, gameCode, callback) {
        console.log("New Message happened somewhere");

        console.log(messageFromIndex);
        console.log("new guess: " + messageBody);
        console.log("original word: " + allGames[gameCode].currentWord);
        var messageFrom = allGames[gameCode].players[messageFromIndex].playerName;

        if (messageBody.toUpperCase() === allGames[gameCode].currentWord.toUpperCase()) {
            // callback({ wordGuessed: true });
            markPlayerHasGuessed(gameCode, messageFromIndex);

            socket.broadcast.emit("newMessage", {
                newMessage: { messageBody: messageFrom + " guessed the word!", messageFrom: "Game" }
            });
            if (checkIfAllPlayersGuessed(allGames[gameCode])) {
                resetHasGuessed(gameCode);
                var whoseTurn = parseInt(allGames[gameCode].whoseDrawing) + 1 == allGames[gameCode].players.length ? 0 : parseInt(allGames[gameCode].whoseDrawing) + 1;
                allGames[gameCode].whoseDrawing = whoseTurn;
                console.log("changing turn");
                console.log(whoseTurn);
                callback({ wordGuessed: true, isMyTurn: messageFromIndex == whoseTurn })
                socket.broadcast.emit("turnChange", {
                    whoseTurn
                })
            }
        } else {
            callback({ wordGuessed: false, isMyTurn: false });
            socket.broadcast.emit("newMessage", {
                newMessage: { messageBody, messageFrom }
            });
        }


    });

    function markPlayerHasGuessed(gameCode, playerIndex) {
        allGames[gameCode].players[playerIndex].hasGuessedCurrent = true;
    }

    function resetHasGuessed(gameCode) {
        for (var i = 0; i < allGames[gameCode].players.length; i++) {
            allGames[gameCode].players[i].hasGuessedCurrent = false;
        }
    }

    socket.on("genRandomWords", function (callback) {
        console.log("Random Word Gen happened somewhere");
        var newWords = randomPictionaryWords(3);
        console.log(newWords);
        callback({ randomWords: newWords });

    });

    function checkIfAllPlayersGuessed(gamestate) {
        var retVal = true;
        for (var i = 0; i < gamestate.players.length; i++) {
            if (i == gamestate.whoseDrawing) {
                continue;
            } else {
                if (gamestate.players[i].hasGuessedCurrent == false) {
                    retVal = false
                }
            }
        }
        return retVal;
    }

    socket.on("turnChange", function (rank, gameCode, callback) {
        console.log("Turn Change happened somewhere");
        console.log(rank);
        console.log(allGames[gameCode].players.length);

        var whoseTurn = parseInt(rank) + 1 == allGames[gameCode].players.length ? 1 : parseInt(rank) + 1 + 1
        allGames[gameCode].whoseDrawing = whoseTurn;
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
        allGames[gameCode].whoseDrawing = 0;
        var newWords = randomPictionaryWords(3);
        callback({ randomWords: newWords });
        socket.broadcast.emit("startGame");
    });

    socket.on("wordSelect", function (word, gameCode, callback) {
        console.log("Word Select happened somewhere");
        console.log(word);
        allGames[gameCode].currentWord = word;

        var originalWord = "";
        var hint = "";
        var seperatedWords = word.split(" ");
        seperatedWords.forEach(word => {
            for (var i = 0; i < word.length; i++) {
                originalWord += word[i];
                originalWord += " ";
            }

            hint += "_ ".repeat(word.length).substring(0, 2 * word.length - 1);
            hint += "   ";
            originalWord += "  ";
        })
        hint = hint.substring(0, hint.length - 3);
        originalWord = originalWord.substring(0, originalWord.length - 3);

        console.log(hint);
        console.log(originalWord);
        callback({ wordHint: originalWord });
        var timerVal = 90;
        socket.broadcast.emit("wordSelect", { wordHint: hint });
        setTimeout(() => {
            socket.broadcast.emit("timerVal", { timerVal: timerVal });
            timerVal--;
        }, 1000);
    });

    socket.on("getGames", function (callback) {
        console.log(allGames);
        callback();
    })
});