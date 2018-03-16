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
var users = [];
var userName;
var questionsTable = [];
var colArray = ['yellow', 'blue', 'green'];
var pNumber = 0;

//db config
var sqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'irish-conq'
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
        //go trough all the results one my one
        results.forEach(function (result) {
            //create a new instance of User using the result of each db row
            var user = new User(result.id, result.username, result.email, result.password, result.coins, result.experience, result.image);
            //save the user into the users array
            users.push(user);
        });
    });
});


//set the route of the game
app.use('/game/', express.static(path.join(__dirname, '/public')));


//set the route of the svg and dist files
app.get('/svg', function (req, res) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(path.join(__dirname, '/svg/irelandLow.svg'));
});
app.get('/dist', function (req, res) {
    res.setHeader('Content-Type', 'text/javascript');
    res.sendFile(path.join(__dirname, '/public/dist/domJSON.min.js'));
});


//a way of handling bad request
//initiate connectedUser variable with an value and if it doesnt change redirect the user to a different page
var connectedUser;
//get the user id from the link
app.get('/game/:id', function (req, res, next) {
    //store user id
    userId = req.params.id;
    //check which user joined the game room using the id
    for (i = 0; i < users.length; i++) {
        if (users[i].id == userId) {
            connectedUser = users[i];
            console.log('\n User found! It is: ' + connectedUser.username);
        }
    }
    userId = -1;
    next();
}, function (req, res) {
    //redirect the user to the game page
    res.redirect('/game');
});


//might be usefull in the future
app.get('/fullRoom', function (req, res) {
    res.send('The room is full');
});

//redirect the user in case he tries to access different pages
app.get('/', function (req, res) {
    res.redirect('http://localhost/irish-conq/public/');
});

//handle bad requests
app.all('*', function (req, res) {
    throw new Error("Bad request")
});
app.use(function (e, req, res, next) {
    if (e.message === "Bad request") {
        res.status(400).json({
            error: {
                msg: e.message,
                stack: e.stack
            }
        });
    }
});

io.on('connection', function (socket) {

    //new Player(id, socketid, username, color) //only usefull information is sent back and forth
    //create a new instance of player each time a user access the link

    if (connectedUser != null) {
        var player = new Player(connectedUser.id, socket.id, connectedUser.username, 'yellow');
        players.push(player);
        connectedUser = null;
        //        console.log(players);
    } else {
        //TODO: REDIRECT THE USER TO A DIFFERENT PAGE / INVALID JOIN 
    }

    io.emit('user-connected', players);

    socket.on('disconnect', function () {
        console.log('user disconnected');
        var found = findObjectByKey(players, 'socketId', socket.id);
        if (found != null) {
            players.splice(found, 1)
        }
        io.emit('user-connected', players);
    });


    //chat functionality
    socket.on('chat msg', function (msg) {
        //THE COMMENTED CODE CAN BE USED IN ORDER TO SAVE THE MESSAGES INTO THE DATABASE
        //        sql = "INSERT INTO messages (user, message) VALUES ('" + msg.user + "', '" + msg.msg + "');";
        //        console.log(sql);
        //        conn.query(sql, function (error, results, fields) {
        //            if (error) throw error;
        //        });
        //send the message to the other users
        socket.broadcast.emit('chat msg', msg);
    });



    //show the number of connected players to the webiste (including the ones without an ID)
    console.log(io.engine.clientsCount);


    //    io.emit('room-full');







    //
    //
    //    //deciding when the game starts
    //    players.push(player);
    //    if (players.length < 3) {
    //        //wait for all players to connect
    //        console.log('waiting for players \n');
    //        io.emit('waiting-for-players');
    //    } else if (players.length === 3) {
    //        //room is full start the game
    //        console.log('game starts \n');
    //        io.emit('game-ready');
    //    } else {
    //        //game already started
    //        //need to redirect the user to a different page for now // Don't know how to do that
    //        console.log('room is full \n');
    //        players.pop(player); //pops the user from the array
    //        //redirect the user to a different page 
    //        //        app.use(express.static("./fullRoom")); //doesn't work
    //        //untill redirect will work
    //        io.emit('room-full');
    //    }
    //    //show players event
    //
    //
    //    socket.on('disconnect', function () {
    //        //        io.emit('disc'); //not using yet
    //        console.log('user ' + socket.id + ' disconnected\n');
    //        players.pop(socket.id);
    //    });
    //
    //    console.log(players);
    //
    //    io.emit('user-connected', players);
    //
    //    socket.on('request random question', function () {
    //        var question = randomQuestion(questionsTable)
    //        socket.emit('random question', question);
    //    });
    //
    //    //this method runs multiple times, for some reason //doesnt cause any trouble yet
    //    socket.on('right answer', function (ter) {
    //        console.log(ter);
    //        console.log("Right answer event received");
    //        socket.broadcast.emit('right answer', ter);
    //        console.log("Right answer event sent");
    //    });

});


//start the server on selected port! in this case 3000
server.listen(port, function () {
    console.log('listening on *:' + port + '\n');
});

function randomQuestion(questions) {
    var question = questions[Math.floor(Math.random() * 100 % 91) + 1];
    console.log(question);
    return question;
}

function Player(_id, _socketId, _username, _col) {
    this.id = _id;
    this.socketId = _socketId;
    this.username = _username;
    this.color = _col;

}

function User(_id, _username, _email, _password, _coins, _experience, _image) {
    this.id = _id;
    this.username = _username;
    this.email = _email;
    this.password = _password;
    this.coins = _coins;
    this.experience = _experience;
    this.image = _image;
}

function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            //            return array[i];
            return i;
        }
    }
    return null;
}

//TODO: SET AN ALGORITHM THAT SETS THE COLOURS OF THE PLAYERS
