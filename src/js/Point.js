const NS = "http://www.w3.org/2000/svg";

class Point {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
	}

	addToCanvas = (canvas) => {
		const POINT = document.createElementNS(NS, "circle");
		POINT.setAttributeNS(null, "cx", this.x);
		POINT.setAttributeNS(null, "cy", this.y);
		POINT.setAttributeNS(null, "r", this.radius);
		POINT.setAttributeNS(null, "fill", this.color);
		canvas.appendChild(POINT);
	};
}

export default Point;
