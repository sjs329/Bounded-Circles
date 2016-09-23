var Editor = (function(editor) {
  editor.start = function() {
      editor.canvas = document.getElementById('bounded_circles')
      editor.screen = editor.canvas.getContext('2d');
      var font = { style: "50px Verdana", align: "center", color: "black" };
      editor.dimensions = { x: editor.screen.canvas.width,
                            y: editor.screen.canvas.height - 50 };
      var testing = new editor.Text("Hello World!",
              {x: editor.dimensions.x/2, y: editor.dimensions.y/4+10}, 0, font);
      testing.draw(editor.screen);
      var mouser = new Mouser(editor.canvas, editor.screen);
  };

  window.addEventListener('load', editor.start);
  return editor;
})(Game || {});
