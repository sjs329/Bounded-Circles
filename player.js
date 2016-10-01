var Game = (function (game){
  // **new Player()** creates a player.
  game.Player = function() {
    this.gameSize = game.dimensions;
    // this.world = game.world;
    this.size = { x: 15, y: 15 };
    this.center = { x: this.gameSize.x / 2, y: Math.round(this.gameSize.y - this.size.y/2) };
    this.floor = this.gameSize.y-this.size.y/2;
    this.velocity = { x: 0, y: 0};
    this.type = "player";
    this.speed = 3;
    this.gravity = {x: 0.0, y: 0.25};
    this.default_gravity = {x: 0.0, y: 0.25};
    this.air_resist = 0.0;
    this.alive = true;

    // Create a keyboard object to track button presses.
    this.keyboarder = new Keyboarder();
    // this.h_pressed = false;
    this.self = this;

    this.primaryWeapon = Pistol();
    this.secondaryWeapon = Fish();
    this.secondaryWeaponInd = 0;
    this.secondaryWeaponTemp = new game.FillBar({x: this.center.x, y: this.center.y-11}, {x: 15, y: 3}, 'red', 0, false)
    this.secretWeapon = FlameThrower();
    this.secretWeapon.capacity = 0;
    this.shield = ShieldGun();
    window.addEventListener('keydown', this.handleKeyboardPress.bind(this));
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
          this.velocity.y = 0; //stop moving up
        }

        //slow down horizontal velocity if we're not pressing key
        if (!this.keyboarder.isDown(this.keyboarder.KEYS.A) && !this.keyboarder.isDown(this.keyboarder.KEYS.D)) {
          if (this.velocity > 0) {
            this.velocity.x -= 0.01;
          }
          else if (this.velocity < 0){
            this.velocity.x += 0.01;
          }
        }
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
    },

    handleKeyboardPress: function(evt) {
      // Key presses
      // If left cursor key is down...
      if (evt.keyCode == this.keyboarder.KEYS.A) {
        // ... move left.
        if (this.center.x-Math.round(this.size.x/2) > 0) {
          this.velocity.x -= this.speed;  
        } 
        // else {
        //   this.velocity.x = 0;
        // }
      } else if (evt.keyCode == this.keyboarder.KEYS.D) {
        if (this.center.x+Math.round(this.size.x/2) < this.gameSize.x) {
          this.velocity.x += this.speed;  
        } 
        // else {
        //   this.velocity.x = 0;
        // }
      } 
      // else {
      //   this.velocity.x = 0;
      // }

      if (this.center.y >= this.floor){
        if (evt.keyCode == this.keyboarder.KEYS.SPACE || evt.keyCode == this.keyboarder.KEYS.W) {
            this.velocity.y -= 6;
        }
      }
      if (evt.keyCode == this.keyboarder.KEYS.S) {
        this.velocity.y += 0.25;
      }

      if (game.world.time - this.primaryWeapon.last_fired >= this.primaryWeapon.reload_time) 
      {
        if (evt.keyCode == this.keyboarder.KEYS.K) 
        {
          this.primaryWeapon.fire({ x: this.center.x, y: this.center.y - this.size.y - this.size.y/3 }, { x: 0, y: -1 }, game.world);
        } 
        else if(evt.keyCode == this.keyboarder.KEYS.L) 
        {
          this.primaryWeapon.fire({ x: this.center.x, y: this.center.y + this.size.y + this.size.y/3 }, { x: 0, y: 1 }, game.world);
        } 
      }
      if (game.world.time - this.secondaryWeapon.last_fired >= this.secondaryWeapon.reload_time) 
      {
        if (evt.keyCode == this.keyboarder.KEYS.J)  
        {
          this.secondaryWeapon.fire({ x: this.center.x, y: this.center.y - this.size.y - this.size.y/3 }, { x: 0, y: -1 }, game.world);
        }
      }
      if (game.world.time - this.secretWeapon.last_fired >= this.secretWeapon.reload_time)
      {
        if (evt.keyCode == this.keyboarder.KEYS.SIX)
        {
          this.secretWeapon.fire({ x: this.center.x, y: this.center.y - this.size.y - this.size.y/3 }, { x: 0, y: -1 }, game.world);
        }
      }
      if (game.world.time - this.shield.last_fired >= this.shield.reload_time)
      {
        if (evt.keyCode == this.keyboarder.KEYS.I)
        {
          this.shield.fire({ x: this.center.x, y: this.center.y }, { x: 0, y: 0 }, game.world);
        }
      }
      
      if (!game.world.running) //this level is over
      {
        if (this.alive) //we won!
        {
          if (evt.keyCode == this.keyboarder.KEYS.N)
          {
            var next_level = game.world.level + 1;
            if (next_level < game.levels.length) {
              game.world.score += game.world.level_score;
              game.reset(game.world, game.world.level + 1, game.world.lives);
            }
            else
              console.log("No more levels!");
          }
          if (evt.keyCode == this.keyboarder.KEYS.R)
          {
            if (game.world.level < game.levels.length-1) {
              game.reset(game.world, game.world.level, game.world.lives); //restart level
            } else {
              game.world.score = 0;
              game.reset(game.world, 0); //restart game
            }
          }
        }
        else { //we're dead :(
          if (evt.keyCode == this.keyboarder.KEYS.R) {
            game.world.lives--;
            if (game.world.lives > 0 && game.world.circles.length > 0) {
              game.reset(game.world, game.world.level, game.world.lives);
            }
            else {
              game.world.score = 0;
              game.reset(game.world, 0);
            }
          }
        }
      }
      else {
        if (evt.keyCode == this.keyboarder.KEYS.R)
        {
          game.reset(game.world, game.world.level, game.world.lives); //allow resets during level
        }
      }

      //switching weapons
      if (evt.keyCode == this.keyboarder.KEYS.H) {
        this.secondaryWeaponInd++;
        if (this.secondaryWeaponInd >= game.world.secondaryWeaponList) {
          this.secondaryWeaponInd = 0;
        }
      }
      if (evt.keyCode == this.keyboarder.KEYS.ONE && this.keyboarder.isdown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(game.world, 0);
      }
      if (evt.keyCode == this.keyboarder.KEYS.TWO && this.keyboarder.isdown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(game.world, 1);
      }
      if (evt.keyCode == this.keyboarder.KEYS.THREE && this.keyboarder.isdown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(game.world, 2);
      }
      if (evt.keyCode == this.keyboarder.KEYS.FOUR && this.keyboarder.isdown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(game.world, 3);
      }
      if (evt.keyCode == this.keyboarder.KEYS.FIVE && this.keyboarder.isdown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(game.world, 4);
      }
      if (evt.keyCode == this.keyboarder.KEYS.SIX && this.keyboarder.isdown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(game.world, 5);
      }
      if (evt.keyCode == this.keyboarder.KEYS.SEVEN && this.keyboarder.isdown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(game.world, 6);
      }
      if (evt.keyCode == this.keyboarder.KEYS.EIGHT && this.keyboarder.isdown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(game.world, 7);
      }
      if (evt.keyCode == this.keyboarder.KEYS.NINE && this.keyboarder.isdown(this.keyboarder.KEYS.SHIFT))
      {
        game.reset(game.world, 8);
      }
    }
  };
  

  return game;
} (Game || {}));
