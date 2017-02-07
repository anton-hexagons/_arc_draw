///// Arc Draw by hexagons.se


//// setup

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setViewport(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);

canvas = renderer.domElement;
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;
document.body.appendChild(canvas);
document.body.style.margin = 0;

var scene = new THREE.Scene();

var ratio = window.innerWidth / window.innerHeight;
var cam = new THREE.PerspectiveCamera(60.0, ratio, 0.01, 10);
cam.position.z = Math.sqrt(0.75);



//// tools

/// circle from 3 points - from some epic dude on stackoverflow
function calculateCircleCenter(A,B,C) {
    var yDelta_a = B.y - A.y;
    var xDelta_a = B.x - A.x;
    var yDelta_b = C.y - B.y;
    var xDelta_b = C.x - B.x;

    center = new THREE.Vector3();

    var aSlope = yDelta_a / xDelta_a;
    var bSlope = yDelta_b / xDelta_b;

    center.x = (aSlope*bSlope*(A.y - C.y) + bSlope*(A.x + B.x) - aSlope*(B.x+C.x) )/(2* (bSlope-aSlope) );
    center.y = -1*(center.x - (A.x+B.x)/2)/aSlope +  (A.y+B.y)/2;
    return center;
}



//// geo

var arcCount = 1000;
var arcDetail = 24;

var randomArrs = [];
for (var i = 0; i < 2; i++) {
	var randomArr = [];
	for (var j = 0; j < arcCount; j++) {
		randomArr.push(Math.random());
	}
	randomArrs.push(randomArr);
}

function drawArcs(center, realArcCount) {


	for (var i = 0; i < realArcCount; i++) {

		var line_geo = new THREE.Geometry();
		
		var topPoint = new THREE.Vector3(ratio * randomArrs[0][i] - ratio / 2, 0.5, 0.0),
			midPoint = new THREE.Vector3(center.x, center.y, 0.0),
			leftPoint = new THREE.Vector3(-ratio / 2, randomArrs[1][i] - 0.5, 0.0);
		var circle3pt_center = calculateCircleCenter(topPoint, midPoint, leftPoint);
		var circle3pt_radius = circle3pt_center.distanceTo(midPoint);
		var topPoint_rot = Math.atan2(topPoint.y - circle3pt_center.y, topPoint.x - circle3pt_center.x),
			leftPoint_rot = Math.atan2(leftPoint.y - circle3pt_center.y, leftPoint.x - circle3pt_center.x);
		var curve_arc = new THREE.ArcCurve(circle3pt_center.x, circle3pt_center.y, circle3pt_radius, topPoint_rot, leftPoint_rot, true);
		for (var j = 0; j < arcDetail; j++) {
			var vert = curve_arc.getPoint(j / (arcDetail - 1));
			var point = new THREE.Vector3(vert.x, vert.y, 0.0);
			line_geo.vertices.push(point);
		}

		var line_mat = new THREE.LineBasicMaterial({color: new THREE.Color(0.1, 0.1, 0.1), linewidth: 5});
		line_mat.transparent = true;
		line_mat.blending = THREE["CustomBlending"];
		line_mat.blendSrc = THREE["OneFactor"];
		line_mat.blendDst = THREE["OneFactor"];
		line_mat.blendEquation = THREE.AddEquation;
		var line_line = new THREE.Line(line_geo, line_mat);
		scene.add( line_line );

	}
	
}
drawArcs(new THREE.Vector2(), arcCount);



//// nav

var mouse = null;
document.addEventListener('mousemove', onDocumentMouseMove, false);
function onDocumentMouseMove(e) {
	e.preventDefault();
	if (!mouse) mouse = new THREE.Vector2();
	mouse.x = (e.clientX / window.innerWidth) * ratio - ratio / 2;
	mouse.y = -(e.clientY / window.innerHeight) + 0.5;

	for (var i = 0; i < scene.children.length; i++) {
		scene.remove(scene.children[i]);
	}
	drawArcs(mouse, 100);
}



//// render

var render = function() {
	requestAnimationFrame(render);

	// for (var i = 0; i < scene.children.length; i++) {
	// 	scene.remove(scene.children[i]);
	// }
	// drawArcs();

	renderer.render(scene, cam);
}
render();
