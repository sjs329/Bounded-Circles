var Mouser = function(editor) {
    // for drawing circles.
    var radius = 10;

    // for recording clicks, to be written to file.
    circles = [];
    lines = [];
    drawingLine = false;
    drawingCircle = false;

    function getCoords(evt) {
        var rect = editor.canvas.getBoundingClientRect();
        var x = evt.clientX-rect.left;
        var y = evt.clientY-rect.top;
        if (!onCanvas({x:x, y:y})) return;
        if (drawingLine) {
            drawingLine = false;
        }
        else if (drawingCircle) {
            drawingCircle = false;
        }
        else if (evt.shiftKey) {
            // shift=left click: draw line
            var line =  {    
                            pt1: {x: x, y: y}, 
                            pt2: {x: x, y: y},
                            color: "black"
                        }
            lines.push(line)
            drawingLine = true;
        }
        else {
            // left click: circle
            var circle = {  center: 
                                {   x: x,
                                    y: y
                                },
                            radius: 10,
                            velocity: {x:0, y:0 }
                         }
            circles.push(circle)
            drawingCircle = true;
        }
        
    };
    window.addEventListener('click', getCoords);

    function onCanvas(point) {
        return (point.x > 0 && point.x < editor.dimensions.x && point.y >0 && point.y < editor.dimensions.y);
    };

    function getPosition(evt) {
        var rect = editor.canvas.getBoundingClientRect();
        var x = evt.clientX-rect.left;
        var y = evt.clientY-rect.top;
        if (!onCanvas({x:x, y:y})) return;
        if (drawingLine) {
            lines[lines.length-1].pt2.x = x;
            lines[lines.length-1].pt2.y = y;
        } 
        else if (drawingCircle) {
            circles[circles.length-1].velocity.x = (x - circles[circles.length-1].center.x) / 10;
            circles[circles.length-1].velocity.y = (y - circles[circles.length-1].center.y) / 10;
        }
    };
    window.addEventListener('mousemove', getPosition);

    function saveLevel() {
        // Write circles.
        var file = "circles ["
        for (var i = 0; i < circles.length; i++) {
            file += circles[i].center.x + " " + circles[i].center.y + " " + circles[i].velocity.x + " " +circles[i].velocity.y;
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

        //Primary weapon
        file += "primaryWeapon "+document.getElementById("primaryWeaponSelect").value + "\n";

        //Secondary weapon
        file += "secondaryWeapon "+document.getElementById("secondaryWeaponSelect").value + "\n";

        //Powerups
        file += "powerup_drop_prob "+document.getElementById("PowerupDropProb").value + "\n";
        var powerupArray=[],powerupProbs=[];
        if (document.getElementById("PistolWeight").value > 0) { 
            powerupArray.push("Pistol"); 
            powerupProbs.push(document.getElementById("PistolWeight").value)
        }
        if (document.getElementById("SMGWeight").value > 0) { 

            powerupArray.push("SMG"); 
            powerupProbs.push(document.getElementById("SMGWeight").value)
            // console.log("SMG",powerupArray,powerupProbs)
        }
        if (document.getElementById("FlameThrowerWeight").value > 0) { 
            powerupArray.push("FlameThrower"); 
            powerupProbs.push(document.getElementById("FlameThrowerWeight").value)
        }
        if (document.getElementById("MissileLauncherWeight").value > 0) { 
            powerupArray.push("MissileLauncher"); 
            powerupProbs.push(document.getElementById("MissileLauncherWeight").value)
        }
        if (document.getElementById("MultiMissileLauncherWeight").value > 0) { 
            powerupArray.push("MultiMissileLauncher"); 
            powerupProbs.push(document.getElementById("MultiMissileLauncherWeight").value)
        }
        if (document.getElementById("GatlingGunWeight").value > 0) { 
            powerupArray.push("GatlingGun"); 
            powerupProbs.push(document.getElementById("GatlingGunWeight").value)
        }
        if (document.getElementById("FishWeight").value > 0) { 
            powerupArray.push("Fish"); 
            powerupProbs.push(document.getElementById("FishWeight").value)
        }
        if (powerupArray.length > 0) {file += "powerups ["}
        for (var i=0; i<powerupArray.length; i++) {
            // console.log("Writing ",i)
            file += ""+powerupArray[i]
            if (i < powerupArray.length-1) {
                file += " "
            }
        }
        file += "]\n"
        if (powerupProbs.length > 0) {file += "powerup_probs ["}
        for (var i=0; i<powerupProbs.length; i++) {
            file += ""+powerupProbs[i]
            if (i < powerupProbs.length-1) {
                file += " "
            }
        }
        file += "]\n"

        saveTextAs(file, "my_awesome_level.lvl");
    }
    document.getElementById('saveButton').addEventListener('click', saveLevel);

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
