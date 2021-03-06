
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

    // Create a vector that represents the line
    var lineUnitVector = matrix.unitVector(
      matrix.vectorBetween(line.end1, line.end2));

    // Pick a line end and create a vector that represents the
    // imaginary line between the end and the circle.
    var lineEndToCircleVector = matrix.vectorBetween(line.end1, circle.center);

    // Get a dot product of the vector between the line end and circle, and
    // the line vector.  (See the `dotProduct()` function for a
    // fuller explanation.)  This projects the line end and circle
    // vector along the line vector.  Thus, it represents how far
    // along the line to go from the end to get to the point on the
    // line that is closest to the circle.
    var projection = matrix.dotProduct(lineEndToCircleVector, lineUnitVector);

    // If `projection` is less than or equal to 0, the closest point
    // is at or past `line.end1`.  So, return `line.end1`.
    if (projection <= 0) {
      return line.end1;

    // If `projection` is greater than or equal to the length of the
    // line, the closest point is at or past `line.end2`.  So,
    // return `line.end2`.
    } else if (projection >= trig.distance(line.end1, line.end2)) {
      return line.end2;

    // The projection indicates a point part way along the line.
    // Return that point.
    } else {
      return {
        x: line.end1.x + lineUnitVector.x * projection,
        y: line.end1.y + lineUnitVector.y * projection
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

  didCircleIntersectLine: function(circle, line) {
    // console.log(circle)
    var linePath = { end1: circle.center, end2: matrix.subtract(circle.velocity, circle.center)}

    var intersect = this.getIntersectionPoint(linePath, line)

    return !intersect.failed;
  },

  // **isLineIntersectingCircle()** returns true if `line` is
  // intersecting `circle`.
  isCircleIntersectingCircle: function(circle1, circle2) {

    // Get the distance between the closest point and the center of
    // the circle.
    var distance = trig.distance(circle1.center, circle2.center);

    // Return true if distance is less than the radius.
    return distance < (circle1.radius + circle2.radius);
  },

  // will return true if the lines intersect and false if not. If true, point will hold the intersection point.
  // Not sure if this is really working correctly...
  getIntersectionPoint: function(line1, line2) 
  {
    // console.log("Intersecting", line1, "with", line2)
    var s1 = matrix.subtract(line1.end2, line1.end1);
    var s2 = matrix.subtract(line2.end2, line1.end1);
    var p = matrix.subtract(line1.end1, line2.end1);

    var s, t, div;
    div = (-s2.x*s1.y+s1.x*s2.y);
    if (div == 0) return {failed: true}; // I think this means they're parallel

    s = (-s1.y*p.x + s1.x*p.y) / div;
    t = ( s2.x*p.y - s2.y*p.x) / div;

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
      // Intersection detected
      point = { 
        x: line1.end1.x + (t * s1.x),
        y: line1.end1.y + (t * s1.y),
        failed: false
      }
      return point;
    }
    return {failed: true}; // No intersection

  },

  isLineUnderPoint: function(line, point)
  {
    if ((point.x >= line.end1.x && point.x <= line.end2.x) || (point.x <= line.end1.x && point.x >= line.end2.x))
    {
      return (line.end1.y >= point.y && line.end2.y >= point.y);
    }
    return false;
  },

  isPointUnderLine: function(line, point)
  {
    if ((point.x >= line.end1.x && point.x <= line.end2.x) || (point.x <= line.end1.x && point.x >= line.end2.x))
    {
      return (line.end1.y <= point.y && line.end2.y <= point.y);
    }
    return false;
  }
};

var geometry = {
  //entirely untested
  pointInPolygon: function(point, polygon) {
    var inersectionCount = 0;
    for (var i=0; i<polygon.length; i++) {
      var line = polygon[i];
      if (getIntersectionPoint(line, {end1:point, end2: {x:0, y:0}}).failed == false) {
        intersectionCount++;
      }
    }
    return (intersection % 2) != 0; //odd number of intersections means point is in polygon
  },

  pointsEqual: function(point1, point2) {
    return point1.x == point2.x && point1.y == point2.y
  }
}

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

  //returns the unit vector in the direction normal to the given vector, (rotated 90 degrees counter-clockwise)
  unitNormal: function(vector1) {
    return { x: -vector1.y, y: vector1.x}
  },

  multiply: function(vector, scalar) {
    return {x: vector.x*scalar, y: vector.y*scalar}
  },

  radians: function(degrees) {
    return degrees * Math.PI / 180.0;
  },

  rotate: function(vector, angle) {
    var angle_rad = this.radians(angle);
    var x = vector.x * Math.cos(angle_rad) - vector.y * Math.sin(angle_rad);
    var y = vector.x * Math.sin(angle_rad) + vector.y * Math.cos(angle_rad);
    return {x: x, y: y};
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