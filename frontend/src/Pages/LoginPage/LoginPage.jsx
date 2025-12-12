import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import LoginForm from "../../Components/LoginForm/LoginForm";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-form-section">
        <button className="back-btn" onClick={() => navigate("/")}>
          <ArrowLeftOutlined /> Quay lại cửa hàng
        </button>
        <LoginForm />
      </div>
      <div className="login-banner">
        <div className="banner-content">
          <h1>
            Tham gia cộng đồng
            <br />
            MECHA ZONE
          </h1>
          <p>
            Truy cập các ưu đãi độc quyền, theo dõi đơn hàng của bạn,
            <br />
            và quản lý bộ sưu tập của bạn tất cả ở một nơi.
          </p>

          <div className="stats">
            <div>
              <h2>10K+</h2>
              <span>Người xây dựng hài lòng</span>
            </div>
            <div>
              <h2>500+</h2>
              <span>Model Kits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
