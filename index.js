var express = require('express');
var randomPictionaryWords = require('word-pictionary-list');
const { globalAgent } = require('http');
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

var getScoreFromTimerVal = (timerVal) => {
    return timerVal * 15;
}

io.on('connection', function (socket) {
    console.log("Someone connected");



    socket.emit("connected");

    var globalGameCode = 0;

    socket.on("createGame", function (playerName, callback) {
        var val = Math.floor(1000 + Math.random() * 9000);
        globalGameCode = val;
        allGames[val] = { players: [] };
        allGames[val].players.push({ playerName, score: 0, rank: allGames[val].players.length, hasGuessedCurrent: false, score: 0 });
        allGames[val].isStarted = false;
        allGames[val].currentWord = "";
        allGames[val].whoseDrawing = 0;
        allGames[val].timer = null;
        console.log("Creating new game");
        console.log(allGames);
        console.log(val);
        callback({
            gameState: allGames[val], gameCode: val,
            newPlayer: { playerName, score: 0, rank: allGames[val].players.length - 1 }
        });
        socket.join(val);
        // socket.broadcast.emit("createGame", {
        //     code: val
        // });
    });

    socket.on("touch", function (x, y) {
        console.log("Touch event happened somewhere");
        console.log(x + ", " + y);
        console.log(globalGameCode);
        socket.in(globalGameCode).broadcast.emit("touch", {
            touchX: x,
            touchY: y
        });
    });


    socket.on("move", function (x, y) {
        console.log("Move event happened somewhere");
        console.log(x + ", " + y);
        socket.in(globalGameCode).broadcast.emit("move", {
            touchX: x,
            touchY: y
        });
    });

    socket.on("changePaint", function (color) {
        console.log("Paint change happened somewhere");
        console.log(color);
        socket.in(globalGameCode).broadcast.emit("changePaint", {
            color: color
        });
    });

    socket.on("changeWidth", function (width) {
        console.log("Width change happened somewhere");
        console.log(width);
        socket.in(globalGameCode).broadcast.emit("changeWidth", {
            width: width
        });
    });

    socket.on("undo", function (restore) {
        console.log("Undo change happened somewhere");
        console.log(restore);
        socket.in(globalGameCode).broadcast.emit("undo", {
            restore: restore
        });
    });

    socket.on("clear", function () {
        console.log("Clear change happened somewhere");
        socket.in(globalGameCode).broadcast.emit("clear");
    });



    socket.on("joinGame", function (playerName, gameCode, callback) {
        console.log(gameCode);
        console.log(playerName);
        socket.join(gameCode);

        if (allGames[gameCode] != null) {

            if (!checkPlayerExists(gameCode, playerName)) {

                globalGameCode = gameCode;

                allGames[gameCode].players.push({ playerName, score: 0, rank: allGames[gameCode].players.length, hasGuessedCurrent: false, score: 0 });
                console.log("Join game happened somewhere");
                console.log(gameCode);
                console.log("game status : ")
                console.log(allGames[gameCode]);
                callback({
                    gameState: allGames[gameCode],
                    gameCode,
                    newPlayer: { playerName, score: 0, rank: allGames[gameCode].players.length - 1 }
                })
                socket.in(gameCode).broadcast.emit("joinGame", {
                    newPlayer: { playerName, score: 0, rank: allGames[gameCode].players.length - 1 }
                });

                socket.in(gameCode).broadcast.emit("newMessage", {
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

    var getAllScores = () => {
        var allScores = [];
        allGames[globalGameCode].players.forEach((player) => {
            allScores.push({ playerName: player.playerName, score: player.score });
        });
        return allScores;
    }

    var emitAllScore = () => {
        socket.in(globalGameCode).broadcast.emit("allScores", { allScores: getAllScores() });
    }
    socket.on("newMessage", function (messageBody, messageFromIndex, timerVal, callback) {
        // Now Logging incoming words and original word
        console.log("New Message happened somewhere");
        console.log(messageFromIndex);
        console.log("new guess: " + messageBody);
        console.log("original word: " + allGames[globalGameCode].currentWord);
        // logging done
        var messageFrom = allGames[globalGameCode].players[messageFromIndex].playerName;

        if (messageBody.toUpperCase() === allGames[globalGameCode].currentWord.toUpperCase()) {
            increaseDrawersScroe(timerVal);
            // callback({ wordGuessed: true });
            markPlayerHasGuessed(globalGameCode, messageFromIndex, timerVal);

            socket.in(globalGameCode).broadcast.emit("newMessage", {
                newMessage: { messageBody: messageFrom + " guessed the word!", messageFrom: "Game" }
            });
            if (checkIfAllPlayersGuessed(allGames[globalGameCode])) {

                changeTurn(globalGameCode, callback, messageFromIndex);

            } else {
                callback({ wordGuessed: true, isMyTurn: false })
            }
        } else {
            callback({ wordGuessed: false, isMyTurn: false });
            socket.in(globalGameCode).broadcast.emit("newMessage", {
                newMessage: { messageBody, messageFrom }
            });
        }


    });

    function changeTurn(callback, messageFromIndex) {
        resetHasGuessed(globalGameCode);
        var whoseTurn = parseInt(allGames[globalGameCode].whoseDrawing) + 1 == allGames[globalGameCode].players.length ? 0 : parseInt(allGames[gameCode].whoseDrawing) + 1;
        allGames[globalGameCode].whoseDrawing = whoseTurn;
        console.log("changing turn");
        console.log(whoseTurn);
        clearInterval(allGames[globalGameCode].timer);
        callback({ wordGuessed: true, isMyTurn: messageFromIndex == whoseTurn, allScores: getAllScores() });
        emitAllScore();
        socket.broadcast.in(globalGameCode).emit("turnChange", {
            whoseTurn
        })
    }

    function increaseDrawersScroe(timerVal) {
        var playerCount = allGames[globalGameCode].players.length;
        var whoseDrawing = allGames[globalGameCode].whoseDrawing;
        allGames[globalGameCode].players[whoseDrawing].score += timerVal * 5;
    }

    function markPlayerHasGuessed(playerIndex, timerVal) {
        allGames[globalGameCode].players[playerIndex].hasGuessedCurrent = true;
        allGames[globalGameCode].players[playerIndex].score += getScoreFromTimerVal(timerVal);
    }

    function resetHasGuessed() {
        for (var i = 0; i < allGames[globalGameCode].players.length; i++) {
            allGames[globalGameCode].players[i].hasGuessedCurrent = false;
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

    socket.on("turnChange", function (rank, callback) {
        console.log("Turn Change happened somewhere");
        console.log(rank);
        console.log(allGames[globalGameCode].players.length);

        var whoseTurn = parseInt(rank) + 1 == allGames[globalGameCode].players.length ? 1 : parseInt(rank) + 1 + 1
        allGames[globalGameCode].whoseDrawing = whoseTurn;
        console.log(whoseTurn);
        callback({ whoseTurn });
        socket.in(globalGameCode).broadcast.emit("turnChange", {
            whoseTurn
        })
    });

    socket.on("startGame", function (callback) {
        console.log("Game Start happened somewhere");
        console.log(gameCode);
        allGames[gameCode].isStarted = true;
        allGames[gameCode].whoseDrawing = 0;
        var newWords = randomPictionaryWords(3);
        callback({ randomWords: newWords });
        socket.in(gameCode).broadcast.emit("startGame");
    });

    socket.on("wordSelect", function (word, playerName, callback) {
        console.log("Word Select happened somewhere");
        console.log(word);
        allGames[globalGameCode].currentWord = word;

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
        var timerVal = 89;
        socket.in(globalGameCode).broadcast.emit("wordSelect", { wordHint: hint, whoseDrawing: playerName });
        allGames[globalGameCode].timer = setInterval(() => {
            socket.in(globalGameCode).broadcast.emit("timerVal", { timerVal: timerVal-- });
            if (timerVal == 0) {
                clearInterval(allGames[globalGameCode].timer);
                console.log("done");
            }
        }, 1000);
    });

    socket.on("getGames", function (callback) {
        console.log(allGames);
        callback();
    })
});