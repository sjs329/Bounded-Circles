var Game = (function(game) {

  // The top-level functions that run the game
  // -----------------------------------------------


  var max_speed = 5;
  var min_speed = 0;
  var screen;
  var dimensions;

  // **start()** creates the lines and circles and starts the simulation.
  game.start = function() {

    // In index.html, there is a canvas tag that the game will be drawn in.
    // Grab that canvas out of the DOM.  From it, get the drawing
    // context, an object that contains functions that allow drawing to the canvas.
    screen = document.getElementById('bounded_circles').getContext('2d');
    dimensions = { x: screen.canvas.width, y: screen.canvas.height };
    

    // `world` holds the current state of the world.
    var world = {

      dimensions: dimensions,
      circles: [ ],

      // Set up the border lines.
      lines: [
        new game.Line({ x: 0, y: 0 },{ x: 0, y: screen.canvas.height }),
        new game.Line({ x: 0, y: screen.canvas.height },{ x: screen.canvas.width, y: screen.canvas.height }),
        new game.Line({ x: screen.canvas.width, y: screen.canvas.height },{ x: screen.canvas.width, y: 0 }),
        new game.Line({ x: screen.canvas.width, y: 0 },{ x: 0, y: 0 })
      ],

      player: new game.Player(dimensions),

      projectiles: [],

      misc: [],  //these are any miscellaneous objects. They must have their own draw and update functions, and these will be called every tick. They also have to have an exists boolean field that will be used to filter them
      time: 0,
      running: false,
      init: false,

      stillOnTheCanvas: function(body) {
        return body.center.x > 0 && body.center.x < screen.canvas.width &&
               body.center.y > 0 && body.center.y < screen.canvas.height;
      }
    };

    // **tick()** is the main simulation tick function.  It loops forever, running 60ish times a second.
    function tick() {
      if (!world.init)
      {
        game.reset(world);
      }
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
      world.misc.push(new game.Text("Score: "+score, {x: dimensions.x/2, y: dimensions.y/4}, 0, font));

      font = { 
        style: "10px Verdana",
        align: "center",
        color: "black"
      };
      world.misc.push(new game.Text("It's golf scoring - lower is better", {x: dimensions.x/2,y: dimensions.y/4+30}, 0, font));

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
    // var screen = document.getElementById('bounded_circles').getContext('2d');
    // var dimensions = { x: screen.canvas.width, y: screen.canvas.height };

    world.circles.length = 0;
    for (var i=0; i<5; i++) {
      world.circles.push(new game.Circle(world.dimensions, {x: Math.random()*screen.canvas.width, y: 10}, {x: Math.random()*max_speed + min_speed, y: Math.random()*max_speed + min_speed} ))
    }
    world.player = new game.Player(world.dimensions);
    world.time = 0;
    world.running = true;
    world.init = true;
  };

  // // Export `start()` so it can be run by index.html
  // exports.start = game.start;

  // **update()** updates the state of the lines and circles.
  game.update = function(world) {

    game.updateMisc(world);

    // Move bullets
    game.updateProjectiles(world);

    // Move and bounce the circles.
    game.updateCircles(world);

    // Update player
    game.updatePlayer(world);

    // if (world.running) {
      world.time += 1;
    // }
    
  };

  game.updateMisc = function(world) {
    world.misc = world.misc.filter(world.stillOnTheCanvas);
    for (var i=0; i < world.misc.length; i++) {
      physics.applyGravity(world.misc[i]);
      physics.applyAirResistance(world.misc[i]);
      physics.moveBody(world.misc[i]);
      world.misc[i].update(world);
    }
    var stillExists = function(misc_obj) {
      return misc_obj.exists;
    }
    world.misc = world.misc.filter(stillExists);
  }

  // **updateCircles()** moves and bounces the circles.
  game.updateCircles = function(world) {

    world.circles = world.circles.filter(world.stillOnTheCanvas);

    var stillAlive = function(circle) {
      ret_val = circle.health > 0;
      if (!ret_val) {
        circle.explode(world);
      }
      return ret_val;
    };
    world.circles = world.circles.filter(stillAlive);


    for (var i = world.circles.length - 1; i >= 0; i--) {
      var circle = world.circles[i];

      // Run through all lines.
      for (var j = 0; j < world.lines.length; j++) {
        var line = world.lines[j];

        // If `line` is intersecting `circle`, bounce circle off line.
        if (trig.isLineIntersectingCircle(circle, line)) {
          physics.bounceCircleOffLine(circle, line);
        }
      }

      // Run through all circles.
      for (var j = 0; j < i; j++) {
        var circle2 = world.circles[j];

        // If `line` is intersecting `circle`, bounce circle off line.
        if (trig.isCircleIntersectingCircle(circle, circle2)) {
          physics.bounceCircleOffCircle(circle, circle2);
        }
      }

      // // Apply gravity to the velocity of `circle`.
      physics.applyGravity(circle);

      // Apply air resistance to the velocity of 'circle'
      physics.applyAirResistance(circle);

      // Move `circle` according to its velocity.
      physics.moveBody(circle);
    }
  };

  game.updateProjectiles = function(world) {
    // remove any bullets that are off the canvas
    world.projectiles = world.projectiles.filter(world.stillOnTheCanvas);

    // loop through bullets to move them and check for circle collisions
    for (var i = 0; i < world.projectiles.length; i++) {
      // Move bullets
      physics.applyGravity(world.projectiles[i]);
      physics.applyAirResistance(world.projectiles[i]);
      physics.moveBody(world.projectiles[i]);
      world.projectiles[i].update(world);
    }

    var notSpent = function(projectile) {
      return !projectile.spent;
    }
    world.projectiles = world.projectiles.filter(notSpent);

  };

  game.updatePlayer = function(world) {
    world.player.update(world); //get presses
    if (world.player.alive){
      physics.moveBody(world.player);
      physics.applyGravity(world.player);

      // Check for death
      for (var i=0; i<world.circles.length; i++){
        if (trig.distance(world.player.center, world.circles[i].center) <= (world.circles[i].radius+world.player.size.x/2)) {
          world.player.alive = false; //we're dead!
          world.player.explode(world);
        }
      }
    }
  };

  // **draw()** draws the all the circles and lines in the simulation.
  game.draw = function(world, screen) {
    // Clear away the drawing from the previous tick.
    screen.clearRect(0, 0, world.dimensions.x, world.dimensions.y);

    // the concatenation order determines the draw order - rightmost is on top
    var bodies = world.lines.concat(world.player).concat(world.projectiles).concat(world.misc).concat(world.circles);
    for (var i = 0; i < bodies.length; i++) {
      bodies[i].draw(screen);
    }
  };

  // Start
  // -----

  // When the DOM is ready, start the simulation.
  window.addEventListener('load', game.start);

  return game;
})(Game || {});
