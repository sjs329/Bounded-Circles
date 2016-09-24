var Mouser = function(editor) {
    // for drawing circles.
    var radius = 10;

    // for recording clicks, to be written to file.
    circles = [];
    lines = [];
    drawingLine = false;

    function getCoords(evt) {
        var rect = editor.canvas.getBoundingClientRect();
        if (drawingLine) {
            drawingLine = false;
        }
        else if (evt.shiftKey) {
            // shift=left click: draw line
            var line =  {    
                            pt1: {x: evt.clientX - rect.left, y: evt.clientY - rect.top}, 
                            pt2: {x: evt.clientX - rect.left+1, y: evt.clientY - rect.top+1}
                        }
            lines.push(line)
            drawingLine = true;
        }
        else {
            // left click: circle
            var circle = {  center: 
                                {   x: evt.clientX - rect.left,
                                    y: evt.clientY - rect.top
                                },
                            radius: 10
                         }
            circles.push(circle)
        }
        
    };
    window.addEventListener('click', getCoords);

    function getPosition(evt) {
        if (drawingLine) {
            var rect = editor.canvas.getBoundingClientRect();
            lines[lines.length-1].pt2.x = evt.clientX-rect.left;
            lines[lines.length-1].pt2.y = evt.clientY-rect.top;
        }
    };
    window.addEventListener('mousemove', getPosition);

    function saveLevel() {
        // Write circles.
        var file = "circles ["
        for (var i = 0; i < circles.length; i++) {
            file += circles[i].center.x + " " + circles[i].center.y + " 0 0";
            if (i < circles.length - 1) {
                file += ","
            }
        }
        file += "]\n"

        // Write lines
        file += "lines ["
        for (var i=0; i<lines.length; i++) {
            file += lines[i].pt1.x + " " + lines[i].pt1.y + " " + lines[i].pt2.x + " " + lines[i].pt2.y;
            if (i < lines.length - 1) {
                file += ","
            }
        }
        file += "]\n"
        saveTextAs(file, "my_awesome_level.lvl");
    }
    document.getElementById('saveButton').addEventListener('click',
            saveLevel);

    function tick() {
        // Clear away the drawing from the previous tick.
        editor.screen.clearRect(1, 1, editor.dimensions.x-2, editor.dimensions.y-2); //but don't clear the border lines
        
        //draw lines
        for (var i=0; i<lines.length; i++) {
            // console.log("Drawing line",lines[i])
            editor.drawLine(lines[i])
        }

        //draw circles
        for (var i=0; i<circles.length; i++) {
            editor.drawCircle(circles[i])
        }
        
        // Queue up the next call to tick with the browser.
        requestAnimationFrame(tick);
    }
    tick();
}
