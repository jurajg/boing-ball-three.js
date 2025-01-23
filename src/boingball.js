/////////////////////////////////////////////////////////////////////////
///// IMPORT
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CheckerSphereGeometry } from "./checkerSphereGeometry.js";

// right handed coordinate system: https://medium.com/@axcodes/an-overview-of-the-three-js-coordinate-system-07f75ee76e64
// x+ left
// y+ up
// z+ forward

var renderer;
var camera;

// setup boing ball 3D animation inside parentElement
export function SetupBoingBall(parentElement, parentW, parentH) {
  /////////////////////////////////////////////////////////////////////////
  ///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
  const container = document.createElement("div");
  parentElement.appendChild(container);

  /////////////////////////////////////////////////////////////////////////
  ///// SCENE CREATION
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#c8f0f9");

  /////////////////////////////////////////////////////////////////////////
  ///// RENDERER CONFIG
  renderer = new THREE.WebGLRenderer({ antialias: true }); // turn on antialias
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //set pixel ratio
  renderer.setSize(parentW, parentH); // make it full screen
  renderer.outputEncoding = THREE.sRGBEncoding; // set color encoding
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement); // add the renderer to html div

  /////////////////////////////////////////////////////////////////////////
  ///// CAMERAS CONFIG
  camera = new THREE.PerspectiveCamera(35, parentW / parentH, 1, 100);
  camera.position.set(0, 0, -20);
  scene.add(camera);

  /////////////////////////////////////////////////////////////////////////
  ///// CREATE ORBIT CONTROLS
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false; //default - disable orbit controls
  //setupOrbitControls();

  /////////////////////////////////////////////////////////////////////////
  ///// SCENE LIGHTS
  //const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82);
  //scene.add(ambient);

  //const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96);
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  sunLight.position.set(20, 0, -30);
  sunLight.castShadow = true;
  scene.add(sunLight);

  const sphereGroup = new THREE.Group();

  const sphereRadius = 1;

  const redGeometry = new CheckerSphereGeometry(0, sphereRadius, 16, 8);
  const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const redSphere = new THREE.Mesh(redGeometry, redMaterial);

  redSphere.castShadow = true;
  redSphere.receiveShadow = false;

  const whiteGeometry = new CheckerSphereGeometry(1, sphereRadius, 16, 8);
  const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const whiteSphere = new THREE.Mesh(whiteGeometry, whiteMaterial);

  whiteSphere.castShadow = true;
  whiteSphere.receiveShadow = false;

  sphereGroup.add(redSphere);
  sphereGroup.add(whiteSphere);

  const edges = new THREE.EdgesGeometry(redGeometry);
  const sphereLines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  );

  sphereGroup.add(sphereLines);

  scene.add(sphereGroup);
  sphereGroup.position.z = -sphereRadius;

  const backWallGeometry = new THREE.PlaneGeometry(10, 10);
  const backWallMaterial = new THREE.MeshPhongMaterial({
    color: 0xdddddd,
    side: THREE.DoubleSide,
    shininess: 30,
  });

  const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
  scene.add(backWall);
  backWall.castShadow = false;
  backWall.receiveShadow = true;

  // draw line grid
  const gridLineColor = 0xbb00bb;
  const nlinesH = 16;
  const nlinesV = 13;
  const nlinesZ = 3;
  const spacing = 0.4;
  const startX = (spacing * (nlinesH - 1)) / 2;
  const startY = (spacing * (nlinesV - 1)) / 2;
  const endY = -startY;
  const endX = startX - spacing * (nlinesH - 1);
  const startZ = 0;
  const endZ = -spacing * nlinesZ;

  function getLine(a, b, color) {
    var points = [];
    points.push(a);
    points.push(b);
    const lineMaterial = new THREE.LineBasicMaterial({ color: color });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(lineGeometry, lineMaterial);
  }

  for (var i = 0; i < nlinesH; i++) {
    var a = new THREE.Vector3(startX - spacing * i, startY, 0);
    var b = new THREE.Vector3(startX - spacing * i, -startY, 0);
    scene.add(getLine(a, b, gridLineColor));
  }

  for (var i = 0; i < nlinesV; i++) {
    var a = new THREE.Vector3(startX, startY - spacing * i, 0);
    var b = new THREE.Vector3(endX, startY - spacing * i, 0);
    scene.add(getLine(a, b, gridLineColor));
  }

  // Z direction
  for (var i = 0; i < nlinesH; i++) {
    var a = new THREE.Vector3(startX - spacing * i, -startY, startZ);
    var b = new THREE.Vector3(startX - spacing * i, -startY, endZ);
    scene.add(getLine(a, b, gridLineColor));
  }

  for (var i = 0; i < nlinesZ; i++) {
    var a = new THREE.Vector3(startX, -startY, startZ - spacing * i);
    var b = new THREE.Vector3(endX, -startY, startZ - spacing * i);
    scene.add(getLine(a, b, gridLineColor));
  }

  // animation parameters
  var moveDir = 1;
  var rotDir = 1;
  var moveSpeed = 0.05;
  var rotSpeedY = 0.04;
  var bounceDist = 2.4;
  var bounceX = -bounceDist / 2;
  var bounceHeight = startY - endY - 2 * sphereRadius;
  var bounceK = bounceHeight / (0.25 * bounceDist * bounceDist);
  var sphereRotation = 0;

  // animation loop
  const animate = () => {
    requestAnimationFrame(animate);

    // horizontal movement
    sphereGroup.position.x += moveDir * moveSpeed;
    if (moveDir == 1) {
      if (sphereGroup.position.x > startX) {
        sphereGroup.position.x = startX;
        moveDir = -1;
        rotDir = -1;
      }
    } else {
      if (sphereGroup.position.x < endX) {
        sphereGroup.position.x = endX;
        moveDir = 1;
        rotDir = 1;
      }
    }

    sphereRotation += rotDir * rotSpeedY;
    var sphereRot = new THREE.Euler(0, sphereRotation, 0.3, "ZXY");
    sphereGroup.setRotationFromEuler(sphereRot);

    // vertical movement
    bounceX += moveSpeed;
    if (bounceX >= bounceDist / 2) {
      bounceX = -bounceDist / 2;
    }
    var bounceY =
      endY + sphereRadius + bounceHeight - bounceK * bounceX * bounceX;
    sphereGroup.position.y = bounceY;

    if (controls.enabled) controls.update();
    renderer.render(scene, camera);
  };

  animate();
}

// call on parent div resized
export function ResizeBoingBall(width, height) {
  console.log(width);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  //renderer.setPixelRatio(2);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //set pixel ratio
}

// orbit controls for debugging
function setupOrbitControls() {
  controls.enabled = true;
  setOrbitControlsLimits(); //enable controls limits
  controls.update();
  console.log(controls.target);
  controls.target = new THREE.Vector3(0, 0, 0);
}

function setOrbitControlsLimits() {
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 5;
  controls.maxDistance = 60;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.maxPolarAngle = Math.PI;
}
