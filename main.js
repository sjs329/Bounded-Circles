var Game = (function(game) {

  // The top-level functions that run the game
  // -----------------------------------------------


  var max_speed = 7;
  var min_speed = -3.5;
  // var num_circles = 8;
  // var game.screen;
  // var dimensions;

  // **start()** creates the lines and circles and starts the simulation.
  game.start = function() {

    // In index.html, there is a canvas tag that the game will be drawn in.
    // Grab that canvas out of the DOM.  From it, get the drawing
    // context, an object that contains functions that allow drawing to the canvas.
    game.screen = document.getElementById('bounded_circles').getContext('2d');
    game.dimensions = { x: game.screen.canvas.width, y: game.screen.canvas.height - 50 };
    game.levels = game.buildLevels();

    // `world` holds the current state of the world.
    var world = {

      dimensions: game.dimensions,
      circles: [ ],

      // Set up the border lines.
      lines: [
        new game.Line({ x: 0, y: 0 },{ x: 0, y: game.screen.canvas.height }),
        new game.Line({ x: 0, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: game.screen.canvas.height }),
        new game.Line({ x: game.screen.canvas.width, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: 0 }),
        new game.Line({ x: game.screen.canvas.width, y: 0 },{ x: 0, y: 0 }),
        new game.Line({ x: 0, y: game.dimensions.y}, {x:game.dimensions.x, y:game.dimensions.y})
      ],

      player: new game.Player(game.dimensions),

      projectiles: [],

      persistant: [], //these won't get cleared when the game is reset. Make sure there's a good reason for adding something here (it looks cool is a good reason :D)
      misc: [],  //these are any miscellaneous objects. They must have their own draw and update functions, and these will be called every tick. They also have to have an exists boolean field that will be used to filter them
      
      primaryWeaponText: "",
      primaryReloadBar: {},
      secondaryWeaponText: "",
      secondaryReloadBar: {},

      time: 0,
      running: false,
      level: 0,
      init: false,

      stillOnTheCanvas: function(body) {
        return body.center.x > 0 && body.center.x < game.screen.canvas.width &&
               body.center.y > 0 && body.center.y < game.screen.canvas.height;
      },

      stillExists: function(body) {
        return body.exists;
      }
    };

    // **tick()** is the main simulation tick function.  It loops forever, running 60ish times a second.
    function tick() {
      if (!world.init)
      {
        game.reset(world, 0);
      }

      // console.log(Math.random())
      // Update state of circles and lines.
      game.update(world);

      if (!world.player.alive && world.running) {
        printScoreText("infinity", "black", world);
        printMainText("You Lose! :(", "red", world);
        printSubText("(Press 'R' to restart the game)", "black", world);
        world.running = false;
      }

      if (world.circles.length == 0 && world.running){
        printScoreText(world.time, "black", world);
        printMainText("You Win! :)", "blue", world);
        if (world.level == game.levels.length-1) 
        {
          printSubText("(That was the last level! Press 'R' to restart the game)", "black", world);
        }
        else
        {
          printSubText("(Press 'N' to go to the next level, 'R' to play this one again)", "black", world);
        }
        world.running = false;
      }
      
      // console.log("Player:",world.player.center)
      // Draw circles and lines.
      game.draw(world, game.screen);

      // Queue up the next call to tick with the browser.
      requestAnimationFrame(tick);

    };

    function printScoreText(score, color, world) {
      font = { style: "50px Verdana", align: "center", color: "black" };
      // console.log(world);
      world.misc.push(new game.Text("Score: "+score, {x: game.dimensions.x/2, y: game.dimensions.y/4+10}, 0, font));

      font = {style: "10px Verdana", align: "center", color: "black" };
      world.misc.push(new game.Text("It's golf scoring - lower is better", {x: game.dimensions.x/2,y: game.dimensions.y/4+40}, 0, font));
    };

    function printMainText(text, color, world) {
      font = { style: "30px Verdana", align: "center", color: color };
      world.misc.push(new game.Text(text, {x: game.dimensions.x/2,y: game.dimensions.y/2}, 0, font));
    }

    function printSubText(text, color, world) {
      font = { style: "20px Verdana", align: "center", color: color };
      world.misc.push(new game.Text(text, {x: game.dimensions.x/2,y: game.dimensions.y/2+30}, 0, font));
    }

    // Run the first game tick.  All future calls will be scheduled by
    // `tick()` itself.
    tick();
  };

  game.reset = function(world, level) {
    world.level = level;
    world.misc.length = 0;
    world.projectiles.length = 0;
    world.lines = game.levels[level].lines;
    
    world.circles.length = 0;

    if (game.levels[level].num_rand_circles > 0) {
      for (var i=0; i<game.levels[level].num_rand_circles; i++) {
        world.circles.push(new game.Circle(world.dimensions, {x: Math.floor(Math.random()*game.screen.canvas.width)+1, y: Math.floor(Math.random()*100)+40}, {x: Math.floor(Math.random()*max_speed) + min_speed, y: Math.floor(Math.random()*max_speed) + min_speed} ))
        // make sure this circle isn't overlapping another one
        for (var j=i-1; j>=0; j--) {
          if (trig.isCircleIntersectingCircle(world.circles[i], world.circles[j])) {
            var d = matrix.subtract(world.circles[i], world.circles[j]);
            var new_d = matrix.multiply(matrix.unitVector(d), world.circles[i].radius+world.circles[j].radius+0.5); //vector from j to i so they're not touching
            world.circles[i].center = matrix.add(world.circles[j].center, new_d);
          }
        }
      }
    }
    world.player = new game.Player(world.dimensions); //game.levels[level].player;
    world.player.primaryWeapon = new game.levels[level].primaryWeapon;
    world.player.secondaryWeapon = new game.levels[level].secondaryWeapon;
    world.player.secretWeapon = new game.levels[level].secretWeapon;
    // world.player.alive = true;

    world.primaryWeaponText = new game.Text("",
                                     {x: 5, y: game.dimensions.y +15},
                                     0,
                                     {style: "15px Courier", align: "left", color: "black"} )
    world.primaryReloadBar = new game.FillBar({x: 218, y: game.dimensions.y+40}, {x: 100, y: 12}, "gray", 0.0);
    world.secondaryWeaponText = new game.Text("",
                                     {x: game.dimensions.x/2, y: game.dimensions.y+15},
                                     0,
                                     {style: "15px Courier", align: "left", color: "black"} )
    world.secondaryReloadBar = new game.FillBar({x: game.dimensions.x/2 + 215, y: game.dimensions.y+40}, {x: 100, y: 12}, "gray", 0.0);
    world.misc.push(world.primaryWeaponText);
    world.misc.push(world.primaryReloadBar);
    world.misc.push(world.secondaryWeaponText);
    world.misc.push(world.secondaryReloadBar);

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
    // console.log(world.projectiles)
    world.persistant = world.persistant.filter(world.stillOnTheCanvas);


    var bodies = [world.player].concat(world.projectiles).concat(world.misc).concat(world.persistant).concat(world.circles);
    for (var i = 0; i < bodies.length; i++) {
      physics.applyGravity(bodies[i]);
      physics.applyAirResistance(bodies[i]);
      physics.moveBody(bodies[i]);
      bodies[i].update(world);
    }

    //remove anything that no longer exists
    world.circles = world.circles.filter(world.stillExists);
    world.projectiles = world.projectiles.filter(world.stillExists);
    world.misc = world.misc.filter(world.stillExists);
    world.persistant = world.persistant.filter(world.stillExists);

    // Special case for circles to reset their circle_checked field
    for (var i=0; i<world.circles.length; i++) world.circles[i].circle_checked = false;

    // Update weapon text info
    world.primaryWeaponText.setText("Primary Weapon:   "+world.player.primaryWeapon.name+"\nRounds Remaining: "+(world.player.primaryWeapon.capacity > 0 ? world.player.primaryWeapon.rounds_remaining : "Infinite")+"\nReload Time:");
    world.primaryReloadBar.setPercent((world.time - world.player.primaryWeapon.last_fired)/world.player.primaryWeapon.reload_time);
    world.secondaryWeaponText.setText("Secondary Weapon: "+world.player.secondaryWeapon.name+"\nRounds Remaining: "+(world.player.secondaryWeapon.capacity > 0 ? world.player.secondaryWeapon.rounds_remaining : "Infinite")+"\nReload Time:");
    world.secondaryReloadBar.setPercent((world.time - world.player.secondaryWeapon.last_fired)/world.player.secondaryWeapon.reload_time);
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

  function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
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
