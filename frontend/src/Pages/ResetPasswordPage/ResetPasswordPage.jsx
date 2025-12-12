import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Space, message } from "antd";
import { LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import authApi from "../../api/authApi";

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      message.error("Token không hợp lệ. Vui lòng yêu cầu link reset mới.");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleSubmit = async (values) => {
    if (!token) {
      message.error("Token không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword({
        token,
        newPassword: values.newPassword,
      });

      setSuccess(true);
      message.success("Đặt lại mật khẩu thành công!");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        "Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 450,
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
          }}
        >
          <CheckCircleOutlined
            style={{ fontSize: 64, color: "#52c41a", marginBottom: 24 }}
          />
          <Title level={3} style={{ marginBottom: 16 }}>
            Đặt lại mật khẩu thành công!
          </Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
            Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
          </Text>
          <Button type="primary" onClick={() => navigate("/login")}>
            Đi đến trang đăng nhập
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 450,
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              Đặt lại mật khẩu
            </Title>
            <Text type="secondary">
              Nhập mật khẩu mới cho tài khoản của bạn
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu mới",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập lại mật khẩu mới"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  height: 48,
                  fontWeight: 600,
                }}
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <Link to="/login">
              <Button type="link">Quay lại đăng nhập</Button>
            </Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;

