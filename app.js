//old way of writting the server
//var app = require('express')();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);

var mysql = require('mysql');
var express = require('express');
var cors = require('cors');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var port = 3000;


var sqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'irishq'
});
sqlConnection.connect(function (err) {

    if (err) {
        throw err;
    } else {
        console.log("connected");
    }

});

var questionTable;

questionTable = sqlConnection.query('SELECT * FROM questiontable', function (error, results, fields) {
    if (error) throw error;
//    console.log(results);
//    socket.emit('questions array', results);
//    console.log("Question table event sent");
    return results;
});

console.log(questionTable);


app.use(express.static("./public"));


io.on('connection', function (socket) {
    io.emit('conn');
    socket.on('disconnect', function () {
        io.emit('disc');
    });
    //    socket.on('chat msg', function (msg) {
    //        console.log('message:' + msg);
    //        socket.broadcast.emit('chat msg', msg);
    //    });
    //    socket.on('user typing', function (username) {
    //        console.log(username + " is typing");
    //        io.emit('user typing', username);
    //    });
    //    socket.on('user not typing', function () {
    //        io.emit('user not typing');
    //    });

    socket.on('right answer', function (ter) {
        console.log(ter);
        console.log("Right answer event received");
        socket.broadcast.emit('right answer', ter);
        console.log("Right answer event sent");
    });
});












//start the on selected port! in this case 3000
server.listen(port, function () {
    console.log('listening on *:' + port);
});
