import React, { useState } from "react";
import { Button, Input, message } from "antd";
import {
  MailOutlined,
  UserOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import "./RegisterForm.css";

const RegisterForm = () => {
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleRegister = async () => {
    const { username, email, phone, password, confirmPassword } = formValues;

    if (!username || !email || !password || !confirmPassword) {
      message.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (password.length < 6) {
      message.warning("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await authApi.register({
        username,
        email,
        password,
        phone: phone || undefined,
      });
      message.success("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      const backendMessage =
        err?.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại";
      message.error(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-box">
      <h2>Tạo tài khoản mới</h2>
      <p>Tham gia cộng đồng MECHA ZONE để theo dõi đơn hàng của bạn.</p>

      <div className="input-row">
        <div className="input-group">
          <label>Tên hiển thị</label>
          <Input
            size="large"
            placeholder="Nhập tên của bạn"
            prefix={<UserOutlined />}
            value={formValues.username}
            onChange={handleChange("username")}
          />
        </div>
        <div className="input-group">
          <label>Số điện thoại (tuỳ chọn)</label>
          <Input
            size="large"
            placeholder="0901 234 567"
            prefix={<PhoneOutlined />}
            value={formValues.phone}
            onChange={handleChange("phone")}
          />
        </div>
      </div>

      <div className="input-group">
        <label>Email</label>
        <Input
          size="large"
          placeholder="you@example.com"
          prefix={<MailOutlined />}
          value={formValues.email}
          onChange={handleChange("email")}
        />
      </div>

      <div className="input-group">
        <label>Mật khẩu</label>
        <Input.Password
          size="large"
          placeholder="Tối thiểu 6 ký tự"
          prefix={<LockOutlined />}
          value={formValues.password}
          onChange={handleChange("password")}
        />
      </div>

      <div className="input-group">
        <label>Nhập lại mật khẩu</label>
        <Input.Password
          size="large"
          placeholder="Nhập lại mật khẩu của bạn"
          prefix={<LockOutlined />}
          value={formValues.confirmPassword}
          onChange={handleChange("confirmPassword")}
        />
      </div>

      <Button
        type="primary"
        block
        size="large"
        className="register-btn"
        loading={loading}
        onClick={handleRegister}
      >
        Đăng ký
      </Button>

      <div className="login-text">
        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
      </div>
    </div>
  );
};

export default RegisterForm;

