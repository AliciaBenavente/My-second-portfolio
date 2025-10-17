import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { CSG } from 'three-csg-ts';

// SCENE AND CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// RENDERER
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 7.7;
controls.minDistance = 2;
controls.minPolarAngle = Math.PI / 4.6; // Prevent looking above the ceiling
controls.maxPolarAngle = Math.PI / 2.1; // Prevent looking below the ground
controls.enabledDamping = true;


const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2, // strength
  0.4, // radius
  0.85 // threshold
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// MATERIALS
const textureLoader = new THREE.TextureLoader();
const metalTexture1 = textureLoader.load('textures/metal/Metal046A_1K-JPG_Displacement.jpg');
const metalTexture2 = textureLoader.load('textures/metal/Metal046A_1K-JPG_Roughness.jpg');
const metalTexture3 = textureLoader.load('textures/metal/Metal009_1K-JPG_Color.jpg');
const ceilingTexture = textureLoader.load('textures/ceiling/OfficeCeiling002_1K-JPG_AmbientOcclusion.jpg');
const floorTexture = textureLoader.load('textures/floor/Terrazzo006_1K-JPG_Color.jpg');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);


const materials = {
  floor: new THREE.MeshStandardMaterial({ map: floorTexture, name: 'floor' }),
  ceiling: new THREE.MeshStandardMaterial({ map: ceilingTexture, roughness: 0.9, metalness: 0, name: 'ceiling' }),
  walls: new THREE.MeshStandardMaterial({ color: 0xF2F2F2, roughness: 0.8, metalness: 0.1, name: 'frontWall' }),
  // backWall: new THREE.MeshStandardMaterial({color: 0xF2F2F2, name: 'backWall'}),
  // leftWall: new THREE.MeshStandardMaterial({color: 0xF2F2F2, name: 'leftWall'}),
  // rightWall: new THREE.MeshStandardMaterial({color: 0xF2F2F2, name: 'rightWall'}),
  frontWindow: new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 0,
    thickness: 0.1,
    transparent: true,
    reflectivity: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0,
    color: 0xffffff
  }),
  leftWindow: new THREE.MeshStandardMaterial({ color: 0xDE0000, transparent: true, opacity: 0.4, name: 'leftWindow' }),
  rightWindow: new THREE.MeshStandardMaterial({ color: 0xA0C8F0, transparent: true, opacity: 0.4, name: 'rightWindow' }),
  windowFrame: new THREE.MeshStandardMaterial({ map: metalTexture1, name: 'windowFrame' }),
  labDoor: new THREE.MeshStandardMaterial({ map: metalTexture3, metalness: 0.1, roughness: 0.3, name: 'labDoor' }),
  glass: new THREE.MeshStandardMaterial({ color: 0xA0C8F0, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.2, name: 'glass' }),
  glassFrame: new THREE.MeshStandardMaterial({ map: metalTexture2, metalness: 0.4, roughness: 0.3, name: 'glassFrame' }),
}

// WALLS AND DOOR GEOMETRY
const wallsWidth = 20;
const wallsDepth = 15;
const wallsHeight = 7;
const wallsThickness = 0.1;

const doorWidth = 3.5;
const doorHeight = 5.5;
const doorThickness = 0.1;

function createWall(width, height, depth, material, position, rotation = [0, 0, 0]) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(...position);
  wall.rotation.set(...rotation);
  wall.receiveShadow = true;
  scene.add(wall);
  // console.info("Pared creada:", material.name, "Color de la pared:", material.color.getHexString());
};

createWall(wallsWidth, wallsThickness, wallsDepth, materials.floor, [0, wallsThickness / 2, 0]);
createWall(wallsWidth, wallsThickness, wallsDepth, materials.ceiling, [0, wallsHeight - wallsThickness / 2, 0]);
// createWall(wallsWidth, wallsHeight, wallsThickness, materials.walls, [0, wallsHeight / 2, - wallsDepth / 2]);
createWall(wallsWidth, wallsHeight, wallsThickness, materials.walls, [0, wallsHeight / 2, wallsDepth / 2]);
createWall(wallsDepth, wallsHeight, wallsThickness, materials.walls, [- wallsWidth / 2, wallsHeight / 2, 0], [0, Math.PI / 2, 0]);
createWall(wallsDepth, wallsHeight, wallsThickness, materials.walls, [wallsWidth / 2, wallsHeight / 2, 0], [0, -Math.PI / 2, 0]);

// WINDOWS GEOMETRY
// function createWindowWithFrame(width, height, thickness, material, position, rotation = [0, 0, 0], frameMaterial = materials.windowFrame, frameThickness = 0.25) {

//   const geometry = new THREE.BoxGeometry(width, height, thickness);
//   const windowMesh = new THREE.Mesh(geometry, material);
//   windowMesh.position.set(...position);
//   windowMesh.rotation.set(...rotation);
//   windowMesh.castShadow = false;
//   windowMesh.receiveShadow = true;
//   scene.add(windowMesh);

//   // Dimensiones del marco
//   const frameDepth = thickness;
//   const [x, y, z] = position;

//   // Marcos horizontales (arriba y abajo)
//   createWall(width + frameThickness * 2, frameThickness, frameDepth, frameMaterial, [x, y + height / 2 + frameThickness / 2, z], rotation);
//   createWall(width + frameThickness * 2, frameThickness, frameDepth, frameMaterial, [x, y - height / 2 - frameThickness / 2, z], rotation);

//   // Marcos verticales (izquierda y derecha)
//   if (Math.abs(rotation[1]) === Math.PI / 2) {
//     createWall(frameThickness, height, frameDepth, frameMaterial, [x, y, z - width / 2 - frameThickness / 2], rotation);
//     createWall(frameThickness, height, frameDepth, frameMaterial, [x, y, z + width / 2 + frameThickness / 2], rotation);
//   } else {
//     createWall(frameThickness, height, frameDepth, frameMaterial, [x - width / 2 - frameThickness / 2, y, z], rotation);
//     createWall(frameThickness, height, frameDepth, frameMaterial, [x + width / 2 + frameThickness / 2, y, z], rotation);
//   }
// };
// createWindowWithFrame(8, 4, 0.1, materials.frontWindow, [-5, wallsHeight / 1.8, - wallsDepth / 2 + wallsThickness / 2], [0, 0, 0], materials.windowFrame, 0.35); // frontWall left window
// createWindowWithFrame(8, 4, 0.1, materials.frontWindow, [5, wallsHeight / 1.8, - wallsDepth / 2 + wallsThickness / 2], [0, 0, 0], materials.windowFrame, 0.35); // frontWall right window
// createWindowWithFrame(4, 4, 0.1, materials.rightWindow, [wallsWidth / 2 - wallsThickness / 2, wallsHeight / 2, 0], [0, -Math.PI / 2, 0], materials.windowFrame, 0.35); // Right side window
// createWindowWithFrame(4, 4, 0.1, materials.leftWindow, [- wallsWidth / 2 + wallsThickness / 2, wallsHeight / 2, 0], [0, Math.PI / 2, 0], materials.windowFrame, 0.35); // Left side window
// createWindowWithFrame(doorWidth, doorHeight, doorThickness, materials.labDoor, [0, doorHeight / 2, wallsDepth / 2 - doorThickness / 2], [0, 0, 0], materials.glassFrame, 0.25); // Door

function createWallWithHoles({ wallWidth, wallHeight, wallDepth, material, position, rotation = [0, 0, 0], holes = [] }) {
  const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
  const wallMesh = new THREE.Mesh(wallGeometry, material);

  let wallCSG = CSG.fromMesh(wallMesh);

  for (const hole of holes) {
    const { width, height, depth, position: holePos } = hole;
    const holeGeometry = new THREE.BoxGeometry(width, height, depth || wallDepth + 0.01);
    const holeMesh = new THREE.Mesh(holeGeometry);
    holeMesh.position.set(...holePos);
    holeMesh.updateMatrixWorld();
    const holeCSG = CSG.fromMesh(holeMesh);
    wallCSG = wallCSG.subtract(holeCSG);
  }

  const finalWall = CSG.toMesh(wallCSG, wallMesh.matrix, material);
  finalWall.position.set(...position);
  finalWall.rotation.set(...rotation);
  finalWall.receiveShadow = true;
  scene.add(finalWall);
};
// createWallWithHoles({
//   wallWidth: wallsWidth,
//   wallHeight: wallsHeight,
//   wallDepth: wallsThickness,
//   material: materials.walls,
//   position: [0, wallsHeight / 2, -wallsDepth / 2],
//   holes: [
//     {
//       width: 8,
//       height: 4,
//       position: [-5, 0, 0]
//     },
//     {
//       width: 8,
//       height: 4,
//       position: [5, 0, 0]
//     }
//   ]
// });

// const windowGlassGeometry = new THREE.PlaneGeometry(8, 4);
// const leftWindowGlass = new THREE.Mesh(windowGlassGeometry, materials.frontWindow);
// leftWindowGlass.position.set(-5, wallsHeight / 2, - wallsDepth / 2);
// leftWindowGlass.castShadow = false;
// leftWindowGlass.receiveShadow = false;
// const rightWindowGlass = new THREE.Mesh(windowGlassGeometry, materials.frontWindow);
// rightWindowGlass.position.set(5, wallsHeight / 2, - wallsDepth / 2);
// rightWindowGlass.castShadow = false;
// rightWindowGlass.receiveShadow = false;

// scene.add(leftWindowGlass, rightWindowGlass);

// //////////////////////////
function addGlassToWallHoles({ holes, wallPosition, wallRotation = [0, 0, 0], wallDepth, material, offset = 0.01 }) {
  for (const hole of holes) {
    const { width, height, position: localPos } = hole;

    // Calculamos posición global del cristal
    const x = wallPosition[0] + localPos[0];
    const y = wallPosition[1] + localPos[1];
    const z = wallPosition[2] + localPos[2] + wallDepth / 2 + offset;

    const glassGeometry = new THREE.PlaneGeometry(width, height);
    const glass = new THREE.Mesh(glassGeometry, material);

    glass.position.set(x, y, z);
    glass.rotation.set(...wallRotation);
    glass.castShadow = false;
    glass.receiveShadow = false;

    scene.add(glass);
  }
};
const holes = [
  { width: 8, height: 4, position: [-5, 0, 0] },
  { width: 8, height: 4, position: [5, 0, 0] }
];

createWallWithHoles({
  wallWidth: wallsWidth,
  wallHeight: wallsHeight,
  wallDepth: wallsThickness,
  material: materials.walls,
  position: [0, wallsHeight / 2, -wallsDepth / 2],
  holes
});

addGlassToWallHoles({
  holes,
  wallPosition: [0, wallsHeight / 2, -wallsDepth / 2],
  wallDepth: wallsThickness,
  material: materials.frontWindow
});

// //////////////////////////

// DOOR GLASS
const glassRadius = 0.9;
const glassGeometry = new THREE.CircleGeometry(glassRadius, 32);
const glass = new THREE.Mesh(glassGeometry, materials.glass);
glass.position.set(0, doorHeight / 1.4, 7.38);
glass.rotation.y = Math.PI;
scene.add(glass);
// DOOR GLASS FRAME
const ringGeometry = new THREE.RingGeometry(0.8, 1, 32);
const ring = new THREE.Mesh(ringGeometry, materials.glassFrame);
ring.position.set(0, doorHeight / 1.4, 7.37);
ring.rotation.y = Math.PI;
scene.add(ring);
// DOOR HANDLE
const handleWidth = 2.8;
const handleHeight = 0.15;
const handleDepth = 0.1;
const handleGeometry = new THREE.BoxGeometry(handleWidth, handleHeight, handleDepth);
const handle = new THREE.Mesh(handleGeometry, materials.glassFrame);
handle.position.set(0, doorHeight / 2.2, 7.37);
scene.add(handle);

// LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.intensity = 0.3;
scene.add(ambientLight);

const sunlight = new THREE.DirectionalLight(0xffffff, 1.2);
sunlight.position.set(-10, 10, -20); // desde fuera, arriba y a la izquierda
sunlight.target.position.set(0, 3, 0); // apunta al interior del laboratorio

sunlight.castShadow = true;
sunlight.shadow.mapSize.width = 1024;
sunlight.shadow.mapSize.height = 1024;
sunlight.shadow.camera.near = 1;
sunlight.shadow.camera.far = 50;
sunlight.shadow.camera.left = -20;
sunlight.shadow.camera.right = 20;
sunlight.shadow.camera.top = 20;
sunlight.shadow.camera.bottom = -20;

scene.add(sunlight);
scene.add(sunlight.target);
const directionalLightHelper = new THREE.DirectionalLightHelper(sunlight);
scene.add(directionalLightHelper);

// const ceilingBounce = new THREE.HemisphereLight(0xffffff, 0x6173ff, 0.3);
// ceilingBounce.position.set(-5, wallsHeight -1, wallsThickness - 7);
// scene.add(ceilingBounce);
// const pointLightHelper = new THREE.HemisphereLightHelper(ceilingBounce);
// scene.add(pointLightHelper);


// CUBE
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.position.set(1, 2, 1);
scene.add(cube);



function animate() {
  controls.update();
  composer.render();
  directionalLightHelper.update();
  // pointLightHelper.update();
}
renderer.setAnimationLoop(animate);