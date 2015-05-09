
// Keyboard input tracking
// -----------------------

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
  this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32, UP: 38, W: 87, A: 65, S: 83, D: 68, L: 76, K: 75, J:74, SIX: 54, R: 82, N: 78, 
    ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SHIFT: 16, I: 73};
};
