import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Typography,
  Space,
  message,
  Divider,
  Select,
  Tabs,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { getCurrentUser, updateCurrentUser } from "../../api/userApi";
import authApi from "../../api/authApi";

const { Title, Text } = Typography;
const { Option } = Select;

const MyProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser, loading: authLoading } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      navigate("/login?returnUrl=/profile");
      return;
    }
    loadUserProfile();
  }, [user, navigate, authLoading]);

  const loadUserProfile = async () => {
    if (!user?._id && !user?.id) return;
    try {
      const userData = await getCurrentUser();
      form.setFieldsValue({
        username: userData.username || userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        city: userData.city || "",
        country: userData.country || "Vietnam",
      });
      if (userData.avatar) {
        setAvatarUrl(userData.avatar);
      }
    } catch (error) {
      form.setFieldsValue({
        username: user?.username || user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: user?.city || "",
        country: user?.country || "Vietnam",
      });
      if (user?.avatar) {
        setAvatarUrl(user?.avatar);
      }
    }
  };

  const handleAvatarChange = async (info) => {
    const file = info.file;
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ chấp nhận file ảnh!");
      return;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setAvatarUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (values) => {
    if (!user?._id && !user?.id) {
      message.error("Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        username: values.username,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        country: values.country,
        avatar: avatarUrl,
      };

      const updatedUser = await updateCurrentUser(updateData);

      const newUserData = {
        ...user,
        ...updatedUser,
      };
      updateUser(newUserData);

      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        "Cập nhật thất bại, vui lòng thử lại";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setPasswordLoading(true);
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công!");
      passwordForm.resetFields();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        "Đổi mật khẩu thất bại, vui lòng thử lại";
      message.error(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const userInitial =
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 24 }}
        >
          Quay lại
        </Button>

        <Card>
          <div style={{ marginBottom: 32 }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              Thông tin cá nhân
            </Title>
            <Text type="secondary">
              Quản lý thông tin cá nhân và địa chỉ giao hàng của bạn
            </Text>
          </div>

          <Tabs
            defaultActiveKey="profile"
            items={[
              {
                key: "profile",
                label: (
                  <span>
                    <UserOutlined />
                    Thông tin cá nhân
                  </span>
                ),
                children: (
                  <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            autoComplete="off"
            >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 32,
                padding: "24px",
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <Avatar
                size={120}
                src={avatarUrl}
                icon={!avatarUrl && <UserOutlined />}
                style={{
                  backgroundColor: "#1890ff",
                  marginBottom: 16,
                  fontSize: 48,
                }}
              >
                {!avatarUrl && userInitial}
              </Avatar>
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAvatarChange}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Thay đổi ảnh đại diện
                </Button>
              </Upload>
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                JPG, PNG hoặc GIF. Tối đa 2MB
              </Text>
            </div>

            <Divider />

            <Title level={4} style={{ marginBottom: 16 }}>
              Thông tin cá nhân
            </Title>

            <Form.Item
              label="Tên hiển thị"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên hiển thị" },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập tên của bạn"
                prefix={<UserOutlined />}
              />
            </Form.Item>

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
                disabled
                style={{ background: "#f5f5f5" }}
              />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phone">
              <Input
                size="large"
                placeholder="0901 234 567"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Divider />

            <Title level={4} style={{ marginBottom: 16 }}>
              Địa chỉ giao hàng
            </Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              Địa chỉ này sẽ được sử dụng khi bạn đặt hàng
            </Text>

            <Form.Item label="Địa chỉ" name="address">
              <Input
                size="large"
                placeholder="123 Đường Lê Lợi"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="Thành phố" name="city">
              <Input
                size="large"
                placeholder="Hồ Chí Minh"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="Quốc gia" name="country">
              <Select size="large" style={{ width: "100%" }}>
                <Option value="Vietnam">Vietnam</Option>
                <Option value="United States">United States</Option>
                <Option value="Canada">Canada</Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginTop: 32 }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Lưu thay đổi
                </Button>
                <Button size="large" onClick={() => navigate(-1)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
                ),
              },
              {
                key: "password",
                label: (
                  <span>
                    <LockOutlined />
                    Đổi mật khẩu
                  </span>
                ),
                children: (
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                    autoComplete="off"
                    style={{ maxWidth: 500 }}
                  >
                    <Form.Item
                      label="Mật khẩu hiện tại"
                      name="currentPassword"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mật khẩu hiện tại",
                        },
                      ]}
                    >
                      <Input.Password
                        size="large"
                        placeholder="Nhập mật khẩu hiện tại"
                        prefix={<LockOutlined />}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Mật khẩu mới"
                      name="newPassword"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mật khẩu mới",
                        },
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

                    <Form.Item style={{ marginTop: 24 }}>
                      <Space>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          icon={<LockOutlined />}
                          loading={passwordLoading}
                        >
                          Đổi mật khẩu
                        </Button>
                        <Button
                          size="large"
                          onClick={() => passwordForm.resetFields()}
                        >
                          Hủy
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;

