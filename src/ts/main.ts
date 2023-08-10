/**
 * Based on: https://github.com/twohiccups/Ear-Clipping
 *
 * Still working on some changes to the code
 */

import "../css/global.css";

import Point from "./Point.ts";
import Triangle from "./Triangle.ts";
import { Coordinates } from "./Types.ts";

import { BULL, TWELVE, OCTAGON, SAW } from "./prefabs/prefabs.ts";

const NS = "http://www.w3.org/2000/svg";
const SVG = document.getElementById("svg");
const START_BUTTON = document.querySelector("#start");
const LABELS_BUTTON = document.querySelector("#labels");
const CLEAR_BUTTON = document.querySelector("#clear");
const REVERSE_BUTTON = document.querySelector("#reverse");
// const STEP_BUTTON = document.querySelector("#step");
const BULL_BUTTON = document.querySelector("#bull");
const TWELVE_BUTTON = document.querySelector("#twelve");
const SAW_BUTTON = document.querySelector("#saw");
const OCTAGON_BUTTON = document.querySelector("#octagon");

let ORIGINAL_POINTS: Point[] = [];
let POINTS: Point[] = [];
const TRIANGLES: Triangle[] = [];

SVG!.addEventListener("click", addPointOnClick);

START_BUTTON!.addEventListener("click", startClipping);
LABELS_BUTTON!.addEventListener("click", toggleLabels);
CLEAR_BUTTON!.addEventListener("click", reset);
BULL_BUTTON!.addEventListener("click", () => {
	loadPrefab(BULL);
});
TWELVE_BUTTON!.addEventListener("click", () => {
	loadPrefab(TWELVE);
});
SAW_BUTTON!.addEventListener("click", () => {
	loadPrefab(SAW);
});
OCTAGON_BUTTON!.addEventListener("click", () => {
	loadPrefab(OCTAGON);
});
REVERSE_BUTTON!.addEventListener("click", () => {
	TRIANGLES.length = 0;
	SVG!.innerHTML = "";
	POINTS = [...ORIGINAL_POINTS].reverse();
	//	POINTS.reverse();
	loadPrefab([...POINTS]);
});

function addPointOnClick(event: MouseEvent) {
	const POINT = new Point(POINTS.length, event.offsetX, event.offsetY, 4, "black");
	POINT.addToCanvas(SVG!);
	POINTS.push(POINT);
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

function connectPoints(pointA: Point, pointB: Point) {
	const line = document.createElementNS(NS, "line");
	line.setAttributeNS(null, "x1", pointA.x.toString());
	line.setAttributeNS(null, "y1", pointA.y.toString());
	line.setAttributeNS(null, "x2", pointB.x.toString());
	line.setAttributeNS(null, "y2", pointB.y.toString());
	line.setAttributeNS(null, "stroke", "black");
	SVG!.appendChild(line);
}

function toggleLabels() {
	POINTS.forEach((point) => {
		point.toggleLabel();
	});
}

function getRandomColor() {
	const letters = "789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 5)];
	}
	return color + "CC";
}

function drawTriangles() {
	if (TRIANGLES.length) {
		drawTriangle(TRIANGLES[0]);
	}
	TRIANGLES.shift();
	if (TRIANGLES.length) {
		setTimeout(drawTriangles, 100);
	}
}

function drawTriangle(triangle: Triangle) {
	const polygon = document.createElementNS(NS, "polygon");
	polygon.setAttributeNS(
		null,
		"points",
		triangle.pointA.x + "," + triangle.pointA.y + " " + triangle.pointB.x + "," + triangle.pointB.y + " " + triangle.pointC.x + "," + triangle.pointC.y
	);
	polygon.setAttributeNS(null, "fill", getRandomColor());
	polygon.setAttributeNS(null, "stroke", "black");
	SVG!.insertBefore(polygon, SVG!.childNodes[0]);
	return polygon;
}

function getAngle(pointA: Point, pointB: Point, pointC: Point) {
	const temp = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) - Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
	return temp < 0 ? Math.PI * 2 + temp : temp;
}

function getAngleRadians(pointA: Point, pointB: Point, pointC: Point) {
	const AB = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
	const BC = Math.sqrt(Math.pow(pointB.x - pointC.x, 2) + Math.pow(pointB.y - pointC.y, 2));
	const AC = Math.sqrt(Math.pow(pointC.x - pointA.x, 2) + Math.pow(pointC.y - pointA.y, 2));
	return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
}

function getAngleDegrees(pointA: Point, pointB: Point, pointC: Point) {
	return getAngleRadians(pointA, pointB, pointC) * (180 / Math.PI);
}

function measureAngles(points: Point[]) {
	for (let i = 0; i < points.length + 1; i++) {
		points[(i + 1) % points.length].angle =
			(getAngle(points[i % points.length], points[(i + 1) % points.length], points[(i + 2) % points.length]) * 180) / Math.PI;
	}
}

function isInsideTriangle(triangle: Triangle, point: Point) {
	const areaA = new Triangle(triangle.pointA, triangle.pointB, point).area();
	const areaB = new Triangle(triangle.pointB, triangle.pointC, point).area();
	const areaC = new Triangle(triangle.pointC, triangle.pointA, point).area();
	return Math.sign(areaA) == Math.sign(areaB) && Math.sign(areaA) == Math.sign(areaC);
}

function triangulate(points: Point[]) {
	if (points.length < 3) return;

	if (getAngle(points[0], points[1], points[2]) > Math.PI) {
		points.reverse();
	}

	let i = 0;

	measureAngles(points);

	while (points.length > 3) {
		const pointA = points[i % points.length];
		const pointB = points[(i + 1) % points.length];
		const pointC = points[(i + 2) % points.length];

		if (getAngle(pointA, pointB, pointC) < Math.PI) {
			const tempTriangle = new Triangle(pointA, pointB, pointC);
			let isEar = true;
			for (let j = i + 3; j < points.length + i + 3; j++) {
				if (isInsideTriangle(tempTriangle, points[j % points.length])) {
					isEar = false;
				}
			}
			if (isEar) {
				//points[(i + 1) % points.length].setVisible(false);
				points.splice((i + 1) % points.length, 1);
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
		drawTriangles();
	}, 500);
}

function loadPrefab(prefab: Coordinates[]) {
	reset();
	POINTS.length = 0;
	for (let i = 0; i < prefab.length; i++) {
		const POINT = new Point(POINTS.length, prefab[i].x, prefab[i].y, 4, "black");
		POINT.addToCanvas(SVG!);
		POINTS.push(POINT);
	}
	for (let i = 0; i < POINTS.length - 1; i++) {
		connectPoints(POINTS[i], POINTS[i + 1]);
	}
	connectPoints(POINTS[POINTS.length - 1], POINTS[0]);
	ORIGINAL_POINTS = POINTS;
}

function reset() {
	TRIANGLES.length = 0;
	POINTS.length = 0;
	ORIGINAL_POINTS.length = 0;
	SVG!.innerHTML = "";
}
