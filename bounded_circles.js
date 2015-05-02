;(function(exports) {

  // The top-level functions that run the simulation
  // -----------------------------------------------

  var max_speed = 5;
  var min_speed = 0;

  // **start()** creates the lines and circles and starts the simulation.
  function start() {

    // In index.html, there is a canvas tag that the game will be drawn in.
    // Grab that canvas out of the DOM.  From it, get the drawing
    // context, an object that contains functions that allow drawing to the canvas.
    var screen = document.getElementById('bounded_circles').getContext('2d');

    var dimensions = { x: screen.canvas.width, y: screen.canvas.height };
    

    // `world` holds the current state of the world.
    var world = {

      dimensions: dimensions,
      circles: [ ],

      // Set up the border lines.
      lines: [
        makeLine({ x: 0, y: 0 },{ x: 0, y: screen.canvas.height }),
        makeLine({ x: 0, y: screen.canvas.height },{ x: screen.canvas.width, y: screen.canvas.height }),
        makeLine({ x: screen.canvas.width, y: screen.canvas.height },{ x: screen.canvas.width, y: 0 }),
        makeLine({ x: screen.canvas.width, y: 0 },{ x: 0, y: 0 })
      ],

      player: new Player(dimensions),

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
        reset(world);
      }
      // console.log("update");
      // Update state of circles and lines.
      update(world);

      if (!world.player.alive) {
        printEndText("You Lose! :(", "infinity", "red", world);
        world.running = false;
        // return;
      }

      if (world.circles.length == 0){
        printEndText("You Win! :)", world.time, "blue", world);
        world.running = false;
        // return;
      }
      
      // console.log("draw");
      // Draw circles and lines.
      draw(world, screen);

      // console.log("loop");
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
      world.misc.push(new Text("Score: "+score, {x: dimensions.x/2, y: dimensions.y/4}, 100, font));

      font = { 
        style: "10px Verdana",
        align: "center",
        color: "black"
      };
      world.misc.push(new Text("It's golf scoring - lower is better", {x: dimensions.x/2,y: dimensions.y/4+30}, 100, font));

      font = { 
        style: "30px Verdana",
        align: "center",
        color: color
      };
      world.misc.push(new Text(end_text, {x: dimensions.x/2,y: dimensions.y/2}, 100, font));

      font = { 
        style: "20px Verdana",
        align: "center",
        color: "black"
      };
      world.misc.push(new Text("(Press 'R' to play again)", {x: dimensions.x/2,y: dimensions.y/2+30}, 100, font));

      // screen.font="10px Verdana";
      // screen.textAlign="center";
      // screen.fillStyle = "black";
      // screen.fillText("It's golf scoring - lower is better",dimensions.x/2,dimensions.y/4+30);
      // screen.font="30px Verdana";
      // screen.textAlign="center";
      // screen.fillStyle = color;
      // screen.fillText(end_text,dimensions.x/2,dimensions.y/2);
      // screen.font="20px Verdana";
      // screen.textAlign="center";
      // screen.fillStyle = "black";
      // screen.fillText("(Refresh page to play again)",dimensions.x/2,dimensions.y/2+30);
    };

    // Run the first game tick.  All future calls will be scheduled by
    // `tick()` itself.
    tick();
  };

  function reset(world) {
    var screen = document.getElementById('bounded_circles').getContext('2d');
    var dimensions = { x: screen.canvas.width, y: screen.canvas.height };

    world.circles.length = 0;
    for (var i=0; i<5; i++) {
      world.circles.push(new Circle({x: Math.random()*screen.canvas.width, y: 10}, {x: Math.random()*max_speed + min_speed, y: Math.random()*max_speed + min_speed} ))
    }
    world.player = new Player(dimensions);
    world.time = 0;
    world.running = true;
    world.init = true;
  };

  // Export `start()` so it can be run by index.html
  exports.start = start;
  // exports.menu = menu;

  // **update()** updates the state of the lines and circles.
  function update(world) {

    updateMisc(world);

    // Move bullets
    updateProjectiles(world);

    // Move and bounce the circles.
    updateCircles(world);

    // Update player
    updatePlayer(world);

    if (world.running) {
      world.time += 1;
    }
    
  };

  function updateMisc(world) {
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
  function updateCircles(world) {

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

  function updateProjectiles(world) {
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

  function updatePlayer(world) {
    world.player.update(world); //get presses
    physics.moveBody(world.player);
    if (world.player.center.y > world.player.floor){
      world.player.center.y = world.player.floor;
      world.player.velocity.y = 0;
    }
    if (world.player.center.y != world.player.floor) {
      physics.applyGravity(world.player);
    }

    // Check for death
    for (var i=0; i<world.circles.length; i++){
      if (trig.distance(world.player.center, world.circles[i].center) <= (world.circles[i].radius+world.player.size.x/2)) {
        world.player.alive = false; //we're dead!
      }
    }
  };

  // **draw()** draws the all the circles and lines in the simulation.
  function draw(world, screen) {
    // Clear away the drawing from the previous tick.
    screen.clearRect(0, 0, world.dimensions.x, world.dimensions.y);

    // the concatenation order determines the draw order - rightmost is on top
    var bodies = world.lines.concat(world.player).concat(world.projectiles).concat(world.misc).concat(world.circles);
    for (var i = 0; i < bodies.length; i++) {
      bodies[i].draw(screen);
    }
  };

  // **new Circle()** creates a circle that has the passed `center`.
  var Circle = function(center, velocity) {
    this.center = center;
    this.velocity = velocity;
    this.radius = 10;
    this.health = 100;
    this.hit_area = 10;
    this.mass = 1;
    this.gravity = 0.06;
    this.air_resist = 0.0005;

  };

  Circle.prototype = {
    // The circle has its own built-in `draw()` function.  This allows
    // the main `draw()` to just polymorphicly call `draw()` on circles and lines.
    draw: function(screen) {
      screen.beginPath();
      screen.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);
      screen.closePath();
      screen.stroke();

      screen.beginPath();
      screen.arc(this.center.x, this.center.y, this.radius*this.health/100.0, 0, Math.PI * 2, true);
      screen.closePath();
      screen.fillStyle = "green";
      screen.fill();
    },

    explode: function(world) {
      for (var i=0; i<6; i++) {
        // determine velocity of this piece of debris
        var speed = Math.random() * 1.25 +0.5;
        var direction = matrix.unitVector({ x: Math.random()*2-1, y: Math.random()*2-1});
        var velocity = matrix.multiply(direction, speed);
        var position = { x: this.center.x, y: this.center.y }; //matrix.add(matrix.multiply(direction, this.radius), this.center);
        var lifespan = Math.random() *90 + 30; //40 - 240 ticks
        // console.log("Debris:",i, velocity)
        world.misc.push(new Debris(position, velocity, lifespan));

        if (Math.random() > 0.95)
        {
          world.misc.push(new Powerup({x: this.center.x, y: this.center.y}, {x: 0, y: 0.1}));
        }
      }
    }
  };

  // **makeLine()** creates a line
  function makeLine(pt1, pt2) {
    return {
      end1: pt1,
      end2: pt2,

      // The line has its own built-in `draw()` function.  This allows
      // the main `draw()` to just polymorphicly call `draw()` on circles and lines.
      draw: function(screen) {

        screen.beginPath();
        screen.lineWidth = 1.5;
        screen.moveTo(this.end1.x, this.end1.y);
        screen.lineTo(this.end2.x, this.end2.y);
        screen.closePath();

        screen.strokeStyle = "black";
        screen.stroke();
      }
    };
  };

  // // **isCircleInWorld()** returns true if `circle` is on screen.
  // function isCircleInWorld(circle, worldDimensions) {
  //   return circle.center.x > -circle.radius &&
  //     circle.center.x < worldDimensions.x + circle.radius &&
  //     circle.center.y > -circle.radius &&
  //     circle.center.y < worldDimensions.y + circle.radius;
  // };

  // ------

  // **new Player()** creates a player.
  var Player = function(gameSize) {
    this.gameSize = gameSize;
    this.size = { x: 15, y: 15 };
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.y };
    this.floor = gameSize.y-this.size.y;
    this.velocity = { x: 0, y: 0};
    this.type = "player";
    this.gravity = 0.25;
    this.air_resist = 0.0;
    this.alive = true;

    // Create a keyboard object to track button presses.
    this.keyboarder = new Keyboarder();

    this.primaryWeapon = new Pistol();
    this.secondaryWeapon = new Fish();
    this.secretWeapon = new FlameThrower();
  };

  Player.prototype = {
    // **update()** updates the state of the player for a single tick.
    update: function(world) {
      if (this.alive) {
        // If left cursor key is down...
        if (this.keyboarder.isDown(this.keyboarder.KEYS.A)) {
          // ... move left.
          if (this.center.x-this.size.x > 0) {
            this.velocity.x = -2;  
          } else {
            this.velocity.x = 0;
          }
        } else if (this.keyboarder.isDown(this.keyboarder.KEYS.D)) {
          if (this.center.x+this.size.x < this.gameSize.x) {
            this.velocity.x = 2;  
          } else {
            this.velocity.x = 0;
          }
        } else {
          this.velocity.x = 0;
        }

        if (this.center.y == this.floor){
          if (this.keyboarder.isDown(this.keyboarder.KEYS.W)) {
              this.velocity.y -= 6;  
          }
        }
        if (this.keyboarder.isDown(this.keyboarder.KEYS.S)) {
          this.velocity.y += 0.25;
        }

        if (world.time - this.primaryWeapon.last_fired >= this.primaryWeapon.reload_time) 
        {
          if (this.keyboarder.isDown(this.keyboarder.KEYS.K)) 
          {
            this.primaryWeapon.fire({ x: this.center.x, y: this.center.y - this.size.y - this.size.y/3 }, { x: 0, y: -1 }, world);
          } 
          else if(this.keyboarder.isDown(this.keyboarder.KEYS.L)) 
          {
            this.primaryWeapon.fire({ x: this.center.x, y: this.center.y + this.size.y + this.size.y/3 }, { x: 0, y: 1 }, world);
          } 
        }
        if (world.time - this.secondaryWeapon.last_fired >= this.secondaryWeapon.reload_time) 
        {
          if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE))  
          {
            this.secondaryWeapon.fire({ x: this.center.x, y: this.center.y - this.size.y - this.size.y/3 }, { x: 0, y: -1 }, world);
          }
        }
        if (world.time - this.secretWeapon.last_fired >= this.secretWeapon.reload_time)
        {
          if (this.keyboarder.isDown(77)) //m
          {
            this.secretWeapon.fire({ x: this.center.x, y: this.center.y - this.size.y - this.size.y/3 }, { x: 0, y: -1 }, world);
          }
        }
      }
      
      if (!this.alive || !world.running) //Not alive
      {
        if (this.keyboarder.isDown(82)) //r 
        {
          // this.alive = true;
          reset(world);
        }
      }
    },

    draw: function(screen) {
      if (this.alive){
        screen.fillStyle="#2E2EFE";
        screen.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2,
                      this.size.x, this.size.y);
      }
    }
  };

  // Fish is a useless weapon - used to set the secondary weapon to nothing initially
  var Fish = function() {
    this.reload_time = 10000;
    this.bullet = 0;
    this.type = "weapon";
    this.last_fired = -this.reload_time;
  };

  Fish.prototype = {
    fire: function(center, velocity, world) {
      // You can't fire a fish...
    }
  };

  var Pistol = function() {
    this.reload_time = 5;
    this.bullet = new Bullet({x:0,y:0},{x:0,y:0});
    this.type = "weapon";
    this.last_fired = -this.reload_time;
  };

  Pistol.prototype = {
    fire: function(center, velocity, world) {
      world.projectiles.push(new Bullet(center, velocity));
      this.last_fired = world.time;
    }
  };

  // Bullet
  // ------

  // **new Bullet()** creates a new bullet.
  var Bullet = function(center, velocity) {
    this.center = center;
    this.size = { x: 3, y: 3 };
    this.speed = 10;
    this.velocity = matrix.multiply(matrix.unitVector(velocity), this.speed);
    this.type = "bullet"
    this.gravity = 0.0;
    this.air_resist = 0.0;
    this.damage = 10;
    this.spent = false; //this gets set to true when this bullet hits something
  };

  Bullet.prototype = {

    // **update()** updates the state of the bullet for a single tick.
    update: function(world) {
      for (var j=0; j<world.circles.length; j++){
        if (trig.distance(world.circles[j].center, this.center) <= world.circles[j].hit_area) {
          world.circles[j].health -= this.damage;
          this.spent= true;
          break;
        }
      }
    },

    draw: function(screen) {
      screen.fillStyle="#FF0000";
      screen.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2,
                    this.size.x, this.size.y);
    }
  };

  var MissileLauncher = function() {
    this.reload_time = 20;
    this.bullet = new Missile({x:0,y:0},{x:0,y:0});
    this.type = "weapon";
    this.last_fired = -this.reload_time;
  };

  MissileLauncher.prototype = {
    fire: function(center, velocity, world) {
      world.projectiles.push(new Missile(center, velocity));
      this.last_fired = world.time;
    }
  };

  // Missile
  // ------

  // **new Missile()** creates a new bullet.
  var Missile = function(center, velocity) {
    this.center = center;
    this.size = { x: 5, y: 12 };
    this.speed = 3;
    this.velocity = matrix.multiply(matrix.unitVector(velocity), this.speed);
    this.type = "bullet"
    this.gravity = -0.08;
    this.air_resist = 0.0;
    this.damage = 40;
    this.spent = false; //this gets set to true when this bullet hits something

  };

  Missile.prototype = {

    // **update()** updates the state of the bullet for a single tick.
    update: function(world) {
      for (var j=0; j<world.circles.length; j++){
        if (trig.distance(world.circles[j].center, this.center) <= world.circles[j].hit_area) {
          world.circles[j].health -= this.damage;
          this.spent= true;
          break;
        }
      }
    },

    draw: function(screen) {
      var radius = this.size.x/2;
      screen.beginPath();
      screen.arc(this.center.x, this.center.y-this.size.y/2+radius, radius, 0, Math.PI, true);
      screen.closePath();
      screen.fillStyle = "red";
      screen.fill();
      screen.fillStyle="black";
      screen.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2+radius, this.size.x, this.size.y-radius-3);
      screen.fillStyle="yellow";
      screen.fillRect(this.center.x - this.size.x / 2, this.center.y + this.size.y / 2 - 3, this.size.x, 3);
    }
  };

  var FlameThrower = function() {
    this.reload_time = 3;
    this.bullet = new Missile({x:0,y:0},{x:0,y:0});
    this.type = "weapon";
    this.last_fired = -this.reload_time;
  };

  FlameThrower.prototype = {
    fire: function(center, velocity, world) {
      world.projectiles.push(new Flame(center, velocity));
      this.last_fired = world.time;
    }
  };

  // **new Missile()** creates a new bullet.
  var Flame = function(center, velocity) {
    this.center = center;
    this.radius = 5;
    this.speed = 4;
    this.velocity = matrix.multiply(matrix.unitVector(velocity), this.speed);
    this.type = "bullet"
    this.gravity = -0.02;
    this.air_resist = 0.0;
    this.damage = 20;
    this.spent = false; 
    this.color = {r: 255, g: 0, b: 0};
    this.lifespan = Math.round(Math.random()*20+40);
    this.age = 0;
  };

  Flame.prototype = {

    // **update()** updates the state of the bullet for a single tick.
    update: function(world) {
      this.age += 1;
      if (this.age > this.lifespan) {
        this.spent = true;
        return;
      }

      for (var j=0; j<world.circles.length; j++){
        if (trig.distance(world.circles[j].center, this.center) <= (world.circles[j].hit_area+this.radius)) {
          world.circles[j].health -= this.damage*1/this.radius;
          break;
        }
      }

      //increase size over time
      this.radius = this.radius* (1+Math.random()*0.075)

      // give a little lateral velocity change over time
      this.velocity.x += Math.random()*0.15 - 0.075;

      // Color change
      this.color.g = Math.random()*255;
    },

    RGB2Color: function(color)
    {
      return 'rgb(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ')';
    },

    draw: function(screen) {
      //var radius = this.size.x/2;
      screen.beginPath();
      screen.arc(this.center.x, this.center.y, this.radius, 0, Math.PI*2, false);
      screen.closePath();
      screen.fillStyle = this.RGB2Color(this.color);
      screen.fill();
    }
  };

  // this is a misc type
  var Debris = function(center, velocity, lifespan) {
    this.center = center;
    this.size = { x: 3, y: 3 };
    //this.speed = Math.random*2+1; //speed from 1 to 3
    this.velocity = velocity; //matrix.multiply(matrix.unitVector(direction), this.speed);
    this.lifespan = lifespan;
    this.exists = true;
    this.age = 0;
    this.gravity = 0.07;
    this.air_resist = 0.0005;
  };

  Debris.prototype = {
    update: function(world) {
      this.age += 1;
      if (this.age > this.lifespan){ 
        this.exists = false;
      }
    },

    draw: function(screen) {
      // console.log("Drawing debris life:",this.lifespan, "center:",this.center)
      screen.fillStyle="green"
      screen.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2, this.size.x, this.size.y);
    }
  };

  // this is a misc type
  var Powerup = function(center, velocity) {
    this.center = center;
    this.radius = 9;
    this.size = { x: 10 , y: 10 };
    this.velocity = velocity; //matrix.multiply(matrix.unitVector(direction), this.speed);
    this.lifespan = 400;
    this.exists = true;
    this.age = 0;
    this.gravity = 0.06;
    this.air_resist = 0.0;
  };

  Powerup.prototype = {
    update: function(world) {
      this.age += 1;
      if (this.age > this.lifespan){ 
        this.exists = false;
      }
      if (this.center.y + this.radius > world.dimensions.y) {
        this.center.y = world.dimensions.y - this.radius;
        this.velocity.y = 0;
      }
      if (trig.distance(this.center, world.player.center) <= this.radius + world.player.size.x/2) 
      {
        if (Math.random() > 0.5)
        {
          world.player.secondaryWeapon = new FlameThrower();
        }
        else
        {
          world.player.secondaryWeapon = new MissileLauncher();
        }
        this.exists = false;
      }
    },

    draw: function(screen) {
      // console.log("Drawing debris life:",this.lifespan, "center:",this.center)
      screen.beginPath();
      screen.arc(this.center.x, this.center.y, this.radius, 0, Math.PI*2, false);
      screen.closePath();
      screen.fillStyle = "purple";
      screen.fill();
      screen.fillStyle="gold"
      screen.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2, this.size.x, this.size.y);
    }
  };

  // this is a misc type
  var Text = function(text, center, lifespan, font) {
    this.text = text;
    this.center = center;
    this.font = font;
    //this.size = ""+size+"px";
    this.velocity = {x: 0, y: 0};
    this.lifespan = lifespan;
    this.exists = true;
    this.age = 0;
    this.gravity = 0.0;
    this.air_resist = 0.0;
  };

  Text.prototype = {
    update: function(world) {
      this.age += 1;
      if (this.age > this.lifespan){ 
        this.exists = false;
      }
    },

    draw: function(screen) {
      screen.font = this.font.style;
      screen.textAlign = this.font.align;
      screen.fillStyle = this.font.color;
      screen.fillText(this.text,this.center.x,this.center.y);
    }
  };


  // Keyboard input tracking
  // -----------------------

  // this prevents the spacebar from scrolling down
  window.onkeydown = function(e) { 
    return !(e.keyCode == 32);
  };

  // **new Keyboarder()** creates a new keyboard input tracking object.
  var Keyboarder = function() {

    // Records up/down state of each key that has ever been pressed.
    var keyState = {};

    // When key goes down, record that it is down.
    window.addEventListener('keydown', function(e) {
      keyState[e.keyCode] = true;
    });

    // When key goes up, record that it is up.
    window.addEventListener('keyup', function(e) {
      keyState[e.keyCode] = false;
    });

    // Returns true if passed key is currently down.  `keyCode` is a
    // unique number that represents a particular key on the keyboard.
    this.isDown = function(keyCode) {
      return keyState[keyCode] === true;
    };

    // Handy constants that give keyCodes human-readable names.
    this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32, UP: 38, W: 87, A: 65, S: 83, D: 68, L: 76, K: 75 };
  };

  // Other functions
  // ---------------

  // **drawRect()** draws passed body as a rectangle to `screen`, the drawing context.
  var drawRect = function(screen, body) {
    screen.fillRect(body.center.x - body.size.x / 2, body.center.y - body.size.y / 2,
                    body.size.x, body.size.y);
  };

  // Trigonometry functions to help with calculating circle movement
  // -------------------------------------------------------------

  var trig = {

    // **distance()** returns the distance between `point1` and `point2`
    // as the crow flies.  Uses Pythagoras's theorem.
    distance: function(point1, point2) {
      var x = point1.x - point2.x;
      var y = point1.y - point2.y;
      return Math.sqrt(x * x + y * y);
    },

    // **pointOnLineClosestToCircle()** returns the point on `line`
    // closest to `circle`.
    pointOnLineClosestToCircle: function(circle, line) {

      // Get the points at each end of `line`.
      var lineEndPoint1 = line.end1;
      var lineEndPoint2 = line.end2;

      // Create a vector that represents the line
      var lineUnitVector = matrix.unitVector(
        matrix.vectorBetween(lineEndPoint1, lineEndPoint2));

      // Pick a line end and create a vector that represents the
      // imaginary line between the end and the circle.
      var lineEndToCircleVector = matrix.vectorBetween(lineEndPoint1, circle.center);

      // Get a dot product of the vector between the line end and circle, and
      // the line vector.  (See the `dotProduct()` function for a
      // fuller explanation.)  This projects the line end and circle
      // vector along the line vector.  Thus, it represents how far
      // along the line to go from the end to get to the point on the
      // line that is closest to the circle.
      var projection = matrix.dotProduct(lineEndToCircleVector, lineUnitVector);

      // If `projection` is less than or equal to 0, the closest point
      // is at or past `lineEndPoint1`.  So, return `lineEndPoint1`.
      if (projection <= 0) {
        return lineEndPoint1;

      // If `projection` is greater than or equal to the length of the
      // line, the closest point is at or past `lineEndPoint2`.  So,
      // return `lineEndPoint2`.
      } else if (projection >= line.len) {
        return lineEndPoint2;

      // The projection indicates a point part way along the line.
      // Return that point.
      } else {
        return {
          x: lineEndPoint1.x + lineUnitVector.x * projection,
          y: lineEndPoint1.y + lineUnitVector.y * projection
        };
      }
    },

    // **isLineIntersectingCircle()** returns true if `line` is
    // intersecting `circle`.
    isLineIntersectingCircle: function(circle, line) {

      // Get point on line closest to circle.
      var closest = trig.pointOnLineClosestToCircle(circle, line);

      // Get the distance between the closest point and the center of
      // the circle.
      var circleToLineDistance = trig.distance(circle.center, closest);

      // Return true if distance is less than the radius.
      return circleToLineDistance < circle.radius;
    },

    // **isLineIntersectingCircle()** returns true if `line` is
    // intersecting `circle`.
    isCircleIntersectingCircle: function(circle1, circle2) {

      // Get the distance between the closest point and the center of
      // the circle.
      var distance = trig.distance(circle1.center, circle2.center);

      // Return true if distance is less than the radius.
      return distance < (circle1.radius + circle2.radius);
    }
  };

  var matrix = {

    // **magnitude()** returns the magnitude of the passed vector.
    // Sort of like the vector's speed.  A vector with a larger x or y
    // will have a larger magnitude.
    magnitude: function(vector) {
      return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    },

    // **unitVector()** returns the unit vector for `vector`.
    // A unit vector points in the same direction as the original,
    // but has a magnitude of 1.  It's like a direction with a
    // speed that is the same as all other unit vectors.
    unitVector: function(vector) {
      return {
        x: vector.x / matrix.magnitude(vector),
        y: vector.y / matrix.magnitude(vector)
      };
    },

    // **dotProduct()** returns the dot product of `vector1` and
    // `vector2`. A dot product represents the amount one vector goes
    // in the direction of the other.  Imagine `vector2` runs along
    // the ground and `vector1` represents a ball fired from a
    // cannon. If `vector2` is multiplied by the dot product of the
    // two vectors, it produces a vector that represents the amount
    // of ground covered by the ball.
    dotProduct: function(vector1, vector2) {
      return vector1.x * vector2.x + vector1.y * vector2.y;
    },

    multiply: function(vector, scalar) {
      return {x: vector.x*scalar, y: vector.y*scalar}
    },

    add: function (vector1, vector2) {
      return {x: vector1.x + vector2.x, y: vector1.y + vector2.y}
    },

    subtract: function (vector1, vector2) {
      return {x: vector1.x - vector2.x, y: vector1.y - vector2.y}
    },

    // **vectorBetween()** returns the vector that runs between `startPoint`
    // and `endPoint`.
    vectorBetween: function(startPoint, endPoint) {
      return {
        x: endPoint.x - startPoint.x,
        y: endPoint.y - startPoint.y
      };
    },
  };

  // Physics functions for calculating circle movement
  // -----------------------------------------------

  var physics = {

    // **applyGravity()** adds gravity to the velocity of `circle`.
    applyGravity: function(body) {
      body.velocity.y += body.gravity;
    },

    applyAirResistance: function(body) {
      var speed = matrix.magnitude(body.velocity)
      var accel = body.air_resist * speed*speed;
      body.velocity = matrix.add(body.velocity, matrix.multiply(matrix.unitVector(matrix.multiply(body.velocity, -1)), accel));
    },

    // **moveCircle()** adds the velocity of the circle to its center.
    moveBody: function(body) {
      body.center.x += body.velocity.x;
      body.center.y += body.velocity.y;
    },

    // **bounceCircleOffLine()** assumes `line` is intersecting `circle` and
    // bounces `circle` off `line`.
    bounceCircleOffLine: function(circle, line) {

      // Get the vector that points out from the surface the circle is
      // bouncing on.
      var bounceLineNormal = physics.bounceLineNormal(circle, line);

      // Set the new circle velocity by reflecting the old velocity in
      // `bounceLineNormal`.
      var dot = matrix.dotProduct(circle.velocity, bounceLineNormal);
      circle.velocity.x -= 2 * dot * bounceLineNormal.x;
      circle.velocity.y -= 2 * dot * bounceLineNormal.y;

      // Move the circle until it has cleared the line.  This stops
      // the circle getting stuck in the line.
      while (trig.isLineIntersectingCircle(circle, line)) {
        physics.moveBody(circle);
      }
    },

    // **bounceCircleOffCircle()** assumes `circle1` is intersecting `circle2` and
    // bounces `circle1` off `circle2`.
    bounceCircleOffCircle: function(circle1, circle2) {

      // find point where circles met (approximately)
      var epsilon = 0.001;
      var true_dist = circle1.radius + circle2.radius;
      var current_dist = matrix.magnitude(matrix.subtract(circle1.center, circle2.center));
      var divisor = 0.5; // binary search velocity divisor
      var sign = 1;
      //for (var i=0; i<10; i++) {
      while (current_dist - true_dist > epsilon) {
        // if (current_dist - true_dist <= epsilon) {
        //   break;
        // }
        if (current_dist < true_dist) { sign = -1; }
        else { sign = 1; }
        circle1.center = matrix.add(circle1.center, matrix.muliply(matrix.multiply(circle1.velocity, divisor), sign));
        circle2.center = matrix.add(circle2.center, matrix.muliply(matrix.multiply(circle2.velocity, divisor), sign));
        current_dist = matrix.magnitude(matrix.subtract(circle1.center, circle2.center));
        divisor = divisor/2;
      }

      var d = matrix.subtract(circle2.center, circle1.center);
      // console.log("d",d)

      var v1 = circle1.velocity;
      var v2 = circle2.velocity;

      var factor = 1/(d.x*d.x + d.y*d.y);
      // console.log("factor:", factor)

      var v1_new = {
        x: factor*(v2.x*d.x*d.x + v2.y*d.x*d.y + v1.x*d.y*d.y - v1.y*d.x*d.y),
        y: factor*(v1.x*d.x*d.x + v1.y*d.x*d.y + v2.x*d.y*d.y - v2.y*d.x*d.y)
      };

      var v2_new = {
        x: factor*(v2.x*d.x*d.y + v2.y*d.y*d.y - v1.x*d.x*d.y + v1.y*d.x*d.x),
        y: factor*(v1.x*d.x*d.y + v1.y*d.y*d.y - v2.x*d.x*d.y + v2.y*d.x*d.x)
      };

      circle1.velocity = v1_new;
      circle2.velocity = v2_new;
    },

    // **bounceLineNormal()** assumes `line` intersects `circle`.  It
    // returns the normal to the side of the line that the `circle` is
    // hitting.
    bounceLineNormal: function(circle, line) {

      // Get vector that starts at the closest point on
      // the line and ends at the circle.  If the circle is hitting
      // the flat of the line, this vector will point perpenticular to
      // the line.  If the circle is hitting the end of the line, the
      // vector will point from the end to the center of the circle.
      var circleToClosestPointOnLineVector =
          matrix.vectorBetween(
            trig.pointOnLineClosestToCircle(circle, line),
            circle.center);

      // Make the normal a unit vector and return it.
      return matrix.unitVector(circleToClosestPointOnLineVector);
    },

    // **bounceCircleNormal()** assumes `circle1` intersects `circle2`.  It
    // returns the normal to the side of the line that the `circle1` is
    // hitting.
    bounceCircleNormal: function(circle1, circle2) {

      // Make the normal a unit vector and return it.
      return matrix.unitVector(matrix.vectorBetween(circle2.center, circle1.center));
    }
  };

  // Start
  // -----

  // When the DOM is ready, start the simulation.
  window.addEventListener('load', start);
})(this);
