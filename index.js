import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/Addons.js";
 
const tableLength = 10;   // long side
const tableWidth  = 10;   // short side
const chairWidth  = 1.5;
const minMargin   = 1;
const maxMargin   = 10;
const totalChairs = 11; 


const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 25, 30);
camera.lookAt(0,0,0);

// simple table
const table = new THREE.Mesh(
  new THREE.BoxGeometry(tableLength, 1, tableWidth),
  new THREE.MeshBasicMaterial({ color: 0x8b4513 })
);
scene.add(table);

// small gap between chair and table edge
const edgeGap = 0.2;

function clamp(v, a, b){ return Math.min(Math.max(v,a),b); }

function capacityForSide(sideLength){
  const cap = Math.floor((sideLength - minMargin) / (chairWidth + minMargin));
  return Math.max(0, cap);
}

function createChair(x, z, rotY=0){
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(chairWidth, 1, chairWidth),
    new THREE.MeshBasicMaterial({ color: 0x1f6feb })
  );
  m.position.set(x, 0, z);
  m.rotation.y = rotY;
  scene.add(m);
}

function positionsAlongLength(count, z, facingAngle){
  if (count <= 0) return [];
  const totalChairWidth = count * chairWidth;
  const totalMargin = tableLength - totalChairWidth;
  let margin = totalMargin / (count + 1);
  margin = clamp(margin, minMargin, maxMargin);

  const positions = [];
  for (let i = 0; i < count; i++){
    const x = -tableLength/2 + margin*(i+1) + chairWidth/2 + i*chairWidth;
    positions.push({ x, z, rot: facingAngle });
  }
  return positions;
}

function positionsAlongWidth(count, x, facingAngle){
  if (count <= 0) return [];
  const totalChairWidth = count * chairWidth;
  const totalMargin = tableWidth - totalChairWidth;
  let margin = totalMargin / (count + 1);
  margin = clamp(margin, minMargin, maxMargin);

  const positions = [];
  for (let i = 0; i < count; i++){
    const z = -tableWidth/2 + margin*(i+1) + chairWidth/2 + i*chairWidth;
    positions.push({ x, z, rot: facingAngle });
  }
  return positions;
}

// ---- distribution algorithm (balanced, then alternate) ----
function distributeAndPlace(total){
  // capacities (each long side, each short side)
  const capLong  = capacityForSide(tableLength);
  const capShort = capacityForSide(tableWidth);

  let remaining = total;

  // allocate to long sides first (combined capacity = 2*capLong)
  const allocLong = Math.min(remaining, 2 * capLong);

  // balanced split: left gets ceil, right gets floor (this matches 1st-left,2nd-right alternation)
  let leftCount  = Math.ceil(allocLong / 2);
  let rightCount = allocLong - leftCount;

  leftCount  = Math.min(leftCount, capLong);
  rightCount = Math.min(rightCount, capLong);

  remaining -= (leftCount + rightCount);

  // allocate to short sides next
  const allocShort = Math.min(remaining, 2 * capShort);
  let rightWidthCount = Math.ceil(allocShort / 2); // we'll place width-right first, then width-left (5th -> right)
  let leftWidthCount  = allocShort - rightWidthCount;
  rightWidthCount = Math.min(rightWidthCount, capShort);
  leftWidthCount  = Math.min(leftWidthCount, capShort);

  remaining -= (rightWidthCount + leftWidthCount);


  const lengthA_z = - (tableWidth/2 + chairWidth/2 + edgeGap); // one long side (A)
  const lengthB_z =   (tableWidth/2 + chairWidth/2 + edgeGap); // opposite long side (B)
  const widthR_x  =   (tableLength/2 + chairWidth/2 + edgeGap); // right short side (R)
  const widthL_x  = - (tableLength/2 + chairWidth/2 + edgeGap); // left short side (L)

  const lengthA_pos = positionsAlongLength(leftCount,  lengthA_z, 0);        // faces +Z (rot 0)
  const lengthB_pos = positionsAlongLength(rightCount, lengthB_z, Math.PI); // faces -Z (rot PI)
  const widthR_pos  = positionsAlongWidth(rightWidthCount, widthR_x, -Math.PI/2); // face -X
  const widthL_pos  = positionsAlongWidth(leftWidthCount,  widthL_x, Math.PI/2);  // face +X

  const placements = [];

  let ia = 0 , ib = 0;
 while (ia < lengthA_pos.length || ib < lengthB_pos.length){
    if (ia < lengthA_pos.length){ placements.push(lengthA_pos[ia++]); }
    if (ib < lengthB_pos.length){ placements.push(lengthB_pos[ib++]); }
  } 

  let ir = 0, il = 0;
  while (ir < widthR_pos.length || il < widthL_pos.length){
    if (ir < widthR_pos.length){ placements.push(widthR_pos[ir++]); }
    if (il < widthL_pos.length){ placements.push(widthL_pos[il++]); }
  }
 
  // Finally create chairs in that exact alternating order
  for (const p of placements){
    createChair(p.x, p.z, p.rot);
  }

  console.log({
    capLong, capShort,
    leftCount, rightCount, rightWidthCount, leftWidthCount,
    remaining
  });
}

distributeAndPlace(totalChairs);

const control = new OrbitControls(camera , renderer.domElement)

function animate(){
     requestAnimationFrame(animate); 
     control.update()
     renderer.render(scene, camera); 

    }
animate();