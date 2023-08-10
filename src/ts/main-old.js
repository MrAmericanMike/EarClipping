import "../css/global.css";
import BULL from "./bull.js";

const NS = "http://www.w3.org/2000/svg";
const CANVAS = document.getElementById("triangulation");
const START_BUTTON = document.querySelector("#start");
const LABELS_BUTTON = document.querySelector("#labels");
const CLEAR_BUTTON = document.querySelector("#clear");
const BULL_BUTTON = document.querySelector("#bull");

const POINTS = [];
const labels = [];

START_BUTTON.addEventListener("click", earClip);
LABELS_BUTTON.addEventListener("click", toggleLabels);
CLEAR_BUTTON.addEventListener("click", reset);
BULL_BUTTON.addEventListener("click", triangulateBull);

CANVAS.addEventListener("click", addPoint);

function addPoint(event) {
	POINTS.push(createPoint(event.offsetX, event.offsetY));
	if (POINTS.length > 1) {
		connectPoints(POINTS[POINTS.length - 1], POINTS[POINTS.length - 2]);
	}
}

function earClip() {
	if (POINTS.length > 2) {
		connectPoints(POINTS[POINTS.length - 1], POINTS[0]);
		triangulate(POINTS);
	} else {
		alert("Needs at least three points");
	}
}

function createPoint(x, y) {
	const cir = document.createElementNS(NS, "circle");
	cir.setAttributeNS(null, "cx", x);
	cir.setAttributeNS(null, "cy", y);
	cir.setAttributeNS(null, "r", 4);
	cir.setAttributeNS(null, "fill", "black");
	CANVAS.appendChild(cir);
	return new Point(x, y, cir);
}

function labelPoints(points) {
	for (let i = 0; i < points.length; i++) {
		let textNode = document.createElementNS(NS, "text");
		textNode.setAttributeNS(null, "x", points[i].x - 4);
		textNode.setAttributeNS(null, "y", points[i].y - 8);
		textNode.setAttributeNS(null, "fill", "crimson");
		textNode.setAttributeNS(null, "family", "sans-serif");
		textNode.setAttributeNS(null, "font-size", "12px");
		let text = document.createTextNode(i);
		textNode.appendChild(text);
		CANVAS.appendChild(textNode);
		labels.push(textNode);
		points[i].id = i;
	}
}

function toggleLabels() {
	if (labels.length == 0) return;

	let fill;
	if (labels[0].getAttribute("fill") == "red") {
		fill = "transparent";
	} else {
		fill = "red";
	}
	for (let i = 0; i < labels.length; i++) {
		labels[i].setAttributeNS(null, "fill", fill);
	}
}

function connectPoints(a, b) {
	const line = document.createElementNS(NS, "line");
	line.setAttributeNS(null, "x1", a.x);
	line.setAttributeNS(null, "y1", a.y);
	line.setAttributeNS(null, "x2", b.x);
	line.setAttributeNS(null, "y2", b.y);
	line.setAttributeNS(null, "stroke", "black");
	CANVAS.appendChild(line);
	return line;
}

function drawTriangle(triangle) {
	const polygon = document.createElementNS(NS, "polygon");
	polygon.setAttributeNS(
		null,
		"points",
		triangle.a.x + "," + triangle.a.y + " " + triangle.b.x + "," + triangle.b.y + " " + triangle.c.x + "," + triangle.c.y
	);
	polygon.setAttributeNS(null, "fill", getRandomColor());
	polygon.setAttributeNS(null, "stroke", "black");
	CANVAS.insertBefore(polygon, CANVAS.childNodes[0]);
	return polygon;
}

function getRandomColor() {
	const letters = "BCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 5)];
	}
	return color;
}

function drawTriangles(triangles) {
	function setDelay(i) {
		setTimeout(function () {
			drawTriangle(triangles[i]);
		}, i * 500);
	}
	for (let i = 0; i < triangles.length; i++) {
		setDelay(i);
	}
}

function triangulateBull() {
	reset();
	POINTS.length = 0;
	for (let i = 0; i < BULL.length; i++) {
		POINTS.push(createPoint(BULL[i].x, BULL[i].y));
	}
	for (let i = 0; i < POINTS.length - 1; i++) {
		connectPoints(POINTS[i], POINTS[i + 1]);
	}
	connectPoints(POINTS[POINTS.length - 1], POINTS[0]);
	triangulate(POINTS);
}

class Point {
	constructor(x, y, c) {
		this.x = x;
		this.y = y;
		this.c = c;
	}
}

function angle(a, b, c) {
	const temp = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
	return temp < 0 ? Math.PI * 2 + temp : temp;
}

class Triangle {
	constructor(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.area = function () {
			return (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2;
		};
	}
}

function measureAngles(points) {
	for (let i = 0; i < points.length + 1; i++) {
		points[(i + 1) % points.length].angle =
			(angle(points[i % points.length], points[(i + 1) % points.length], points[(i + 2) % points.length]) * 180) / Math.PI;
	}
}

function isInsideTriangle(triangle, point) {
	const areaA = new Triangle(triangle.a, triangle.b, point).area();
	const areaB = new Triangle(triangle.b, triangle.c, point).area();
	const areaC = new Triangle(triangle.c, triangle.a, point).area();
	return Math.sign(areaA) == Math.sign(areaB) && Math.sign(areaA) == Math.sign(areaC);
}

function triangulate(points) {
	if (points < 3) return;

	if (angle(points[0], points[1], points[2]) > Math.PI) {
		points.reverse();
	}

	let i = 1;
	let a, b, c;
	let triangles = [];

	labelPoints(points);
	measureAngles(points);
	while (points.length > 3) {
		a = points[i % points.length];
		b = points[(i + 1) % points.length];
		c = points[(i + 2) % points.length];

		if (angle(a, b, c) < Math.PI) {
			var tempTriangle = new Triangle(a, b, c);
			var isEar = true;
			for (var j = i + 3; j < points.length + i + 3; j++) {
				if (isInsideTriangle(tempTriangle, points[j % points.length])) isEar = false;
			}
			if (isEar) {
				points.splice((i + 1) % points.length, 1); // erase middle point
				triangles.push(tempTriangle);
			}
		}
		i++;
	}
	triangles.push(new Triangle(points[0], points[1], points[2]));
	setTimeout(() => {
		drawTriangles(triangles);
	}, 500);
}

function reset() {
	POINTS.length = 0;
	CANVAS.innerHTML = "";
}
