import * as THREE from 'three';

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x666666);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// CUBE
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.position.set(1, 2, 1);
scene.add(cube);

// LIGHT
const ambientLight = new THREE.AmbientLight(0x404040);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-1, 1, 1);
light.castShadow = true;
scene.add(light, ambientLight);

// PLANE
const planeGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5, metalness: 1 }); //without roughness and metalness light won't work
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.position.set(0, 0, 0);
scene.add(plane);


// const grid = new THREE.GridHelper(50, 10);
// scene.add(grid);

camera.position.z = 5;
camera.position.y = -3;
camera.rotation.x = .5;


function animate() {
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);