var Mouser = function(editor, firstStart) {
    // for drawing circles.
    var radius = 10;

    // for recording clicks, to be written to file.
    circles = [];
    lines = [];
    antiGravityWells = [];
    drawingLine = false;
    drawingCircle = false;
    drawingAntiGravityWell = false;
    antiGravityWellStage = 0;

    function getCoords(evt) {
        if (!editor.editor_mode) return;
        var rect = editor.canvas.getBoundingClientRect();
        var x = evt.clientX-rect.left;
        var y = evt.clientY-rect.top;
        if (!onCanvas({x:x, y:y})) return;
        editor.saved = false; //we've changed something
        if (drawingAntiGravityWell) {
            drawingAntiGravityWell = false;
        }
        else if (drawingLine) {
            drawingLine = false;
        }
        else if (drawingCircle) {
            drawingCircle = false;
        }
        else if (evt.shiftKey) {
            // shift=left click: draw line
            var line =  new editor.EditorLine(
                            {x: x, y: y}, //pt1
                            {x: x, y: y}, //pt2
                            "black"  //color
                        )
            lines.push(line)
            addItemToList(line)
            drawingLine = true;
        }
        else if (evt.altKey) {
            var antiGravityWell = new editor.EditorAntiGravityWell(
                                        {x: x, y: y}, //center
                                        {x: 0, y: 1}, //direction
                                        0.01 //acceleration
                                        )
            antiGravityWells.push(antiGravityWell)
            addItemToList(antiGravityWell)
            drawingAntiGravityWell = true;
            antiGravityWellStage = 0;
        }
        else {
            // left click: circle
            var circle = new editor.EditorCircle( 
                                {x: x, y: y}, //center
                                {x:0, y:0 } //velocity
                                )
            circles.push(circle)
            addItemToList(circle)
            drawingCircle = true;
        }
        
    };
    window.addEventListener('click', getCoords);

    function onCanvas(point) {
        return (point.x > 0 && point.x < editor.dimensions.x && point.y >0 && point.y < editor.dimensions.y);
    };

    function getPosition(evt) {
        if (!editor.editor_mode) return;
        var rect = editor.canvas.getBoundingClientRect();
        var x = evt.clientX-rect.left;
        var y = evt.clientY-rect.top;
        if (!onCanvas({x:x, y:y})) return;
        if (drawingLine) {
            if (evt.shiftKey) {
                var pt1 = lines[lines.length-1].pt1;
                if (Math.abs(x-pt1.x) > Math.abs(y-pt1.y)) {
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
        } else if (drawingAntiGravityWell) {
            var thisWell = antiGravityWells[antiGravityWells.length-1];
            var vectorToMouse = matrix.vectorBetween(thisWell.center, {x:x, y:y});
            thisWell.private_acceleration_vector = matrix.multiply(vectorToMouse, 0.001);
            thisWell.acceleration = matrix.magnitude(thisWell.private_acceleration_vector)
            thisWell.direction = matrix.unitVector(vectorToMouse);
        }
    };
    window.addEventListener('mousemove', getPosition);

    function getLevelString() {
        // Write circles.
        var file = "circles ["
        for (var i = 0; i < circles.length; i++) {
            file += circles[i].toString()
            if (i < circles.length - 1) {
                file += ","
            }
        }
        file += "]\n"

        // Write lines
        file += "lines ["
        for (var i=0; i<lines.length; i++) {
            file += lines[i].toString()
            if (i < lines.length - 1) {
                file += ","
            }
        }
        file += "]\n"

        // Write antiGravityWells
        file += "antiGravityWells ["
        for (var i=0; i<antiGravityWells.length; i++) {
            file += antiGravityWells[i].toString()
            if (i < antiGravityWells.length - 1) {
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
        var filename = document.getElementById("save_filename")
        saveTextAs(file, filename.value);
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

    function addItemToList(item) {
        var container = document.getElementById("itemDropdown");
        var para = document.createElement("a");
        var itemName = ""
        if (item.private_type == "Circle") {
            itemName += "Circle ("+item.center.x+", "+item.center.y+")";
        } else if (item.private_type == "Line") {
            itemName += "Line ("+item.pt1.x+", "+item.pt1.y+")";
        } else if (item.private_type == "AntiGravityWell") {
            itemName += "AntiGravityWell ("+item.center.x+", "+item.center.y+")";
        }else {
            itemName = "Unknown"
        }
        var text = document.createTextNode(itemName);
        para.appendChild(text)
        para.id = item.private_id
        para.onmouseover = hoverItem
        para.onclick = selectItem
        container.appendChild(para);
    }

    function hoverItem(evt) {
        var id = evt.target.id;
        var type = evt.target.innerHTML.split(" ")[0]
        var array = getBodies();
        for (var i=0; i<array.length; i++) {
            if (""+array[i].private_id == id) {
                editor.selected_item = array[i]
                break;
            }
        }
    }

    function getBodies() {
        return lines.concat(circles).concat(antiGravityWells);
    }

    function selectItem(evt) {
        populatePropertyBox(editor.selected_item)
    }

    function removeItem(evt) {

        //remove from arrays
        if (editor.selected_item.private_type == "Circle") {
            var idx = circles.indexOf(editor.selected_item)
            circles.splice(idx, 1)
        } else if (editor.selected_item.private_type == "Line") {
            var idx = lines.indexOf(editor.selected_item)
            lines.splice(idx, 1)
        } else if (editor.selected_item.private_type == "AntiGravityWell") {
            var idx = antiGravityWells.indexOf(editor.selected_item)
            antiGravityWells.splice(idx, 1)
        }
        else {
            console.log("removed unknown:",editor.selected_item)
        }

        // clear property box
        clearPropertyBox(document.getElementById("propertyBox"))

        //remove from dropdown
        var container = document.getElementById("itemDropdown");
        var item = document.getElementById(editor.selected_item.private_id);
        container.removeChild(item)

        editor.selected_item = null
    }

    function populatePropertyBox(object){

        // Container <div> where dynamic content will be placed
        var container = document.getElementById("propertyBox");
        // Clear previous contents of the container
        clearPropertyBox(container)
        makePropertyInputs(object, [], "", "", container);
        container.appendChild(document.createElement("br"))
        var deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.onclick = removeItem
        deleteButton.className = "deletebtn"
        deleteButton.appendChild(document.createTextNode("Delete"))
        container.appendChild(deleteButton)
    }

    function clearPropertyBox(container) {
        while (container.hasChildNodes()) {
            container.removeChild(container.lastChild);
        }
    }

    function makePropertyInputs(object, keyPath, name, indent, container) { //recursive function
        var newObject = object;
        for (var i=0; i<keyPath.length; i++) {
            newObject = newObject[keyPath[i]]; //this is tomfoolary seemingly needed to get the properties to actually reference the object
        }
        if (typeof newObject === "object") {
            var keys = getKeys(newObject);
            var num = keys.length;
            container.appendChild(document.createElement("br"));
            for (var i=0; i<num; i++) {
                if (typeof newObject[keys[i]] === "function" || keys[i].substr(0,7) == 'private') return;
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
                    editor.saved = false; //we've changed something
                    var newObject = object;
                    for (var i=0; i<keyPath.length-1; i++) {
                        newObject = newObject[keyPath[i]]
                    }
                    if (typeof newObject[keyPath[keyPath.length-1]] == "number") {
                        newObject[keyPath[keyPath.length-1]] = parseFloat(input.value); 
                    } else if (typeof newObject[keyPath[keyPath.length-1]] == "string") {
                        newObject[keyPath[keyPath.length-1]] = input.value; 
                    } else {
                        console.log("Bad type",newObject[keyPath[keyPath.length-1]],":",typeof newObject[keyPath[keyPath.length-1]])
                    }
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
        
        //draw stuff
        var bodies = getBodies();
        for (var i=0; i<bodies.length; i++) {
            bodies[i].draw(editor.screen);
        }

        if (editor.selected_item) {
            editor.selected_item.drawSelected(editor.screen);
        }
        
        // Queue up the next call to tick with the browser.
        requestAnimationFrame(tick);
    }
    tick();
}
