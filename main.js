import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// SCENE AND CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10,10,10);
camera.lookAt(0,0,0);


// RENDERER
const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 7.5;
controls.minDistance = 2;
controls.minPolarAngle = Math.PI / 4.6; // Prevent looking above the ceiling
controls.maxPolarAngle = Math.PI / 2.1; // Prevent looking below the ground
controls.enabledDamping = true;

// LIGHT
const ambientLight = new THREE.AmbientLight(0xF2F2F2);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(ambientLight, directionalLight);

// MATERIALS
const textureLoader = new THREE.TextureLoader();
const metalTexture = textureLoader.load('textures/Metal046A_1K-JPG_Displacement.jpg');

const materials = {
  floor: new THREE.MeshBasicMaterial({color: 0xBDBDBD, name: 'floor'}),
  ceiling: new THREE.MeshStandardMaterial({color: 0xF2F2F2, name: 'ceiling'}),
  frontWall: new THREE.MeshStandardMaterial({color: 0xF2F2F2, name: 'frontWall'}),
  backWall: new THREE.MeshStandardMaterial({color: 0xF2F2F2, name: 'backWall'}),
  leftWall: new THREE.MeshStandardMaterial({color: 0xF2F2F2, name: 'leftWall'}),
  rightWall: new THREE.MeshStandardMaterial({color: 0xF2F2F2, name: 'rightWall'}),
  frontWindow: new THREE.MeshStandardMaterial({color: 0xA0C8F0, transparent: false, name: 'frontWindow'}),
  leftWindow: new THREE.MeshStandardMaterial({color: 0xDE0000, transparent: false, opacity: 0.6, name: 'leftWindow'}),
  rightWindow: new THREE.MeshStandardMaterial({color: 0xA0C8F0, transparent: false, opacity: 0.8, name: 'rightWindow'}),
  windowFrame: new THREE.MeshStandardMaterial({map: metalTexture, name: 'windowFrame'}),
}

// WALLS GEOMETRY
const width = 20;
const depth = 15;
const height = 7;
const thickness = 0.1;

function createWall(width, height, depth, material, position, rotation = [0, 0, 0]) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(...position);
  wall.rotation.set(...rotation);
  wall.receiveShadow = true;
  scene.add(wall);
  // console.info("Pared creada:", material.name, "Color de la pared:", material.color.getHexString());
};

createWall(width, thickness, depth, materials.floor, [0, thickness / 2, 0]);
createWall(width, thickness, depth, materials.ceiling, [0, height - thickness / 2, 0]);
createWall(width, height, thickness, materials.frontWall, [0, height / 2, - depth / 2]);
createWall(width, height, thickness, materials.backWall, [0, height / 2, depth / 2]);
createWall(depth, height, thickness, materials.leftWall, [ - width / 2, height / 2, 0], [0, Math.PI / 2, 0]);
createWall(depth, height, thickness, materials.rightWall, [width / 2, height / 2, 0], [0, -Math.PI / 2, 0]);

// WINDOWS GEOMETRY
function createWindowWithFrame(width, height, thickness, material, position, rotation = [0, 0, 0], frameMaterial = materials.windowFrame, frameThickness = 0.25) {
  // Ventana
  const geometry = new THREE.BoxGeometry(width, height, thickness);
  const windowMesh = new THREE.Mesh(geometry, material);
  windowMesh.position.set(...position);
  windowMesh.rotation.set(...rotation);
  windowMesh.castShadow = false;
  windowMesh.receiveShadow = true;
  scene.add(windowMesh);

  // Dimensiones del marco
  const frameDepth = thickness;
  const [x, y, z] = position;

  // Marcos horizontales (arriba y abajo)
  createWall(width + frameThickness * 2, frameThickness, frameDepth, frameMaterial, [x, y + height / 2 + frameThickness / 2, z], rotation);
  createWall(width + frameThickness * 2, frameThickness, frameDepth, frameMaterial, [x, y - height / 2 - frameThickness / 2, z], rotation);

  // Marcos verticales (izquierda y derecha)
  if (Math.abs(rotation[1]) === Math.PI / 2) {
  // Pared lateral: desplazar en Z
  createWall(frameThickness, height, frameDepth, frameMaterial, [x, y, z - width / 2 - frameThickness / 2], rotation);
  createWall(frameThickness, height, frameDepth, frameMaterial, [x, y, z + width / 2 + frameThickness / 2], rotation);
  } else {
  // Pared frontal o trasera: desplazar en X
  createWall(frameThickness, height, frameDepth, frameMaterial, [x - width / 2 - frameThickness / 2, y, z], rotation);
  createWall(frameThickness, height, frameDepth, frameMaterial, [x + width / 2 + frameThickness / 2, y, z], rotation);
  }
};
createWindowWithFrame(8, 4, 0.09, materials.frontWindow, [-5, height / 2, -depth / 2 + thickness / 2], [0, 0, 0], materials.windowFrame, 0.35); // frontWall left window
createWindowWithFrame(8, 4, 0.09, materials.frontWindow, [5, height / 2, -depth / 2 + thickness / 2], [0, 0, 0], materials.windowFrame, 0.35); // frontWall right window
createWindowWithFrame(4, 4, 0.11, materials.rightWindow, [width / 2 - thickness / 2, height / 2, 0], [0, -Math.PI / 2, 0], materials.windowFrame, 0.35); // Right side window
createWindowWithFrame(4, 4, 0.11, materials.leftWindow, [-width / 2 + thickness / 2, height / 2, 0], [0, Math.PI / 2, 0], materials.windowFrame, 0.35); // Left side window




// CUBE
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.position.set(1, 2, 1);
scene.add(cube);



function animate() {
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);