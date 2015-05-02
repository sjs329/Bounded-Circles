# Bounded-Circles
Javascript game inspired by Mary Rose Cook (http://maryrosecook.com/)

*TODO:*
* Fix circle-bouncing-off-circle physics
* * Add mass into momentum equations so we can affect circle velocity due to bullets
* Add start screen 
* * Make a button press to start? Or maybe just a key
* * Also allow pressing a button to restart the game instead of refreshing
* Organize game logic better
* * I think every physical object should get stuck into one array and update loop will just call physics on each of those objects, plus call their internal update method
* Figure out how to make header files? or at least pull different sections into different files
* * E.g. have a weapons file and an objects file, etc..
* Add more fun weapons

*Eventually*
* * Add levels! and a storyline? maybe. Not sure if I care enough haha
