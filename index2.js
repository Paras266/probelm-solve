import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/Addons.js";

// === Parameters ===
const radius = 15;         // circle radius (manual input)
const chairWidth = 1.5;    // width of a chair
const minMargin = 1;       // minimum spacing between chairs
const maxMargin = 10;      // maximum spacing
const totalChairs = 7;    // total number of chairs

// === Scene setup ===
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 25, 30);
camera.lookAt(0, 0, 0);

// === Circular Table ===
const tableGeom = new THREE.CylinderGeometry(radius, radius, 1, 64);
const tableMat = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
const table = new THREE.Mesh(tableGeom, tableMat);
scene.add(table);

// === Chair Creation ===
function createChair(x, z, rotY = 0) {
  const chairGeom = new THREE.BoxGeometry(chairWidth, 1, chairWidth);
  const chairMat = new THREE.MeshBasicMaterial({ color: 0x1f6feb });
  const chair = new THREE.Mesh(chairGeom, chairMat);
  chair.position.set(x, 0, z);
  chair.rotation.y = rotY;
  scene.add(chair);
}

// === Chair placement around the circle ===
function placeChairsAroundCircle(numChairs) {
  const circumference = 2 * Math.PI * radius;
  const totalChairWidth = numChairs * chairWidth;
  const totalMargin = circumference - totalChairWidth;

  // Evenly distribute margin between all chairs
  let margin = totalMargin / numChairs;
  margin = Math.min(Math.max(margin, minMargin), maxMargin);

  // const arcLength = chairWidth + margin;
  const angleStep = 2*Math.PI / numChairs // radians between chairs

  const placements = [];
  console.log(angleStep);
  // Start from angle = 0 and go counterclockwise
  for (let i = 0; i < numChairs; i++) {

    const angle = i * angleStep;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const rotY = angle + Math.PI; // face the table center
    placements.push({ x, z, rotY });
  }

  // Create chairs
  for (const p of placements) {
    createChair(p.x, p.z, p.rotY);
  }

  console.log({
    circumference: circumference.toFixed(2),
    margin: margin.toFixed(2),
    angleStep: (angleStep * 180 / Math.PI).toFixed(2) + '°',
    totalChairs
  });
}

placeChairsAroundCircle(totalChairs);

// === Controls and render ===
const controls = new OrbitControls(camera, renderer.domElement);
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
