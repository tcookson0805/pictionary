// calling io and setting to socket variable
var socket = io();

// function where all the magic happens
var pictionary = function() {
    
    var canvas, context;
    
    var drawing = false;

    var draw = function(position) {
        
        // this tells the context you are about to start drawing a new object
        context.beginPath();
        
        // this is used to draw arcs, in this case we tell it to draw an entire circle
            //centered at position, with a radius of 6px
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        
        // finally this fills the path in to create a solid black circle
        context.fill();
        
        // EMITTER that lets server know 'draw' has occured and sends position  
        socket.emit('draw', position);       
    };

    // using jQuery to select the <canvas> element
    canvas = $('canvas');
    
    // using the .getContext('2d') function to create a drawing context for the canvas
        // this context object allows you to draw simple graphis to the canvas
    context = canvas[0].getContext('2d');
    
    // setting width and height of canvas object equal to its offsetWidth and offsetHeight
        // this makes what is drawn to the context object display w/ correct resolutions
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    
   $('body').on('mousedown', canvas, function(){
        drawing = true;
   });
   
   $('body').on('mouseup', canvas, function(){
        drawing = false;
   });
   
   
    //  adding mousemove listener to the canvas
    canvas.on('mousemove', function(event) {
        
        // first find the offset of the canvas on the page
        var offset = canvas.offset();
        
        // then subtract this from the event pageX and pageY attributes
            // note that the page attributes give position of the mouse relative to the whole
            //  page so by subtracting the offset we obtain the position of the mouse relative
            //  to the top-left of the canvas
        var position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        
        if(drawing){
            draw(position);            
        }
  
    });
    
    // hears the 'draw' from the server
    socket.on('draw', function(position){
       draw(position);
    });
    
    
    
    //////////////////
    
    
    var guessBox;
    var guessDiv = $('.guess').clone();
    
    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }
        var guess = guessBox.val()
        socket.emit('guess', guessBox.val());
        
        guessBox.val('');
    };

    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);
    
    
    var guessDiv = '<div class="guess"><span class="guess_text"> {{guess}}</span></div>'  

    var guessTemplate = Handlebars.compile(guessDiv)
    
    
    socket.on('guess', function(value){
        var userguess = guessTemplate({guess : value});
        $('.guessboard').append(userguess)
    })
    
};

$(document).ready(function() {
    pictionary();
});












