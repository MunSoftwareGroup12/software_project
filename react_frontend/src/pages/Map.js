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
renderer.outputEncoding = THREE.sRGBEncoding; // 开启sRGB编码
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 开启HDR渲染
export default function MapView() {
  //temp
  const [cord, setCord] = useState({ x: 0, y: 0, z: 0 });
  const [targ, setTarg] = useState({ x: 0, y: 0, z: 0 });
  const [test, setTest] = useState(0);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(null);
  const sphereRef = useRef(null);
  const sphereTest = useRef(null);

  useEffect(() => {
    console.log("useEffect")
    let animationFrameId;
    // Flag whether the selected ui should be updated
    let needUpdate = false;

    // Initialize the environment
    const InitializeEnv = () => {
      console.log("InitializeEnv");
      // Initialize the scene
      sceneRef.current = new THREE.Scene();

      // Add camera
      let width = document.documentElement.clientWidth;
      cameraRef.current = new THREE.PerspectiveCamera(75, width / (width * 0.4), 0.1, 2000);
      cameraRef.current.position.set(-14, 7, -6);
      sceneRef.current.add(cameraRef.current)

      //Load environment texture
      const hdrLoader = new RGBELoader()
      hdrLoader.loadAsync("/hdr/sky03.hdr").then((texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        sceneRef.current.background = texture;
        sceneRef.current.environment = texture;
        renderer.toneMappingExposure = 0.8;
      })

      // Add default parallel light
      // const light = new THREE.DirectionalLight(0xffffff, 1);
      // light.position.set(-100, 100, 10);
      // sceneRef.current.add(light);

      // Initialize the Orbit controller
      controlsRef.current = new OrbitControls(cameraRef.current, containerRef.current)
      controlsRef.current.enableDamping = true;
      controlsRef.current.maxDistance = 20;
      controlsRef.current.minDistance = 10;
      controlsRef.current.addEventListener('change', function () {
        cameraRef.current.position.y = cameraRef.current.position.y < 5 ? 5 : cameraRef.current.position.y;
      });

      // Initialize the mouse controller
      raycasterRef.current = new THREE.Raycaster();
      mouseRef.current = new THREE.Vector2();

      // Add renderer to container
      containerRef.current.appendChild(renderer.domElement);
    }

    // Initialize the extra objects in environment
    const InitializeObject = () => {
      console.log("InitializeObject");

      // Add coordinate system
      var axesHelper = new THREE.AxesHelper(50);
      sceneRef.current.add(axesHelper);

      // // Add a sky sphere
      // const skyGeo = new THREE.SphereGeometry(1000, 60, 60);
      // const skyTex = new THREE.TextureLoader().load("/images/sky.jpg")
      // const skyMat = new THREE.MeshBasicMaterial({ map: skyTex })
      // skyGeo.scale(1, 1, -1)
      // const sky = new THREE.Mesh(skyGeo, skyMat)
      // sceneRef.current.add(sky)

      //Add model
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
        { id: "001", x: 9.5, y: 6.2, z: -7.7 },
        { id: "002", x: 8, y: 5.3, z: -3.2 },
        { id: "003", x: 6.1, y: 4.3, z: -1.4 },
        { id: "004", x: 5.8, y: 3.4, z: -12.2 },
        { id: "005", x: 4.7, y: 2.9, z: -3.6 },
        { id: "006", x: 3.9, y: 2.4, z: -7 },
        { id: "007", x: 3.9, y: 2.7, z: -2.8 },
        { id: "008", x: 3.8, y: 2.2, z: -5.8 },
        { id: "009", x: 3, y: 1.4, z: -12 },
        { id: "010", x: 1, y: 0.9, z: -5.4 },
        { id: "011", x: -1.6, y: -0.7, z: -12.5 },
        { id: "012", x: -2.3, y: -0.8, z: -8.7 },
        { id: "013", x: -4, y: -1, z: -5 },
        { id: "014", x: -4.1, y: -1.4, z: -1.4 }
      ]
      creatLocationArray(testarr)
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

    // Click event
    const onClick = (event) => {
      let rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      // Raycasting
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      let intersects = raycasterRef.current.intersectObjects(sceneRef.current.children);
      if (intersects.length > 0 && intersects[0].object.userData.id) {
        let info = document.getElementById('info');
        console.log(intersects[0].object.userData);
        info.style.display = 'block';
        info.textContent = 'ID: ' + intersects[0].object.userData.id;
        needUpdate = true;
      }
    }

    // Render
    const render = () => {
      console.log("render");
      TWEEN.update();

      renderer.render(sceneRef.current, cameraRef.current);
      // Set the UI of selected object
      let info = document.getElementById('info');
      if (needUpdate) {
        let intersects = raycasterRef.current.intersectObjects(sceneRef.current.children);
        if (intersects.length > 0) {
          let vector = new THREE.Vector3();
          vector.setFromMatrixPosition(intersects[0].object.matrixWorld);
          vector.project(cameraRef.current);
          let rect = renderer.domElement.getBoundingClientRect();
          info.style.left = (rect.left + (vector.x + 1) / 2 * rect.width) + 'px';
          info.style.top = (rect.top - (vector.y - 1) / 2 * rect.height - info.offsetHeight) + 'px';
          needUpdate = false;
        }
      }
      // Request for next animation frame
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

    InitializeEnv();
    InitializeObject();
    updateCameraAndRenderer();
    // Listen for window size change event
    window.addEventListener('resize', updateCameraAndRenderer);
    // Listen for the click event
    window.addEventListener('click', onClick);
    // Listen for camera change
    controlsRef.current.addEventListener('change', () => { document.getElementById('info').style.display = 'none'; });
    render();

    return () => {
      // Clean up the WebGL context
      renderer.dispose();
      cancelAnimationFrame(animationFrameId);
      controlsRef.current.removeEventListener('change');
      window.removeEventListener('resize', updateCameraAndRenderer);
      window.removeEventListener('click', onClick);
      controlsRef.current.removeEventListener('change', () => { document.getElementById('info').style.display = 'none'; });
    };
  }, []);


  const creatLocation = useCallback((x, y, z) => {
    // Add a sphere geometry
    var geometry = new THREE.SphereGeometry(0.3, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    sphereTest.current = new THREE.Mesh(geometry, material);
    sphereTest.current.position.set(x, y, z)
    sceneRef.current.add(sphereTest.current);
  }, [])

  const creatLocationArray = useCallback((location) => {
    let geometry = new THREE.SphereGeometry(0.3, 32, 32);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    for (let i = 0; i < location.length; i++) {
      let sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(location[i].x, location[i].y, location[i].z);
      sphere.userData.id = location[i].id;
      sceneRef.current.add(sphere);
    }
  }, [])

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

  const throttledMove = useCallback(throttle(moveCameraAndTarget, 300), [moveCameraAndTarget]);

  const changeTest = useCallback((x, y, z) => {
    sphereTest.current.position.set(sphereTest.current.position.x + x, sphereTest.current.position.y + y, sphereTest.current.position.z + z);
    console.log(sphereTest.current.position)
  }, [])

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
      <div id="info" style={{ position: "absolute", background: "red", display: "none" }}></div>
    </div>
  );
}
