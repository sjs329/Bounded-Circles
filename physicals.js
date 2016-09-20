var Game = (function (game){

  // var game = {};
  // **new Circle()** creates a circle that has the passed `center`.
  game.Circle = function( args ) { //gameSize, center, velocity) {
    this.gameSize = args.gameSize;
    this.center = {x: args.center.x, y: args.center.y};
    this.velocity = {x: args.velocity.x, y: args.velocity.y};
    this.radius = 10;
    this.health = 100;
    this.exists = true;
    this.circle_checked = false;
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
        world.level_score += world.kill_multiplier;
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
      screen.strokeStyle = "black"
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

      var rand = Math.random();
      if (rand < game.levels[world.level].powerup_drop_prob) {

        var weapon = this.getRandElement(game.levels[world.level].powerups, game.levels[world.level].powerup_probs)
        world.misc.push(new game.Powerup(this.gameSize, {x: this.center.x, y: this.center.y}, {x: 0, y: 0.1}, weapon, world));
      }
    },

    getRandElement: function(array, probabilities) {
      var i = 0;
      var sum = 0;
      var boundary = 0;
      var temp_ar = [];
      for (i=0; i<probabilities.length; i++) {
        // console.log("Adding",probabilities[i],"to sum",sum);
        sum+=probabilities[i];
      }
      for (i=0; i<probabilities.length-1; i++)
      {
        boundary += (probabilities[i] / sum);
        temp_ar.push(boundary);
      }
      // console.log("Sum:",sum)
      // console.log("Bounds:", temp_ar);
      var r = Math.random(); // returns [0,1]
      // console.log("Rand:", r);
      for (i=0; i<temp_ar.length && r>=temp_ar[i]; i++); //loop through until we find the right boundary
      // console.log("i:", i)
      return array[i];
    }
  };


  // **new Player()** creates a player.
  game.Player = function(gameSize) {
    this.gameSize = gameSize;
    this.size = { x: 15, y: 15 };
    this.center = { x: gameSize.x / 2, y: Math.round(gameSize.y - this.size.y/2) };
    this.floor = gameSize.y-this.size.y/2;
    this.velocity = { x: 0, y: 0};
    this.type = "player";
    this.speed = 3;
    this.gravity = 0.25;
    this.air_resist = 0.0;
    this.alive = true;

    // Create a keyboard object to track button presses.
    this.keyboarder = new Keyboarder();
    this.h_pressed = false;

    this.primaryWeapon = Pistol();
    this.secondaryWeapon = Fish();
    this.secondaryWeaponInd = 0;
    this.secondaryWeaponTemp = new game.FillBar({x: this.center.x, y: this.center.y-11}, {x: 15, y: 3}, 'red', 0, false)
    this.secretWeapon = FlameThrower();
    this.secretWeapon.capacity = 0;
    this.shield = ShieldGun();
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
            if (typeof this.secondaryWeapon.temperature !== 'undefined')
              this.secondaryWeapon.temperature = 0; //make sure the temp bar goes away

            return;
          }
        }

        // if we're falling, check to see if we fall through a line
        physics.updateFloor(world, this);

        // make sure we don't jump through the roof
        if (this.center.y-(this.size.y/2) <= 0) {
          this.center.y = (this.size.y/2);
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
        if (world.time - this.shield.last_fired >= this.shield.reload_time)
        {
          if (this.keyboarder.isDown(this.keyboarder.KEYS.I))
          {
            this.shield.fire({ x: this.center.x, y: this.center.y }, { x: 0, y: 0 }, world);
          }
        }
      }
      
      if (!world.running) //this level is over
      {
        if (world.player.alive) //we won!
        {
          if (this.keyboarder.isDown(this.keyboarder.KEYS.N))
          {
            var next_level = world.level + 1;
            if (next_level < game.levels.length) {
              world.score += world.level_score;
              game.reset(world, world.level + 1, world.lives);
            }
            else
              console.log("No more levels!");
          }
          if (this.keyboarder.isDown(this.keyboarder.KEYS.R))
          {
            if (world.level < game.levels.length-1) {
              game.reset(world, world.level, world.lives); //restart level
            } else {
              world.score = 0;
              game.reset(world, 0); //restart game
            }
          }
        }
        else { //we're dead :(
          if (this.keyboarder.isDown(this.keyboarder.KEYS.R)) {
            world.lives--;
            if (world.lives > 0 && world.circles.length > 0) {
              game.reset(world, world.level, world.lives);
            }
            else {
              world.score = 0;
              game.reset(world, 0);
            }
          }
        }
      }
      else {
        if (this.keyboarder.isDown(this.keyboarder.KEYS.R))
        {
          game.reset(world, world.level, world.lives); //allow resets during level
        }
      }

      //switching weapons
      if (!this.h_pressed && this.keyboarder.isDown(this.keyboarder.KEYS.H)) {
        this.secondaryWeaponInd++;
        if (this.secondaryWeaponInd >= world.secondaryWeaponList) {
          this.secondaryWeaponInd = 0;
        }
        this.h_pressed = true;
      }
      if (!this.keyboarder.isDown(this.keyboarder.KEYS.H)) {
        this.h_pressed = false;
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.ONE) && this.keyboarder.isDown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(world, 0);
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.TWO) && this.keyboarder.isDown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(world, 1);
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.THREE) && this.keyboarder.isDown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(world, 2);
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.FOUR) && this.keyboarder.isDown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(world, 3);
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.FIVE) && this.keyboarder.isDown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(world, 4);
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SIX) && this.keyboarder.isDown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(world, 5);
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.SEVEN) && this.keyboarder.isDown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(world, 6);
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.EIGHT) && this.keyboarder.isDown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(world, 7);
      }
      if (this.keyboarder.isDown(this.keyboarder.KEYS.NINE) && this.keyboarder.isDown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(world, 8);
      }
    },

    draw: function(screen) {
      if (this.alive){
        screen.fillStyle="#2E2EFE";
        screen.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2,
                      this.size.x, this.size.y);
      }

      if (typeof this.secondaryWeapon.temperature !== 'undefined') {
        this.secondaryWeaponTemp.center = {x: this.center.x, y: this.center.y-11};
        this.secondaryWeaponTemp.setPercent(this.secondaryWeapon.temperature / this.secondaryWeapon.heat_capacity)
        this.secondaryWeaponTemp.draw(screen)
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
        return;
      }

      physics.updateFloor(world, this);
    },

    draw: function(screen) {
      // console.log("Drawing debris life:",this.lifespan, "center:",this.center)
      screen.fillStyle=this.color;
      screen.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2, this.size.x, this.size.y);
    }
  };

  // this is a misc type
  game.Powerup = function(dimensions, center, velocity, weapon, world) {
    this.center = center;
    this.radius = 12;
    this.size = { x: 14 , y: 14 };
    this.velocity = velocity;
    this.weapon = weapon;
    this.weaponProto = new this.weapon(world);
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
        if (this.weaponProto.name == 'Life') {
          if (world.lives < world.max_lives) {
            world.lives++;
          }
          this.exists = false;
          return;
        }
        var matching_weapon;
        //remove blanks
        world.secondaryWeaponList = world.secondaryWeaponList.filter(function (weap) { return weap.name !== 'Blanks' });
        for (var i=0; i<world.secondaryWeaponList.length; i++) {
          if (world.secondaryWeaponList[i].name.substr(0,this.weaponProto.name.length) === this.weaponProto.name) {
            matching_weapon = world.secondaryWeaponList[i];
            break;
          }
        }
        if (matching_weapon) {
          matching_weapon.rounds_remaining += this.weaponProto.rounds_remaining;
        }
        else {
          world.secondaryWeaponList.push(this.weaponProto)
          if (typeof this.weaponProto.exists !== 'undefined') 
          {
            world.misc.push(this.weaponProto); //make sure to add any updateable weapons to misc.
          }
        }
        this.exists = false;
      }
    },

    draw_int: function(screen) {
      screen.beginPath();
      screen.arc(this.center.x, this.center.y, this.radius, 0, Math.PI*2, false);
      screen.closePath();
      screen.fillStyle = this.weaponProto.color;
      screen.fill();
      screen.font = "bold 18px arial";
      screen.textAlign = "center";
      screen.fillStyle = "black";
      screen.fillText(this.weaponProto.symbol, this.center.x, this.center.y+this.radius/2);
    },

    draw_ext: function(screen, weaponProto) {
      this.weaponProto = weaponProto;
      this.draw_int(screen);
    },

    draw: function(screen, weaponProto) {
      if (arguments.length == 1)
        return this.draw_int(screen);
      else
        return this.draw_ext(screen, weaponProto);
    }
  };

  // this is a misc type
  game.Text = function(text, center, lifespan, font) {
    this.text = text;
    this.center = center;
    this.font = font;
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

  game.FillBar = function(center, size, color, percent, draw_border) {
    this.center = center;
    this.size = size;
    this.color = color;
    this.percent = percent;
    this.velocity = {x:0, y:0};
    this.type = "fillbar"
    this.exists = true;
    this.gravity = 0.0;
    this.air_resist = 0.0;
    this.floor = 10000;
    this.draw_border = draw_border || false;
  };

  game.FillBar.prototype = {
    setPercent: function(percent)
    {
      if (percent > 1) percent = 1;
      if (percent < 0) percent = 0;
      this.percent = percent;
    },

    setColor: function(color)
    {
      this.color = color;
    },

    update: function(world) { }, //nothing to update

    draw: function(screen) {
      screen.fillStyle = this.color;
      screen.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2, this.size.x*this.percent, this.size.y);
      if (this.draw_border) {
        screen.beginPath();
        screen.strokeStyle = "black"
        screen.rect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2, this.size.x, this.size.y);
        screen.stroke();
      }
    }
  };

  return game;
} (Game || {}));
