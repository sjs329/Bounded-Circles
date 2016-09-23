var Mouser = function(canvas, screen) {

    // coordinates of upper left corner of screen, needed to remove the offset.
    console.log(screen);
    console.log(Object.getOwnPropertyNames(screen));
    var rect = canvas.getBoundingClientRect();
    var startingXCoord = rect.left;
    var startingYCoord = rect.top; 

    // for drawing circles.
    var radius = 10;

    // for recording clicks, to be written to file.
    lineXCoords = [];
    lineYCoords = [];
    circleXCoords = [];
    circleYCoords = [];

    function getCoords(evt) {
        if (evt.shiftKey) {
            // shift=left click: draw line
            circleXCoords.push(evt.clientX);
            circleYCoords.push(evt.clientY);
            alert('shift-click' + evt.clientX + " " + evt.clientY); 
        }
        else {
            // left click: circle
            lineXCoords.push(evt.clientX);
            lineXCoords.push(evt.clientY);
            //alert('click' + evt.clientX + " " + evt.clientY); 
            screen.beginPath();
            screen.strokeStyle = "black";
            screen.arc(evt.clientX - startingXCoord,
                       evt.clientY - startingYCoord,
                       radius, 0, Math.PI * 2, true);
            screen.closePath();
            screen.stroke();
        }
        
    };
    window.addEventListener('click', getCoords);
}
