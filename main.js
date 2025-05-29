import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x666666);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CUBE
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
scene.add(cube);

// LIGHT
const light = new THREE.DirectionalLight(0xffffff, 1, 100);
light.position.set(0, 1, 1);
light.castShadow = true;
scene.add(light);

// PLANE
const planeGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.position.set(0, 0, 0);
scene.add(plane);


// const grid = new THREE.GridHelper(50, 10);
// scene.add(grid);

camera.position.z = 5;
camera.position.y = -10;
camera.rotation.x = 1;


function animate() {
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);