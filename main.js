var Game = (function(game) {

  // The top-level functions that run the game
  // -----------------------------------------------


  var max_speed = 7;
  var min_speed = -3.5;
  var MAX_LIVES = 5;
  var INITIAL_KILL_MULTIPLIER = 10;
  // var num_circles = 8;
  // var game.screen;
  // var dimensions;

  // **start()** creates the lines and circles and starts the simulation.
  game.start = function(loadDefaults, levels) {

    // In index.html, there is a canvas tag that the game will be drawn in.
    // Grab that canvas out of the DOM.  From it, get the drawing
    // context, an object that contains functions that allow drawing to the canvas.
    game.screen = document.getElementById('bounded_circles').getContext('2d');
    game.dimensions = { x: game.screen.canvas.width, y: game.screen.canvas.height - 50 };
    if (loadDefaults) {
      game.levels = game.buildLevels();
    }
    if (levels && levels.length > 0) {
      game.levels = []
      for (var i=0; i<levels.length; i++) {
        game.levels.push(game.readLevel(levels[i]))
      }
    }
    // document.getElementById('files').addEventListener('change', game.loadLevels, false);


    // `world` holds the current state of the world.
    var world = {

      dimensions: game.dimensions,
      circles: [ ],

      // Set up the border lines.
      lines: [ ],
      //   new game.Line({ x: 0, y: 0 },{ x: 0, y: game.screen.canvas.height }),
      //   new game.Line({ x: 0, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: game.screen.canvas.height }),
      //   new game.Line({ x: game.screen.canvas.width, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: 0 }),
      //   new game.Line({ x: game.screen.canvas.width, y: 0 },{ x: 0, y: 0 }),
      //   new game.Line({ x: 0, y: game.dimensions.y}, {x:game.dimensions.x, y:game.dimensions.y})
      // ],

      player: new game.Player(game.dimensions),

      projectiles: [],

      persistant: [], //these won't get cleared when the game is reset. Make sure there's a good reason for adding something here (it looks cool is a good reason :D)
      misc: [],  //these are any miscellaneous objects. They must have their own draw and update functions, and these will be called every tick. They also have to have an exists boolean field that will be used to filter them
      
      primaryWeaponText: "",
      primaryReloadBar: {},
      secondaryWeaponText: "",
      secondaryReloadBar: {},
      secondaryWeaponList: [],
      shieldText: "",
      shieldReloadBar: {},

      time: 0,
      running: false,
      level: 0,
      init: false,
      lives: MAX_LIVES,
      max_lives: MAX_LIVES,
      score: 0,
      level_score: 0,
      kill_multiplier: INITIAL_KILL_MULTIPLIER,
      high_score: 0,

      stillOnTheCanvas: function(body) {
        if (typeof body.center === 'undefined') return false;
        return body.center.x > 0 && body.center.x < game.screen.canvas.width &&
               body.center.y > 0 && body.center.y < game.screen.canvas.height;
      },

      stillExists: function(body) {
        if (typeof body.exists === 'undefined') return false;
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
        printScoreText(world.score+world.level_score, "black", world);
        // printMainText("You Lose! :(", "red", world);
        if (world.lives > 1) {
          printMainText("Ouch! :(", "red", world);
          printSubText("(Press 'R' to restart this level)", "black", world);
        }
        else {
          printMainText("You Lose! :(", "red", world);
          printSubText("(Press 'R' to restart the game)", "black", world); 
        }
        world.running = false;
      }

      if (world.circles.length == 0 && world.running){
        printScoreText(world.score+world.level_score, "black", world);
        
        if (world.level == game.levels.length-1) 
        {
          printMainText("You Win! :)", "blue", world);
          printSubText("(That was the last level! Press 'R' to restart the game)", "black", world);
        }
        else
        {
          printMainText("Level "+(world.level+1)+" defeated! :)", "blue", world);
          printSubText("(Press 'N' to go to the next level, 'R' to play this one again)", "black", world);
        }
        world.running = false;
      }
      
      // console.log("Player:",world.player.center)
      // Draw circles and lines.
      game.draw(world, game.screen);

      // Queue up the next call to tick with the browser.
      if (typeof game.editor_mode === "undefined" || !game.editor_mode) {
        requestAnimationFrame(tick);
      }

    };

    function printScoreText(score, color, world) {
      var font = { style: "50px Verdana", align: "center", color: "black" };
      // console.log(world);
      world.misc.push(new game.Text("Score: "+score, {x: game.dimensions.x/2, y: game.dimensions.y/4+10}, 0, font));
      if (score > world.high_score) world.high_score = score;

      var font = {style: "20px Verdana", align: "center", color: "black" };
      world.misc.push(new game.Text("High Score: "+world.high_score, {x: game.dimensions.x/2,y: game.dimensions.y/4+40}, 0, font));
    };

    function printMainText(text, color, world) {
      var font = { style: "30px Verdana", align: "center", color: color };
      world.misc.push(new game.Text(text, {x: game.dimensions.x/2,y: game.dimensions.y/2}, 0, font));
    }

    function printSubText(text, color, world) {
      var font = { style: "20px Verdana", align: "center", color: color };
      world.misc.push(new game.Text(text, {x: game.dimensions.x/2,y: game.dimensions.y/2+30}, 0, font));
    }

    // Run the first game tick.  All future calls will be scheduled by
    // `tick()` itself.
    tick();
  };

  game.reset = function(world, level, lives) {
    if (level < 0 || level >= game.levels.length) level = 0; // make sure this level exists
    world.level = level;
    world.lives = lives || MAX_LIVES;
    world.kill_multiplier = INITIAL_KILL_MULTIPLIER+1;
    world.level_score = 0;

    // Clear arrays
    world.misc.length = 0;
    world.projectiles.length = 0;    
    world.secondaryWeaponList.length = 0;
    //anything in world.persistant remains through resets / level changes

    // rebuild lines and circles if they exists in this level
    if (game.levels[level].lines) 
    {
      world.lines.length = 0;
      game.buildLines(world, game.levels[level].lines);
      // console.log("Built lines:", game.levels[level].lines)
    }
    // console.log(game.levels[level])
    if (game.levels[level].circles || game.levels[level].num_rand_circles > 0) 
    {
      // console.log("Building circles")
      world.circles.length = 0;
      game.buildCircles(world, game.levels[level].circles, game.levels[level].num_rand_circles);
      // console.log("Circles:",game.levels[level].circles)
    }

    if (game.levels[level].antiGravityWells) {
      game.buildAntiGravityWells(world, game.levels[level].antiGravityWells)
    }

    // rebuild player
    world.player = new game.Player(world.dimensions); //game.levels[level].player;
    world.player.primaryWeapon = new game.levels[level].primaryWeapon(world);
    world.player.secondaryWeapon = new game.levels[level].secondaryWeapon(world);
    world.secondaryWeaponList.push(world.player.secondaryWeapon);
    world.player.secretWeapon = new game.levels[level].secretWeapon;
    world.player.secretWeapon.capacity = 0;
    world.player.secretWeapon.reload_time = 2;

    // Set up weapon status text
    world.primaryWeaponText = new game.Text("",
                                     {x: 5, y: game.dimensions.y +15},
                                     0,
                                     {style: "15px Courier", align: "left", color: "black"} )
    world.primaryReloadBar = new game.FillBar({x: 218, y: game.dimensions.y+40}, {x: 100, y: 12}, "gray", 0.0);
    world.secondaryWeaponText = new game.Text("",
                                     {x: game.dimensions.x/2-100, y: game.dimensions.y+15},
                                     0,
                                     {style: "15px Courier", align: "left", color: "black"} )
    world.secondaryReloadBar = new game.FillBar({x: game.dimensions.x/2 + 115, y: game.dimensions.y+40}, {x: 100, y: 12}, "gray", 0.0);
    world.shieldText = new game.Text("Shield",
                                     {x: 5, y: 15},
                                     0,
                                     {style: "15px Courier", align: "left", color: "black"} )
    world.shieldReloadBar = new game.FillBar({x: 55, y: 28}, {x: 100, y: 12}, "#58ACFA", 0.0);
    world.scoreLabel = new game.Text("Score:",
                                     {x: game.dimensions.x-140, y: 15},
                                     0,
                                     {style: "15px Courier", align: "left", color: "black"} )
    world.scoreText = new game.Text("",
                                     {x: game.dimensions.x-55, y: 15},
                                     0,
                                     {style: "15px Courier", align: "right", color: "black"} )
    world.livesLabel = new game.Text("Lives:",
                                     {x: game.dimensions.x-140, y: 30},
                                     0,
                                     {style: "15px Courier", align: "left", color: "black"} )
    world.scoreMultiplier = new game.Text("1000",
                                     {x: game.dimensions.x-25, y: 15},
                                     0,
                                     {style: "15px Courier", align: "right", color: "black"} )
    world.scoreMultiplierBar = new game.FillBar({x: game.dimensions.x-13, y: 10}, {x: 15, y: 7}, "magenta", 0.0, false);
    world.misc.push(world.primaryWeaponText);
    world.misc.push(world.primaryReloadBar);
    world.misc.push(world.secondaryWeaponText);
    world.misc.push(world.secondaryReloadBar);
    world.misc.push(world.shieldText);
    world.misc.push(world.shieldReloadBar);
    world.misc.push(world.scoreLabel);
    world.misc.push(world.scoreText);
    world.misc.push(world.livesLabel);
    world.misc.push(world.scoreMultiplier);
    world.misc.push(world.scoreMultiplierBar);

    // game logic vars
    world.time = 0;
    world.running = true;
    world.init = true;
  };

  game.buildLines = function(world, lines)
  {
    for (var i=0; i<lines.length; i++)
    {
      world.lines.push(new Line(lines[i]));
    }
  };

  game.buildCircles = function(world, circles, num_rand)
  {
    if (circles)
    {
      for (var i=0; i<circles.length; i++)
      {
        world.circles.push(new game.Circle(circles[i]));
      }
    }
    if (num_rand > 0) {
      // console.log("Building",num_rand,"Circles")
      for (var i=0; i<num_rand; i++) {
        world.circles.push(new game.Circle({gameSize: world.dimensions, center: {x: Math.floor(Math.random()*game.screen.canvas.width)+1, y: Math.floor(Math.random()*100)+40}, velocity: {x: Math.floor(Math.random()*max_speed) + min_speed, y: Math.floor(Math.random()*max_speed) + min_speed} } ))
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
  };

  game.buildAntiGravityWells = function(world, antiGravityWells)
  {
    for (var i=0; i<antiGravityWells.length; i++)
    {
      world.misc.push(new game.AntiGravityWell(antiGravityWells[i]));
    }
  };

  // // Export `start()` so it can be run by index.html
  // exports.start = game.start;

  // **update()** updates the state of the lines and circles.
  game.update = function(world) {

    //remove anything that's off screen
    world.circles = world.circles.filter(world.stillOnTheCanvas);
    world.projectiles = world.projectiles.filter(world.stillOnTheCanvas);
    world.misc = world.misc.filter(world.stillOnTheCanvas);
    world.persistant = world.persistant.filter(world.stillOnTheCanvas);

    // update physical bodies
    // var bodies = [world.player].concat(world.projectiles).concat(world.misc).concat(world.persistant).concat(world.circles);
    var bodies = world.projectiles.concat(world.misc).concat(world.persistant).concat(world.circles).concat(world.player);
    for (var i = 0; i < bodies.length; i++) {
      physics.applyGravity(bodies[i]);
      physics.applyAirResistance(bodies[i]);
      physics.moveBody(bodies[i]);
      bodies[i].update(world);
    }

    // update lines - shields are made of lines, which can move and die
    for (var i = 0; i< world.lines.length; i++)
    {
      world.lines[i].update(world);
    }

    //remove anything that no longer exists
    world.lines = world.lines.filter(world.stillExists);
    world.circles = world.circles.filter(world.stillExists);
    world.projectiles = world.projectiles.filter(world.stillExists);
    world.misc = world.misc.filter(world.stillExists);
    world.persistant = world.persistant.filter(world.stillExists);

    //remove weapons wih no ammo
    world.secondaryWeaponList = world.secondaryWeaponList.filter(function (weap) {return weap.capacity==0 || weap.rounds_remaining>0;})
    if (world.player.secondaryWeaponInd >= world.secondaryWeaponList.length) {
      world.player.secondaryWeaponInd = 0;
    }
    if (world.secondaryWeaponList.length == 0)
    {
      world.secondaryWeaponList.push(new Fish(world));
      world.player.secondaryWeapon = world.secondaryWeaponList[0];
      world.player.secondaryWeaponInd = 0;
    }
    else {
      if (world.player.secondaryWeapon.name != world.secondaryWeaponList[world.player.secondaryWeaponInd].name) {
        world.player.secondaryWeapon = world.secondaryWeaponList[world.player.secondaryWeaponInd];
        world.player.secondaryWeapon.last_fired = world.time;
      }
    } 

    // Special case for circles to reset their circle_checked field
    for (var i=0; i<world.circles.length; i++) world.circles[i].circle_checked = false;

    // Update weapon text info
    world.primaryWeaponText.setText("Primary Weapon:   "+world.player.primaryWeapon.name+"\nRounds Remaining: "+(world.player.primaryWeapon.capacity > 0 ? world.player.primaryWeapon.rounds_remaining : "Infinite")+"\nReload Time:");
    world.primaryReloadBar.setPercent((world.time - world.player.primaryWeapon.last_fired)/world.player.primaryWeapon.reload_time);
    world.secondaryWeaponText.setText("Secondary Weapon: "+world.player.secondaryWeapon.name+"\nRounds Remaining: "+(world.player.secondaryWeapon.capacity > 0 ? world.player.secondaryWeapon.rounds_remaining : "Infinite")+"\nReload Time:");
    world.secondaryReloadBar.setPercent((world.time - world.player.secondaryWeapon.last_fired)/world.player.secondaryWeapon.reload_time);
    world.scoreText.setText((world.score+world.level_score).toFixed(0));
    world.scoreMultiplier.setText("x"+world.kill_multiplier.toFixed(0));
    if (world.kill_multiplier > 1)
      world.scoreMultiplierBar.setPercent((300-world.time%300)/300);
    else
      world.scoreMultiplierBar.setPercent(1);

    // Update shield status bar
    time_since_shield = world.time - world.player.shield.last_fired;
   
    if (time_since_shield < world.player.shield.capacity)
    {
      world.shieldReloadBar.setColor("#0824FF");
      // console.log("Decreasing")
      // Shield active, turn bar dark blue and decrease precentage
      world.shieldReloadBar.setPercent((world.player.shield.capacity - time_since_shield)/world.player.shield.capacity);  
    }
    else
    {
      world.shieldReloadBar.setColor("#58ACFA");
      //Shield expired, increase percentage to fill back up
      reload_time = world.player.shield.reload_time - world.player.shield.capacity;
      // console.log("increasing",reload_time, time_since_shield)
      world.shieldReloadBar.setPercent((time_since_shield-world.player.shield.capacity)/reload_time);  
    }

    if (world.shieldReloadBar.percent >= 1.0)
    {
      world.shieldReloadBar.setColor("#0824FF");
    }


    // Update kill multiplier
    if ((world.time % 300 == 0) && (world.kill_multiplier > 1))
      world.kill_multiplier--;

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

    // Draw lives
    screen.fillStyle="#2E2EFE";
    for (var i = 0; i < world.lives; i++) {
      var size = {x: 10, y: 10};
      var center = {x: game.dimensions.x-(i*(size.x+5))-size.x, y: 25};
      screen.fillRect(center.x - size.x / 2, center.y - size.y / 2, size.x, size.y);
    }

    // Draw available secondary weapons
    for (var i=0; i < world.secondaryWeaponList.length; i++) {
      var powerup = new game.Powerup({x:0,y:0}, {x:0,y:0}, {x:0,y:0}, Fish, world);
      powerup.center = {x: game.dimensions.x-215+(i*(2*powerup.radius+3)), y: game.dimensions.y + powerup.radius + 15};
      // powerup.radius /= 2;
      powerup.draw(screen, world.secondaryWeaponList[i]);
      if (i == world.player.secondaryWeaponInd) {
        screen.beginPath();
        screen.strokeStyle = "black"
        screen.arc(powerup.center.x, powerup.center.y, powerup.radius, 0, Math.PI * 2, true);
        screen.closePath();
        screen.stroke();
      }
      if (world.secondaryWeaponList[i].capacity == 0) {
        var ammo = new game.Text('inf', 
                               {x: game.dimensions.x-215+(i*(2*powerup.radius+3)), y: game.dimensions.y + powerup.radius + 35},
                               0, 
                               {style: "10px Courier", align: "center", color: "black"} )
      }
      else {
        var ammo = new game.Text(''+world.secondaryWeaponList[i].rounds_remaining, 
                               {x: game.dimensions.x-215+(i*(2*powerup.radius+3)), y: game.dimensions.y + powerup.radius + 35},
                               0, 
                               {style: "10px Courier", align: "center", color: "black"} )
      }
      ammo.draw(screen)
    }
  };

  // Start
  // -----

  // this prevents the spacebar from scrolling down
  window.onkeydown = function(e) { 
    return !(e.keyCode == 32);
  };

  // When the DOM is ready, start the simulation.
  // window.addEventListener('load', game.start);
  var waitForChange = function () {
    if (typeof game.editor_mode === "undefined" || !game.editor_mode) {
      document.getElementById('files').addEventListener('change', game.loadLevels, false);
      game.start(true)
    }
    // game.start(false)
  }
  window.addEventListener('load', waitForChange);

  return game;
})(Game || {});
