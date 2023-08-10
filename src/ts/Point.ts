const NS = "http://www.w3.org/2000/svg";

class Point {
	constructor(
		private id: number,
		public x: number,
		public y: number,
		public radius: number,
		public color: string,
		private circle: SVGCircleElement = document.createElementNS(NS, "circle"),
		private visible: boolean = true,
		private visibleLabel: boolean = true,
		private label: SVGTextElement = document.createElementNS(NS, "text"),
		public angle: number | null = null
	) {
		this.circle = document.createElementNS(NS, "circle");
		this.label = document.createElementNS(NS, "text");
	}

	addToCanvas = (svg: HTMLElement) => {
		this.circle.setAttributeNS(null, "cx", this.x.toString());
		this.circle.setAttributeNS(null, "cy", this.y.toString());
		this.circle.setAttributeNS(null, "r", this.radius.toString());
		this.circle.setAttributeNS(null, "fill", this.color);
		svg.appendChild(this.circle);

		this.label.setAttributeNS(null, "x", (this.x - 4).toString());
		this.label.setAttributeNS(null, "y", (this.y - 8).toString());
		this.label.setAttributeNS(null, "fill", "crimson");
		this.label.setAttributeNS(null, "family", "sans-serif");
		this.label.setAttributeNS(null, "font-size", "12px");
		this.label.appendChild(document.createTextNode(this.id.toString()));
		svg.appendChild(this.label);
	};

	setVisible = (visible: boolean) => {
		if (visible && !this.visible) {
			this.circle.setAttributeNS(null, "fill", this.color);
			this.label.setAttributeNS(null, "fill", "crimson");
			this.visible = true;
			this.visibleLabel = true;
		} else if (!visible && this.visible) {
			this.circle.setAttributeNS(null, "fill", "transparent");
			this.label.setAttributeNS(null, "fill", "transparent");
			this.visible = false;
			this.visibleLabel = false;
		}
	};

	toggleLabel = () => {
		if (!this.visibleLabel) {
			this.label.setAttributeNS(null, "fill", "crimson");
			this.visibleLabel = true;
		} else {
			this.label.setAttributeNS(null, "fill", "transparent");
			this.visibleLabel = false;
		}
	};
}

export default Point;
