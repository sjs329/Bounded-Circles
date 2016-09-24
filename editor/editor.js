var Editor = (function(editor) {
  editor.start = function() {
      editor.canvas = document.getElementById('bounded_circles')
      editor.screen = editor.canvas.getContext('2d');
      // var font = { style: "50px Verdana", align: "center", color: "black" };
      // editor.dimensions = { x: editor.screen.canvas.width,
      //                       y: editor.screen.canvas.height - 50 };
      // var testing = new editor.Text("Hello World!",
      //         {x: editor.dimensions.x/2, y: editor.dimensions.y/4+10}, 0, font);
      // testing.draw(editor.screen);
      editor.dimensions = { x: editor.screen.canvas.width, y: editor.screen.canvas.height - 50 };
      
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
  };

  editor.drawLine = function(line) {
    editor.screen.beginPath();
    editor.screen.lineWidth = 1.5;
    editor.screen.moveTo(line.pt1.x, line.pt1.y);
    editor.screen.lineTo(line.pt2.x, line.pt2.y);
    editor.screen.closePath();
    editor.screen.strokeStyle = "black";
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
  };

  window.addEventListener('load', editor.start);
  return editor;
})(Game || {});
