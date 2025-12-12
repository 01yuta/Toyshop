import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import RegisterForm from "../../Components/RegisterForm/RegisterForm";
import "../LoginPage/LoginPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-form-section">
        <button className="back-btn" onClick={() => navigate("/")}>
          <ArrowLeftOutlined /> Back to Shop
        </button>
        <RegisterForm />
      </div>
      <div className="login-banner">
        <div className="banner-content">
          <h1>
            Gia nhập cộng đồng
            <br />
            MECHA ZONE
          </h1>
          <p>
            Cập nhật deal độc quyền, quản lý bộ sưu tập và đơn hàng của bạn
            trong một nơi duy nhất.
          </p>
          <div className="stats">
            <div>
              <h2>10K+</h2>
              <span>Thành viên tin dùng</span>
            </div>
            <div>
              <h2>500+</h2>
              <span>Model kits mới mỗi năm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

