
// Keyboard input tracking
// -----------------------

// **new Keyboarder()** creates a new keyboard input tracking object.
var Keyboarder = function() {

  // Records up/down state of each key that has ever been pressed.
  var keyState = {};
  var prevKeyState = {};

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

  // this.pressed = function(keyCode) {
  // };

  // Handy constants that give keyCodes human-readable names.
  this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32, UP: 38, W: 87, A: 65, S: 83, D: 68, L: 76, K: 75, J:74, H:72, R: 82, N: 78, 
    ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57, SHIFT: 16, I: 73};

  // var keyNames = getKeys(this.KEYS);
  // for (var i=0; i<keyNames.length; i++) {
  //   this.
  // }
};

// var getKeys = function(obj){
//    var keys = [];
//    for(var key in obj){
//       keys.push(key);
//    }
//    return keys;
// }
