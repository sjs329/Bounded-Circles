var Editor = (function(editor) {

	var id = 0;
	editor.EditorCircle = function (center, velocity, color) {
		this.center = center;
		this.velocity = velocity;
		this.private_radius = 10;
		this.private_color = (color || "green");
		this.private_id = id++;
	};

	editor.EditorCircle.prototype = {
		draw: function(screen) {
			//outline
		    screen.beginPath();
		    screen.strokeStyle = "black";
		    screen.arc(this.center.x, this.center.y, this.private_radius, 0, Math.PI * 2, true);
		    screen.closePath();
		    screen.stroke();

		    //inner circle
		    screen.beginPath();
		    screen.arc(this.center.x, this.center.y, this.private_radius, 0, Math.PI * 2, true);
		    screen.closePath();
		    screen.fillStyle = this.private_color;
		    screen.fill();

		    //draw velocity arrow
		    var line = {pt1:this.center, pt2: {x:this.center.x+(this.velocity.x*10), y:this.center.y+(this.velocity.y*10)}, color: "red"}
		    screen.beginPath();
		    screen.lineWidth = 1.5;
		    screen.moveTo(line.pt1.x, line.pt1.y);
		    screen.lineTo(line.pt2.x, line.pt2.y);
		    screen.closePath();
		    screen.strokeStyle = line.color;
		    screen.stroke();
		},

		drawSelected: function(screen) {
			//highlight circle
		    screen.beginPath();
		    screen.arc(this.center.x, this.center.y, this.private_radius+3, 0, Math.PI * 2, true);
		    screen.closePath();
		    screen.fillStyle = "rgba(0, 0, 255, 0.5)";
		    screen.fill();
		}
	};

	editor.EditorLine = function (pt1, pt2, color) {
		this.pt1 = pt1;
		this.pt2 = pt2;
		this.private_color = (color || "black");
		this.private_id = id++;
	};

	editor.EditorLine.prototype = {
		draw: function(screen) {
		    screen.beginPath();
		    screen.lineWidth = 1.5;
		    screen.moveTo(this.pt1.x, this.pt1.y);
		    screen.lineTo(this.pt2.x, this.pt2.y);
		    screen.closePath();
		    screen.strokeStyle = this.private_color;
		    screen.stroke();
		},

		drawSelected: function(screen) {
			screen.beginPath();
		    screen.lineWidth = 3;
		    screen.moveTo(this.pt1.x, this.pt1.y);
		    screen.lineTo(this.pt2.x, this.pt2.y);
		    screen.closePath();
		    screen.strokeStyle = "rgba(0, 0, 255, 0.5)";
		    screen.stroke();
		}
	};

	return editor;
})(Game || {});