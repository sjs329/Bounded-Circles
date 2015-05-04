var Game = (function(game) {
  ///*******************///
  ///***** LEVELS ******///
  ///*******************///

  game.screen;
  game.dimensions;
  game.levels;


  var Level = function(args) { //level_num, lines, num_circles, circles, player, primaryWeapon, secondaryWeapon, secretWeapon){
    this.lines = args.lines;
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
          new game.Line({ x: 0, y: 0 },{ x: 0, y: game.screen.canvas.height }),
          new game.Line({ x: 0, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: game.screen.canvas.height }),
          new game.Line({ x: game.screen.canvas.width, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: 0 }),
          new game.Line({ x: game.screen.canvas.width, y: 0 },{ x: 0, y: 0 }),
          new game.Line({ x: 0, y: game.dimensions.y}, {x:game.dimensions.x, y:game.dimensions.y}),

          // low lines:
          new game.Line({ x: game.dimensions.x/8, y: game.dimensions.y*7/8}, {x:game.dimensions.x/3, y:game.dimensions.y*7/8}),
          new game.Line({ x: game.dimensions.x*2/3, y: game.dimensions.y*7/8}, {x:game.dimensions.x*7/8, y:game.dimensions.y*7/8}),
        ],

        num_rand_circles: 1, // if this is zero, the circles array below should already be populated. if it's not zero, random circles will be added up to this amount
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
          new game.Line({ x: 0, y: 0 },{ x: 0, y: game.screen.canvas.height }),
          new game.Line({ x: 0, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: game.screen.canvas.height }),
          new game.Line({ x: game.screen.canvas.width, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: 0 }),
          new game.Line({ x: game.screen.canvas.width, y: 0 },{ x: 0, y: 0 }),
          new game.Line({ x: 0, y: game.dimensions.y}, {x:game.dimensions.x, y:game.dimensions.y}),
        ],

        num_rand_circles: 2,
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
          new game.Line({ x: 0, y: 0 },{ x: 0, y: game.screen.canvas.height }),
          new game.Line({ x: 0, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: game.screen.canvas.height }),
          new game.Line({ x: game.screen.canvas.width, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: 0 }),
          new game.Line({ x: game.screen.canvas.width, y: 0 },{ x: 0, y: 0 }),
          new game.Line({ x: 0, y: game.dimensions.y}, {x:game.dimensions.x, y:game.dimensions.y}),

          // middle lines:
          new game.Line({ x: game.dimensions.x/8, y: game.dimensions.y/3}, {x:game.dimensions.x/3, y:game.dimensions.y/3}),
          new game.Line({ x: game.dimensions.x*2/3, y: game.dimensions.y/3}, {x:game.dimensions.x*7/8, y:game.dimensions.y/3}),
        ],

        num_rand_circles: 8,
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
          new game.Line({ x: 0, y: 0 },{ x: 0, y: game.screen.canvas.height }),
          new game.Line({ x: 0, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: game.screen.canvas.height }),
          new game.Line({ x: game.screen.canvas.width, y: game.screen.canvas.height },{ x: game.screen.canvas.width, y: 0 }),
          new game.Line({ x: game.screen.canvas.width, y: 0 },{ x: 0, y: 0 }),
          new game.Line({ x: 0, y: game.dimensions.y}, {x:game.dimensions.x, y:game.dimensions.y}),

          // middle lines:
          new game.Line({ x: 0, y: game.dimensions.y/3}, {x:game.dimensions.x, y:game.dimensions.y/3}),
          // new game.Line({ x: game.dimensions.x*2/3, y: game.dimensions.y/3}, {x:game.dimensions.x*7/8, y:game.dimensions.y/3}),
        ],

        num_rand_circles: 8,
        primaryWeapon: FlameThrower,
        secondaryWeapon: Fish,
        secretWeapon: MultiMissileLauncher
      }),
      //-------- END LEVEL 3 ---------//
    ];
  }
  return game;
})(Game || {});
