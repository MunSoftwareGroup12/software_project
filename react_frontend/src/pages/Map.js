import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { throttle, displayRender } from '../utils/tool'
import { fetchData } from '../api/request'
import { SearchOutlined, CloseOutlined, CaretUpOutlined, CaretDownOutlined, CaretLeftOutlined, SmileOutlined, CaretRightOutlined, HomeFilled, EllipsisOutlined, FlagFilled } from '@ant-design/icons';
import { Flex, Cascader, FloatButton, Modal, Tabs, Drawer, Select, Card, Tooltip, Button, message, Spin } from 'antd';
import RouteItem from '../components/RouteItem';
import './Map.css';

import { difficultyOptions, options } from '../utils/test'
import responseData1 from "../utils/testData1.json";
import responseData2 from "../utils/testData2.json";

const renderer = new THREE.WebGLRenderer({
  antialias: true, // Anti-aliasing
  logarithmicDepthBuffer: true, // Logarithmic depth buffer
});
renderer.toneMapping = THREE.ACESFilmicToneMapping;
export default function Map() {
  const [caculateRoutes, setCaculateRoutes] = useState([]); //caculate routes information
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [card, setCard] = useState({}); //selectedObj information
  const [additionalShow, setAdditionalShow] = useState(false); //indicate if there displays additional map search objs
  const [loadings, setLoadings] = useState([true, false]);
  const [pannelOpen, setPannelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [selectRoute, setSelectRoute] = useState(1);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(null);
  const selectedObjRef = useRef(null);
  const basicShowRef = useRef([]); // an array to save basic map search objs
  const additionalShowRef = useRef([]); //an array to save additional map search objs
  const [messageApi, contextHolder] = message.useMessage();

  const sphereTest = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let needUpdate = false; // flag whether the selected ui should be updated

    // Search for the routes
    const getDataInfo = async (index) => {
      try {
        const data = await fetchData("https://mun-comp-6905-group-12-ski-routing-app-backend.vercel.app/map");
        // const data = responseData1
        creatLocationArray(data)
        setLoadings(getLoading(0, false))
        setIsTipsOpen(true)
      } catch (error) {
        setLoadings(getLoading(0, false))
        messageApi.open({
          type: 'error',
          content: error.message,
        });
      }
    };
    // Initialize the environment
    const InitializeEnv = () => {
      // Initialize the scene
      sceneRef.current = new THREE.Scene();
      // Add camera
      let element = document.documentElement;
      cameraRef.current = new THREE.PerspectiveCamera(75, element.clientWidth / element.clientHeight, 0.1, 2000);
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
        getDataInfo()

      })
    }

    // Update the camera and renderer
    const updateCameraAndRenderer = () => {
      console.log("updateCameraAndRenderer");
      let element = document.documentElement;
      cameraRef.current.aspect = element.clientWidth / element.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(element.clientWidth, element.clientHeight);
    };

    // Click event on the map
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
          if (selectedObject.userData.type === 'R') {
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
    controlsRef.current.addEventListener('change', closeCard);
    render();

    return () => {
      // Clean up the WebGL context and remove listener
      renderer.dispose();
      cancelAnimationFrame(animationFrameId);
      controlsRef.current.removeEventListener('change');
      window.removeEventListener('resize', updateCameraAndRenderer);
      window.removeEventListener('click', onClick);
      controlsRef.current.removeEventListener('change', closeCard);
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
  const changeTest = (x, y, z) => {
    sphereTest.current.position.set(sphereTest.current.position.x + x, sphereTest.current.position.y + y, sphereTest.current.position.z + z);
    console.log(sphereTest.current.position)
  }

  // Create mesh by location
  const creatLocationArray = useCallback((Arr, baisc = true) => {
    let SphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    let material_loc = new THREE.MeshBasicMaterial({ color: 0x0287fc });
    let location = Arr.locations;
    for (let i = 0; i < location.length; i++) {
      let sphere = new THREE.Mesh(SphereGeometry, material_loc);
      sphere.position.set(location[i].x, location[i].y, location[i].z);
      sphere.userData = location[i];
      sphere.userData.dispalyName = location[i].id + " " + location[i].name;
      sceneRef.current.add(sphere);
      baisc ? basicShowRef.current.push(sphere) : additionalShowRef.current.push(sphere);
    }
    let route = Arr.routes;
    let material_arr = [
      new THREE.MeshBasicMaterial({ color: 0x5f5f5f }), //grey
      new THREE.MeshBasicMaterial({ color: 0x008a00 }), //green
      new THREE.MeshBasicMaterial({ color: 0x00008a }), //blue
      new THREE.MeshBasicMaterial({ color: 0x8a0000 }), //red
      new THREE.MeshBasicMaterial({ color: 0x000000 }) //black
    ];
    for (let i = 0; i < route.length; i++) {
      let D1 = new THREE.Vector3(route[i].D1.x, route[i].D1.y, route[i].D1.z);
      let D2 = new THREE.Vector3(route[i].D2.x, route[i].D2.y, route[i].D2.z);
      let BoxGeometry = new THREE.BoxGeometry(0.2, 0.2, D1.distanceTo(D2));
      let box = new THREE.Mesh(BoxGeometry, material_arr[route[i].difficulty]);
      let midpoint = new THREE.Vector3().addVectors(D1, D2).multiplyScalar(0.5);
      box.position.copy(midpoint);
      box.lookAt(D1);
      box.userData.D1 = D1;
      if (route[i].lineSegmentType) {
        let direction = new THREE.Vector3().subVectors(D2, D1).normalize(); // compute the vector between two locations
        let normal = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize(); // compute normal vector
        let displacement = new THREE.Vector3().copy(normal).multiplyScalar(0.15 * route[i].lineSegmentType); // compute the displacement vector
        box.position.copy(new THREE.Vector3().addVectors(midpoint, displacement));
        box.userData.D1 = D1.addVectors(D1, displacement);
      }
      box.userData.dispalyName = route[i].id + " (" + route[i].D1.id + ' ⇄ ' + route[i].D2.id + ")";
      box.userData.id = route[i].id;
      box.userData.type = 'R';
      box.userData.description = route[i].description;
      sceneRef.current.add(box);
      baisc ? basicShowRef.current.push(box) : additionalShowRef.current.push(box);
    }
    if (!baisc) {
      setAdditionalShow(true);
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
  }, []);
  const throttledMove = useCallback(throttle(moveCameraAndTarget, 300), [moveCameraAndTarget]);

  // Hide the card
  const closeCard = () => {
    document.getElementById('selectedInfo').style.display = 'none';
    sceneRef.current.remove(selectedObjRef.current);
  }

  // Cascader onchange
  const inputOptionsChange = (value, index) => {
    console.log(value, index);
    switch (index) {
      case 0: setStartLocation(value); break;
      case 1: setEndLocation(value); break;
      case 2: setDifficulty(value); break;
      default: break;
    }
  };

  // Get loading status
  const getLoading = (index, status) => {
    const newLoadings = [...loadings];
    newLoadings[index] = status;
    return newLoadings;
  }
  // Search for the routes
  const searchRoutes = async (index) => {
    console.log("searchRoutes");
    setLoadings(getLoading(index, true))
    try {
      const data = await fetchData("https://mun-comp-6905-group-12-ski-routing-app-backend.vercel.app/calculated-routes");
      // const data = responseData2
      setCaculateRoutes(data.testAddArr);
      setLoadings(getLoading(index, false))
      setPannelOpen(false);
      setIsModalOpen(true);
    } catch (error) {
      setLoadings(getLoading(index, false))
      messageApi.open({
        type: 'error',
        content: error.message,
      });
    }
  };

  // Clear the existed additional map reach objs
  const clearShow = (opacity) => {
    basicShowRef.current.forEach(obj => {
      obj.material.opacity = opacity;
      obj.material.transparent = opacity < 1 ? true : false;
      obj.material.needsUpdate = true;
    });
    additionalShowRef.current.forEach(obj => { sceneRef.current.remove(obj); });
    additionalShowRef.current = [];
    setAdditionalShow(false);
  }

  // Reset to the Status before seach
  const resetShow = () => {
    clearShow(1);
    setStartLocation(undefined);
    setEndLocation(undefined);
  }

  // Deside which route to display
  const selectOneRoute = () => {
    clearShow(0.2);
    additionalShowRef.current = [];
    creatLocationArray(caculateRoutes[selectRoute - 1], false);
    setIsModalOpen(false);
  }

  return (
    <div>
      <Spin spinning={loadings[0]} fullscreen tip="loading..." />
      <div className="container" ref={containerRef}></div>
      {contextHolder}
      {/* Map movecontroller */}
      <Flex className='moveControler' vertical={true} align="center" >
        <CaretUpOutlined id="dirKey_up" style={{ fontSize: '40px' }} onClick={() => { throttledMove('F') }} />
        <Flex>
          <CaretLeftOutlined id="dirKey_left" style={{ fontSize: '40px' }} onClick={() => { throttledMove('L') }} />
          <CaretRightOutlined id="dirKey_right" style={{ fontSize: '40px' }} onClick={() => { throttledMove('R') }} />
        </Flex>
        <CaretDownOutlined id="dirKey_down" style={{ fontSize: '40px' }} onClick={() => { throttledMove('B') }} />
      </Flex>
      {/* Float action button group */}
      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 50 }}>
        <FloatButton type="primary" icon={<SearchOutlined />} onClick={() => { setPannelOpen(true) }} />
        {additionalShow && <FloatButton icon={<CloseOutlined />} onClick={resetShow} />}
        {additionalShow && <FloatButton onClick={() => { setIsModalOpen(true); }} />}
      </FloatButton.Group>
      {/* Location information card */}
      <Card
        id="selectedInfo"
        title={card.dispalyName}
        extra={<CloseOutlined onClick={() => { closeCard() }} />}
        actions={[
          < Tooltip title="set as start"><FlagFilled key="setting" onClick={() => { closeCard(); setStartLocation(['facility', 'restaurant', 'S002']); setPannelOpen(true); }} /></Tooltip>,
          < Tooltip title="set as end"><HomeFilled key="edit" onClick={() => { closeCard(); setEndLocation(['skiPoint', 'level1', 'L001']); setPannelOpen(true); }} /></Tooltip>,
          < Tooltip title="details"><EllipsisOutlined key="ellipsis" /></Tooltip>,
        ]}
      >
        <p>{card.description}</p>
      </Card>
      {/* Routes search panel */}
      <Drawer
        title="Search Best Routes" placement={"bottom"} extra={<CloseOutlined onClick={() => { setPannelOpen(false) }} />}
        maskClosable={false} closable={false} open={pannelOpen}
      >
        <Flex className="searchAreaBox" justify="center">
          <Flex className="searchArea" justify="center" wrap="wrap" gap="small">
            <Cascader
              className='searchItem' expandTrigger="hover" placeholder="Choose Start Loction" size="large"
              options={options} value={startLocation} displayRender={displayRender}
              onChange={(value) => inputOptionsChange(value, 0)}
            />
            <Cascader
              className='searchItem' expandTrigger="hover" placeholder="Choose End Loction" size="large"
              options={options} value={endLocation} displayRender={displayRender}
              onChange={(value) => inputOptionsChange(value, 1)}
            />
            <Select
              className='searchItem' mode="multiple" placeholder="Difficulty Preference(mutiple)" size="large"
              options={difficultyOptions} allowClear
              onChange={(value) => inputOptionsChange(value, 2)}
            />
            <Button className='searchButton' type="primary" size="large" icon={<SearchOutlined />}
              loading={loadings[1]} onClick={() => searchRoutes(1)}>
              Search
            </Button>
          </Flex>
        </Flex>
      </Drawer>
      {/* Routes select panel */}
      <Modal title="Select Routes" okText="Display" cancelText="Cancel"
        open={isModalOpen} onOk={selectOneRoute} onCancel={() => { setIsModalOpen(false) }} >
        <Tabs
          tabPosition={"left"}
          activeKey={selectRoute}
          onChange={(value) => { setSelectRoute(value) }}
          items={caculateRoutes.map((item) => {
            return {
              label: item.tag,
              key: item.id,
              children: <RouteItem routeData={item} />,
            };
          })}
        />
      </Modal>
      <Modal title="How to caculate a route?" okText="Got it!" cancelButtonProps={{ style: { display: 'none' } }}
        closeIcon={false} open={isTipsOpen} onOk={() => { setIsTipsOpen(false) }}
      >
        <p>Click on a location to set as start or end maunally.</p>
        <p>Or click the Search icon in the bottom right to set start and end from a list.</p>
      </Modal>
      {/* <button onClick={() => changeTest(1, 0, 0)}>x+</button>
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
      <button onClick={() => changeTest(0, 0, -0.1)}>``z-</button> */}
    </div >
  );
}
