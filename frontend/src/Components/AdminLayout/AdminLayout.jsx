import React, { useEffect } from "react";
import { Layout, Menu, Typography, Spin } from "antd";
import {
  AppstoreOutlined,
  UserOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  BarChartOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "./AdminLayout.css";

const { Sider, Content, Header } = Layout;
const { Title } = Typography;

const MENU_ITEMS = [
  {
    key: "/admin/sales",
    icon: <BarChartOutlined />,
    label: "Doanh số",
  },
  {
    key: "/admin/products",
    icon: <AppstoreOutlined />,
    label: "Sản phẩm",
  },
  {
    key: "/admin/users",
    icon: <UserOutlined />,
    label: "Người dùng",
  },
  {
    key: "/admin/orders",
    icon: <ShoppingOutlined />,
    label: "Đơn hàng",
  },
  {
    key: "/admin/chat",
    icon: <MessageOutlined />,
    label: "Chat khách hàng",
  },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const token = localStorage.getItem("accessToken");
      if (!user && !token) {
        navigate(`/login?returnUrl=${encodeURIComponent(location.pathname)}`);
        return;
      }
      if (user && !user.isAdmin) {
        navigate("/");
        return;
      }
    }
  }, [user, loading, navigate, location.pathname]);

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
      navigate("/login");
      return;
    }
    navigate(key);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <Layout className="admin-layout" style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <Sider 
        breakpoint="lg" 
        collapsedWidth="0" 
        className="admin-sider"
        width={200}
        style={{ overflow: "hidden" }}
      >
        <div className="admin-logo">
          <span>MECHA</span>
          <small>ADMIN</small>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            ...MENU_ITEMS,
            {
              type: "divider",
            },
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Đăng xuất",
            },
          ]}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: 0, overflowX: "hidden" }}>
        <Header className="admin-header">
          <Title level={4} style={{ margin: 0, fontSize: 18 }}>
            Bảng điều khiển admin
          </Title>
          <div className="admin-user-info">
            Xin chào, <strong>{user?.username || user?.email}</strong>
          </div>
        </Header>
        <Content className="admin-content">
          <div className="admin-content-inner">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

