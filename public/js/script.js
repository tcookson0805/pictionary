// calling io and setting to socket variable
var socket = io();

// function where all the magic happens
var pictionary = function() {
    var canvas, context;
    var drawer = false;
    var drawing = false;
    var userScore = 0;
    var userName;
    var count = 5;
    var countdown;

    var initiateCountDown = function(obj){
       countdown = setInterval(function(){
         if(count > 0){
            count--;
            // socket.emit('countDown', count);
            $('.countdown').html(count);
         }else{
            stopCountDown();
            count = 5;
            $('.countdown').html(count);
            socket.emit('updateDrawer', obj);
         }
      },1000);
    }
    
    var stopCountDown = function(){
        clearInterval(countdown);
    }
    
    
    var draw = function(position){    
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

    // // using jQuery to select the <canvas> element
    // canvas = $('canvas');
    // // using the .getContext('2d') function to create a drawing context for the canvas
    //     // this context object allows you to draw simple graphis to the canvas
    // context = canvas[0].getContext('2d');
    // // setting width and height of canvas object equal to its offsetWidth and offsetHeight
    //     // this makes what is drawn to the context object display w/ correct resolutions
    // canvas[0].width = canvas[0].offsetWidth;
    // canvas[0].height = canvas[0].offsetHeight;
    
   $('body').on('mousedown', canvas, function(){
        if(drawer.userName === userName){
            drawing = true;   
        }
   });
   
   $('body').on('mouseup', canvas, function(){
        if(drawer.userName === userName){
            drawing = false;            
        }
   });
   
    //  adding mousemove listener to the canvas
    $('body').on('mousemove', canvas, function(event){
        if(drawing) {          
            // first find the offset of the canvas on the page
            var offset = canvas.offset();
            // then subtract this from the event pageX and pageY attributes
                // note that the page attributes give position of the mouse relative to the whole
                //  page so by subtracting the offset we obtain the position of the mouse relative
                //  to the top-left of the canvas
            var position = {x: event.pageX - offset.left,
                            y: event.pageY - offset.top};         
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
        var guess = {userName: userName, guess: guessBox.val()}   
        socket.emit('guess', guess);
        guessBox.val('');
    };

    guessBox = $('#guessTemplate input');
    guessBox.on('keydown', onKeyDown);
    
    
    // defer.promise(closeSignin);
    $('body').on('keydown', '.hero', function(event){
        if(event.keyCode != 13){
            return;
        }
        var val = $('#screen_name').val();
        socket.emit('screenName', val);
    });
    
    socket.on('screenName', function(userObj){
        if(userObj === 'already exists'){
            $('.alreadyTaken').show();
        }else{
            $('.signIn').hide();
            $('.game').show();
            
            // $('.user_info_name').html
            // using jQuery to select the <canvas> element
            canvas = $('#canvas');
            
            // using the .getContext('2d') function to create a drawing context for the canvas
                // this context object allows you to draw simple graphis to the canvas
            context = canvas[0].getContext('2d');
            
            // setting width and height of canvas object equal to its offsetWidth and offsetHeight
                // this makes what is drawn to the context object display w/ correct resolutions
            canvas[0].width = canvas[0].offsetWidth;
            canvas[0].height = canvas[0].offsetHeight;
            
            if(!userName){
                userName = userObj.userName
                $('.user_info_name').html(userName);
                $('.userScore').html(userScore);                
            }
        }
    });


    socket.on('drawer', function(obj){
        drawer = obj;
        if(userName === obj.userName){
            $('#guessTemplate').hide();
            $('#clueTemplate').show();
        }else {
            $('#guessTemplate').show();
            $('#clueTemplate').hide();
        }
                
        $('.drawing').show();
        $('.winner').hide();
        $('.drawer').html(obj.userName);
        
    });
    
    socket.on('updateDrawer', function(obj){
        drawer = obj;
        if(userName === obj.userName){
            $('#guessTemplate').hide();
            $('#clueTemplate').show();
        }else {
            $('#guessTemplate').show();
            $('#clueTemplate').hide();
        }
                
        $('.drawing').show();
        $('.winner').hide();
        $('.drawer').html(obj.userName);
        $('.guesses').children().remove();
    })
    
    
    socket.on('clue', function(clue){
        $('.clue').html(clue);
    });

    socket.on('incorrect', function(obj){
        var guessDiv = '<div class="guess"><span class="guess_text">' + '{{userName}} : ' + '{{guess}}</span></div>' 
        var guessTemplate = Handlebars.compile(guessDiv);
        $('.guesses').append(guessTemplate({userName: obj.userName, guess: obj.guess}))
        $('.guesses')[0].scrollTop = $('.guesses')[0].scrollHeight;
    });
    
    socket.on('correct', function(obj){
       $('.drawing').hide();
       $('.winner').show();
       $('.winner_user').html(obj.userName);
       $('.winner_answer').html(obj.guess);
    
       if(obj.userName === userName){
            socket.emit('updateScore', obj.userName);
       }
       
       initiateCountDown(obj);
    });
       

       
    
    socket.on('updateUsers', function(obj){
        
        $('.users').children().remove();
            
        var rank = []  
        
        for(var key in obj){
            rank.push(obj[key]);
        }
        
        rank.sort(function(a, b){
            return parseFloat(b.wins) - parseFloat(a.wins);
        });
        
        for(var i = 0; i < rank.length; i++){
            if(rank[i].userName === userName){
                $('.userScore').html(rank[i].wins);
            }
            $('.users').append('<div>' + rank[i].userName + ' - ' + rank[i].wins + ' points' + '</div>');
        }
        
        $('.userboard_number').html(rank.length);
        $('.users')[0].scrollTop = $('.users')[0].scrollHeight;   
    });
    
    
    socket.on('countDown', function(num){
        $('.countdown').html(num);
    });
    
      
};









$(document).ready(function() {
    pictionary();
});












