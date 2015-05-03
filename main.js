var Game = (function(game) {

  // The top-level functions that run the game
  // -----------------------------------------------


  var max_speed = 7;
  var min_speed = -3.5;
  var num_circles = 8;
  var screen;
  var dimensions;

  // **start()** creates the lines and circles and starts the simulation.
  game.start = function() {

    // In index.html, there is a canvas tag that the game will be drawn in.
    // Grab that canvas out of the DOM.  From it, get the drawing
    // context, an object that contains functions that allow drawing to the canvas.
    screen = document.getElementById('bounded_circles').getContext('2d');
    dimensions = { x: screen.canvas.width, y: screen.canvas.height - 40 };
    

    // `world` holds the current state of the world.
    var world = {

      dimensions: dimensions,
      circles: [ ],

      // Set up the border lines.
      lines: [
        new game.Line({ x: 0, y: 0 },{ x: 0, y: screen.canvas.height }),
        new game.Line({ x: 0, y: screen.canvas.height },{ x: screen.canvas.width, y: screen.canvas.height }),
        new game.Line({ x: screen.canvas.width, y: screen.canvas.height },{ x: screen.canvas.width, y: 0 }),
        new game.Line({ x: screen.canvas.width, y: 0 },{ x: 0, y: 0 }),
        new game.Line({ x: 0, y: dimensions.y}, {x:dimensions.x, y:dimensions.y})
      ],

      player: new game.Player(dimensions),

      projectiles: [],

      persistant: [], //these won't get cleared when the game is reset. Make sure there's a good reason for adding something here (it looks cool is a good reason :D)
      misc: [],  //these are any miscellaneous objects. They must have their own draw and update functions, and these will be called every tick. They also have to have an exists boolean field that will be used to filter them
      
      primaryWeaponText: "",
      secondaryWeaponText: "",

      time: 0,
      running: false,
      init: false,

      stillOnTheCanvas: function(body) {
        return body.center.x > 0 && body.center.x < screen.canvas.width &&
               body.center.y > 0 && body.center.y < screen.canvas.height;
      },

      stillExists: function(body) {
        return body.exists;
      }
    };

    // **tick()** is the main simulation tick function.  It loops forever, running 60ish times a second.
    function tick() {
      if (!world.init)
      {
        game.reset(world);
      }

      // console.log(Math.random())
      // Update state of circles and lines.
      game.update(world);

      if (!world.player.alive && world.running) {
        printEndText("You Lose! :(", "infinity", "red", world);
        world.running = false;
      }

      if (world.circles.length == 0 && world.running){
        printEndText("You Win! :)", world.time, "blue", world);
        world.running = false;
      }
      
      // console.log("Player:",world.player.center)
      // Draw circles and lines.
      game.draw(world, screen);

      // Queue up the next call to tick with the browser.
      requestAnimationFrame(tick);

    };

    function printEndText(end_text, score, color, world) {
      font = { 
        style: "50px Verdana",
        align: "center",
        color: "black"
      };
      // console.log(world);
      world.misc.push(new game.Text("Score: "+score, {x: dimensions.x/2, y: dimensions.y/4+10}, 0, font));

      font = { 
        style: "10px Verdana",
        align: "center",
        color: "black"
      };
      world.misc.push(new game.Text("It's golf scoring - lower is better", {x: dimensions.x/2,y: dimensions.y/4+40}, 0, font));

      font = { 
        style: "30px Verdana",
        align: "center",
        color: color
      };
      world.misc.push(new game.Text(end_text, {x: dimensions.x/2,y: dimensions.y/2}, 0, font));

      font = { 
        style: "20px Verdana",
        align: "center",
        color: "black"
      };
      world.misc.push(new game.Text("(Press 'R' to play again)", {x: dimensions.x/2,y: dimensions.y/2+30}, 0, font));
    };

    // Run the first game tick.  All future calls will be scheduled by
    // `tick()` itself.
    tick();
  };

  game.reset = function(world) {
    world.misc.length = 0;
    world.projectiles.length = 0;
    world.circles.length = 0;
    for (var i=0; i<num_circles; i++) {
      world.circles.push(new game.Circle(world.dimensions, {x: Math.floor(Math.random()*screen.canvas.width)+1, y: Math.floor(Math.random()*40)+40}, {x: Math.floor(Math.random()*max_speed) + min_speed, y: Math.floor(Math.random()*max_speed) + min_speed} ))
      // make sure this circle isn't overlapping another one
      for (var j=i-1; j>=0; j--) {
        if (trig.isCircleIntersectingCircle(world.circles[i], world.circles[j])) {
          var d = matrix.subtract(world.circles[i], world.circles[j]);
          var new_d = matrix.multiply(matrix.unitVector(d), world.circles[i].radius+world.circles[j].radius+0.5); //vector from j to i so they're not touching
          world.circles[i].center = matrix.add(world.circles[j].center, new_d);
        }
      }
    }
    world.player = new game.Player(world.dimensions);
    world.primaryWeaponText = new game.Text("Primary Weapon:   "+world.player.primaryWeapon.name+"\nRounds Remaining: "+(world.player.primaryWeapon.capacity > 0 ? world.player.primaryWeapon.rounds_remaining : "Inf"),
                                     {x: 5, y: dimensions.y +20},
                                     0,
                                     {style: "15px Courier", align: "left", color: "black"} )
    world.secondaryWeaponText = new game.Text("Secondary Weapon: "+world.player.secondaryWeapon.name+"\nRounds Remaining: "+(world.player.secondaryWeapon.capacity > 0 ? world.player.secondaryWeapon.rounds_remaining : "Inf"),
                                     {x: dimensions.x/2+5, y: dimensions.y+20},
                                     0,
                                     {style: "15px Courier", align: "left", color: "black"} )
    world.misc.push(world.primaryWeaponText);
    world.misc.push(world.secondaryWeaponText);

    world.time = 0;
    world.running = true;
    world.init = true;
  };

  // // Export `start()` so it can be run by index.html
  // exports.start = game.start;

  // **update()** updates the state of the lines and circles.
  game.update = function(world) {

    //remove anything that's off screen
    world.circles = world.circles.filter(world.stillOnTheCanvas);
    world.projectiles = world.projectiles.filter(world.stillOnTheCanvas);
    world.misc = world.misc.filter(world.stillOnTheCanvas);
    // console.log(world.persistant)
    world.persistant = world.persistant.filter(world.stillOnTheCanvas);


    var bodies = [world.player].concat(world.projectiles).concat(world.misc).concat(world.persistant).concat(world.circles);
    for (var i = 0; i < bodies.length; i++) {
      bodies[i].update(world);
      physics.applyGravity(bodies[i]);
      physics.applyAirResistance(bodies[i]);
      physics.moveBody(bodies[i]);

    }

    //remove anything that no longer exists
    world.circles = world.circles.filter(world.stillExists);
    world.projectiles = world.projectiles.filter(world.stillExists);
    world.misc = world.misc.filter(world.stillExists);
    world.persistant = world.persistant.filter(world.stillExists);

    // Special case for circles to reset their circle_checked field
    for (var i=0; i<world.circles.length; i++) world.circles[i].circle_checked = false;

    // Update weapon text info
    world.primaryWeaponText.text = "Primary Weapon:   "+world.player.primaryWeapon.name+"\nRounds Remaining: "+(world.player.primaryWeapon.capacity > 0 ? world.player.primaryWeapon.rounds_remaining : "Inf");
    world.secondaryWeaponText.text = "Secondary Weapon: "+world.player.secondaryWeapon.name+"\nRounds Remaining: "+(world.player.secondaryWeapon.capacity > 0 ? world.player.secondaryWeapon.rounds_remaining : "Inf");

    world.time += 1;
    
  };

  // **draw()** draws everything
  game.draw = function(world, screen) {
    // Clear away the drawing from the previous tick.
    screen.clearRect(0, 0, screen.canvas.width, screen.canvas.height);

    // the concatenation order determines the draw order - rightmost is on top
    var bodies = world.lines.concat(world.player).concat(world.projectiles).concat(world.misc).concat(world.persistant).concat(world.circles);
    for (var i = 0; i < bodies.length; i++) {
      bodies[i].draw(screen);
    }
  };

  // Start
  // -----

  // this prevents the spacebar from scrolling down
  window.onkeydown = function(e) { 
    return !(e.keyCode == 32);
  };

  // When the DOM is ready, start the simulation.
  window.addEventListener('load', game.start);

  return game;
})(Game || {});
