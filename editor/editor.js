var Editor = (function(editor) {
  editor.beginEditor = function(evt, firstStart) {
      editor.canvas = document.getElementById('bounded_circles')
      editor.screen = editor.canvas.getContext('2d');
      editor.dimensions = { x: editor.screen.canvas.width, y: editor.screen.canvas.height - 50 };
      editor.editor_mode = true;


      if (typeof firstStart == 'undefined' || firstStart == true) {
        editor.saved = false;
        
        //draw border
        editor.non_game_lines = []
        //outer border
        editor.non_game_lines.push({ pt1: { x: 0, y: 0 }, pt2: { x: 0, y: editor.screen.canvas.height } })
        editor.non_game_lines.push({ pt1: { x: 0, y: editor.screen.canvas.height }, pt2: { x: editor.screen.canvas.width, y: editor.screen.canvas.height } })
        editor.non_game_lines.push({ pt1: { x: editor.screen.canvas.width, y: editor.screen.canvas.height }, pt2: { x: editor.screen.canvas.width, y: 0 } })
        editor.non_game_lines.push({ pt1: { x: editor.screen.canvas.width, y: 0 }, pt2: { x: 0, y: 0 } })

        //line above weapon info text
        editor.non_game_lines.push({ pt1: { x: 0, y: editor.dimensions.y}, pt2: {x:editor.dimensions.x, y:editor.dimensions.y} })
      
        for (var i=0; i<editor.non_game_lines.length; i++) {
          editor.drawLine(editor.non_game_lines[i])
        }

        var mouser = new Mouser(editor); //.canvas, editor.screen);
      }    
  };

  editor.drawLine = function(line) {
    editor.screen.beginPath();
    editor.screen.lineWidth = 1.5;
    editor.screen.moveTo(line.pt1.x, line.pt1.y);
    editor.screen.lineTo(line.pt2.x, line.pt2.y);
    editor.screen.closePath();
    editor.screen.strokeStyle = line.color;
    editor.screen.stroke();
  };

  editor.drawCircle = function(circle) {
    editor.screen.beginPath();
    editor.screen.strokeStyle = "black";
    editor.screen.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2, true);
    editor.screen.closePath();
    editor.screen.stroke();

    editor.screen.beginPath();
    editor.screen.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2, true);
    editor.screen.closePath();
    editor.screen.fillStyle = "green";
    editor.screen.fill();

    //draw velocity arrow
    var line = {pt1:circle.center, pt2: {x:circle.center.x+circle.velocity.x*10, y:circle.center.y+circle.velocity.y*10}, color: "red"}
    editor.drawLine(line)
  };

  window.addEventListener('load', editor.beginEditor);
  return editor;
})(Game || {});

// /* When the user clicks on the button, 
// toggle between hiding and showing the dropdown content */
// function myFunction() {
//     document.getElementById("myDropdown").classList.toggle("show");
// }

// // Close the dropdown menu if the user clicks outside of it
// window.onclick = function(event) {
//   if (!event.target.matches('.dropbtn')) {

//     var dropdowns = document.getElementsByClassName("dropdown-content");
//     var i;
//     for (i = 0; i < dropdowns.length; i++) {
//       var openDropdown = dropdowns[i];
//       if (openDropdown.classList.contains('show')) {
//         openDropdown.classList.remove('show');
//       }
//     }
//   }
// }
