import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { throttle, displayRender } from '../utils/tool'
import { fetchData } from '../api/request'
import { SearchOutlined, CloseOutlined, CaretUpOutlined, CaretDownOutlined, QuestionOutlined, ProfileOutlined, DragOutlined, CaretLeftOutlined, CheckCircleTwoTone, CloseCircleTwoTone, CaretRightOutlined, HomeFilled, FlagFilled, AimOutlined } from '@ant-design/icons';
import { Flex, Cascader, FloatButton, Modal, Tabs, Drawer, Select, Card, Tooltip, Button, message, Spin } from 'antd';
import RouteItem from '../components/RouteItem';
import './Map.css';

import { difficultyOptions, options } from '../utils/test'
import originData from "../utils/iteration2_origin.json";
import caculateData from "../utils/iteration2_caculate.json";

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

  useEffect(() => {
    let animationFrameId;

    // Search for the routes
    const getDataInfo = async (index) => {
      try {
        const data = await fetchData("https://mun-comp-6905-group-12-ski-routing-app-backend.vercel.app/map");
        //const data = originData;
        creatLocationArray(data);
        setLoadings(getLoading(0, false));
        setIsTipsOpen(true);
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
      // cameraRef.current.position.set(6.7, 6.5, 47.5);
      cameraRef.current.position.set(11.8, 11.6, 45.3);
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
      controlsRef.current.target.set(-8.9, 0, 29.9);
      controlsRef.current.update();
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
      loader.load("/glb/snowMountain.glb", (gltf) => {
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
          let selectedObject = intersects[0].object;
          if (selectedObjRef.current) {
            sceneRef.current.remove(selectedObjRef.current);
          }
          let material = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0xFFD700 });
          selectedObjRef.current = new THREE.Mesh(selectedObject.geometry, material);
          selectedObjRef.current.position.copy(selectedObject.position);
          sceneRef.current.add(selectedObjRef.current);
          // Set the UI of selected object, use setTimeout to make sure the dom has updated
          let info = document.getElementById('selectedInfo');
          setCard(intersects[0].object.userData);
          setTimeout(() => {
            info.style.display = 'block';
            let cardX = event.clientX;
            let cardY = event.clientY - info.offsetHeight;
            let cardHead = info.getElementsByClassName('ant-card-head')[0];
            let difficulty = intersects[0].object.userData.difficulty
            if (!isNaN(difficulty)) {
              let routeColor = ["rgba(0, 138, 0, 0.2)", "rgba(0, 0, 138, 0.2)", "rgba(138, 0, 0, 0.2)", "rgba(0, 0, 0, 0.2)"];
              cardHead.style.background = routeColor[difficulty];
            } else {
              cardHead.style.background = "rgba(2, 135, 252, 0.22)"
            }
            info.style.left = ((cardX > document.documentElement.clientWidth * 0.6) ? cardX - info.offsetWidth : cardX) + 'px';
            info.style.top = ((cardY > 100) ? cardY : cardY + info.offsetHeight) + 'px';
          }, 0);
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
      new THREE.MeshBasicMaterial({ color: 0x008a00 }), //green
      new THREE.MeshBasicMaterial({ color: 0x00008a }), //blue
      new THREE.MeshBasicMaterial({ color: 0x8a0000 }), //red
      new THREE.MeshBasicMaterial({ color: 0x000000 }) //black
    ];
    for (let i = 0; i < route.length; i++) {
      const points = route[i].locs.map(loc => new THREE.Vector3(loc.x, loc.y, loc.z))
      const path = new THREE.CatmullRomCurve3(points);
      let radius = (route[i].type === "R" ? 0.15 : 0.25);
      const tubeGeometry = new THREE.TubeGeometry(path, route[i].locs.length * 15, radius, 3, false);
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

  }, []);
  const throttledMove = useCallback(throttle(moveCameraAndTarget, 300), [moveCameraAndTarget]);

  // Switch the move control
  const switchMoveControl = () => {
    let element = document.getElementById('moveControler');
    element.style.display = (element.style.display === 'none' ? 'flex' : 'none');
  }

  // Hide the card
  const closeCard = () => {
    document.getElementById('selectedInfo').style.display = 'none';
    sceneRef.current.remove(selectedObjRef.current);
  }

  // Cascader onchange
  const inputOptionsChange = (value, index) => {
    switch (index) {
      case 0: setStartLocation(value); break;
      case 1: setEndLocation(value); break;
      case 2: setDifficulty(value); break;
      default: break;
    }
  };

  // Select a location as start or end location
  const selectLoction = (card, isStart) => {
    let option = [card.group.split("/")[0], card.group.split("/")[1], card.id];
    isStart ? setStartLocation(option) : setEndLocation(option);
    closeCard();
    setPannelOpen(true);
  };

  // Get loading status
  const getLoading = (index, status) => {
    const newLoadings = [...loadings];
    newLoadings[index] = status;
    return newLoadings;
  }

  // Search for the routes
  const searchRoutes = async (index) => {
    if (!Array.isArray(startLocation) || !Array.isArray(endLocation)) {
      messageApi.open({
        type: 'warning',
        content: "Please complete your input before searching",
      });
      return;
    }
    setLoadings(getLoading(index, true))
    try {
      let diff = (Array.isArray(difficulty) && difficulty.length > 0) ? difficulty.join('') : '123';
      const data = await fetchData(`https://mun-comp-6905-group-12-ski-routing-app-backend.vercel.app/calculate-routes?startLocationId=${startLocation[2]}&endLocationId=${endLocation[2]}&&difficulty=${diff}`);
      //const data = caculateData;
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
      <Flex id='moveControler' vertical={true} align="center" >
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
        <FloatButton icon={<DragOutlined />} onClick={() => { switchMoveControl() }} />
        <FloatButton icon={<QuestionOutlined />} onClick={() => { setIsTipsOpen(true) }} />
        {additionalShow && <FloatButton icon={<ProfileOutlined />} onClick={() => { closeCard(); setIsModalOpen(true); }} />}
        {additionalShow && <FloatButton icon={<CloseOutlined />} onClick={resetShow} />}
      </FloatButton.Group>
      {/* Location information card */}
      <Card
        id="selectedInfo"
        title={<div>{card.displayName + ' '}</div>}
        extra={<CloseOutlined onClick={() => { closeCard() }} />}
        actions={card.type !== "L" ? [] :
          [
            < Tooltip title="set as start"><HomeFilled key="setting" onClick={() => { selectLoction(card, true) }} /></Tooltip>,
            < Tooltip title="set as end"><FlagFilled key="edit" onClick={() => { selectLoction(card, false) }} /></Tooltip>,
          ]}
      >
        {card.availability ? (<b>Available <CheckCircleTwoTone twoToneColor="#52c41a" /></b>) : (<b>Not Available <CloseCircleTwoTone twoToneColor="#eb2f96" /></b>)}
        {!card.length && <p><b>Group: </b>{card.group}</p>}
        {card.length && <p><b>Length: </b>{card.length + "m "}</p>}
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
      <Modal title="Tips" okText="Got it!" cancelButtonProps={{ style: { display: 'none' } }}
        closeIcon={false} open={isTipsOpen} onOk={() => { setIsTipsOpen(false) }}
      >
        <b>Basic operations:</b>
        <p>-Click on a location or a route to check the detail.</p>
        <p>-Click <DragOutlined /> button to open the move controller (not neccessary for mobile).</p>
        <p>-Click <QuestionOutlined /> button to reopen the tips instructions.</p>
        <b>How to caculate a route?</b>
        <p>-Click on a location to open detail pannel, click <HomeFilled /> button to set as start or click <FlagFilled /> button to set as end.</p>
        <p>-Your can also click <SearchOutlined /> button to set start and end from drop-down box.</p>
        <b>After caculation finished, you can...</b>
        <p>-Choose a route you want to display on the map.</p>
        <p>-Click <ProfileOutlined /> button to redisplay the list of caculated routes.</p>
        <p>-Click <CloseOutlined /> button to restore the original map display.</p>
      </Modal>
    </div >
  );
}
