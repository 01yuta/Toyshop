import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Space, message } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../../api/authApi";

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await authApi.forgotPassword({ email: values.email });
      
      message.success(
        response.data?.resetToken
          ? `Link reset đã được gửi! Token (dev only): ${response.data.resetToken}`
          : "Nếu email tồn tại, link reset đã được gửi đến email của bạn"
      );
      
      form.resetFields();
    } catch (error) {
      console.error("Forgot password error:", error);
      message.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
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
              Quên mật khẩu?
            </Title>
            <Text type="secondary">
              Nhập email của bạn để nhận link đặt lại mật khẩu
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input
                size="large"
                placeholder="your.email@example.com"
                prefix={<MailOutlined />}
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
                  background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  border: "none",
                  height: 48,
                  fontWeight: 600,
                }}
              >
                Gửi link reset mật khẩu
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <Space>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/login")}
              >
                Quay lại đăng nhập
              </Button>
              <Text type="secondary">|</Text>
              <Link to="/register">
                <Button type="link">Chưa có tài khoản? Đăng ký</Button>
              </Link>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;

