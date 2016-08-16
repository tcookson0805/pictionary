var http = require('http');
var express = require('express');
var socket_io = require('socket.io')

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

// establishing listener for connection
io.on('connection', function(socket){
  
  // socket listens for 'draw' event to occur
  socket.on('draw', function(position){
    // turns around and broadcasts back to script.js
    socket.broadcast.emit('draw', position);
  });

});


server.listen(8080, function(){
  console.log('Listening on port: 8080');
});