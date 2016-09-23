var Mouser = function(canvas, screen) {

    // coordinates of upper left corner of screen, needed to remove the offset.
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
            lineXCoords.push(evt.clientX - startingXCoord);
            lineYCoords.push(evt.clientY - startingYCoord);
            alert('shift-click' + evt.clientX + " " + evt.clientY); 
        }
        else {
            // left click: circle
            circleXCoords.push(evt.clientX - startingXCoord);
            circleYCoords.push(evt.clientY - startingYCoord);
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

    function saveLevel() {
        // Write circles.
        var file = "circles ["
        for (i = 0; i < circleXCoords.length; i++) {
            file += circleXCoords[i] + " " + circleYCoords[i] + " 0 0";
            if (i < circleXCoords.length - 1) {
                file += ","
            }
        }
        file += "]\n"
        saveTextAs(file, "my_awesome_level.lvl");
    }
    document.getElementById('saveButton').addEventListener('click',
            saveLevel);
}
