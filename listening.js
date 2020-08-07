var io = require('socket.io-client');
const { response } = require('express');
// var socket = io.socket("http://localhost:3000/")
console.log("socket init");
var socket = io.connect("http://localhost:3000/")
// var socket = io.connect("https://pictionary-server.herokuapp.com");



console.log("socket init");
socket.connect();
console.log("socket connected");

socket.on("newMessage", function (response) {
    console.log(response);
})

socket.on("turnChange", function (response) {
    console.log(response);
})

socket.on("joinGame", function (response) {
    console.log(response);
})