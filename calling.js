var io = require('socket.io-client')
// var socket = io.socket("http://localhost:3000/")
console.log("socket init");
var socket = io.connect("https://pictionary-server.herokuapp.com");
console.log("socket init");
socket.connect();
console.log("socket connected");
for (var i = 0; i < 100; i++) {
    socket.emit("touch", i+3, i*3 + i);
}
// socket.off();
// socket.disconnect();
console.log("socket emitted");
// socket.emit("touch",0,0);