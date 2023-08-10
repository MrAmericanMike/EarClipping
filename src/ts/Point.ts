const NS = "http://www.w3.org/2000/svg";

class Point {
	constructor(
		public x: number,
		public y: number,
		public radius: number,
		public color: string,
		private visible: boolean = true,
		private circle: SVGCircleElement = document.createElementNS(NS, "circle"),
		public angle: number | null = null
	) {
		this.circle = document.createElementNS(NS, "circle");
	}

	addToCanvas = (svg: HTMLElement) => {
		this.circle.setAttributeNS(null, "cx", this.x.toString());
		this.circle.setAttributeNS(null, "cy", this.y.toString());
		this.circle.setAttributeNS(null, "r", this.radius.toString());
		this.circle.setAttributeNS(null, "fill", this.color);
		svg.appendChild(this.circle);
	};

	setVisible = (visible: boolean) => {
		if (visible && !this.visible) {
			this.circle.setAttributeNS(null, "fill", this.color);
			this.visible = true;
		} else if (!visible && this.visible) {
			this.circle.setAttributeNS(null, "fill", "transparent");
			this.visible = false;
		}
	};
}

export default Point;
