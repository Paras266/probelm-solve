import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { calculateChairPlacements } from './utils/chairplacement';
let renderer, scene, camera, controls;

init();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 25, 30);
  camera.lookAt(0, 0, 0);

  controls = new OrbitControls(camera, renderer.domElement);

  document.getElementById('draw').addEventListener('click', drawScene);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function drawScene() {
  // Clear previous scene
  while (scene.children.length) scene.remove(scene.children[0]);

  const shape = document.getElementById('shape').value;
  const length = parseFloat(document.getElementById('length').value);
  const widthOrRadius = parseFloat(document.getElementById('width').value);
  const totalChairs = parseInt(document.getElementById('chairs').value, 10);
  const minMargin   = parseFloat(document.getElementById('minMargin').value);
    const maxMargin   = parseFloat(document.getElementById('maxMargin').value);
  const commonParams = {
    shape,
    totalChairs,
    chairWidth: 1.5,
    minMargin,
    maxMargin
   
  };

  let placements = [];
  if (shape === 'rectangle') {
    Object.assign(commonParams, {
      tableLength: length,
      tableWidth: widthOrRadius
    });

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(length, 1, widthOrRadius),
      new THREE.MeshBasicMaterial({ color: 0x8B4513 })
    );
    scene.add(table);

  } else if (shape === 'circle') {
    Object.assign(commonParams, {
      radius: widthOrRadius,
      gap: 1.1,
    });

    const table = new THREE.Mesh(
      new THREE.CylinderGeometry(widthOrRadius, widthOrRadius, 1, 64),
      new THREE.MeshBasicMaterial({ color: 0x8B4513 })
    );
    scene.add(table);
  }

  placements = calculateChairPlacements(commonParams);

  for (const p of placements) {
    const chair = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1, 1.5),
      new THREE.MeshBasicMaterial({ color: 0x1f6feb })
    );
    chair.position.set(p.x, 0.5, p.z);
    chair.rotation.y = p.rot;
    scene.add(chair);
  }
}
