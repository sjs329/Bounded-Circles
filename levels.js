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
    this.num_rand_circles = args.num_rand_circles;
    this.primaryWeapon = args.primaryWeapon;
    this.secondaryWeapon = args.secondaryWeapon;
    this.secretWeapon = args.secretWeapon;
  };


  
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
        num_rand_circles: 0, // these will be created in addition to the ones defined above

        primaryWeapon: Pistol,
        secondaryWeapon: Fish,
        secretWeapon: FlameThrower
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
        secretWeapon: MultiMissileLauncher
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
        secretWeapon: MultiMissileLauncher
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
        secretWeapon: MultiMissileLauncher
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
        secretWeapon: MultiMissileLauncher
      }),
      //-------- END LEVEL 4 ---------//

      //-----------------//
      //---- LEVEL X ----//
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
        secretWeapon: MultiMissileLauncher
      }),
      //-------- END LEVEL 4 ---------//
    ];
  }
  return game;
})(Game || {});
