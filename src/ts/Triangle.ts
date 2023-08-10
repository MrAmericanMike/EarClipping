import Point from "./Point";

class Triangle {
	constructor(public pointA: Point, public pointB: Point, public pointC: Point) {}

	area() {
		return (
			(this.pointA.x * (this.pointB.y - this.pointC.y) +
				this.pointB.x * (this.pointC.y - this.pointA.y) +
				this.pointC.x * (this.pointA.y - this.pointB.y)) /
			2
		);
	}
}

export default Triangle;
