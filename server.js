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
  this.screenName = name;
  this.wins = 0;
  this.drawer = false;
};


// establishing listener for connection
io.on('connection', function(socket){
  
  socket.on('screenName', function(val){
    
    if(usersOnline[val]){
      io.emit('screenName', 'already exists');
    }else{
      usersOnline[val] = new User(val);
      
      socket.user = usersOnline[val];
      
      if(!Object.keys(usersOnline).length){
        usersOnline.val.drawer = true;
      }
       
      io.emit('screenName', usersOnline[val].name);
    }
  });
  
  // socket listens for 'draw' event to occur
  socket.on('draw', function(position){
    // turns around and broadcasts back to script.js
    socket.broadcast.emit('draw', position);
  });
  
  socket.on('guess', function(value){
    io.emit('guess', value);
  })
  
  socket.on('disconnect', function(){
    // check to see if disconnecting user is the drawer
    
    console.log(usersOnline);
    
    if(Object.keys(usersOnline).length){
      if(socket.user.drawer && Object.keys(usersOnline).length > 1){
        
        // removing disconnecting user from userOnline obj
        delete usersOnline[socket.user.name];
        
        var randomNum = Math.floor(Math.random() * Object.keys(usersOnline).length);
        var count = 0;
        
        for(var key in usersOnline){
          if(count === randomNumber){
            usersOnline[key].drawer = true;
          }else{
            count++;
          }
        }
          
      }else{
        delete usersOnline[socket.user.name];  
      } 
    }
  });
  
  
  

});


server.listen(8080, function(){
  console.log('Listening on port: 8080');
});