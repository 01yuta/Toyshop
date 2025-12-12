import React, { useState } from "react";
import { Button, Input, message } from "antd";
import {
  GoogleOutlined,
  FacebookOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import "./LoginForm.css";

const LoginForm = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSignIn = async () => {
    if (!email || !password) {
      message.warning("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });

      const { user, accessToken } = res.data.data;
      login(user, accessToken);

      message.success("Đăng nhập thành công!");

      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl));
      } else {
        navigate("/");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box">
      <h2>Chào mừng trở lại</h2>
      <p>Đăng nhập vào tài khoản của bạn để tiếp tục mua sắm</p>

      <div className="input-group">
        <label>Địa chỉ email</label>
        <Input
          size="large"
          placeholder="your.email@example.com"
          prefix={<MailOutlined />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Mật khẩu</label>
        <Input.Password
          size="large"
          placeholder="Nhập mật khẩu của bạn"
          prefix={<LockOutlined />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="login-options">
        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </div>

      <Button
        type="primary"
        block
        size="large"
        className="login-btn"
        loading={loading}
        onClick={handleSignIn}
      >
        Đăng nhập
      </Button>

      <div className="or-divider">HOẶC TIẾP TỤC VỚI</div>

      <div className="social-login">
        <Button icon={<GoogleOutlined />} block>
          Google
        </Button>
        <Button icon={<FacebookOutlined />} block>
          Facebook
        </Button>
      </div>

      <div className="signup-text">
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </div>

      <p className="security-note">
        Được bảo vệ bởi mã hóa tiêu chuẩn ngành. Dữ liệu của bạn được an toàn với chúng tôi.
      </p>
    </div>
  );
};

export default LoginForm;
