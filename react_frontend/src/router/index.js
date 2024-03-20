//路由配置
import App from "../app";
import Home from "../pages/Home";
import Map from "../pages/Map";
import NotYet from "../pages/NotYet";
import { createBrowserRouter } from "react-router-dom";
import { Navigate } from 'react-router-dom';

//配置路由实例
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Navigate to="/map" /> },
      { path: "home", element: <Home /> },
      { path: "map", element: <Map /> },
      { path: "notYet", element: <NotYet /> }
    ]
  }
]);

export default router