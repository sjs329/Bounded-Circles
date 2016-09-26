var Mouser = function(editor, firstStart) {
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
        editor.saved = false; //we've changed something
        if (drawingLine) {
            drawingLine = false;
            populatePropertyBox(lines[lines.length-1])
        }
        else if (drawingCircle) {
            drawingCircle = false;
            populatePropertyBox(circles[circles.length-1])
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
            if (evt.shiftKey) {
                var pt1 = lines[lines.length-1].pt1;
                if (Math.abs(x-pt1.x) > Math.abs(y-pt1.y)) {
                    // console.log("Horiz line")
                    lines[lines.length-1].pt2.x = x;
                    lines[lines.length-1].pt2.y = pt1.y;
                } else {
                    lines[lines.length-1].pt2.x = pt1.x;
                    lines[lines.length-1].pt2.y = y;
                }
            } else {
                lines[lines.length-1].pt2.x = x;
                lines[lines.length-1].pt2.y = y;
            }
        } 
        else if (drawingCircle) {
            circles[circles.length-1].velocity.x = (x - circles[circles.length-1].center.x) / 10;
            circles[circles.length-1].velocity.y = (y - circles[circles.length-1].center.y) / 10;
        }
    };
    window.addEventListener('mousemove', getPosition);

    function getLevelString() {
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
        if (document.getElementById("NewLifeWeight").value > 0) { 
            powerupArray.push("NewLife"); 
            powerupProbs.push(document.getElementById("NewLifeWeight").value)
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

        return file
    }

    function saveLevel() {
        var file = getLevelString();

        saveTextAs(file, "my_awesome_level.lvl");
        editor.saved = true;
    }
    document.getElementById('saveButton').addEventListener('click', saveLevel);

    function backToGame() {
        if (editor.saved) {
            window.location.href = '../index.html';
        }
        else {
            var r = confirm("Warning, the game has not been saved. Would you like to save the game before leaving?\n\nPress Cancel to leave without saving.");
            if (r == true) {
                saveLevel();
                window.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        }
    }
    document.getElementById('backToGameButton').addEventListener('click', backToGame);

    function testLevel() {
        var level = getLevelString();

        editor.editor_mode = false;
        editor.start(false, [level])
    }
    document.getElementById('testLevel').addEventListener('click', testLevel);

    function endTest() {
        editor.editor_mode = true;
        editor.beginEditor(null, false)
    }
    document.getElementById('endTest').addEventListener('click', endTest);

    function populatePropertyBox(object){

        // Container <div> where dynamic content will be placed
        var container = document.getElementById("propertyBox");
        // Clear previous contents of the container
        while (container.hasChildNodes()) {
            container.removeChild(container.lastChild);
        }
        makePropertyInputs(object, [], "", "", container);
    }

    function makePropertyInputs(object, keyPath, name, indent, container) { //recursive function
        var newObject = object;
        for (var i=0; i<keyPath.length; i++) {
            newObject = newObject[keyPath[i]]; //this is tomfoolary seemingly needed to get the properties to match up to the object
        }
        if (typeof newObject === "object") {
            var keys = getKeys(newObject);
            var num = keys.length;
            container.appendChild(document.createElement("br"));
            for (var i=0; i<num; i++) {
                container.appendChild(document.createTextNode(indent+keys[i]+": "));   
                makePropertyInputs(object, keyPath.concat(keys[i]), keys[i], indent+"  ", container);
            }
        } else {
            var input = document.createElement("input");
            input.value = newObject;
            input.type = typeof newObject;
            input.name = "member" + i;
            
            container.appendChild(input);
            //Add event listener
            input.onchange = function() 
                { 
                    var newObject = object;
                    for (var i=0; i<keyPath.length-1; i++) {
                        newObject = newObject[keyPath[i]]
                    }
                    newObject[keyPath[keyPath.length-1]] = input.value; 
                }
            // Append a line break 
            container.appendChild(document.createElement("br"));
        }
        
    }

    var getKeys = function(obj){
       var keys = [];
       for(var key in obj){
          keys.push(key);
       }
       return keys;
    }

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
