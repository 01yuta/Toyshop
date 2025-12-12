import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Space,
  Button,
  Tag,
  message,
  Typography,
  Modal,
  Form,
  Input,
  Switch,
  Popconfirm,
} from "antd";
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchUsers, createUser, updateUser, deleteUser } from "../../api/userApi";

const { Title, Paragraph } = Typography;

const AdminUsers = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const isEditing = Boolean(editingUser);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    const token = localStorage.getItem("accessToken");
    if (!user && !token) {
      navigate("/login?returnUrl=/admin/users");
      return;
    }
    if (user && !user.isAdmin) {
      message.warning("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
    if (user?.isAdmin) {
      loadUsers();
    }
  }, [user, loadUsers, navigate, authLoading]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ isAdmin: false });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      phone: record.phone,
      isAdmin: record.isAdmin,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingUser) {
        const payload = {
          username: values.username,
          email: values.email,
          phone: values.phone,
          isAdmin: Boolean(values.isAdmin),
        };
        await updateUser(editingUser._id || editingUser.id, payload);
        message.success("Đã cập nhật người dùng");
      } else {
        const payload = {
          username: values.username,
          email: values.email,
          password: values.password,
          phone: values.phone,
          isAdmin: Boolean(values.isAdmin),
        };
        await createUser(payload);
        message.success("Đã tạo người dùng mới");
      }

      closeModal();
      loadUsers();
    } catch (error) {
      if (error?.errorFields) return;
      console.error("Save user failed:", error);
      const backendMessage =
        error?.response?.data?.message ||
        (editingUser
          ? "Không thể cập nhật người dùng"
          : "Không thể tạo người dùng");
      message.error(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success("Đã xóa người dùng");
      loadUsers();
    } catch (error) {
      message.error("Không thể xóa người dùng");
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Tên hiển thị",
        dataIndex: "username",
        key: "username",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        key: "phone",
        render: (value) => value || "—",
      },
      {
        title: "Vai trò",
        dataIndex: "isAdmin",
        key: "isAdmin",
        render: (value) =>
          value ? <Tag color="green">Admin</Tag> : <Tag>Khách</Tag>,
      },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xóa người dùng?"
              description="Thao tác này không thể hoàn tác"
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record._id || record.id)}
            >
              <Button danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>
            Quản lý người dùng
          </Title>
          <Paragraph type="secondary">
            Xem, chỉnh sửa quyền hoặc xóa người dùng khỏi hệ thống.
          </Paragraph>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Thêm người dùng
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadUsers}>
            Tải lại
          </Button>
        </Space>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <Table
            rowKey={(record) => record._id || record.id}
            columns={columns}
            dataSource={users}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
            style={{ minWidth: 800 }}
          />
        </div>
      </Space>

      <Modal
        open={modalOpen}
        title={isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={isEditing ? "Lưu" : "Tạo mới"}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{ isAdmin: false }}
        >
          <Form.Item
            name="username"
            label="Tên hiển thị"
            rules={[{ required: true, message: "Nhập tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
          {!isEditing && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item
            name="isAdmin"
            label="Quản trị viên"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsers;


