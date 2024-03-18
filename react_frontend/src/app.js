import React from 'react';
import './app.css';
import { HomeOutlined, BranchesOutlined, AccountBookOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;
const items = [{
    key: "1",
    icon: React.createElement(HomeOutlined),
    label: (
        <Link to={`/home`}>SKI RESORT</Link>
    ),
},
{
    key: "2",
    icon: React.createElement(BranchesOutlined),
    label: (
        <Link to={`/map`}>PISTE MAP</Link>
    ),
},
{
    key: "3",
    icon: React.createElement(AccountBookOutlined),
    label: (
        <Link to={`/notYet`}>TICKETS</Link>
    ),
},
{
    key: "4",
    icon: React.createElement(UserOutlined),
    label: (
        <Link to={`/notYet`}>CONTACT US</Link>
    ),
}]
const App = () => {
    return (
        <Layout className='app_layout'>
            <Sider
                className="app_sider"
                style={{ position: 'absolute', zIndex: 1000 }}
                breakpoint="lg"
                collapsedWidth="0"
            >
                <Menu
                    className="app_menu"
                    theme="dark" mode="inline"
                    defaultSelectedKeys={['1']}
                    items={items}
                />
            </Sider>
            <Layout>
                <Header
                    className="app_header">
                    <Menu
                        className="app_menu"
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['1']}
                        items={items}
                        style={{ flex: 1, minWidth: 0 }}
                    />
                </Header>
                <Content>
                    <Outlet />
                </Content>
                <Footer
                    style={{
                        textAlign: 'center',
                        userSelect: 'none'
                    }}
                >
                    Powered by Ant Design ©{new Date().getFullYear()} Developed by Group 12
                </Footer>
            </Layout>
        </Layout>
    );
};
export default App;