/**
 * Based on: https://github.com/twohiccups/Ear-Clipping
 *
 * Still working on some changes to the code
 */

import "../css/global.css";
import BULL from "./prefabs/bull.js";
import DOCE from "./prefabs/doce.js";
import SAW from "./prefabs/saw.js";
import OCTAGON from "./prefabs/octagon.js";

const NS = "http://www.w3.org/2000/svg";
const CANVAS = document.getElementById("triangulation");
const START_BUTTON = document.querySelector("#start");
const LABELS_BUTTON = document.querySelector("#labels");
const CLEAR_BUTTON = document.querySelector("#clear");
const REVERSE_BUTTON = document.querySelector("#reverse");
// const STEP_BUTTON = document.querySelector("#step");
const BULL_BUTTON = document.querySelector("#bull");
const DOCE_BUTTON = document.querySelector("#doce");
const SAW_BUTTON = document.querySelector("#saw");
const OCTAGON_BUTTON = document.querySelector("#octagon");

let ORIGINAL_POINTS = [];
let POINTS = [];
const LABELS = [];

START_BUTTON.addEventListener("click", startClipping);
LABELS_BUTTON.addEventListener("click", toggleLabels);
CLEAR_BUTTON.addEventListener("click", reset);
BULL_BUTTON.addEventListener("click", () => {
	triangulatePrefab(BULL);
});
DOCE_BUTTON.addEventListener("click", () => {
	triangulatePrefab(DOCE);
});
SAW_BUTTON.addEventListener("click", () => {
	triangulatePrefab(SAW);
});
OCTAGON_BUTTON.addEventListener("click", () => {
	triangulatePrefab(OCTAGON);
});
REVERSE_BUTTON.addEventListener("click", () => {
	CANVAS.innerHTML = "";
	POINTS = [...ORIGINAL_POINTS];
	POINTS.reverse();
	triangulatePrefab([...POINTS]);
});

CANVAS.addEventListener("click", addPoint);

function addPoint(event) {
	POINTS.push(createPoint(event.offsetX, event.offsetY));
	if (POINTS.length > 1) {
		connectPoints(POINTS[POINTS.length - 1], POINTS[POINTS.length - 2]);
	}
}

function startClipping() {
	if (POINTS.length > 2) {
		ORIGINAL_POINTS = [...POINTS];
		// Close the loop connecting last point to the first
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
		LABELS.push(textNode);
		points[i].id = i;
	}
}

function toggleLabels() {
	if (LABELS.length == 0) return;

	let fill;
	if (LABELS[0].getAttribute("fill") == "red") {
		fill = "transparent";
	} else {
		fill = "red";
	}
	for (let i = 0; i < LABELS.length; i++) {
		LABELS[i].setAttributeNS(null, "fill", fill);
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
}

function getRandomColor() {
	const letters = "789ABCDEF";
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

function getAngle(pointA, pointB, pointC) {
	const temp = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) - Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
	return temp < 0 ? Math.PI * 2 + temp : temp;
}

function getAngleRadians(pointA, pointB, pointC) {
	const AB = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
	const BC = Math.sqrt(Math.pow(pointB.x - pointC.x, 2) + Math.pow(pointB.y - pointC.y, 2));
	const AC = Math.sqrt(Math.pow(pointC.x - pointA.x, 2) + Math.pow(pointC.y - pointA.y, 2));
	return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
}

function getAngleDegrees(pointA, pointB, pointC) {
	return getAngleRadians(pointA, pointB, pointC) * (180 / Math.PI);
}

function measureAngles(points) {
	for (let i = 0; i < points.length + 1; i++) {
		points[(i + 1) % points.length].angle =
			(getAngle(points[i % points.length], points[(i + 1) % points.length], points[(i + 2) % points.length]) * 180) / Math.PI;
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

	if (getAngle(points[0], points[1], points[2]) > Math.PI) {
		points.reverse();
	}

	let i = 1;
	const TRIANGLES = [];

	labelPoints(points);
	measureAngles(points);

	while (points.length > 3) {
		let pointA = points[i % points.length];
		let pointB = points[(i + 1) % points.length];
		let pointC = points[(i + 2) % points.length];

		if (getAngle(pointA, pointB, pointC) < Math.PI) {
			const tempTriangle = new Triangle(pointA, pointB, pointC);
			let isEar = true;
			for (var j = i + 3; j < points.length + i + 3; j++) {
				if (isInsideTriangle(tempTriangle, points[j % points.length])) {
					isEar = false;
				}
			}
			if (isEar) {
				points.splice((i + 1) % points.length, 1); // erase middle point
				TRIANGLES.push(tempTriangle);
			}
		} else {
			if (i > points.length * points.length * points.length) {
				console.log("BROKEN");
				break;
			}
		}
		i++;
	}

	TRIANGLES.push(new Triangle(points[0], points[1], points[2]));

	setTimeout(() => {
		drawTriangles(TRIANGLES);
	}, 500);
}

function triangulatePrefab(prefab) {
	reset();
	POINTS.length = 0;
	for (let i = 0; i < prefab.length; i++) {
		POINTS.push(createPoint(prefab[i].x, prefab[i].y));
	}
	for (let i = 0; i < POINTS.length - 1; i++) {
		connectPoints(POINTS[i], POINTS[i + 1]);
	}
	connectPoints(POINTS[POINTS.length - 1], POINTS[0]);
}

function reset() {
	POINTS.length = 0;
	CANVAS.innerHTML = "";
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

class Point {
	constructor(x, y, c) {
		this.x = x;
		this.y = y;
		this.c = c;
	}
}