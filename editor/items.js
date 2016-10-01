var Editor = (function(editor) {

	var id = 0;
	editor.EditorCircle = function (center, velocity, color) {
		this.center = center;
		this.velocity = velocity;
		this.private_radius = 10;
		this.private_color = (color || "green");
		this.private_type = "Circle";
		this.private_id = id++;
	};

	editor.EditorCircle.prototype = {
		draw: function(screen) {
			//outline
		    screen.beginPath();
		    screen.strokeStyle = "black";
		    screen.arc(this.center.x, this.center.y, this.private_radius, 0, Math.PI * 2, true);
		    screen.closePath();
		    screen.lineWidth = 1.5;
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
		},

		toString: function() {
			return "" + this.center.x + " " + this.center.y + " " + this.velocity.x + " " +this.velocity.y;
		}
	};

	editor.EditorLine = function (pt1, pt2, color) {
		this.pt1 = pt1;
		this.pt2 = pt2;
		this.private_color = (color || "black");
		this.private_type = "Line";
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
		},

		toString: function() {
			return "" + this.pt1.x + " " + this.pt1.y + " " + this.pt2.x + " " + this.pt2.y;
		}
	};

	editor.EditorAntiGravityWell = function (center, direction, acceleration) {
		this.center = center;
	    this.direction = direction;
	    this.acceleration = acceleration
	    // this.private_acceleration_vector = matrix.multiply(this.direction, acceleration);
	    this.private_length = 50;
		this.private_type = "AntiGravityWell";
		this.private_id = id++;
	};

	editor.EditorAntiGravityWell.prototype = {
		draw: function(screen) {
		    //draw line perpendicular to direction
		    if (this.direction.x == 0 && this.direction.y ==0) {
		    	this.direction.y = 0.01
			}
		    this.direction = matrix.unitVector(this.direction)
		    var private_pt1 = {x: this.center.x + matrix.unitNormal(this.direction).x*this.private_length/2, y: this.center.y + matrix.unitNormal(this.direction).y*this.private_length/2};
	    	var private_pt2 = {x: this.center.x - matrix.unitNormal(this.direction).x*this.private_length/2, y: this.center.y - matrix.unitNormal(this.direction).y*this.private_length/2};
			var acceleration_vector = matrix.multiply(this.direction, this.acceleration);
			screen.strokeStyle = "blue";
			screen.beginPath();
			screen.lineWidth = 5;
			screen.moveTo(private_pt1.x, private_pt1.y);
			screen.lineTo(private_pt2.x, private_pt2.y);
			screen.closePath();
			screen.stroke();
			screen.strokeStyle = "cyan";
			screen.beginPath();
			screen.lineWidth = 1;
			screen.moveTo(private_pt1.x, private_pt1.y);
			screen.lineTo(private_pt2.x, private_pt2.y);
			screen.closePath();
			screen.stroke();

			//draw accel vector
			var line = {private_pt1:this.center, private_pt2: {x:this.center.x+(acceleration_vector.x*1000), y:this.center.y+(acceleration_vector.y*1000)}, color: "red"}
		    screen.beginPath();
		    screen.lineWidth = 1.5;
		    screen.moveTo(line.private_pt1.x, line.private_pt1.y);
		    screen.lineTo(line.private_pt2.x, line.private_pt2.y);
		    screen.closePath();
		    screen.strokeStyle = line.color;
		    screen.stroke();

		},

		drawSelected: function(screen) {
		    var private_pt1 = {x: this.center.x + matrix.unitNormal(this.direction).x*this.private_length/2, y: this.center.y + matrix.unitNormal(this.direction).y*this.private_length/2};
	    	var private_pt2 = {x: this.center.x - matrix.unitNormal(this.direction).x*this.private_length/2, y: this.center.y - matrix.unitNormal(this.direction).y*this.private_length/2};
			screen.beginPath();
		    screen.lineWidth = 10;
		    screen.moveTo(private_pt1.x, private_pt1.y);
		    screen.lineTo(private_pt2.x, private_pt2.y);
		    screen.closePath();
		    screen.strokeStyle = "rgba(0, 0, 255, 0.5)";
		    screen.stroke();
		},

		toString: function() {
			return "" + this.center.x + " " + this.center.y + " " + this.direction.x + " " + this.direction.y + " " + this.acceleration;
		}
	};

	return editor;
})(Game || {});