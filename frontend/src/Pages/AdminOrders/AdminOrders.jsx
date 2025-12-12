import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Typography,
  Drawer,
  Button,
  message,
  Descriptions,
  Popconfirm,
} from "antd";
import {
  ReloadOutlined,
  CheckCircleOutlined,
  CarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import { updateOrderStatus } from "../../api/orderApi";
import { formatVnd } from "../../utils/currency";

const { Title, Paragraph, Text } = Typography;

const AdminOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/orders");
      setOrders(res.data || []);
    } catch (error) {
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, payload) => {
    try {
      await updateOrderStatus(id, payload);
      message.success("Đã cập nhật đơn hàng");
      loadOrders();
    } catch (error) {
      message.error("Cập nhật thất bại");
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      navigate("/login?returnUrl=/admin/orders");
      return;
    }
    if (!user.isAdmin) {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
    loadOrders();
  }, [user, navigate, authLoading]);

  const columns = useMemo(
    () => [
      {
        title: "Mã đơn",
        dataIndex: "_id",
        key: "_id",
        width: 110,
        fixed: "left",
        render: (value) => <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{value?.slice(-8) || "—"}</span>,
      },
      {
        title: "Khách hàng",
        key: "customer",
        width: 140,
        render: (_, record) => (
          <span style={{ fontSize: "13px" }}>
            {record.user?.username || record.user?.email || "Khách lẻ"}
          </span>
        ),
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalPrice",
        key: "totalPrice",
        width: 120,
        align: "right",
        render: (value) => (
          <span style={{ fontWeight: 600, fontSize: "13px" }}>
            {formatVnd(value || 0)}
          </span>
        ),
      },
      {
        title: "Thanh toán",
        dataIndex: "isPaid",
        key: "isPaid",
        width: 130,
        align: "center",
        render: (value) =>
          value ? (
            <Tag color="blue" style={{ margin: 0 }}>Đã thanh toán</Tag>
          ) : (
            <Tag style={{ margin: 0 }}>Chưa thanh toán</Tag>
          ),
      },
      {
        title: "Trạng thái giao hàng",
        dataIndex: "deliveryStatus",
        key: "deliveryStatus",
        width: 140,
        align: "center",
        render: (status, record) => {
          const currentStatus = status || (record.isDelivered ? 'delivered' : 'pending');
          
          const statusConfig = {
            'pending': { color: 'default', label: 'Chờ xử lý' },
            'preparing': { color: 'blue', label: 'Đang chuẩn bị' },
            'shipping': { color: 'orange', label: 'Đang giao' },
            'delivered': { color: 'green', label: 'Đã giao' },
            'returning_pickup': { color: 'purple', label: 'Đang lấy hàng' },
            'returning_shipping': { color: 'cyan', label: 'Đang trả về' },
            'returned': { color: 'red', label: 'Đã hoàn hàng' },
          };
          
          const config = statusConfig[currentStatus] || statusConfig['pending'];
          return <Tag color={config.color} style={{ margin: 0 }}>{config.label}</Tag>;
        },
      },
      {
        title: "Trạng thái",
        key: "status",
        width: 140,
        align: "center",
        render: (_, record) => {
          if (record.isCancelled) {
            if (record.cancelStatus === 'approved') {
              return <Tag color="red" style={{ margin: 0 }}>Đã hủy</Tag>;
            }
            if (record.cancelStatus === 'rejected') {
              return <Tag color="orange" style={{ margin: 0 }}>Hủy bị từ chối</Tag>;
            }
            return <Tag color="orange" style={{ margin: 0 }}>Yêu cầu hủy</Tag>;
          }
          if (record.isReturnRequested) {
            if (record.returnStatus === 'approved') {
              return <Tag color="green" style={{ margin: 0 }}>Đã hoàn đơn</Tag>;
            }
            if (record.returnStatus === 'rejected') {
              return <Tag color="red" style={{ margin: 0 }}>Hoàn đơn bị từ chối</Tag>;
            }
            return <Tag color="blue" style={{ margin: 0 }}>Yêu cầu hoàn đơn</Tag>;
          }
          return <span style={{ color: "#d1d5db" }}>—</span>;
        },
      },
      {
        title: "Ngày đặt",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 160,
        render: (value) => (
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {value ? new Date(value).toLocaleString("vi-VN", {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }) : "—"}
          </span>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 350,
        fixed: "right",
        render: (_, record) => {
          const isCancelled = record.isCancelled && record.cancelStatus === 'approved';
          
          return (
            <Space size="small" wrap>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setSelectedOrder(record);
                  setDrawerOpen(true);
                }}
              >
                Chi tiết
              </Button>
              <Button
                icon={<CheckCircleOutlined />}
                size="small"
                disabled={isCancelled || ['returning_pickup', 'returning_shipping', 'returned'].includes(record.deliveryStatus)}
                onClick={() =>
                  handleUpdateStatus(record._id, { isPaid: !record.isPaid })
                }
              >
                {record.isPaid ? "Bỏ đánh dấu" : "Đã thanh toán"}
              </Button>
              {(() => {
                if (isCancelled) {
                  return null;
                }
                
                const currentStatus = record.deliveryStatus || (record.isDelivered ? 'delivered' : 'pending');
                
                if (['returning_pickup', 'returning_shipping', 'returned'].includes(currentStatus)) {
                  const returnStatusOrder = ['returning_pickup', 'returning_shipping', 'returned'];
                  const currentIndex = returnStatusOrder.indexOf(currentStatus);
                  const nextStatus = returnStatusOrder[currentIndex + 1];
                  
                  if (!nextStatus) {
                    return null;
                  }
                  
                  const returnStatusLabels = {
                    'returning_shipping': '→ Đang trả về',
                    'returned': '→ Đã hoàn hàng',
                  };
                  
                  return (
                    <Button
                      icon={<CarOutlined />}
                      size="small"
                      style={{ fontSize: "12px", padding: "0 8px" }}
                      type={nextStatus === 'returned' ? 'primary' : 'default'}
                      onClick={() =>
                        handleUpdateStatus(record._id, {
                          deliveryStatus: nextStatus,
                        })
                      }
                    >
                      {returnStatusLabels[nextStatus] || 'Cập nhật'}
                    </Button>
                  );
                }
                
                const statusOrder = ['pending', 'preparing', 'shipping', 'delivered'];
                const currentIndex = statusOrder.indexOf(currentStatus);
                const nextStatus = statusOrder[currentIndex + 1];
                
                if (!nextStatus) {
                  return null;
                }
                
                const statusLabels = {
                  'preparing': '→ Đang chuẩn bị',
                  'shipping': '→ Đang giao',
                  'delivered': '→ Đã giao',
                };
                
                return (
                  <Button
                    icon={<CarOutlined />}
                    size="small"
                    style={{ fontSize: "12px", padding: "0 8px" }}
                    type={nextStatus === 'delivered' ? 'primary' : 'default'}
                    onClick={() =>
                      handleUpdateStatus(record._id, {
                        deliveryStatus: nextStatus,
                      })
                    }
                  >
                    {statusLabels[nextStatus] || 'Cập nhật'}
                  </Button>
                );
              })()}
            {record.isCancelled && record.cancelStatus === 'pending' && (
              <>
                <Popconfirm
                  title="Xác nhận hủy đơn hàng?"
                  description="Đơn hàng sẽ được hủy và không thể hoàn tác."
                  okText="Xác nhận"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    handleUpdateStatus(record._id, {
                      cancelStatus: 'approved',
                    })
                  }
                >
                  <Button type="primary" size="small" style={{ fontSize: "12px", padding: "0 8px" }}>
                    Xác nhận hủy
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Từ chối yêu cầu hủy?"
                  description="Đơn hàng sẽ tiếp tục được xử lý."
                  okText="Từ chối"
                  cancelText="Đóng"
                  onConfirm={() =>
                    handleUpdateStatus(record._id, {
                      cancelStatus: 'rejected',
                    })
                  }
                >
                  <Button size="small" style={{ fontSize: "12px", padding: "0 8px" }}>
                    Từ chối
                  </Button>
                </Popconfirm>
              </>
            )}
            {record.isReturnRequested && record.returnStatus === 'pending' && (
              <>
                <Popconfirm
                  title="Xác nhận hoàn đơn hàng?"
                  okText="Xác nhận"
                  cancelText="Hủy"
                  okButtonProps={{ type: "primary" }}
                  onConfirm={() =>
                    handleUpdateStatus(record._id, {
                      returnStatus: 'approved',
                    })
                  }
                >
                  <Button type="primary" size="small" style={{ background: "#1890ff", fontSize: "12px", padding: "0 8px" }}>
                    Xác nhận hoàn đơn
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Từ chối yêu cầu hoàn đơn?"
                  description="Yêu cầu hoàn đơn sẽ bị từ chối."
                  okText="Từ chối"
                  cancelText="Đóng"
                  onConfirm={() =>
                    handleUpdateStatus(record._id, {
                      returnStatus: 'rejected',
                    })
                  }
                >
                  <Button size="small" style={{ fontSize: "12px", padding: "0 8px" }}>
                    Từ chối
                  </Button>
                </Popconfirm>
              </>
            )}
            {!record.isCancelled && (
              <Popconfirm
                title="Hủy đơn hàng?"
                description="Thao tác này không thể hoàn tác."
                okText="Hủy"
                cancelText="Đóng"
                okButtonProps={{ danger: true }}
                onConfirm={() =>
                  handleUpdateStatus(record._id, {
                    cancelReason: "Admin đã hủy",
                    isPaid: false,
                  })
                }
              >
                <Button icon={<CloseCircleOutlined />} danger size="small" style={{ fontSize: "12px", padding: "0 8px" }}>
                  Hủy
                </Button>
              </Popconfirm>
            )}
            {isCancelled && (
              <Tag color="red" style={{ margin: 0, fontSize: "11px" }}>
                Đã hủy
              </Tag>
            )}
          </Space>
          );
        },
      },
    ],
    []
  );

  return (
    <div style={{ width: "100%", maxWidth: "100%", padding: 0 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <Title level={2} style={{ marginBottom: 4, fontSize: "24px" }}>
              Quản lý đơn hàng
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: "14px" }}>
              Xem và cập nhật trạng thái đơn hàng của khách hàng.
            </Paragraph>
          </div>
          <Button icon={<ReloadOutlined />} onClick={loadOrders} type="primary">
            Tải lại
          </Button>
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <Table
            rowKey={(record) => record._id}
            columns={columns}
            dataSource={orders}
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
              pageSizeOptions: ['5', '10', '20', '50']
            }}
            scroll={{ 
              x: 'max-content',
              y: 'calc(100vh - 350px)'
            }}
            size="small"
            bordered
            style={{ fontSize: "13px" }}
          />
        </div>
      </Space>

      <Drawer
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Chi tiết đơn ${
          selectedOrder?._id ? `#${selectedOrder._id.slice(-8)}` : ""
        }`}
      >
        {selectedOrder && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Khách hàng">
              {selectedOrder.user?.username ||
                selectedOrder.user?.email ||
                "Khách lẻ"}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {formatVnd(selectedOrder.totalPrice || 0)}
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              {selectedOrder.isPaid
                ? "Đã thanh toán"
                : "Chưa thanh toán"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái giao hàng">
              {(() => {
                const status = selectedOrder.deliveryStatus || (selectedOrder.isDelivered ? 'delivered' : 'pending');
                const statusConfig = {
                  'pending': { color: 'default', label: 'Chờ xử lý' },
                  'preparing': { color: 'blue', label: 'Đang chuẩn bị' },
                  'shipping': { color: 'orange', label: 'Đang giao' },
                  'delivered': { color: 'green', label: 'Đã giao' },
                  'returning_pickup': { color: 'purple', label: 'Đang lấy hàng' },
                  'returning_shipping': { color: 'cyan', label: 'Đang trả về' },
                  'returned': { color: 'red', label: 'Đã hoàn hàng' },
                };
                const config = statusConfig[status] || statusConfig['pending'];
                return <Tag color={config.color}>{config.label}</Tag>;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao">
              {selectedOrder.shippingAddress?.address || "—"}
            </Descriptions.Item>
            {selectedOrder.isCancelled && (
              <>
                <Descriptions.Item label="Trạng thái hủy">
                  {selectedOrder.cancelStatus === 'approved' && (
                    <Tag color="red">Đã xác nhận hủy</Tag>
                  )}
                  {selectedOrder.cancelStatus === 'rejected' && (
                    <Tag color="orange">Đã từ chối hủy</Tag>
                  )}
                  {selectedOrder.cancelStatus === 'pending' && (
                    <Tag color="orange">Đang chờ xác nhận</Tag>
                  )}
                </Descriptions.Item>
                {selectedOrder.cancelReason && (
                  <Descriptions.Item label="Lý do hủy">
                    {selectedOrder.cancelReason}
                  </Descriptions.Item>
                )}
                {selectedOrder.cancelRequestedAt && (
                  <Descriptions.Item label="Ngày yêu cầu hủy">
                    {new Date(selectedOrder.cancelRequestedAt).toLocaleString("vi-VN")}
                  </Descriptions.Item>
                )}
              </>
            )}
            {selectedOrder.isReturnRequested && (
              <>
                <Descriptions.Item label="Trạng thái hoàn đơn">
                  {selectedOrder.returnStatus === 'approved' && (
                    <Tag color="green">Đã xác nhận hoàn đơn</Tag>
                  )}
                  {selectedOrder.returnStatus === 'rejected' && (
                    <Tag color="red">Đã từ chối hoàn đơn</Tag>
                  )}
                  {selectedOrder.returnStatus === 'pending' && (
                    <Tag color="blue">Đang chờ xác nhận</Tag>
                  )}
                </Descriptions.Item>
                {selectedOrder.returnReason && (
                  <Descriptions.Item label="Lý do hoàn đơn">
                    {selectedOrder.returnReason}
                  </Descriptions.Item>
                )}
                {selectedOrder.returnBankAccount && (
                  <Descriptions.Item label="Số tài khoản ngân hàng">
                    <Text strong style={{ fontFamily: "monospace", fontSize: 16 }}>
                      {selectedOrder.returnBankAccount}
                    </Text>
                  </Descriptions.Item>
                )}
                {selectedOrder.returnRequestedAt && (
                  <Descriptions.Item label="Ngày yêu cầu hoàn đơn">
                    {new Date(selectedOrder.returnRequestedAt).toLocaleString("vi-VN")}
                  </Descriptions.Item>
                )}
                {selectedOrder.returnProcessedAt && (
                  <Descriptions.Item label="Ngày xử lý hoàn đơn">
                    {new Date(selectedOrder.returnProcessedAt).toLocaleString("vi-VN")}
                  </Descriptions.Item>
                )}
              </>
            )}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default AdminOrders;

