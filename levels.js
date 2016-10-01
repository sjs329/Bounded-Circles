var Game = (function(game) {
  ///*******************///
  ///***** LEVELS ******///
  ///*******************///

  game.screen;
  game.dimensions;
  game.levels;


  var Level = function(args) { //level_num, lines, num_circles, circles, player, primaryWeapon, secondaryWeapon, secretWeapon){
    this.lines = args.lines;
    this.circles = args.circles;
    this.antiGravityWells = args.antiGravityWells;
    this.num_rand_circles = args.num_rand_circles;
    this.primaryWeapon = args.primaryWeapon;
    this.secondaryWeapon = args.secondaryWeapon; //secondary weapon you start with
    this.secretWeapon = args.secretWeapon;
    this.powerup_drop_prob = args.powerup_drop_prob; //the probability that killing a circle will drop a powerup
    this.powerups = args.powerups; //array of possible powerups that can be dropped.
    this.powerup_probs = args.powerup_probs; //array of probiabilities (same size as powerups) dictating relative probability of drops
  };

  game.loadLevels = function(evt)
  {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var levels = [];
    var current_file = 0;
    for (var file_ind = 0, f; f = files[file_ind]; file_ind++) {
      var reader = new FileReader();
      reader.onload = function(e) {
        levels.push(game.readLevel(e.target.result));
      };
      reader.onerror = function(e) {
        console.log("Error:",e)
      };

      reader.onloadend = function(e) {
        current_file++;
        if (current_file == files.length) {
          game.levels = levels
          game.start(false)
        }
      }
      reader.readAsText(f)
    }
  }

  game.readLevel = function(level_str) 
  {
    new_level = new Level({ lines:[], 
                              circles:[], 
                              num_rand_circles:0, 
                              primaryWeapon:Pistol, 
                              secondaryWeapon:Fish, 
                              secretWeapon:MultiMissileLauncher,
                              powerup_drop_prob:1.0,
                              powerups:[SMG],
                              powerup_probs:[1.0]
                                          });

    //add border lines
    new_level.lines.push({ pt1: { x: 0, y: 0 }, pt2: { x: 0, y: game.screen.canvas.height } })
    new_level.lines.push({ pt1: { x: 0, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: game.screen.canvas.height } })
    new_level.lines.push({ pt1: { x: game.screen.canvas.width, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: 0 } })
    new_level.lines.push({ pt1: { x: game.screen.canvas.width, y: 0 }, pt2: { x: 0, y: 0 } })

    //line above weapon info text
    new_level.lines.push({ pt1: { x: 0, y: game.dimensions.y}, pt2: {x:game.dimensions.x, y:game.dimensions.y} })

    var file_lines = level_str.split('\n');
    // console.log(file_lines)
    for (var i=0; i<file_lines.length; i++ ) {
      var splits = file_lines[i].split(' ');
      if (splits.length <2 ) continue;
      if (splits[0] == "lines") {
        var points = file_lines[i].split('[')[1].split(']')[0].split(',')
        // console.log("Lines:", points)
        for (var j=0; j<points.length; j++) {
          var nums = points[j].split(' ');
          var point1 = {x:parseFloat(nums[0]), y:parseFloat(nums[1])}
          var point2 = {x:parseFloat(nums[2]), y:parseFloat(nums[3])}
          new_level.lines.push({pt1:point1, pt2:point2})
        }
        // console.log("Level lines:",new_level.lines)
      }
      else if (splits[0] == "circles") {
        var circles = file_lines[i].split('[')[1].split(']')[0].split(',')
        for (var j=0; j<circles.length; j++) {
          var values = circles[j].split(' ')
          var center = {x:parseFloat(values[0]),y:parseFloat(values[1])}
          var vel = {x:parseFloat(values[2]),y:parseFloat(values[3])}
          // console.log("Game dims:",game.dimensions,"(",j,")")
          var args = {gameSize:game.dimensions, center:center, velocity:vel}
          var circle = new game.Circle(args)
          new_level.circles.push(circle)
        }
      }
      else if (splits[0] == "num_rand_circles") {
        new_level.num_rand_circles = parseInt(splits[1].trim());
      }
      else if (splits[0] == "primaryWeapon") {
        if (!window[splits[1].trim()]) {
          console.log("Primary failed on:",splits[1])
        }
        new_level.primaryWeapon = window[splits[1].trim()]
        // console.log("Primary:",new_level.primaryWeapon)
      }
      else if (splits[0] == "secondaryWeapon") {
        // console.log("Secondary:",new_level.secondaryWeapon)
        if (!window[splits[1].trim()]) {
          console.log("Secondary failed on:",splits[1])
        }
        new_level.secondaryWeapon = window[splits[1].trim()]
      }
      else if (splits[0] == "secretWeapon") {
        new_level.secretWeapon = window[splits[1].trim()]
      }
      else if (splits[0] == "powerup_drop_prob") {
        new_level.powerup_drop_prob = parseFloat(splits[1].trim())
      }
      else if (splits[0] == "powerups") {
        var powerups = file_lines[i].split('[')[1].split(']')[0].split(' ')
        for (var j=0; j<powerups.length; j++) {
          new_level.powerups.push(window[powerups[j]])  
        }
      }
      else if (splits[0] == "powerup_probs") {
        var powerup_probs = file_lines[i].split('[')[1].split(']')[0].split(' ')
        for (var j=0; j<powerup_probs.length; j++) {
          new_level.powerup_probs.push(parseFloat(powerup_probs[j]))  
        }
      }
      else {
        // console.log("Ignoring line:",file_lines[i])
      }
    }
    return new_level
  }
  
  game.buildLevels = function() 
  {
    return [  
      //-----------------//
      //---- LEVEL 0 ----//
      //-----------------//
      new Level( 
      {
        // Set up the border lines.
        lines: [
          //outer border
          { pt1: { x: 0, y: 0 }, pt2: { x: 0, y: game.screen.canvas.height } },
          { pt1: { x: 0, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: game.screen.canvas.height } },
          { pt1: { x: game.screen.canvas.width, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: 0 } },
          { pt1: { x: game.screen.canvas.width, y: 0 }, pt2: { x: 0, y: 0 } },

          //line above weapon info text
          { pt1: { x: 0, y: game.dimensions.y}, pt2: {x:game.dimensions.x, y:game.dimensions.y} },
        ],

        circles: [
          {
            gameSize: game.dimensions,
            center: { x: game.dimensions.x/2, y: game.dimensions.y/3 },
            velocity: { x: 1, y: 0 }
          },
        ],

        // antiGravityWells: [
        //   { center: { x: game.dimensions.x/2, y: game.dimensions.y-50 }, direction: { x: 0, y: -2 }, acceleration: 0.1 }
        // ],

        num_rand_circles: 0, // these will be created in addition to the ones defined above

        primaryWeapon: Pistol,
        secondaryWeapon: Fish,
        secretWeapon: FlameThrower,

        powerup_drop_prob: 0,
        powerups: [],
        powerup_probs: []
      }),
      //-------- END LEVEL 0 ---------//

      //-----------------//
      //---- LEVEL 1 ----//
      //-----------------//
      new Level(
      {
        // Set up the border lines.
        lines: [
          //outer border
          { pt1: { x: 0, y: 0 }, pt2: { x: 0, y: game.screen.canvas.height } },
          { pt1: { x: 0, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: game.screen.canvas.height } },
          { pt1: { x: game.screen.canvas.width, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: 0 } },
          { pt1: { x: game.screen.canvas.width, y: 0 }, pt2: { x: 0, y: 0 } },

          //line above weapon info text
          { pt1: { x: 0, y: game.dimensions.y}, pt2: {x:game.dimensions.x, y:game.dimensions.y} },

          // low lines
          { pt1: { x: game.dimensions.x/8, y: game.dimensions.y*7/8}, pt2: {x:game.dimensions.x/3, y:game.dimensions.y*7/8} },
          { pt1: { x: game.dimensions.x*2/3, y: game.dimensions.y*7/8}, pt2: {x:game.dimensions.x*7/8, y:game.dimensions.y*7/8} },
        ],

        circles: [
          {
            gameSize: game.dimensions,
            center: { x: game.dimensions.x/2+20, y: game.dimensions.y/5 },
            velocity: { x: 2, y: 0 }
          },
          {
            gameSize: game.dimensions,
            center: { x: game.dimensions.x/2-20, y: game.dimensions.y/5 },
            velocity: { x: -2, y: 0 }
          },
          {
            gameSize: game.dimensions,
            center: { x: game.dimensions.x/2, y: game.dimensions.y/5 },
            velocity: { x: 0, y: 2 }
          },
        ],
        num_rand_circles: 1, // these will be created in addition to the ones defined above

        primaryWeapon: Pistol,
        secondaryWeapon: SMG,
        secretWeapon: MultiMissileLauncher,

        powerup_drop_prob: 0.5,
        powerups: [SMG, MissileLauncher, FlameThrower],
        powerup_probs: [50, 25, 25]
      }),
      //-------- END LEVEL 1 ---------//

      //-----------------//
      //---- LEVEL 2 ----//
      //-----------------//
      new Level(
      {
        // Set up the border lines.
        lines: [
          //outer border
          { pt1: { x: 0, y: 0 }, pt2: { x: 0, y: game.screen.canvas.height } },
          { pt1: { x: 0, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: game.screen.canvas.height } },
          { pt1: { x: game.screen.canvas.width, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: 0 } },
          { pt1: { x: game.screen.canvas.width, y: 0 }, pt2: { x: 0, y: 0 } },

          //line above weapon info text
          { pt1: { x: 0, y: game.dimensions.y}, pt2: {x:game.dimensions.x, y:game.dimensions.y} },

          // high line
          // { pt1: { x: game.dimensions.x/8, y: game.dimensions.y/3}, pt2: {x:game.dimensions.x/3, y:game.dimensions.y/3} },
          { pt1: { x: game.dimensions.x*5/8, y: game.dimensions.y*3/8}, pt2: {x:game.dimensions.x*7/8, y:game.dimensions.y*3/8} },

          // highish line
          { pt1: { x: game.dimensions.x/2, y: game.dimensions.y/2}, pt2: {x:game.dimensions.x*3/4, y:game.dimensions.y/2} },

          // middle line
          { pt1: { x: game.dimensions.x*3/8, y: game.dimensions.y*5/8}, pt2: {x:game.dimensions.x*5/8, y:game.dimensions.y*5/8} },

          // lowish line
          { pt1: { x: game.dimensions.x*1/4, y: game.dimensions.y*3/4}, pt2: {x:game.dimensions.x/2, y:game.dimensions.y*3/4} },

          // low lines
          { pt1: { x: game.dimensions.x/8, y: game.dimensions.y*7/8}, pt2: {x:game.dimensions.x*3/8, y:game.dimensions.y*7/8} },
        ],

        circles: [],
        
        num_rand_circles: 8, // these will be created in addition to the ones defined above
        
        primaryWeapon: Pistol,
        secondaryWeapon: SMG,
        secretWeapon: MultiMissileLauncher,

        powerup_drop_prob: 0.6,
        powerups: [SMG, FlameThrower, GatlingGun],
        powerup_probs: [33, 33, 33]
      }),
      //-------- END LEVEL 2 ---------//

      //-----------------//
      //---- LEVEL 3 ----//
      //-----------------//
      new Level(
      {
        // Set up the border lines.
        lines: [
          //outer border
          { pt1: { x: 0, y: 0 }, pt2: { x: 0, y: game.screen.canvas.height } },
          { pt1: { x: 0, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: game.screen.canvas.height } },
          { pt1: { x: game.screen.canvas.width, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: 0 } },
          { pt1: { x: game.screen.canvas.width, y: 0 }, pt2: { x: 0, y: 0 } },

          //line above weapon info text
          { pt1: { x: 0, y: game.dimensions.y}, pt2: {x:game.dimensions.x, y:game.dimensions.y} },

          //evil line
          { pt1: { x: 0, y: game.dimensions.y/3}, pt2: {x:game.dimensions.x, y:game.dimensions.y/3} }, 

          // lowish line
          { pt1: { x: game.dimensions.x/3, y: game.dimensions.y*3/4}, pt2: {x:game.dimensions.x*2/3, y:game.dimensions.y*3/4} },

          // low lines
          { pt1: { x: game.dimensions.x/8, y: game.dimensions.y*7/8}, pt2: {x:game.dimensions.x*3/8, y:game.dimensions.y*7/8} },
          { pt1: { x: game.dimensions.x*5/8, y: game.dimensions.y*7/8}, pt2: {x:game.dimensions.x*7/8, y:game.dimensions.y*7/8} },
        ],

        circles: [],
        num_rand_circles: 8, // these will be created in addition to the ones defined above
        
        primaryWeapon: FlameThrower,
        secondaryWeapon: Fish,
        secretWeapon: MultiMissileLauncher,

        powerup_drop_prob: 0.7,
        powerups: [SMG, MissileLauncher, FlameThrower, MultiMissileLauncher, GatlingGun],
        powerup_probs: [2, 2, 2, 2, 92]
      }),
      //-------- END LEVEL 3 ---------//

      //-----------------//
      //---- LEVEL 4 ----//
      //-----------------//
      new Level(
      {
        // Set up the border lines.
        lines: [
          //outer border
          { pt1: { x: 0, y: 0 }, pt2: { x: 0, y: game.screen.canvas.height } },
          { pt1: { x: 0, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: game.screen.canvas.height } },
          { pt1: { x: game.screen.canvas.width, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: 0 } },
          { pt1: { x: game.screen.canvas.width, y: 0 }, pt2: { x: 0, y: 0 } },

          //line above weapon info text
          { pt1: { x: 0, y: game.dimensions.y}, pt2: {x:game.dimensions.x, y:game.dimensions.y} },

          // middle lines:
          { pt1: { x: game.dimensions.x/6, y: game.dimensions.y/3}, pt2: {x: game.dimensions.x/3, y:game.dimensions.y/3} },
          { pt1: { x: game.dimensions.x/2, y: game.dimensions.y/3}, pt2: {x: game.dimensions.x*(2/3), y:game.dimensions.y/3} },
          { pt1: { x: game.dimensions.x*5/6, y: game.dimensions.y/3}, pt2: {x: game.dimensions.x, y:game.dimensions.y/3} },
        ],

        num_rand_circles: 12,
        
        primaryWeapon: MultiMissileLauncher,
        secondaryWeapon: MultiMissileLauncher,
        secretWeapon: MultiMissileLauncher,

        powerup_drop_prob: 0.85,
        powerups: [SMG, MissileLauncher, FlameThrower, MultiMissileLauncher, GatlingGun, NewLife],
        powerup_probs: [17, 17, 17, 17, 17, 15]
      }),
      //-------- END LEVEL 4 ---------//

      //-----------------//
      //---- LEVEL 5 ----//
      //-----------------//
      new Level(
      {
        // Set up the border lines.
        lines: [
          //outer border
          { pt1: { x: 0, y: 0 }, pt2: { x: 0, y: game.screen.canvas.height } },
          { pt1: { x: 0, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: game.screen.canvas.height } },
          { pt1: { x: game.screen.canvas.width, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: 0 } },
          { pt1: { x: game.screen.canvas.width, y: 0 }, pt2: { x: 0, y: 0 } },

          //line above weapon info text
          { pt1: { x: 0, y: game.dimensions.y}, pt2: {x:game.dimensions.x, y:game.dimensions.y} },

          // random lines:
          { pt1: { x: game.dimensions.x/Math.floor(Math.random()*(11)), y: game.dimensions.y/Math.floor(Math.random()*(11))}, pt2: {x: game.dimensions.x/Math.floor(Math.random()*(11)), y:game.dimensions.y/Math.floor(Math.random()*(11))} },
          { pt1: { x: game.dimensions.x/Math.floor(Math.random()*(11)), y: game.dimensions.y/Math.floor(Math.random()*(11))}, pt2: {x: game.dimensions.x/Math.floor(Math.random()*(11)), y:game.dimensions.y/Math.floor(Math.random()*(11))} },
          { pt1: { x: game.dimensions.x/Math.floor(Math.random()*(11)), y: game.dimensions.y/Math.floor(Math.random()*(11))}, pt2: {x: game.dimensions.x/Math.floor(Math.random()*(11)), y:game.dimensions.y/Math.floor(Math.random()*(11))} },
        ],

        num_rand_circles: Math.floor(Math.random()*(50-20)+20),

        primaryWeapon: MultiMissileLauncher,
        secondaryWeapon: MultiMissileLauncher,
        secretWeapon: MultiMissileLauncher,

        powerup_drop_prob: 0.95,
        powerups: [MultiMissileLauncher, NewLife],
        powerup_probs: [80, 20]
      }),
      //-------- END LEVEL 5 ---------//

      //-----------------//
      //---- LEVEL 6 ----//
      //-----------------//
      new Level(
      {
        // Set up the border lines.
        lines: [
          //outer border
          { pt1: { x: 0, y: 0 }, pt2: { x: 0, y: game.screen.canvas.height } },
          { pt1: { x: 0, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: game.screen.canvas.height } },
          { pt1: { x: game.screen.canvas.width, y: game.screen.canvas.height }, pt2: { x: game.screen.canvas.width, y: 0 } },
          { pt1: { x: game.screen.canvas.width, y: 0 }, pt2: { x: 0, y: 0 } },

          //line above weapon info text
          { pt1: { x: 0, y: game.dimensions.y}, pt2: {x:game.dimensions.x, y:game.dimensions.y} },

          // Left Box:
          { pt1: { x: game.dimensions.x/5-30, y: game.dimensions.y/8-30}, pt2: {x: game.dimensions.x/5+30, y: game.dimensions.y/8-30} },
          { pt1: { x: game.dimensions.x/5+30, y: game.dimensions.y/8-30}, pt2: {x: game.dimensions.x/5+30, y: game.dimensions.y/8+30} },
          { pt1: { x: game.dimensions.x/5+30, y: game.dimensions.y/8+30}, pt2: {x: game.dimensions.x/5-30, y: game.dimensions.y/8+30} },
          { pt1: { x: game.dimensions.x/5-30, y: game.dimensions.y/8+30}, pt2: {x: game.dimensions.x/5-30, y: game.dimensions.y/8-30} },

          // Right Box:
          { pt1: { x: game.dimensions.x*4/5-30, y: game.dimensions.y/8-30}, pt2: {x: game.dimensions.x*4/5+30, y: game.dimensions.y/8-30} },
          { pt1: { x: game.dimensions.x*4/5+30, y: game.dimensions.y/8-30}, pt2: {x: game.dimensions.x*4/5+30, y: game.dimensions.y/8+30} },
          { pt1: { x: game.dimensions.x*4/5+30, y: game.dimensions.y/8+30}, pt2: {x: game.dimensions.x*4/5-30, y: game.dimensions.y/8+30} },
          { pt1: { x: game.dimensions.x*4/5-30, y: game.dimensions.y/8+30}, pt2: {x: game.dimensions.x*4/5-30, y: game.dimensions.y/8-30} },

          //bottom lines
          { pt1: { x: game.dimensions.x/2-15, y: game.dimensions.y-63}, pt2: {x: game.dimensions.x/2+15, y: game.dimensions.y-63} },
          // { pt1: { x: game.dimensions.x/2+45, y: game.dimensions.y-63}, pt2: {x: game.dimensions.x/2+15, y: game.dimensions.y-63} },

          // next level
          { pt1: { x: game.dimensions.x/2-60, y: game.dimensions.y-126}, pt2: {x: game.dimensions.x/2-90, y: game.dimensions.y-126} },

          { pt1: { x: game.dimensions.x/2-180, y: game.dimensions.y-75}, pt2: {x: game.dimensions.x/2-210, y: game.dimensions.y-75} },
          { pt1: { x: game.dimensions.x/2-300, y: game.dimensions.y-75}, pt2: {x: game.dimensions.x/2-330, y: game.dimensions.y-75} },
          { pt1: { x: 5, y: game.dimensions.y-135}, pt2: {x: 35, y: game.dimensions.y-135} },
          { pt1: { x: 5, y: game.dimensions.y-198}, pt2: {x: 35, y: game.dimensions.y-198} },
          { pt1: { x: 5, y: game.dimensions.y-261}, pt2: {x: 35, y: game.dimensions.y-261} },
          { pt1: { x: 5, y: game.dimensions.y-324}, pt2: {x: 35, y: game.dimensions.y-324} },
          { pt1: { x: 5, y: game.dimensions.y-387}, pt2: {x: 35, y: game.dimensions.y-387} },
          { pt1: { x: game.dimensions.x/2-300, y: game.dimensions.y-387}, pt2: {x: game.dimensions.x/2-330, y: game.dimensions.y-387} },
          { pt1: { x: game.dimensions.x/2-180, y: game.dimensions.y-387}, pt2: {x: game.dimensions.x/2+180, y: game.dimensions.y-387} },
        ],

        circles: [
          {
            gameSize: game.dimensions,
            center: { x: game.dimensions.x/2+20, y: game.dimensions.y/10 },
            velocity: { x: 2, y: 0 }
          },
          {
            gameSize: game.dimensions,
            center: { x: game.dimensions.x/2-20, y: game.dimensions.y/10 },
            velocity: { x: -2, y: 0 }
          },
          {
            gameSize: game.dimensions,
            center: { x: game.dimensions.x/2, y: game.dimensions.y/5 },
            velocity: { x: 0, y: 2 }
          },

          //right boxed-in circle
          {
            gameSize: game.dimensions,
            center: { x: game.dimensions.x/5, y: game.dimensions.y/8 },
            velocity: { x: 1, y: 1 }
          },

          //left boxed-in circle
          {
            gameSize: game.dimensions,
            center: { x: game.dimensions.x*4/5, y: game.dimensions.y/8 },
            velocity: { x: -1, y: 1 }
          },
        ],

        num_rand_circles: 2,

        primaryWeapon: FlameThrower,
        secondaryWeapon: FlameThrower,
        secretWeapon: MultiMissileLauncher,

        powerup_drop_prob: 0.5,
        powerups: [FlameThrower, NewLife],
        powerup_probs: [99, 1]
      }),
      //-------- END LEVEL 5 ---------//
    ];
  }
  return game;
})(Game || {});
