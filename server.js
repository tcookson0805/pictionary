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
      
      if(!Object.keys(usersOnline).length){
        
        usersOnline[val] = new User(val);
        usersOnline[val].id = socket.id;
        usersOnline[val].drawer = true;
        drawer = usersOnline[val];
        
        io.emit('screenName', usersOnline[val]);
        io.emit('drawer', drawer)
        
        var randomNumber = Math.floor(Math.random() * WORDS.length)
        
        answer = WORDS[randomNumber]
        
        io.emit('clue', answer);
      }else{
      
        usersOnline[val] = new User(val);
        usersOnline[val].id = socket.id;
        io.emit('screenName', usersOnline[val]);
      
      }
      io.emit('updateUsers', usersOnline);
    }
  });
  
  // socket listens for 'draw' event to occur
  socket.on('draw', function(position){
    // turns around and broadcasts back to script.js
    socket.broadcast.emit('draw', position);
  });
  
  socket.on('guess', function(guessObj){

    console.log(guessObj);
    console.log('answer', answer)
    
    if(guessObj.guess === answer){
      
      console.log('correct')
      
      io.emit('correct', guessObj);
    
    }else{
      
      console.log('incorrect');
      
      io.emit('incorrect', guessObj)
    }
    
    // io.emit('guess', value);
  });
  
  
  socket.on('updateScore', function(userName){
    usersOnline[userName].wins++
    console.log('hey');
    io.emit('updateUsers', usersOnline);
  });
  
  
  
  
  socket.on('disconnect', function(){
    // check to see if disconnecting user is the drawer
    
    console.log(usersOnline);
    
    // if(Object.keys(usersOnline).length){
    //   if(socket.user.drawer && Object.keys(usersOnline).length > 1){
        
    //     // removing disconnecting user from userOnline obj
    //     delete usersOnline[socket.user.name];
        
    //     var randomNum = Math.floor(Math.random() * Object.keys(usersOnline).length);
    //     var count = 0;
        
    //     for(var key in usersOnline){
    //       if(count === randomNumber){
    //         usersOnline[key].drawer = true;
    //       }else{
    //         count++;
    //       }
    //     }
          
    //   }else{
    //     delete usersOnline[socket.user.name];  
    //   } 
    // }
  });
  

});


server.listen(8080, function(){
  console.log('Listening on port: 8080');
});