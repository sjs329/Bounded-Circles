
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
    return Math.sqrt(Math.pow(vector.x, 2)+ Math.pow(vector.y, 2));
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