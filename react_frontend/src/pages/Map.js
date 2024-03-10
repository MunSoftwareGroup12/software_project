import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { throttle } from '../utils/tool'
import { CaretUpOutlined, CaretDownOutlined, CaretLeftOutlined, CaretRightOutlined, CloseOutlined, HomeFilled, EllipsisOutlined, FlagFilled } from '@ant-design/icons';
import { Card } from 'antd';
import './Map.css';

const renderer = new THREE.WebGLRenderer({
  antialias: true, // Anti-aliasing 抗锯齿
  logarithmicDepthBuffer: true, // Logarithmic depth buffer 深度缓冲器
});
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 开启HDR渲染

export default function MapView() {
  const [card, setCard] = useState({});
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(null);
  const sphereRef = useRef(null);
  const selectedObjRef = useRef(null);

  const sphereTest = useRef(null);

  useEffect(() => {
    let animationFrameId;
    // Flag whether the selected ui should be updated
    let needUpdate = false;

    // Initialize the environment
    const InitializeEnv = () => {
      // Initialize the scene
      sceneRef.current = new THREE.Scene();
      // Add camera
      let width = document.documentElement.clientWidth;
      cameraRef.current = new THREE.PerspectiveCamera(75, width / Math.max(width * 0.4, 600), 0.1, 2000);
      cameraRef.current.position.set(-13, 5, -2);
      sceneRef.current.add(cameraRef.current)
      //Load environment texture
      const hdrLoader = new RGBELoader()
      hdrLoader.loadAsync("/hdr/sky.hdr").then((texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        sceneRef.current.background = texture;
        sceneRef.current.environment = texture;
        renderer.toneMappingExposure = 0.8;
      })
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
      // Add coordinate system
      var axesHelper = new THREE.AxesHelper(50);
      sceneRef.current.add(axesHelper);
      // //Add show montain model
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

      let testarr = {
        locations: [
          { id: "L001", type: "L", description: "this is a snow location", x: 9.5, y: 6.2, z: -7.7 },
          { id: "L002", type: "L", description: "this is a snow location", x: 8, y: 5.3, z: -3.2 },
          { id: "L003", type: "L", description: "this is a snow location", x: 6.1, y: 4.3, z: -1.4 },
          { id: "L004", type: "L", description: "this is a snow location", x: 5.8, y: 3.4, z: -12.2 },
          { id: "L005", type: "L", description: "this is a snow location", x: 4.7, y: 2.9, z: -3.6 },
          { id: "L006", type: "L", description: "this is a snow location", x: 3.9, y: 2.4, z: -7 },
          { id: "L007", type: "L", description: "this is a snow location", x: 3.9, y: 2.7, z: -2.8 },
          { id: "L008", type: "L", description: "this is a snow location", x: 3.8, y: 2.2, z: -5.8 },
          { id: "L009", type: "L", description: "this is a snow location", x: 0.6, y: 0.2, z: -12 },
          { id: "L010", type: "L", description: "this is a snow location", x: 1, y: 0.9, z: -5.4 },
          { id: "L011", type: "L", description: "this is a snow location", x: -1.6, y: -0.7, z: -12.5 },
          { id: "L012", type: "L", description: "this is a snow location", x: -4, y: -1, z: -5 },
          { id: "L013", type: "L", description: "this is a snow location", x: -2.9, y: -0.7, z: 2 },
          { id: "L014", type: "L", description: "this is a snow location", x: -3.9, y: -0.9, z: 4.6 },
          { id: "L015", type: "L", description: "this is a snow location", x: 3, y: 2.1, z: 7 },
          { id: "S001", type: "S", description: "this is a toliet", x: -2.3, y: -0.8, z: -8.7 },
          { id: "S002", type: "S", description: "this is a Asian restaurant", x: -4.1, y: -1.4, z: -1.4 },
          { id: "S003", type: "S", description: "this is a toliet", x: -3.2, y: -1.1, z: -0.7 },
        ],
        routes: [
          { D1: { id: "L001", x: 9.5, y: 6.2, z: -7.7 }, D2: { id: "L008", x: 3.8, y: 2.2, z: -5.8 }, description: "this is a route from L001 and L008" },
          { D1: { id: "L002", x: 8, y: 5.3, z: -3.2 }, D2: { id: "L005", x: 4.7, y: 2.9, z: -3.6 }, description: "this is a route from L002 and L005" },
          { D1: { id: "L003", x: 6.1, y: 4.3, z: -1.4 }, D2: { id: "L007", x: 3.9, y: 2.7, z: -2.8 }, description: "this is a route from L003 and L007" },
          { D1: { id: "L004", x: 5.8, y: 3.4, z: -12.2 }, D2: { id: "L009", x: 0.6, y: 0.2, z: -12 }, description: "this is a route from L004 and L009" },
          { D1: { id: "L005", x: 4.7, y: 2.9, z: -3.6 }, D2: { id: "L007", x: 3.9, y: 2.7, z: -2.8 }, description: "this is a route from L005 and L007" },
          { D1: { id: "L005", x: 4.7, y: 2.9, z: -3.6 }, D2: { id: "L008", x: 3.8, y: 2.2, z: -5.8 }, description: "this is a route from L005 and L008" },
          { D1: { id: "L006", x: 3.9, y: 2.4, z: -7 }, D2: { id: "L008", x: 3.8, y: 2.2, z: -5.8 }, description: "this is a route from L006 and L008" },
          { D1: { id: "L006", x: 3.9, y: 2.4, z: -7 }, D2: { id: "L009", x: 0.6, y: 0.2, z: -12 }, description: "this is a route from L006 and L009" },
          { D1: { id: "L007", x: 3.9, y: 2.7, z: -2.8 }, D2: { id: "L010", x: 1, y: 0.9, z: -5.4 }, description: "this is a route from L007 and L010" },
          { D1: { id: "L009", x: 0.6, y: 0.2, z: -12 }, D2: { id: "L011", x: -1.6, y: -0.7, z: -12.5 }, description: "this is a route from L009 and L011" },
          { D1: { id: "L010", x: 1, y: 0.9, z: -5.4 }, D2: { id: "L012", x: -4, y: -1, z: -5 }, description: "this is a route from L010 and L012" },
          { D1: { id: "L013", x: -2.9, y: -0.7, z: 2 }, D2: { id: "L014", x: -3.9, y: -0.9, z: 4.6 }, description: "this is a route from L013 and L014" },
          { D1: { id: "L014", x: -3.9, y: -0.9, z: 4.6 }, D2: { id: "L015", x: 3, y: 2.1, z: 7 }, description: "this is a route from L014 and L015" },
          { D1: { id: "S001", x: -2.3, y: -0.8, z: -8.7 }, D2: { id: "L011", x: -1.6, y: -0.7, z: -12.5 }, description: "this is a route from S001 and L011" },
          { D1: { id: "S001", x: -2.3, y: -0.8, z: -8.7 }, D2: { id: "L012", x: -4, y: -1, z: -5 }, description: "this is a route from S001 and L012" },
          { D1: { id: "S002", x: -4.1, y: -1.4, z: -1.4 }, D2: { id: "L012", x: -4, y: -1, z: -5 }, description: "this is a route from S002 and L012" },
          { D1: { id: "S002", x: -4.1, y: -1.4, z: -1.4 }, D2: { id: "L013", x: -2.9, y: -0.7, z: 2 }, description: "this is a route from S002 and L013" },
          { D1: { id: "S003", x: -3.2, y: -1.1, z: -0.7 }, D2: { id: "S002", x: -4.1, y: -1.4, z: -1.4 }, description: "this is a route from S003 and S002" },
        ]
      }
      creatLocationArray(testarr)
    }

    // Update the camera and renderer
    const updateCameraAndRenderer = () => {
      console.log("updateCameraAndRenderer");
      let width = document.documentElement.clientWidth;
      cameraRef.current.aspect = width / Math.max(width * 0.4, 600);
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(width, Math.max(width * 0.4, 600));
    };

    // Click event
    const onClick = (event) => {
      // Only when click on canvas
      if (event.target.closest('.container')) {
        let rect = renderer.domElement.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        // Using raycaster to select location or routes, show UI pannel
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        let intersects = raycasterRef.current.intersectObjects(sceneRef.current.children);
        if (intersects.length > 0 && intersects[0].object.userData.id) {
          // Raycasting
          let selectedObject = intersects[0].object;
          if (selectedObjRef.current) {
            sceneRef.current.remove(selectedObjRef.current);
          }
          let material = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0xFFD700 });
          selectedObjRef.current = new THREE.Mesh(selectedObject.geometry, material);
          selectedObjRef.current.position.copy(selectedObject.position);
          if (selectedObject.userData.type == 'R') {
            selectedObjRef.current.lookAt(selectedObject.userData.D1);
          }
          sceneRef.current.add(selectedObjRef.current);
          // Show UI pannel
          document.getElementById('selectedInfo').style.display = 'block';
          setCard(intersects[0].object.userData);
          needUpdate = true;
        }
      }
    }

    // Orbit change event
    const orbitChange = () => {
      document.getElementById('selectedInfo').style.display = 'none';
      sceneRef.current.remove(selectedObjRef.current);
    }

    // Render
    const render = () => {
      console.log("render");
      TWEEN.update();
      renderer.render(sceneRef.current, cameraRef.current);
      // Set the UI of selected object
      let info = document.getElementById('selectedInfo');
      if (needUpdate) {
        let intersects = raycasterRef.current.intersectObjects(sceneRef.current.children);
        if (intersects.length > 0) {
          let vector = new THREE.Vector3();
          vector.setFromMatrixPosition(intersects[0].object.matrixWorld);
          vector.project(cameraRef.current);
          let rect = renderer.domElement.getBoundingClientRect();
          let windowWidth = document.documentElement.clientWidth;
          let cardX = rect.left + (vector.x + 1) / 2 * rect.width;
          let cardY = rect.top - (vector.y - 1) / 2 * rect.height - info.offsetHeight;
          // Adjust the card position
          info.style.left = ((cardX > windowWidth * 0.7) ? cardX - info.offsetWidth : cardX) + 'px';
          console.log(cardY, info.offsetHeight)
          info.style.top = ((cardY > 100) ? cardY : cardY + info.offsetHeight) + 'px';
          needUpdate = false;
        }
      }
      // Request for next animation frame
      animationFrameId = requestAnimationFrame(render);
    };

    InitializeEnv();
    InitializeObject();
    updateCameraAndRenderer();
    window.addEventListener('resize', updateCameraAndRenderer);
    window.addEventListener('click', onClick);
    controlsRef.current.addEventListener('change', orbitChange);
    render();

    return () => {
      // Clean up the WebGL context and remove listener
      renderer.dispose();
      cancelAnimationFrame(animationFrameId);
      controlsRef.current.removeEventListener('change');
      window.removeEventListener('resize', updateCameraAndRenderer);
      window.removeEventListener('click', onClick);
      controlsRef.current.removeEventListener('change', orbitChange);
    };
  }, []);

  // Only for test
  const creatLocation = useCallback((x, y, z) => {
    // Add a sphere geometry
    var geometry = new THREE.SphereGeometry(0.4, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    sphereTest.current = new THREE.Mesh(geometry, material);
    sphereTest.current.position.set(x, y, z)
    sceneRef.current.add(sphereTest.current);
  }, [])

  // Create mesh by location
  const creatLocationArray = useCallback((Arr) => {
    let SphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    let material_loc = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    let location = Arr.locations;
    for (let i = 0; i < location.length; i++) {
      let sphere = new THREE.Mesh(SphereGeometry, material_loc);
      sphere.position.set(location[i].x, location[i].y, location[i].z);
      sphere.userData.id = location[i].id;
      sphere.userData.type = location[i].type;
      sphere.userData.description = location[i].description;
      sceneRef.current.add(sphere);
    }
    let route = Arr.routes;
    let material_rou = new THREE.MeshBasicMaterial({ color: 0x0287fc });
    for (let i = 0; i < route.length; i++) {
      let D1 = new THREE.Vector3(route[i].D1.x, route[i].D1.y, route[i].D1.z);
      let D2 = new THREE.Vector3(route[i].D2.x, route[i].D2.y, route[i].D2.z);
      let BoxGeometry = new THREE.BoxGeometry(0.3, 0.3, D1.distanceTo(D2));
      let box = new THREE.Mesh(BoxGeometry, material_rou);
      box.position.set((D1.x + D2.x) / 2, (D1.y + D2.y) / 2, (D1.z + D2.z) / 2);
      box.lookAt(D1);
      box.userData.id = route[i].D1.id + ' ⇄ ' + route[i].D2.id;
      box.userData.type = 'R';
      box.userData.D1 = D1;
      box.userData.description = route[i].description;
      sceneRef.current.add(box);
    }
  }, [])

  // User decide to move the oribt target
  const moveCameraAndTarget = useCallback((directionName) => {
    console.log("moveCameraAndTarget");
    let distance = 2;
    let oriDirection = new THREE.Vector3();
    cameraRef.current.getWorldDirection(oriDirection);
    let direction = new THREE.Vector3(0, 0, 0);
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
    let newPosition = new THREE.Vector3();
    newPosition.copy(cameraRef.current.position);
    newPosition.add(dir);
    new TWEEN.Tween(cameraRef.current.position).to(newPosition, 300).easing(TWEEN.Easing.Quadratic.InOut).start();
    // 计算新的固定点位置
    let newTarget = new THREE.Vector3();
    newTarget.copy(controlsRef.current.target);
    newTarget.add(dir);
    controlsRef.current.target.copy(newTarget);
    new TWEEN.Tween(sphereRef.current.position).to(newTarget, 300).easing(TWEEN.Easing.Quadratic.InOut).start();
  }, []);
  const throttledMove = useCallback(throttle(moveCameraAndTarget, 300), [moveCameraAndTarget]);

  // Hide the card
  const closeCard = useCallback(() => {
    document.getElementById('selectedInfo').style.display = 'none';
  })

  // Only for test
  const changeTest = useCallback((x, y, z) => {
    sphereTest.current.position.set(sphereTest.current.position.x + x, sphereTest.current.position.y + y, sphereTest.current.position.z + z);
    console.log(sphereTest.current.position)
  }, [])
  return (
    <div>
      <button onClick={() => changeTest(1, 0, 0)}>x+</button>
      <button onClick={() => changeTest(-1, 0, 0)}>x-</button>
      <button onClick={() => changeTest(0, 1, 0)}>y+</button>
      <button onClick={() => changeTest(0, -1, 0)}>y-</button>
      <button onClick={() => changeTest(0, 0, 1)}>z+</button>
      <button onClick={() => changeTest(0, 0, -1)}>z-</button>
      <button onClick={() => changeTest(0.1, 0, 0)}>``x+</button>
      <button onClick={() => changeTest(-0.1, 0, 0)}>``x-</button>
      <button onClick={() => changeTest(0, 0.1, 0)}>``y+</button>
      <button onClick={() => changeTest(0, -0.1, 0)}>``y-</button>
      <button onClick={() => changeTest(0, 0, 0.1)}>``z+</button>
      <button onClick={() => changeTest(0, 0, -0.1)}>``z-</button>
      <div className="container" ref={containerRef}></div>
      <div className='moveControler' >
        <CaretUpOutlined id="dirKey_up" style={{ fontSize: '40px', color: '#08c' }} onClick={() => { throttledMove('F') }} />
        <div>
          <CaretLeftOutlined id="dirKey_left" style={{ fontSize: '40px', color: '#08c' }} onClick={() => { throttledMove('L') }} />
          <CaretRightOutlined id="dirKey_right" style={{ fontSize: '40px', color: '#08c' }} onClick={() => { throttledMove('R') }} />
        </div>
        <CaretDownOutlined id="dirKey_down" style={{ fontSize: '40px', color: '#08c' }} onClick={() => { throttledMove('B') }} />
      </div>
      <Card
        id="selectedInfo"
        title={card.id}
        extra={<CloseOutlined onClick={() => { closeCard() }} />}
        actions={[
          <FlagFilled key="setting" />,
          <HomeFilled key="edit" />,
          <EllipsisOutlined key="ellipsis" />,
        ]}
      >
        <p>{card.description}</p>
      </Card>
    </div>
  );
}
