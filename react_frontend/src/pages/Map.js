import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import * as TWEEN from '@tweenjs/tween.js';
import { throttle } from '../utils/tool'


const renderer = new THREE.WebGLRenderer({
  antialias: true, // Anti-aliasing 抗锯齿
  logarithmicDepthBuffer: true, // Logarithmic depth buffer 深度缓冲器
});
export default function MapView() {
  //temp
  const [cord, setCord] = useState({ x: 0, y: 0, z: 0 });
  const [targ, setTarg] = useState({ x: 0, y: 0, z: 0 });
  const [test, setTest] = useState(0);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const sphereRef = useRef(null);
  const sphereTest = useRef(null);

  useEffect(() => {
    console.log("useEffect")
    let animationFrameId;
    // Initialize the environment
    const Initialize = () => {
      console.log("Initialize");
      // Initialize the scene
      sceneRef.current = new THREE.Scene();

      // Add coordinate system
      var axesHelper = new THREE.AxesHelper(50);
      sceneRef.current.add(axesHelper);

      // Add camera
      let width = document.documentElement.clientWidth;
      cameraRef.current = new THREE.PerspectiveCamera(75, width / (width * 0.4), 0.1, 2000);
      cameraRef.current.position.set(-14, 7, -6);
      sceneRef.current.add(cameraRef.current)

      // Add a sky sphere
      const skyGeo = new THREE.SphereGeometry(1000, 60, 60);
      const skyTex = new THREE.TextureLoader().load("/images/sky.jpg")
      const skyMat = new THREE.MeshBasicMaterial({
        map: skyTex
      })
      skyGeo.scale(1, 1, -1)
      const sky = new THREE.Mesh(skyGeo, skyMat)
      sceneRef.current.add(sky)

      // Load environment texture
      const hdrLoader = new RGBELoader()
      hdrLoader.loadAsync("/hdr/050.hdr").then((texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        sceneRef.current.background = texture
        sceneRef.current.environment = texture
      })

      // Add parallel light
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(-100, 100, 10);
      sceneRef.current.add(light);

      // Add model
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

      // Add a sphere geometry(as camera target)
      var geometry = new THREE.SphereGeometry(0.5, 32, 32);
      var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      sphereRef.current = new THREE.Mesh(geometry, material);
      sceneRef.current.add(sphereRef.current);

      creatLocation(3, 5, -3);

      let testarr = [
        { x: 9.5, y: 6.2, z: -7.7 },
        { x: 8, y: 5.3, z: -3.2 },
        { x: 6.1, y: 4.3, z: -1.4 },
        { x: 5.8, y: 3.4, z: -12.2 },
        { x: 4.7, y: 2.9, z: -3.6 },
        { x: 3.9, y: 2.4, z: -7 },
        { x: 3.9, y: 2.7, z: -2.8 },
        { x: 3.8, y: 2.2, z: -5.8 },
        { x: 3, y: 1.4, z: -12 },
        { x: 1, y: 0.9, z: -5.4 },
        { x: -1.6, y: -0.7, z: -12.5 },
        { x: -2.3, y: -0.8, z: -8.7 },
        { x: -4, y: -1, z: -5 },
        { x: -4.1, y: -1.4, z: -1.4 }

      ]
      creatLocationArray(testarr)

      // Initialize the controller
      controlsRef.current = new OrbitControls(cameraRef.current, containerRef.current)
      controlsRef.current.enableDamping = true;
      controlsRef.current.maxDistance = 20;
      controlsRef.current.minDistance = 10;
      controlsRef.current.addEventListener('change', function () {
        cameraRef.current.position.y = cameraRef.current.position.y < 5 ? 5 : cameraRef.current.position.y;
      });
      containerRef.current.appendChild(renderer.domElement);
    }
    // Update the camera and renderer
    const updateCameraAndRenderer = () => {
      console.log("updateCameraAndRenderer");
      let width = document.documentElement.clientWidth;
      setTest(prevTest => prevTest + 1);
      // Update camera's aspect ratio
      cameraRef.current.aspect = width / (width * 0.4);
      // Update camera's projection matrix
      cameraRef.current.updateProjectionMatrix();
      // Update renderer's size
      renderer.setSize(width, (width * 0.4));
    };
    // Render
    const render = () => {
      console.log("render");
      TWEEN.update();
      renderer.render(sceneRef.current, cameraRef.current);
      animationFrameId = requestAnimationFrame(render);
      {
        let { x, y, z } = cameraRef.current.position;
        setCord({ x: Math.round(x), y: Math.round(y), z: Math.round(z) });
      }
      {
        let { x, y, z } = controlsRef.current.target;
        setTarg({ x: Math.round(x), y: Math.round(y), z: Math.round(z) });
      }
    };

    Initialize();
    updateCameraAndRenderer();
    // Listen for window size change event
    window.addEventListener('resize', updateCameraAndRenderer);
    render();

    return () => {
      // Clean up the WebGL context
      renderer.dispose();
      cancelAnimationFrame(animationFrameId);
      controlsRef.current.removeEventListener('change');
      window.removeEventListener('resize', updateCameraAndRenderer);
    };
  }, []);

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
      default: break;
    }
    let dir = direction.multiplyScalar(distance)
    // 计算新的相机位置
    var newPosition = new THREE.Vector3();
    newPosition.copy(cameraRef.current.position);
    newPosition.add(dir);

    // 计算新的固定点位置
    var newTarget = new THREE.Vector3();
    newTarget.copy(controlsRef.current.target);
    newTarget.add(dir);

    // 设置新的相机位置和固定点位置(包括固定点实体球)
    new TWEEN.Tween(cameraRef.current.position)
      .to(newPosition, 300)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
    controlsRef.current.target.copy(newTarget);
    new TWEEN.Tween(sphereRef.current.position)
      .to(newTarget, 300)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  }, []);

  const creatLocation = useCallback((x, y, z) => {
    // Add a sphere geometry
    var geometry = new THREE.SphereGeometry(0.3, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    sphereTest.current = new THREE.Mesh(geometry, material);
    sphereTest.current.position.set(x, y, z)
    sceneRef.current.add(sphereTest.current);
  })
  const changeTest = useCallback((x, y, z) => {
    sphereTest.current.position.set(sphereTest.current.position.x + x, sphereTest.current.position.y + y, sphereTest.current.position.z + z);
    console.log(sphereTest.current.position)
  })


  const creatLocationArray = useCallback((location) => {
    let geometry = new THREE.SphereGeometry(0.3, 32, 32);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    for (let i = 0; i < location.length; i++) {
      let sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(location[i].x, location[i].y, location[i].z);
      sceneRef.current.add(sphere);
    }
  })

  const throttledMove = useCallback(throttle(moveCameraAndTarget, 300), []);

  return (
    <div>
      <p>Camera:{cord.x},{cord.y},{cord.z} OrbitControls:{targ.x},{targ.y},{targ.z}, Resize:{test}</p>
      <button onClick={() => { throttledMove('F') }}>Forward</button>
      <button onClick={() => { throttledMove('B') }}>Backward</button>
      <button onClick={() => { throttledMove('L') }}>Left</button>
      <button onClick={() => { throttledMove('R') }}>Right</button>
      <button onClick={() => { changeTest(1, 0, 0) }}>x+</button>
      <button onClick={() => { changeTest(-1, 0, 0) }}>x-</button>
      <button onClick={() => { changeTest(0, 1, 0) }}>y+</button>
      <button onClick={() => { changeTest(0, -1, 0) }}>y-</button>
      <button onClick={() => { changeTest(0, 0, 1) }}>z+</button>
      <button onClick={() => { changeTest(0, 0, -1) }}>z-</button>
      <button onClick={() => { changeTest(0.1, 0, 0) }}>``x+</button>
      <button onClick={() => { changeTest(-0.1, 0, 0) }}>``x-</button>
      <button onClick={() => { changeTest(0, 0.1, 0) }}>``y+</button>
      <button onClick={() => { changeTest(0, -0.1, 0) }}>``y-</button>
      <button onClick={() => { changeTest(0, 0, 0.1) }}>``z+</button>
      <button onClick={() => { changeTest(0, 0, -0.1) }}>``z-</button>
      <div className="container" ref={containerRef}></div>
    </div>
  );
}
