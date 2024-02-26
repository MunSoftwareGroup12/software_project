<template>
  <p>Camera:{{ cx }},{{ cy }},{{ cz }}, OrbitControls:{{ ox }},{{ oy }},{{ oz }}, Resize:{{ test }}</p>
  <button @click="moveCameraAndTarget('F')">Forward</button>
  <button @click="moveCameraAndTarget('B')">Backward</button>
  <button @click="moveCameraAndTarget('L')">Left</button>
  <button @click="moveCameraAndTarget('R')">Right</button>
  <div class="container" ref="container"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import * as TWEEN from '@tweenjs/tween.js';

const cx = ref(0);
const cy = ref(0);
const cz = ref(0);
const ox = ref(0);
const oy = ref(0);
const oz = ref(0);
const test = ref(0);
// Initialize the scene 初始化场景
const scene = new THREE.Scene();
// Initialize the camera 初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
// Initialize the renderer 初始化渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, // Anti-aliasing 抗锯齿
  logarithmicDepthBuffer: true, // Logarithmic depth buffer 深度缓冲器
})
// 定义容器及控制器
const container = ref()
let controls: OrbitControls | null = null;

// 创建坐标系
var axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);
// 创建一个球体几何体
var geometry = new THREE.SphereGeometry(0.5, 32, 32);
var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var sphere = new THREE.Mesh(geometry, material);
// 将球体添加到场景中
scene.add(sphere);

// Initialize the environment
const Initialize = () => {
  // Set camera position 设置相机位置
  camera.position.set(-14, 7, -6);
  scene.add(camera)
  // Create a sky sphere 创建天空球
  const skyGeo = new THREE.SphereGeometry(1000, 60, 60);
  const skyTex = new THREE.TextureLoader().load("/images/sky.jpg")
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTex
  })
  skyGeo.scale(1, 1, -1)
  const sky = new THREE.Mesh(skyGeo, skyMat)
  scene.add(sky)

  // // Video texture 动态天空球
  // const createVideo = () => {
  //   const video = document.createElement("video");
  //   video.src = "/video/sky.mp4"
  //   video.loop = true
  //   window.addEventListener("click", (e) => {
  //     if (video.paused) {
  //       video.play();
  //       const texture = new THREE.VideoTexture(video)
  //       skyMat.map = texture
  //       skyMat.map.needsUpdate = true;
  //     }
  //   })

  // }

  // Load environment texture 加载环境纹理
  const hdrLoader = new RGBELoader()
  hdrLoader.loadAsync("/hdr/050.hdr").then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture
    scene.environment = texture
  })

  // Add parallel light 设置平行光
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(-100, 100, 10);
  scene.add(light);

  // Add model 载入模型
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/")
  loader.setDRACOLoader(dracoLoader)
  loader.load("/glb/glbfile.glb", (gltf) => {
    const model = gltf.scene;
    model.scale.set(100, 100, 100);
    model.rotation.y = -Math.PI / 2; // Rotate 90 degrees
    model.position.set(-14, -5, 15);
    scene.add(model);
  })

  // fog
  // scene.fog = new THREE.Fog(0xffffff, 50, 150);
}

// 更新相机和渲染器
const updateCameraAndRenderer = () => {
  // Update camera's aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  // Update camera's projection matrix
  camera.updateProjectionMatrix();
  // Update renderer's size
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 渲染
const render = () => {
  TWEEN.update();
  renderer.render(scene, camera)
  requestAnimationFrame(render)
  cx.value = Math.round(camera.position.x)
  cy.value = Math.round(camera.position.y)
  cz.value = Math.round(camera.position.z)
  ox.value = Math.round((controls as OrbitControls).target.x)
  oy.value = Math.round((controls as OrbitControls).target.y)
  oz.value = Math.round((controls as OrbitControls).target.z)
}

// 页面加载完毕执行
onMounted(() => {
  Initialize();
  updateCameraAndRenderer();
  // Add controller
  controls = new OrbitControls(camera, container.value)
  // Damping effect
  controls.enableDamping = true;
  controls.maxDistance = 20;
  controls.minDistance = 10;
  controls.addEventListener('change', function () {
    camera.position.y = camera.position.y < 5 ? 5 : camera.position.y;
  });
  // createVideo()
  container.value.appendChild(renderer.domElement)
  render()
})


// Listen for window size change event 监听窗口大小改变事件
window.addEventListener('resize', function () {
  test.value++;
  updateCameraAndRenderer();
}, false);
// // 监听鼠标移动事件
// window.addEventListener('mousemove', function(event) {
//   // 获取鼠标的位置
//   var mouseX = event.clientX;
//   var mouseY = event.clientY;

//   // 将鼠标的位置转换为三维坐标
//   var vector = new THREE.Vector3(
//     (mouseX / window.innerWidth) * 2 - 1,
//     -(mouseY / window.innerHeight) * 2 + 1,
//     0.5
//   );

//   vector.unproject(camera);

//   // 设置 OrbitControls 的 target
//   (controls as OrbitControls).target.set(vector.x, vector.y, vector.z);
// });

//测试用前进方法
const moveCameraAndTarget = (directionName: string) => {
  var distance = 2;
  var oriDirection = new THREE.Vector3();
  camera.getWorldDirection(oriDirection);
  var direction = new THREE.Vector3(0, 0, 0);

  switch (directionName) {
    case 'F':
      direction.set(oriDirection.x, 0, oriDirection.z)
      break;
    case 'B':
      direction.set(-oriDirection.x, 0, -oriDirection.z)
      break;
    case 'L':
      direction.set(oriDirection.z, 0, -oriDirection.x);
      break;
    case 'R':
      direction.set(-oriDirection.z, 0, oriDirection.x);
      break;
  }
console.log(direction)
console.log(direction.multiplyScalar(distance))

  // 计算新的相机位置
  var newPosition = new THREE.Vector3();
  newPosition.copy(camera.position);
  newPosition.add(direction.multiplyScalar(distance));
  console.log("---相机---")
  console.log(camera.position)
  console.log(newPosition)
  console.log("------")

  // console.log(newPosition.length(), (controls as OrbitControls).maxDistance)
  // if (newPosition.length() > (controls as OrbitControls).maxDistance) {
  //   return;
  // }

  // 计算新的固定点位置
  var newTarget = new THREE.Vector3();
  newTarget.copy((controls as OrbitControls).target);
  newTarget.add(direction.multiplyScalar(distance));
  console.log("---球---")
  console.log((controls as OrbitControls).target)
  console.log(newTarget)
  console.log("------")

  // 设置新的相机位置和固定点位置(包括固定点实体球)
  new TWEEN.Tween(camera.position)
    .to(newPosition, 300)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      camera.position.set(camera.position.x, camera.position.y, camera.position.z);
    })
    .start();
  (controls as OrbitControls).target.copy(newTarget);
  // sphere.position.copy(newTarget);
  new TWEEN.Tween(sphere.position)
    .to(newTarget, 300) // 使用球体的新位置
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      sphere.position.set(sphere.position.x, sphere.position.y, sphere.position.z);
    })
    .start();
}


</script>
<style lang='scss' scoped>
.container {
  // height: 100vh;
  width: 100vw;
  background-color: #f0f0f0;
}
</style>