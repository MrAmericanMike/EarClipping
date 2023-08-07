const NS = "http://www.w3.org/2000/svg";

class Point {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.visible = true;
	}

	addToCanvas = (canvas) => {
		this.point = document.createElementNS(NS, "circle");
		this.point.setAttributeNS(null, "cx", this.x);
		this.point.setAttributeNS(null, "cy", this.y);
		this.point.setAttributeNS(null, "r", this.radius);
		this.point.setAttributeNS(null, "fill", this.color);
		canvas.appendChild(this.point);
	};

	setVisible = (visible) => {
		if (visible && !this.visible) {
			this.point.setAttributeNS(null, "fill", this.color);
			this.visible = true;
		} else if (!visible && this.visible) {
			this.point.setAttributeNS(null, "fill", "transparent");
			this.visible = false;
		}
	};
}

export default Point;
