import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { throttle, displayRender } from '../utils/tool'
import { fetchData } from '../api/request'
import { SearchOutlined, CloseOutlined, CaretUpOutlined, CaretDownOutlined, CaretLeftOutlined, CheckCircleTwoTone, CloseCircleTwoTone, CaretRightOutlined, HomeFilled, FlagFilled, AimOutlined } from '@ant-design/icons';
import { Flex, Cascader, FloatButton, Modal, Tabs, Drawer, Select, Card, Tooltip, Button, message, Spin } from 'antd';
import RouteItem from '../components/RouteItem';
import './Map.css';

import { difficultyOptions, options } from '../utils/test'
import originData from "../utils/testData2_origin.json";
import caculateData from "../utils/testData2_caculate.json";

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

    // Search for the routes
    const getDataInfo = async (index) => {
      try {
        //const data = await fetchData("https://mun-comp-6905-group-12-ski-routing-app-backend.vercel.app/map");
        const data = originData;
        creatLocationArray(data);
        setLoadings(getLoading(0, false));
        // setIsTipsOpen(true);
      } catch (error) {
        setLoadings(getLoading(0, false));
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
      cameraRef.current.position.set(6.7, 6.5, 47.5);
      // cameraRef.current.position.set(-9.5, 9.3, 32.5);
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
      controlsRef.current.maxDistance = 30;
      controlsRef.current.minDistance = 10;
      controlsRef.current.addEventListener('change', function () {
        cameraRef.current.position.y = cameraRef.current.position.y < 5 ? 5 : cameraRef.current.position.y;
      });
      controlsRef.current.target.set(-6.6, 0, 39);
      // controlsRef.current.target.set(-27.2, 0, 31.5);
      controlsRef.current.update();
      // Initialize the mouse controller
      raycasterRef.current = new THREE.Raycaster();
      mouseRef.current = new THREE.Vector2();
      // Add renderer to container
      containerRef.current.appendChild(renderer.domElement);
      creatLocation(-26.5, 3.3, 34.7);
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
        getDataInfo();
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
          console.log(intersects[0].object)
          let selectedObject = intersects[0].object;
          if (selectedObjRef.current) {
            sceneRef.current.remove(selectedObjRef.current);
          }
          let material = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0xFFD700 });
          selectedObjRef.current = new THREE.Mesh(selectedObject.geometry, material);
          selectedObjRef.current.position.copy(selectedObject.position);
          sceneRef.current.add(selectedObjRef.current);
          // Set the UI of selected object
          let info = document.getElementById('selectedInfo');
          let cardX = event.clientX;
          let cardY = event.clientY - info.offsetHeight;
          info.style.display = 'block';
          info.style.left = ((cardX > document.documentElement.clientWidth * 0.7) ? cardX - info.offsetWidth : cardX) + 'px';
          info.style.top = ((cardY > 100) ? cardY : cardY + info.offsetHeight) + 'px';
          setCard(intersects[0].object.userData);
        }
      }
    }

    // Render
    const render = () => {
      console.log("render");
      TWEEN.update();
      renderer.render(sceneRef.current, cameraRef.current);
      animationFrameId = requestAnimationFrame(render);// Request for next animation frame
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
    var material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
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
    // Create locations
    let location = Arr.locations;
    let SphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    let material_loc = new THREE.MeshBasicMaterial({ color: 0x0287fc });
    for (let i = 0; i < location.length; i++) {
      let sphere = new THREE.Mesh(SphereGeometry, material_loc);
      sphere.position.set(location[i].x, location[i].y, location[i].z);
      sphere.userData = location[i];
      sphere.userData.displayName = location[i].id + " " + location[i].name;
      sceneRef.current.add(sphere);
      baisc ? basicShowRef.current.push(sphere) : additionalShowRef.current.push(sphere);
    }
    // Create routes
    let route = Arr.routes;
    let material_arr = [
      // new THREE.MeshBasicMaterial({ color: 0x5f5f5f }), //grey
      new THREE.MeshBasicMaterial({ color: 0x008a00 }), //green
      new THREE.MeshBasicMaterial({ color: 0x00008a }), //blue
      new THREE.MeshBasicMaterial({ color: 0x8a0000 }), //red
      new THREE.MeshBasicMaterial({ color: 0x000000 }) //black
    ];
    for (let i = 0; i < route.length; i++) {
      const points = route[i].locs.map(loc => new THREE.Vector3(loc.x, loc.y, loc.z))
      const path = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(path, route[i].locs.length * 15, 0.1, 3, false);
      const tube = new THREE.Mesh(tubeGeometry, material_arr[route[i].difficulty]);
      tube.userData = route[i];
      tube.userData.displayName = route[i].id + " " + route[i].name;
      sceneRef.current.add(tube);
      baisc ? basicShowRef.current.push(tube) : additionalShowRef.current.push(tube);
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
    // Compute new location of camera
    let newPosition = new THREE.Vector3();
    newPosition.copy(cameraRef.current.position);
    newPosition.add(dir);
    new TWEEN.Tween(cameraRef.current.position).to(newPosition, 300).easing(TWEEN.Easing.Quadratic.InOut).start();
    // Compute new location of target point
    let newTarget = new THREE.Vector3();
    newTarget.copy(controlsRef.current.target);
    newTarget.add(dir);
    controlsRef.current.target.copy(newTarget);
    console.log("-----------------------")
    console.log(newPosition)
    console.log(newTarget)

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
      //const data = await fetchData("https://mun-comp-6905-group-12-ski-routing-app-backend.vercel.app/calculated-routes");
      const data = caculateData;
      setCaculateRoutes(data.testAddArr);
      setLoadings(getLoading(index, false));
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
    clearShow(0.1);
    additionalShowRef.current = [];
    creatLocationArray(caculateRoutes[selectRoute - 1], false);
    setIsModalOpen(false);
  }

  return (
    <div>
      <Spin spinning={loadings[0]} fullscreen tip="LOADING..." />
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
        <FloatButton type="primary" icon={<SearchOutlined />} onClick={() => { closeCard(); setPannelOpen(true); }} />
        {additionalShow && <FloatButton onClick={() => { closeCard(); setIsModalOpen(true); }} />}
        {additionalShow && <FloatButton icon={<CloseOutlined />} onClick={resetShow} />}
      </FloatButton.Group>
      {/* Location information card */}
      <Card
        id="selectedInfo"
        title={<div>{card.displayName + ' '}{card.availability ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <CloseCircleTwoTone twoToneColor="#eb2f96" />}</div>}
        extra={<CloseOutlined onClick={() => { closeCard() }} />}
        actions={card.type === "R" ? [] :
          [
            < Tooltip title="set as start"><HomeFilled key="setting" onClick={() => { closeCard(); setStartLocation(['facility', 'restaurant', 'S002']); setPannelOpen(true); }} /></Tooltip>,
            < Tooltip title="set as end"><FlagFilled key="edit" onClick={() => { closeCard(); setEndLocation(['skiPoint', 'level1', 'L001']); setPannelOpen(true); }} /></Tooltip>,
          ]}
      >
        {card.length && <p><b>Length: </b>{card.length + "m "}<b>Slope: </b>{card.slope + "°"}</p>}
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
              className='searchItem' expandTrigger="hover" placeholder="Select Start Loction" size="large"
              options={options} value={startLocation} displayRender={displayRender}
              onChange={(value) => inputOptionsChange(value, 0)}
            />
            <Cascader
              className='searchItem' expandTrigger="hover" placeholder="Select End Loction" size="large"
              options={options} value={endLocation} displayRender={displayRender}
              onChange={(value) => inputOptionsChange(value, 1)}
            />
            <Select
              className='searchItem' mode="multiple" placeholder="Difficulty Preference(mutiple)" size="large"
              options={difficultyOptions} allowClear
              onChange={(value) => inputOptionsChange(value, 2)}
            />
            <Button className='searchItem' type="default" size="large" icon={<AimOutlined />}
              onClick={() => setPannelOpen(false)}>
              Choose locations on the map
            </Button>
            <Button className='searchItem' type="primary" size="large" icon={<SearchOutlined />}
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
    </div >
  );
}
