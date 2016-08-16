var pictionary = function() {
    var canvas, context;

    var drawing = false;

    console.log('what the fuck');

    var draw = function(position) {
        
        // this tells the context you are about to start drawing a new object
        context.beginPath();
        
        // this is used to draw arcs, in this case we tell it to draw an entire circle
            //centered at position, with a radius of 6px
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        
        // finally this fills the path in to create a solid black circle
        context.fill();
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
    
    //  adding mousemove listener to the canvas
    
    canvas.on('mousedown', function(event){
         drawing = true;
    });
    
    canvas.on('mouseup', function(event){
         drawing = false;
    })
    
    canvas.on('mousemove', function(event) {
        
        // first find the offset of the canvas on the page
        var offset = canvas.offset();
        
        // then subtract this from the event pageX and pageY attributes
            // note that the page attributes give position of the mouse relative to the whole
            //  page so by subtracting the offset we obtain the position of the mouse relative
            //  to the top-left of the canvas
        var position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        
        console.log('hey');
        if(drawing){
            draw(position);
        }
        
    });
};

$(document).ready(function() {
    pictionary();
});