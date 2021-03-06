var http = require('http');
var express = require('express');
var socket_io = require('socket.io')

var app = express();
app.use(express.static('public'));
app.use('/css', express.static(__dirname + '/node_modules/materialize-css/dist'))
app.use('/js', express.static(__dirname + '/node_modules/materialize-css/dist'))


var server = http.Server(app);
var io = socket_io(server);

var usersOnline = {}

var User = function(name){
  this.userName = name;
  this.wins = 0;
  this.drawer = false;
};

var drawer;

var answer;

var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];


// establishing listener for connection
io.on('connection', function(socket){
  
  socket.on('screenName', function(val){
    
    if(usersOnline[val]){  
      io.emit('screenName', 'already exists');
    }else{
      socket.userName = val;
      
      if(!Object.keys(usersOnline).length){
        usersOnline[val] = new User(val);
        usersOnline[val].id = socket.id;
        usersOnline[val].drawer = true;
        drawer = usersOnline[val];
                
        var randomNumber = Math.floor(Math.random() * WORDS.length)
        answer = WORDS[randomNumber]
        io.emit('clue', answer);
      }else{
        usersOnline[val] = new User(val);
        usersOnline[val].id = socket.id;
      }
      
      io.emit('screenName', usersOnline[val]);
      io.emit('drawer', drawer);
      io.emit('updateUsers', usersOnline);
    }
    
  });
  
  // socket listens for 'draw' event to occur
  socket.on('draw', function(position){
    // turns around and broadcasts back to script.js
    socket.broadcast.emit('draw', position);
  });
  
  socket.on('guess', function(guessObj){
    if(guessObj.guess === answer){      
      io.emit('correct', guessObj);
    }else{
      io.emit('incorrect', guessObj)
    }
  });
  
  
  socket.on('updateScore', function(userName){
    usersOnline[userName].wins++
    io.emit('updateUsers', usersOnline);
  });
  
  socket.on('updateDrawer', function(userObj){
    io.emit('updateDrawer', userObj);
    drawer = usersOnline[userObj.userName];

    var randomNumber = Math.floor(Math.random() * WORDS.length)
    answer = WORDS[randomNumber]
    io.emit('clue', answer);
  });
  
  socket.on('countDown', function(num){
    io.emit('countDown', num);
  });
  
  socket.on('disconnect', function(){
    
    delete usersOnline[socket.userName]
        
    if(Object.keys(usersOnline).length && drawer.userName === socket.userName){  
      var randomNum = Math.floor(Math.random() * Object.keys(usersOnline).length);
      var count = 0;
      
      for(var key in usersOnline){
        if(count === randomNum){
          drawer = usersOnline[key]
          
          io.emit('updateDrawer', usersOnline[key]);
          
          var randomNumber = Math.floor(Math.random() * WORDS.length)
          answer = WORDS[randomNumber]
          io.emit('clue', answer);
          
        }else{
          count++
        }
      }
    }
    
    io.emit('updateUsers', usersOnline);
    
  });
  
});


server.listen(8080, function(){
  console.log('Listening on port: 8080');
});