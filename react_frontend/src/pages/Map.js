import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import * as TWEEN from '@tweenjs/tween.js';


const renderer = new THREE.WebGLRenderer({
  antialias: true, // Anti-aliasing 抗锯齿
  logarithmicDepthBuffer: true, // Logarithmic depth buffer 深度缓冲器
});
function MapView() {
  console.log("调用MapView")
  const [cx, setCx] = useState(0);
  const [cy, setCy] = useState(0);
  const [cz, setCz] = useState(0);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const [oz, setOz] = useState(0);
  const [test, setTest] = useState(0);

  // 场景、相机、容器、控制器、渲染器
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const sphereRef = useRef(null);

  // Initialize the environment 初始化环境
  const Initialize = useCallback(() => {
    console.log("Initialize");
    // Initialize the scene 初始化场景
    sceneRef.current = new THREE.Scene();

    // 创建坐标系
    var axesHelper = new THREE.AxesHelper(50);
    sceneRef.current.add(axesHelper);

    // Add camera 设置相机
    cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    cameraRef.current.position.set(-14, 7, -6);
    sceneRef.current.add(cameraRef.current)

    // Create a sky sphere 创建天空球
    const skyGeo = new THREE.SphereGeometry(1000, 60, 60);
    const skyTex = new THREE.TextureLoader().load("/images/sky.jpg")
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex
    })
    skyGeo.scale(1, 1, -1)
    const sky = new THREE.Mesh(skyGeo, skyMat)
    sceneRef.current.add(sky)

    // Load environment texture 加载环境纹理
    const hdrLoader = new RGBELoader()
    hdrLoader.loadAsync("/hdr/050.hdr").then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      sceneRef.current.background = texture
      sceneRef.current.environment = texture
    })

    // Add parallel light 设置平行光
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-100, 100, 10);
    sceneRef.current.add(light);

    // Add model 设置模型
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/")
    loader.setDRACOLoader(dracoLoader)
    loader.load("/glb/glbfile.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.set(100, 100, 100);
      model.rotation.y = -Math.PI / 2; // Rotate 90 degrees
      model.position.set(-14, -5, 15);
      sceneRef.current.add(model);
    })

    // 创建一个球体几何体
    var geometry = new THREE.SphereGeometry(0.5, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    sphereRef.current = new THREE.Mesh(geometry, material);
    sceneRef.current.add(sphereRef.current);

    // Initialize the controller 初始化控制器
    controlsRef.current = new OrbitControls(cameraRef.current, containerRef.current)
    controlsRef.current.enableDamping = true;
    controlsRef.current.maxDistance = 20;
    controlsRef.current.minDistance = 10;
    controlsRef.current.addEventListener('change', function () {
      cameraRef.current.position.y = cameraRef.current.position.y < 5 ? 5 : cameraRef.current.position.y;
    });
    containerRef.current.appendChild(renderer.domElement);
  });

  // 更新相机和渲染器
  const updateCameraAndRenderer = useCallback(() => {
    console.log("updateCameraAndRenderer");
    // Update camera's aspect ratio
    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    // Update camera's projection matrix
    cameraRef.current.updateProjectionMatrix();
    // Update renderer's size
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Render
  const render = useCallback(() => {
    console.log("render");
    TWEEN.update();
    renderer.render(sceneRef.current, cameraRef.current);
    requestAnimationFrame(render);
    setCx(Math.round(cameraRef.current.position.x));
    setCy(Math.round(cameraRef.current.position.y));
    setCz(Math.round(cameraRef.current.position.z));
    setOx(Math.round(controlsRef.current.target.x));
    setOy(Math.round(controlsRef.current.target.y));
    setOz(Math.round(controlsRef.current.target.z));
  });

  useEffect(() => {
    console.log("调用useEffect")
    Initialize();
    updateCameraAndRenderer();
    render();
    console.log(sceneRef.current)
    console.log(sceneRef.current.children.length)

    return () => {
      // 组件卸载时，清理 WebGL 上下文
      renderer.dispose();
      controlsRef.current.removeEventListener('change');
    };
  }, []);

  // Listen for window size change event 监听窗口大小改变事件
  window.addEventListener('resize', function () {
    setTest(test + 1);
    updateCameraAndRenderer();
  }, false);

  const moveCameraAndTarget = useCallback((directionName) => {
    console.log("moveCameraAndTarget");
    var distance = 2;
    var oriDirection = new THREE.Vector3();
    cameraRef.current.getWorldDirection(oriDirection);
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

    // 计算新的相机位置
    var newPosition = new THREE.Vector3();
    newPosition.copy(cameraRef.current.position);
    newPosition.add(direction.multiplyScalar(distance));

    // 计算新的固定点位置
    var newTarget = new THREE.Vector3();
    newTarget.copy(controlsRef.current.target);
    newTarget.add(direction.multiplyScalar(distance));

    // 设置新的相机位置和固定点位置(包括固定点实体球)
    new TWEEN.Tween(cameraRef.current.position)
      .to(newPosition, 300)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        cameraRef.current.position.set(cameraRef.current.position.x, cameraRef.current.position.y, cameraRef.current.position.z);
      })
      .start();
    controlsRef.current.target.copy(newTarget);
    new TWEEN.Tween(sphereRef.current.position)
      .to(newTarget, 300) // 使用球体的新位置
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        sphereRef.current.position.set(sphereRef.current.position.x, sphereRef.current.position.y, sphereRef.current.position.z);
      })
      .start();
  });

  return (
    <div>
      <p>Camera:{cx},{cy},{cz}, OrbitControls:{ox},{oy},{oz}, Resize:{test}</p>
      <button onClick={() => moveCameraAndTarget('F')}>Forward</button>
      <button onClick={() => moveCameraAndTarget('B')}>Backward</button>
      <button onClick={() => moveCameraAndTarget('L')}>Left</button>
      <button onClick={() => moveCameraAndTarget('R')}>Right</button>
      <div className="container" ref={containerRef}></div>
    </div>
  );
}

export default MapView;
