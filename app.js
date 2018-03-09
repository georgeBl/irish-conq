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
var path = require('path');

var userId;
var users;
var userName;
var questionsTable = [];
var colArray = ['yellow', 'blue', 'green'];
var pNumber = 0;

//db config
var sqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'irishq'
});
//get all the questions from the database
sqlConnection.connect(function (err) {
    if (err) throw err;
    sqlQuery = "SELECT * FROM questiontable";
    sqlConnection.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        questionsTable = results;
    });
    sqlQuery = "SELECT * FROM users";
    sqlConnection.query(sqlQuery, function (error, results, fields) {
        if (error) throw error;
        users = results;
        console.log(users[5].username);
    });
});



//set the public folder as the default homepage route
//app.use(express.static("./public"));

app.use('/game', express.static(path.join(__dirname, '/public')));

app.get('/svg', function (req, res) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(path.join(__dirname, '/svg/irelandLow.svg'));
});

app.get('/dist', function (req, res) {
    res.setHeader('Content-Type', 'text/javascript');
    res.sendFile(path.join(__dirname, '/public/dist/domJSON.min.js'));
});



app.get('/game/:id', function (req, res, next) {
    userId = req.params.id;
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === userId) {
            userName = users[i].username;
            break;
        }
    }
    next();
}, function (req, res) {
    res.redirect('/game');
});


//might be usefull in the future
app.get('/fullRoom', function (req, res) {
    res.send('The room is full');
});

io.on('connection', function (socket) {

    //setting up the player


    if (pNumber < 4) {
        //new Player(id, socketid, color)
        var player = new Player(pNumber, userName, colArray[pNumber]);
        
        pNumber++;
    } else {
        io.emit('room-full');
    }


    //deciding when the game starts
    //    players.push(socket.id); old
    players.push(player);
    if (players.length < 3) {
        //wait for all players to connect
        console.log('waiting for players \n');
        io.emit('waiting-for-players');
    } else if (players.length === 3) {
        //room is full start the game
        console.log('game starts \n');
        io.emit('game-ready');
    } else {
        //game already started
        //need to redirect the user to a different page for now // Don't know how to do that
        console.log('room is full \n');
        players.pop(player); //pops the user from the array
        //redirect the user to a different page 
        //        app.use(express.static("./fullRoom")); //doesn't work
        //untill redirect will work
        io.emit('room-full');
    }
    //show players event
    io.emit('user-connected', players);

    socket.on('disconnect', function () {
        //        io.emit('disc'); //not using yet
        console.log('user ' + socket.id + ' disconnected\n');
        players.pop(socket.id);
    });

    console.log('players array ' + players + '\n\n');



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

function Player(_id, _socketId, _col) {
    this.id = _id;
    this.socketId = _socketId;
    this.color = _col;
}
