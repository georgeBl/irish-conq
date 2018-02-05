//old way of setting up a node server
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

var questionAndAnswerArray = [];

var sqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'irish-conq'
});
sqlConnection.connect(function (err) {
    if (err) throw err;
    sqlQuery = "SELECT * FROM questiontable as a,answertableexample as b WHERE a.question_id = b.questionId and a.question_id = 1";
    sqlConnection.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        questionAndAnswerArray = results;
    });
    //    console.log("connected");
});

app.use(express.static("./public"));

var i = 0;
io.on('connection', function (socket) {

    //test to see if the connection is estabilished 
    //to be edited to give each user an unique id
    io.emit('conn');
    socket.on('disconnect', function () {
        io.emit('disc');
    });


    socket.on('request random question', function () {
        socket.emit('random question', questionAndAnswerArray);


    });


    //this method runs multiple times, for some reason //doesnt cause any trouble yet
    socket.on('right answer', function (ter) {
        console.log(ter);
        console.log("Right answer event received");
        socket.broadcast.emit('right answer', ter);
        console.log("Right answer event sent");
    });


});









//start the server on selected port! in this case 3000
server.listen(port, function () {
    console.log('listening on *:' + port);
});
//Math.floor(Math.random()*100%50)
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
