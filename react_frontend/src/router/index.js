//路由配置
import Home from "../pages/Home";
import Map from "../pages/Map";
import { createBrowserRouter } from "react-router-dom";

//配置路由实例
const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/map",
        element: <Map />,
    },
]);

export default router