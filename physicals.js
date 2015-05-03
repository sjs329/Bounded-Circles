var Game = (function (game){

  // var game = {};
  // **new Circle()** creates a circle that has the passed `center`.
  game.Circle = function(gameSize, center, velocity) {
    this.gameSize = gameSize;
    this.center = center;
    this.velocity = velocity;
    this.radius = 10;
    this.health = 100;
    this.exists = true;
    this.circle_checked = false;
    this.powerup_probablity = 0.60;
    this.hit_area = 10;
    this.mass = 1;
    this.gravity = 0.06;
    this.air_resist = 0.0002;
    this.floor = 100000; //larger number so that the circle is allowed to intersect the floor. this is how we detect collisions
  };

  game.Circle.prototype = {
    update: function(world) {
      if (this.health <= 0) {
        this.explode(world);
        this.exists = false;
        return; //don't need to check for bounces
      }

      // Run through all lines.
      for (var j = 0; j < world.lines.length; j++) {
        var line = world.lines[j];

        // If `line` is intersecting `circle`, bounce circle off line.
        if (trig.isLineIntersectingCircle(this, line)) {
          physics.bounceCircleOffLine(this, line);
        }
      }

      if (!this.circle_checked){
        // Run through all circles.
        for (var i = 0; i < world.circles.length; i++) {
          if (world.circles[i].center == this.center) continue; //this is ourself - don't check ourself
          var circle2 = world.circles[i];

          if (trig.isCircleIntersectingCircle(this, circle2)) {
            physics.bounceCircleOffCircle(this, circle2);
            circle2.circle_checked = true;
          }
        }
        this.circle_checked = true;
      }
      
    },

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
        var color = "green";
        // console.log("Debris:",i, velocity)
        world.persistant.push(new game.Debris(this.gameSize, position, velocity, lifespan, color));
      }

      if (Math.random() < this.powerup_probablity) {
        var rand = Math.random()
        var weapon;
        if (rand < 0.5)
        {
          weapon = FlameThrower;
        }
        else if (rand < 0.8)
        {
          weapon = MissileLauncher;
        }
        else
        {
          weapon = MultiMissileLauncher;
        }
        world.misc.push(new game.Powerup(this.gameSize, {x: this.center.x, y: this.center.y}, {x: 0, y: 0.1}, weapon));
      }
    }
  };

  // **makeLine()** creates a line
  game.Line = function(pt1, pt2) {
    this.end1 = pt1;
    this.end2 = pt2;
  };

  game.Line.prototype = {
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

  // ------

  // **new Player()** creates a player.
  game.Player = function(gameSize) {
    this.gameSize = gameSize;
    this.size = { x: 15, y: 15 };
    this.center = { x: gameSize.x / 2, y: Math.round(gameSize.y - this.size.y/2) };
    this.floor = Math.round(gameSize.y-this.size.y/2);
    this.velocity = { x: 0, y: 0};
    this.type = "player";
    this.speed = 3;
    this.gravity = 0.25;
    this.air_resist = 0.0;
    this.alive = true;

    // Create a keyboard object to track button presses.
    this.keyboarder = new Keyboarder();

    this.primaryWeapon = Pistol();
    // this.primaryWeapon = MultiMissileLauncher();
    this.secondaryWeapon = Fish();
    this.secretWeapon = FlameThrower();
    this.secretWeapon.capacity = 0;
  };

  game.Player.prototype = {
    // **update()** updates the state of the player for a single tick.
    update: function(world) {  
      if (this.alive) {
        // Check for death
        for (var i=0; i<world.circles.length; i++){
          if (trig.distance(this.center, world.circles[i].center) <= (world.circles[i].radius+this.size.x/2)) {
            this.alive = false; //we're dead!
            this.explode(world);
          }
        }

        // Key presses
        // If left cursor key is down...
        if (this.keyboarder.isDown(this.keyboarder.KEYS.A)) {
          // ... move left.
          if (this.center.x-Math.round(this.size.x/2) > 0) {
            this.velocity.x = -this.speed;  
          } else {
            this.velocity.x = 0;
          }
        } else if (this.keyboarder.isDown(this.keyboarder.KEYS.D)) {
          if (this.center.x+Math.round(this.size.x/2) < this.gameSize.x) {
            this.velocity.x = this.speed;  
          } else {
            this.velocity.x = 0;
          }
        } else {
          this.velocity.x = 0;
        }

        if (this.center.y >= this.floor){
          if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE) || this.keyboarder.isDown(this.keyboarder.KEYS.W)) {
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
          if (this.keyboarder.isDown(this.keyboarder.KEYS.J))  
          {
            this.secondaryWeapon.fire({ x: this.center.x, y: this.center.y - this.size.y - this.size.y/3 }, { x: 0, y: -1 }, world);
          }
        }
        if (world.time - this.secretWeapon.last_fired >= this.secretWeapon.reload_time)
        {
          if (this.keyboarder.isDown(this.keyboarder.KEYS.SIX))
          {
            this.secretWeapon.fire({ x: this.center.x, y: this.center.y - this.size.y - this.size.y/3 }, { x: 0, y: -1 }, world);
          }
        }
      }
      
        if (this.keyboarder.isDown(this.keyboarder.KEYS.R))
        {
          game.reset(world);
        }
    },

    draw: function(screen) {
      if (this.alive){
        screen.fillStyle="#2E2EFE";
        screen.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2,
                      this.size.x, this.size.y);
      }
    }, 

    explode: function(world) {
      for (var i=0; i<20; i++) {
        // determine velocity of this piece of debris
        var speed = Math.random() * 1.25 +0.5;
        var direction = matrix.unitVector({ x: Math.random()*2-1, y: Math.random()*2-1});
        var velocity = matrix.multiply(direction, speed);
        var position = { x: this.center.x, y: this.center.y }; //matrix.add(matrix.multiply(direction, this.radius), this.center);
        var lifespan = Math.random()*300 + 300; //40 - 240 ticks
        var color = "blue";
        // console.log("Debris:",i, velocity)
        world.persistant.push(new game.Debris(this.gameSize, position, velocity, lifespan, color));
      }
    }
  };

  // this is a misc type
  game.Debris = function(dimensions, center, velocity, lifespan, color) {
    this.center = center;
    this.size = { x: 3, y: 3 };
    this.velocity = velocity;
    this.color = color;
    this.lifespan = lifespan;
    this.exists = true;
    this.age = 0;
    this.gravity = 0.07;
    this.air_resist = 0.005;
    this.floor = dimensions.y - this.size.y;
  };

  game.Debris.prototype = {
    update: function(world) {
      this.age += 1;
      if (this.age > this.lifespan){ 
        this.exists = false;
      }
    },

    draw: function(screen) {
      // console.log("Drawing debris life:",this.lifespan, "center:",this.center)
      screen.fillStyle=this.color;
      screen.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2, this.size.x, this.size.y);
    }
  };

  // this is a misc type
  game.Powerup = function(dimensions, center, velocity, weapon) {
    this.center = center;
    this.radius = 12;
    this.size = { x: 14 , y: 14 };
    this.velocity = velocity;
    this.weapon = weapon;
    this.weaponProto = new this.weapon();
    this.lifespan = 400;
    this.exists = true;
    this.age = 0;
    this.gravity = 0.06;
    this.air_resist = 0.0;
    this.floor = dimensions.y - this.size.y;
  };

  game.Powerup.prototype = {
    update: function(world) {
      this.age += 1;
      if (this.age > this.lifespan){ 
        this.exists = false;
      }
      if (world.player.alive && trig.distance(this.center, world.player.center) <= this.radius + world.player.size.x/2) 
      {
        var rand = Math.random();
        if (rand < 0.05)
        {
          world.player.secondaryWeapon = new Fish();
        }
        else
        {
          var newRoundsRemaining = this.weaponProto.rounds_remaining;
          if (world.player.secondaryWeapon.name == this.weaponProto.name) {
            newRoundsRemaining += world.player.secondaryWeapon.rounds_remaining;
          }
          world.player.secondaryWeapon = new this.weapon();
          world.player.secondaryWeapon.rounds_remaining = newRoundsRemaining; // this can make the rounds remaining greater than the capacity. but that should be fine....
        }
        this.exists = false;
      }
    },

    draw: function(screen) {
      screen.beginPath();
      screen.arc(this.center.x, this.center.y, this.radius, 0, Math.PI*2, false);
      screen.closePath();
      screen.fillStyle = this.weaponProto.color;
      screen.fill();
      screen.font = "bold 18px arial";
      screen.textAlign = "center";
      screen.fillStyle = "black";
      screen.fillText(this.weaponProto.symbol, this.center.x, this.center.y+this.radius/2);
    }
  };

  // this is a misc type
  game.Text = function(text, center, lifespan, font) {
    this.text = text;
    this.center = center;
    this.font = font;
    //this.size = ""+size+"px";
    this.velocity = {x: 0, y: 0};
    this.lifespan = lifespan;
    this.type = "text"
    this.exists = true;
    this.age = 0;
    this.gravity = 0.0;
    this.air_resist = 0.0;
    this.floor = 10000;
  };

  game.Text.prototype = {
    setText: function(newText) {
      this.text = newText;
    },

    update: function(world) {
      this.age += 1;
      if (this.lifespan > 0 && this.age > this.lifespan){ 
        this.exists = false;
      }
    },

    fillTextMultiLine: function(screen, text, x, y) {
      var lineHeight = screen.measureText("M").width * 1.5;
      var lines = text.split("\n");
      for (var i = 0; i < lines.length; ++i) {
        screen.fillText(lines[i], x, y);
        y += lineHeight;
      }
    },

    draw: function(screen) {
      screen.font = this.font.style;
      screen.textAlign = this.font.align;
      screen.fillStyle = this.font.color;
      this.fillTextMultiLine(screen, this.text, this.center.x, this.center.y);
    }
  };

  return game;
} (Game || {}));