// Physics functions for calculating circle movement
// -----------------------------------------------

Line = function( args ) { // pt1, pt2) {
    // console.log(args)
    this.end1 = args.pt1;
    this.end2 = args.pt2;
    this.color = "black";
    this.lifespan = 0; //could use this to make lines disappear over time
    this.age = 0;
    this.exists = true;
    this.len = trig.distance(this.end1, this.end2);
  };

Line.prototype = {
    update: function(world) {
      this.age += 1;
      if (this.lifespan > 0 && this.age > this.lifespan)
        this.exists = false;
    },
    // The line has its own built-in `draw()` function.  This allows
    // the main `draw()` to just polymorphicly call `draw()` on circles and lines.
    draw: function(screen) {

      screen.beginPath();
      screen.lineWidth = 1.5;
      screen.moveTo(this.end1.x, this.end1.y);
      screen.lineTo(this.end2.x, this.end2.y);
      screen.closePath();

      screen.strokeStyle = this.color;
      screen.stroke();
    }
  };

var physics = {

  // **applyGravity()** adds gravity to the velocity of `circle`.
  applyGravity: function(body) {
    if (typeof body.gravity == 'undefined') return;
    body.velocity.y += body.gravity;
  },

  applyAirResistance: function(body) {
    if (typeof body.air_resist == 'undefined') return;
    if (body.velocity.x == 0 && body.velocity.y == 0) return;
    var speed = matrix.magnitude(body.velocity)
    var accel = body.air_resist * speed*speed;
    body.velocity = matrix.add(body.velocity, matrix.multiply(matrix.unitVector(matrix.multiply(body.velocity, -1)), accel));

  },

  // **moveBody()** adds the velocity of the body to its center.
  moveBody: function(body) {
    if (typeof body.velocity == 'undefined') return;
    body.center.x += body.velocity.x;
    if (body.velocity.y < 0 || body.center.y < body.floor) {
      body.center.y += body.velocity.y;
    }
    else
    {
      body.center.y = body.floor;
      body.velocity.y = 0;
      body.velocity.x *= 0.5;
    }
  },

  updateFloor: function(world, body)
  {
    body.floor = world.dimensions.y-body.size.y/2;
    var feet = {x: body.center.x, y: body.center.y+body.size.y/2};
    var prev_feet = {x: body.center.x, y: feet.y - body.velocity.y};
    for (var i=0; i<world.lines.length; i++)
    {
      if (trig.isPointUnderLine(world.lines[i], feet))
      {
        if (trig.isLineUnderPoint(world.lines[i], prev_feet))
        {
          body.floor = world.lines[i].end1.y - body.size.y/2;
          // floor_changed = true;
          body.center.y = body.floor;
          break;
        }
      }
    }
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
    // var epsilon = 0.01;
    // var true_dist = circle1.radius + circle2.radius;
    // var current_dist = trig.distance(circle1.center, circle2.center);
    // var divisor = 0.5; // binary search velocity divisor
    // var sign = 1;
    // // for (var i=0; i<1000; i++) {
    // while (Math.abs(true_dist-current_dist) > epsilon) {
    //   console.log("Dist:", true_dist-current_dist, "Vel:", circle1.velocity, circle2.velocity);
    //   // if (Math.abs(current_dist - true_dist) <= epsilon) {
    //   //   break;
    //   // }
    //   if (current_dist < true_dist) { sign = -1; }
    //   else { sign = 1; }
    //   circle1.center = matrix.add(circle1.center, matrix.multiply(matrix.multiply(circle1.velocity, divisor), sign));
    //   circle2.center = matrix.add(circle2.center, matrix.multiply(matrix.multiply(circle2.velocity, divisor), sign));
    //   current_dist = trig.distance(circle1.center, circle2.center);
    //   // console.log(Math.abs(current_dist-true_dist));
    //   divisor = divisor/2;
    // }
    // console.log(Math.abs(current_dist-true_dist));

    var d = matrix.subtract(circle2.center, circle1.center);
    var new_d = matrix.multiply(matrix.unitVector(d), (circle2.radius+circle1.radius)); //vector from j to i so they're barely touching
    circle2.center = matrix.add(circle1.center, new_d);

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

