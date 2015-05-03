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

  // **moveBody()** adds the velocity of the body to its center.
  moveBody: function(body) {
    
    body.center.x += body.velocity.x;
    if (body.center.y <= body.floor) {
      body.center.y += body.velocity.y;
    }
    else
    {
      body.center.y = body.floor;
      body.velocity.y = 0;
      body.velocity.x *= 0.5;
      // body.gravity = 0;
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

