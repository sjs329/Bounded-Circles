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
    this.floor = 10000;
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
    this.floor = 10000;
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
    this.floor = 10000;
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
