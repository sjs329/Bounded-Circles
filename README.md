# Bounded-Circles
Javascript game inspired by Mary Rose Cook (http://maryrosecook.com/)

*TODO:*
* Fix circle-bouncing-off-circle physics
  * Some collisions just don't look right
  * balls sometimes get stuck together and do weird stuff
  * Add mass into momentum equations so we can affect circle velocity due to bullets
* Add start screen 
  * Make a button press to start? Or maybe just a key
  * High score wall?
* Allow shooting after you've won, before you restart the game. (not sure what's preventing this at the moment)
* Organize game logic better
  * I think every physical object should get stuck into one array and update loop will just call physics on each of those objects, plus call their internal update method
* Figure out how to make header files? or at least pull different sections into different files
  * E.g. have a weapons file and an objects file, etc..
* Add more fun weapons

*Eventually*
* Add levels! and a storyline? maybe. Not sure if I care enough haha
* Should definitely add levels (lvl 1 = 1 circle, lvl 2 = 2 circles etc.) -Matt
* Item drops. Start with pistol and every time you destroy a circle there is a chance for a random item / weapon drop -M
  * this is in most recent commit. Only have the pistol at the beginning, each time a circle dies there's a random chance (currently 5%, but it seems to happen much more often) that it will drop a powerup (purple circle with gold square). Currently the powerup with either give you a missle launcher or flamethrower with 50% probability each. Getting a new powerup may change the weapon again. Secondary weapon gets set to space bar (primary is k). -S
  * TODO: make separate powerups for each weapon type so you can choose to get it or not -S
* Item drops: weapons, lives, abilities etc. -M

*Potentially*
* What if we changed the scoring system to make it a more skill based instead of luck based. -M
  * Could do something like you get points for each kill, and higher points the earlier the kills are? Plus decrease score a little bit each time you fire a shot? (different weapons can decrease by different amounts based on how powerful they are. More powerful = larger decrease per fire). -S
* Create some algorithm to take Accuracy and time and output score -M
