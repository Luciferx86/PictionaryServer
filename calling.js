var io = require('socket.io-client')
// var socket = io.socket("http://localhost:3000/")
console.log("socket init");
var socket = io.connect("http://localhost:3000/")
// var socket = io.connect("https://pictionary-server.herokuapp.com");



console.log("socket init");
socket.connect();
console.log("socket connected");

socket.on("move", function (x, y) {
    console.log("got move" + x + y);
})

socket.on("udno", function (val) {
    console.log("got undo" + val);
})

socket.on("createGame", function (code) {
    console.log("game created" + code["code"]);
    
})

// socket.emit("createGame", "firstUser", function (response) {
//     console.log(response["code"]);
// });

// socket.emit("joinGame", "Lucifer2", '4580', function (response) {
//     console.log(response);
// });

// socket.emit("newMessage", "ipad", 'Luciferx86', "4580", function (response) {
//     console.log(response);
//     console.log("Posted");
// });

// socket.emit("genRandomWords", function (val) {
//     val["randomWords"].forEach((word) => {
//         console.log(word);
//     })
// });

// socket.emit("getGames",function(){
//     console.log("gettingGames");
// })

// socket.emit("turnChange", "3", "7353", function () {
//     console.log("yoyo");
// })

// socket.emit("wordSelect", "ipad", '4580', function (response) {
//     console.log("selected word");
// });


// socket.off();
// socket.disconnect();
console.log("socket emitted");

console.log("yoyo".toUpperCase() === "YoYo".toUpperCase());
// socket.emit("touch",0,0);