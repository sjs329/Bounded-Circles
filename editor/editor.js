var Editor = (function(editor) {
  editor.beginEditor = function(evt, firstStart) {
      editor.canvas = document.getElementById('bounded_circles')
      editor.screen = editor.canvas.getContext('2d');
      editor.dimensions = { x: editor.screen.canvas.width, y: editor.screen.canvas.height - 50};
      editor.editor_mode = true;
      editor.selected_item = null;


      if (typeof firstStart == 'undefined' || firstStart == true) {
        editor.saved = false;
        
        //draw border
        editor.non_game_lines = []
        //outer border
        editor.non_game_lines.push(new editor.EditorLine({ x: 0, y: 0 }, { x: 0, y: editor.screen.canvas.height }));
        editor.non_game_lines.push(new editor.EditorLine({ x: 0, y: editor.screen.canvas.height }, { x: editor.screen.canvas.width, y: editor.screen.canvas.height }));
        editor.non_game_lines.push(new editor.EditorLine({ x: editor.screen.canvas.width, y: editor.screen.canvas.height }, { x: editor.screen.canvas.width, y: 0 }));
        editor.non_game_lines.push(new editor.EditorLine({ x: editor.screen.canvas.width, y: 0 }, { x: 0, y: 0 }));

        //line above weapon info text
        editor.non_game_lines.push(new editor.EditorLine({ x: 0, y: editor.dimensions.y}, {x:editor.dimensions.x, y:editor.dimensions.y}));
      
        for (var i=0; i<editor.non_game_lines.length; i++) {
          editor.non_game_lines[i].draw(editor.screen);
        }

        var mouser = new Mouser(editor); //.canvas, editor.screen);
      }    
  };

  window.addEventListener('load', editor.beginEditor);
  return editor;
})(Game || {});

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function selectItem() {
  document.getElementById("itemDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
