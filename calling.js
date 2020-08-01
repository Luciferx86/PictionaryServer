var io = require('socket.io-client')
// var socket = io.socket("http://localhost:3000/")
console.log("socket init");
var socket = io.connect("http://127.0.0.1:3000");
console.log("socket init");
socket.connect();
console.log("socket connected");
socket.emit("touch",0,0);
socket.off();
socket.disconnect();
console.log("socket emitted");
// socket.emit("touch",0,0);