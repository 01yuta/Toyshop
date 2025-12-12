import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Tag,
  Popconfirm,
  message,
  Typography,
  Upload,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/productApi";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import { formatVnd } from "../../utils/currency";

const { Title, Paragraph, Text } = Typography;

const CATEGORY_OPTIONS = ["Model Kits", "Accessories"];

const DEFAULT_FORM_VALUES = {
  name: "",
  series: "",
  scale: "",
  category: "Model Kits",
  price: 0,
  oldPrice: null,
  stock: 0,
  description: "",
  discountText: "",
  isNew: false,
  images: "",
  specifications: "",
};

const normalizeImages = (input = "") =>
  input
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const AdminProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const broadcastRef = useRef(null);
  const notifyProductRefresh = useCallback(() => {
    broadcastRef.current?.postMessage({ type: "refresh" });
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchProducts({ limit: 200 });
      const items = response.items || response.data || response || [];
      setProducts(items.items || items);
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }
    const token = localStorage.getItem("accessToken");
    if (!user && !token) {
      navigate("/login?returnUrl=/admin/products");
      return;
    }
    if (user && !user.isAdmin) {
      message.warning("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
    if (user?.isAdmin) {
      loadProducts();
    }
  }, [user, navigate, loadProducts, authLoading]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return undefined;
    }
    const channel = new BroadcastChannel("products");
    broadcastRef.current = channel;
    return () => {
      channel.close();
      broadcastRef.current = null;
    };
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingProduct(null);
    form.setFieldsValue(DEFAULT_FORM_VALUES);
    setModalOpen(true);
  }, [form]);

  const openEditModal = useCallback(
    (product) => {
      setEditingProduct(product);
      form.setFieldsValue({
        name: product.name || "",
        series: product.series || "",
        scale: product.scale || "",
        category: product.category || "Model Kits",
        price: product.price ?? 0,
        oldPrice: product.oldPrice ?? null,
        stock: product.stock ?? 0,
        description: product.description || "",
        discountText: product.discountText || "",
        isNew: Boolean(product.isNew),
        images: Array.isArray(product.images)
          ? product.images.join("\n")
          : product.images || "",
        specifications: product.specifications || "",
      });
      setModalOpen(true);
    },
    [form]
  );

const handleImageUpload = useCallback(
  async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await api.post("/api/uploads", formData);
      const url = response?.data?.url;
      if (url) {
        const current = form.getFieldValue("images") || "";
        const nextValue = current ? `${current}\n${url}` : url;
        form.setFieldsValue({ images: nextValue });
        message.success("Upload ảnh thành công");
      }
      onSuccess?.();
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      message.error(backendMessage || "Upload ảnh thất bại");
      onError?.(error);
    }
  },
  [form]
);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteProduct(id);
        message.success("Đã xóa sản phẩm");
        notifyProductRefresh();
        loadProducts();
      } catch (error) {
        message.error("Không thể xóa sản phẩm");
      }
    },
    [loadProducts, notifyProductRefresh]
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const normalizedImages = normalizeImages(values.images || "");

      if (!normalizedImages.length) {
        message.warning("Vui lòng nhập ít nhất một ảnh");
        return;
      }

      const payload = {
        name: values.name?.trim() || "",
        series: values.series?.trim() || "",
        scale: values.scale?.trim() || "",
        category: values.category || "Model Kits",
        price: Number(values.price) || 0,
        stock: Number(values.stock) || 0,
        images: normalizedImages,
        isNew: Boolean(values.isNew),
      };

      if (values.oldPrice !== null && values.oldPrice !== undefined && values.oldPrice !== "") {
        payload.oldPrice = Number(values.oldPrice);
      }

      if (values.description?.trim()) {
        payload.description = values.description.trim();
      }

      if (values.specifications?.trim()) {
        payload.specifications = values.specifications.trim();
      }

      if (values.discountText?.trim()) {
        payload.discountText = values.discountText.trim();
      }

      if (!payload.name || !payload.series || !payload.price) {
        message.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      setSubmitting(true);

      if (editingProduct) {
        await updateProduct(editingProduct._id || editingProduct.id, payload);
        message.success("Đã cập nhật sản phẩm");
      } else {
        await createProduct(payload);
        message.success("Đã thêm sản phẩm mới");
      }

      setModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
      notifyProductRefresh();
      loadProducts();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      const backendMessage =
        error?.response?.data?.message || 
        error?.response?.data?.errors?.join(", ") ||
        "Không thể lưu sản phẩm";
      message.error(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Sản phẩm",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 600 }}>{text}</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.series || "Chưa cập nhật"}
            </Text>
          </Space>
        ),
      },
      {
        title: "Danh mục",
        dataIndex: "category",
        key: "category",
        render: (value) => (
          <Tag color={value === "Accessories" ? "blue" : "green"}>{value}</Tag>
        ),
      },
      {
        title: "Giá bán",
        dataIndex: "price",
        key: "price",
        render: (value) => <span>{formatVnd(value)}</span>,
      },
      {
        title: "Giảm giá",
        key: "discount",
        width: 150,
        render: (_, record) => {
          const hasDiscount = record.oldPrice && record.oldPrice > record.price;
          if (!hasDiscount && !record.discountText) {
            return <Text type="secondary">—</Text>;
          }
          
          const discountAmount = hasDiscount ? record.oldPrice - record.price : 0;
          const discountPercent = hasDiscount 
            ? Math.round((discountAmount / record.oldPrice) * 100) 
            : 0;
          
          return (
            <Space direction="vertical" size={4}>
              {hasDiscount && (
                <div>
                  <Text delete type="secondary" style={{ fontSize: 12 }}>
                    {formatVnd(record.oldPrice)}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="red" style={{ margin: 0 }}>
                      -{discountPercent}%
                    </Tag>
                    {discountAmount > 0 && (
                      <div style={{ fontSize: 11, color: '#52c41a', marginTop: 2 }}>
                        Giảm {formatVnd(discountAmount)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {record.discountText && (
                <Tag color="volcano">{record.discountText}</Tag>
              )}
            </Space>
          );
        },
      },
      {
        title: "Tồn kho",
        dataIndex: "stock",
        key: "stock",
        render: (value) =>
          value > 0 ? (
            <Tag color="success">{value} còn hàng</Tag>
          ) : (
            <Tag color="red">Hết hàng</Tag>
          ),
      },
      {
        title: "Nhãn",
        dataIndex: "isNew",
        key: "isNew",
        render: (isNew) => (
          <Space size="small">
            {isNew && <Tag color="magenta">New</Tag>}
          </Space>
        ),
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
              title="Xóa sản phẩm?"
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
    [handleDelete, openEditModal]
  );

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>
            Quản lý sản phẩm
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4 }}>
            Thêm mới, chỉnh sửa hoặc xóa sản phẩm trong cửa hàng của bạn.
          </Paragraph>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Thêm sản phẩm
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadProducts}>
            Tải lại
          </Button>
        </Space>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <Table
            rowKey={(record) => record._id || record.id}
            columns={columns}
            dataSource={products}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
            style={{ minWidth: 900 }}
          />
        </div>
      </Space>

      <Modal
        open={modalOpen}
        title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
        onCancel={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onOk={handleSubmit}
        okText={editingProduct ? "Cập nhật" : "Thêm mới"}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={DEFAULT_FORM_VALUES}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="VD: MG RX-78-2 Gundam" />
          </Form.Item>

          <Form.Item
            name="series"
            label="Series"
            rules={[{ required: true, message: "Vui lòng nhập series" }]}
          >
            <Input placeholder="VD: Mobile Suit Gundam" />
          </Form.Item>

          <Form.Item name="scale" label="Scale">
            <Input placeholder="VD: 1/100 MG" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Chọn danh mục" }]}
          >
            <Select>
              {CATEGORY_OPTIONS.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: "flex", gap: 16, width: "100%" }}>
            <Form.Item
              name="price"
              label="Giá bán"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Nhập giá bán" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="oldPrice" label="Giá cũ" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 16, width: "100%" }}>
            <Form.Item
              name="stock"
              label="Tồn kho"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Nhập tồn kho" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="discountText"
              label="Text giảm giá"
              style={{ flex: 1 }}
            >
              <Input placeholder="VD: -20%" />
            </Form.Item>
          </div>

          <Form.Item name="isNew" label="New Arrival" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn" />
          </Form.Item>

          <Form.Item
            name="specifications"
            label="Specifications"
            tooltip="Nhập mỗi dòng một thông số (Scale, Height...)."
          >
            <Input.TextArea
              rows={4}
              placeholder={"Scale: 1/100 MG\nHeight: ~18cm\nMaterial: ABS, PS"}
            />
          </Form.Item>

          <Form.Item label="Tải ảnh lên">
            <Upload
              accept="image/*"
              showUploadList={false}
              customRequest={handleImageUpload}
            >
              <Button icon={<PlusOutlined />}>Upload ảnh</Button>
            </Upload>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              Ảnh sau khi upload sẽ tự động thêm vào danh sách bên dưới.
            </div>
          </Form.Item>

          <Form.Item
            name="images"
            label="Danh sách ảnh"
            rules={[{ required: true, message: "Nhập ít nhất 1 ảnh" }]}
            extra="Nhập mỗi ảnh trên một dòng hoặc cách nhau bởi dấu phẩy"
          >
            <Input.TextArea rows={4} placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;


