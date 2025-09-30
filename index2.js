import * as THREE from 'three'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1 ,1000);
camera.position.set(0,0,7)

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

const circlulartable = new THREE.Mesh(new THREE.CircleGeometry(3,50), new THREE.MeshBasicMaterial({color:'0xffff0' , side:THREE.DoubleSide}))
scene.add(circlulartable)


function animate(){
    requestAnimationFrame(animate) ;
    renderer.render(scene , camera)
}
animate();