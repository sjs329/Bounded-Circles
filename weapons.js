
// Generic (meta) weapon. Actual weapons are defined below
var Weapon = function(bullet, reload_time, capacity, name) {
  this.reload_time = reload_time;
  this.bullet = bullet;
  this.capacity = capacity;
  this.name = name;
  this.last_fired = -this.reload_time;
  this.rounds_remaining = this.capacity;
};

Weapon.prototype = {
  fire: function(center, velocity, world) {
    if (this.capacity == 0 || this.rounds_remaining > 0){
      world.projectiles.push(new this.bullet(center, velocity));
      this.last_fired = world.time;
      this.rounds_remaining--;
    }
  }
};

///*******************///
///***** WEAPONS *****///
///*******************///
// Fishes shoot blanks.... duh
function Fish() {
  return new Weapon(Blank, 10000, 0, "Fish");
};

function Pistol() {
  return new Weapon(Bullet, 5, 0, "Pistol");
};

function MissileLauncher() {
  return new Weapon(Missile, 20, 10, "Missile Launcher");
};

function FlameThrower() {
  return new Weapon(Flame, 3, 75, "Flamethrower");
};

///***********************///
//****** PROJECTILES ******//
///***********************///
var Blank = function(center,velocity) {
  this.center = center;
  this.velocity = velocity;
  this.exists = false;
  this.damage = 0;
};

Blank.prototype = {
  update: function(world) {
  },

  draw: function(screen) {
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
  this.damage = 15;
  this.exists = true; //this gets set to false when this bullet hits something
  this.floor = 10000;
};

Bullet.prototype = {

  // **update()** updates the state of the bullet for a single tick.
  update: function(world) {
    for (var j=0; j<world.circles.length; j++){
      if (trig.distance(world.circles[j].center, this.center) <= world.circles[j].hit_area) {
        world.circles[j].health -= this.damage;
        this.exists = false;
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
  this.damage = 50;
  this.exists = true; //this gets set to false when this bullet hits something
  this.floor = 10000;
};

Missile.prototype = {

  // **update()** updates the state of the bullet for a single tick.
  update: function(world) {
    for (var j=0; j<world.circles.length; j++){
      if (trig.distance(world.circles[j].center, this.center) <= world.circles[j].hit_area) {
        world.circles[j].health -= this.damage;
        this.exists = false;
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

// Missile
// ------

// **new Flame()** creates a new bullet.
var Flame = function(center, velocity) {
  this.center = center;
  this.radius = 5;
  this.speed = 4;
  this.velocity = matrix.multiply(matrix.unitVector(velocity), this.speed);
  this.type = "bullet"
  this.gravity = -0.02;
  this.air_resist = 0.0;
  this.damage = 20;
  this.exists = true; 
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
      this.exists = false;
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
