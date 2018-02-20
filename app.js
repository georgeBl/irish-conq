//old way of setting up a node server
//var app = require('express')();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);

//debugger variable/s
var i = 0;

//helper variables
var players = [];

var mysql = require('mysql');
var express = require('express');
var cors = require('cors');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var port = 3000;

var questionsTable = [];

var sqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'irish-conq'
});

sqlConnection.connect(function (err) {
    if (err) throw err;
    sqlQuery = "SELECT * FROM questiontable";
    sqlConnection.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        questionsTable = results;
    });



    //    console.log("connected");
});



app.use(express.static("./public"));

app.get('/fullRoom', function (req, res) {

    res.send('The room is full');
});

io.on('connection', function (socket) {

    //deciding when the game starts
    console.log('user ' + socket.id + ' connected \n')
    players.push(socket.id);
    if (players.length < 3) {
        //wait for all players to connect
        console.log('waiting for players \n');
    } else if (players.length === 3) {
        //room is full start the game
        console.log('game starts \n');






    } else {
        //game already started
        //need to redirect the user to a different page for now // Don't know how to do that
        console.log('room is full \n');
        players.pop(socket.id); //pops the user from the array
        app.use(express.static("./fullRoom")); //doesn't work
    }

    socket.on('disconnect', function () {
        //        io.emit('disc'); //not using yet
        console.log('user ' + socket.id + ' disconnected\n');
        players.pop(socket.id);
    });

    console.log('players array ' + players + '\n\n');


    //    //test to see if the connection is estabilished 
    //    //to be edited to give each user an unique id
    //    io.emit('conn');




    socket.on('request random question', function () {
        var question = randomQuestion(questionsTable)
        socket.emit('random question', question);


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
    console.log('listening on *:' + port + '\n');
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


function randomQuestion(questions) {
    var question = questions[Math.floor(Math.random() * 100 % 91) + 1];
    console.log(question);
    return question;
}
