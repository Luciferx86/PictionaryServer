var io = require('socket.io-client')
// var socket = io.socket("http://localhost:3000/")
console.log("socket init");
var socket = io.connect("https://pictionary-server.herokuapp.com");
console.log("socket init");
socket.connect();
console.log("socket connected");

socket.on("move", function (x, y) {
    console.log("got move" + x + y);
})

socket.on("udno", function (val) {
    console.log("got undo" + val);
})
// socket.off();
// socket.disconnect();
console.log("socket emitted");
// socket.emit("touch",0,0);