import React, { useEffect, useMemo, useState } from "react";
import { Card, List, Tag, Typography, Empty, Spin, Button, Modal, Input, message, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders, cancelOrder, returnOrder } from "../../api/orderApi";
import { useAuth } from "../../Context/AuthContext";
import { formatVnd } from "../../utils/currency";
import { CloseCircleOutlined, UndoOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusTag = (order) => {
  if (order.isCancelled) {
    if (order.cancelStatus === 'approved') {
      return <Tag color="red">Đã hủy</Tag>;
    }
    if (order.cancelStatus === 'rejected') {
      return <Tag color="orange">Hủy bị từ chối</Tag>;
    }
    return <Tag color="orange">Đang chờ hủy</Tag>;
  }
  
  const deliveryStatus = order.deliveryStatus || (order.isDelivered ? 'delivered' : 'pending');
  const statusConfig = {
    'pending': { color: 'default', label: 'Chờ xử lý' },
    'preparing': { color: 'blue', label: 'Đang chuẩn bị' },
    'shipping': { color: 'orange', label: 'Đang giao' },
    'delivered': { color: 'green', label: 'Đã giao' },
    'returning_pickup': { color: 'purple', label: 'Đang lấy hàng' },
    'returning_shipping': { color: 'cyan', label: 'Đang trả về' },
    'returned': { color: 'red', label: 'Đã hoàn hàng' },
  };
  
  const config = statusConfig[deliveryStatus] || statusConfig['pending'];
  return <Tag color={config.color}>{config.label}</Tag>;
};

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnBankAccount, setReturnBankAccount] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      navigate("/login?returnUrl=/orders");
    }
  }, [user, navigate, authLoading]);

  const loadOrders = async () => {
    if (!user?._id && !user?.id) return;
    try {
      setLoading(true);
      const data = await fetchMyOrders(user._id || user.id);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleCancelClick = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelModalOpen(true);
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      message.warning("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    try {
      setCancelling(true);
      await cancelOrder(selectedOrderId, cancelReason);
      message.success("Yêu cầu hủy đơn hàng đã được gửi, đang chờ admin xác nhận");
      setCancelModalOpen(false);
      setCancelReason("");
      setSelectedOrderId(null);
      loadOrders();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || "Hủy đơn hàng thất bại, vui lòng thử lại";
      message.error(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnClick = (order) => {
    setSelectedOrderId(order._id);
    setSelectedOrder(order);
    setReturnModalOpen(true);
    setReturnReason("");
    setReturnBankAccount("");
  };

  const canReturnOrder = (order) => {
    if (!order.deliveredAt) return false;
    const deliveredAt = new Date(order.deliveredAt);
    const now = new Date();
    const hoursSinceDelivery = (now - deliveredAt) / (1000 * 60 * 60);
    return hoursSinceDelivery <= 24;
  };

  const getHoursSinceDelivery = (order) => {
    if (!order.deliveredAt) return null;
    const deliveredAt = new Date(order.deliveredAt);
    const now = new Date();
    const hoursSinceDelivery = (now - deliveredAt) / (1000 * 60 * 60);
    return Math.floor(hoursSinceDelivery);
  };

  const handleReturnOrder = async () => {
    if (selectedOrder && !canReturnOrder(selectedOrder)) {
      message.error("Đã quá 24 giờ kể từ khi nhận hàng, không thể hoàn đơn");
      setReturnModalOpen(false);
      return;
    }

    if (!returnReason.trim()) {
      message.warning("Vui lòng nhập lý do hoàn đơn hàng");
      return;
    }

    if (!returnBankAccount.trim()) {
      message.warning("Vui lòng nhập số tài khoản ngân hàng");
      return;
    }

    const bankAccountRegex = /^\d{8,20}$/;
    if (!bankAccountRegex.test(returnBankAccount.trim())) {
      message.warning("Số tài khoản ngân hàng không hợp lệ (phải là số từ 8-20 chữ số)");
      return;
    }

    try {
      setReturning(true);
      await returnOrder(selectedOrderId, returnReason, returnBankAccount);
      message.success("Yêu cầu hoàn đơn hàng đã được gửi, đang chờ admin xác nhận");
      setReturnModalOpen(false);
      setReturnReason("");
      setReturnBankAccount("");
      setSelectedOrderId(null);
      setSelectedOrder(null);
      loadOrders();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || "Hoàn đơn hàng thất bại, vui lòng thử lại";
      message.error(errorMsg);
    } finally {
      setReturning(false);
    }
  };

  const ordersWithTotals = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        subtotal:
          order?.orderItems?.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
          ) || 0,
      })),
    [orders]
  );

  if (!user) {
    return null;
  }

  return (
    <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Đơn hàng của tôi
        </Title>
        <Text type="secondary">
          Theo dõi trạng thái đơn hàng và chi tiết từng lần mua.
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : ordersWithTotals.length === 0 ? (
        <Empty
          description="Bạn chưa có đơn hàng nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate("/models")}>
            Mua sắm ngay
          </Button>
        </Empty>
      ) : (
        <List
          dataSource={ordersWithTotals}
          renderItem={(order) => (
            <Card
              key={order._id}
              style={{ marginBottom: 16 }}
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <Text strong>Mã đơn: {order._id.slice(-8)}</Text>
                    <div>
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <div>{statusTag(order)}</div>
                </div>
              }
              extra={
                <div style={{ textAlign: "right" }}>
                  <Text type="secondary">Tổng cộng</Text>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {formatVnd(order.totalPrice || order.subtotal)}
                  </div>
                </div>
              }
            >
              <List
                dataSource={order.orderItems || []}
                renderItem={(item) => (
                  <List.Item
                    key={`${order._id}-${item.product}`}
                    style={{ alignItems: "flex-start" }}
                  >
                    <div style={{ flex: 1 }}>
                      <Text strong>{item.name}</Text>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        Số lượng: {item.qty}
                      </div>
                    </div>
                    <div>{formatVnd(item.price * item.qty)}</div>
                  </List.Item>
                )}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 12,
                  fontSize: 13,
                  color: "#64748b",
                }}
              >
                <div>
                  Phương thức: {order.paymentMethod || "Không xác định"}
                </div>
                <div>
                  Giao đến:{" "}
                  {order.shippingAddress?.address || "Chưa có thông tin"}
                </div>
              </div>

              {order.isCancelled && order.cancelReason && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px",
                    background: "#fff7e6",
                    borderRadius: 4,
                    border: "1px solid #ffd591",
                  }}
                >
                  <Text strong style={{ display: "block", marginBottom: 4 }}>
                    Lý do hủy:
                  </Text>
                  <Text>{order.cancelReason}</Text>
                  {order.cancelStatus === 'pending' && (
                    <div style={{ marginTop: 8 }}>
                      <Tag color="orange">Đang chờ admin xác nhận</Tag>
                    </div>
                  )}
                </div>
              )}

              {order.isReturnRequested && order.returnReason && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px",
                    background: "#e6f7ff",
                    borderRadius: 4,
                    border: "1px solid #91d5ff",
                  }}
                >
                  <Text strong style={{ display: "block", marginBottom: 4 }}>
                    Lý do hoàn đơn:
                  </Text>
                  <Text>{order.returnReason}</Text>
                  {order.returnBankAccount && (
                    <>
                      <Text strong style={{ display: "block", marginTop: 8, marginBottom: 4 }}>
                        Số tài khoản ngân hàng:
                      </Text>
                      <Text style={{ fontFamily: "monospace" }}>{order.returnBankAccount}</Text>
                    </>
                  )}
                  {order.returnStatus === 'pending' && (
                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue">Đang chờ admin xác nhận</Tag>
                    </div>
                  )}
                  {order.returnStatus === 'approved' && (
                    <div style={{ marginTop: 8 }}>
                      <Tag color="green">Đã được chấp nhận</Tag>
                    </div>
                  )}
                  {order.returnStatus === 'rejected' && (
                    <div style={{ marginTop: 8 }}>
                      <Tag color="red">Đã bị từ chối</Tag>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 16, textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                {!order.isDelivered && order.deliveryStatus !== 'delivered' && !order.isCancelled && (
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleCancelClick(order._id)}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
                {(order.isDelivered || order.deliveryStatus === 'delivered') && 
                 !order.isReturnRequested && 
                 !order.isCancelled && (
                  <>
                    {canReturnOrder(order) ? (
                      <Button
                        type="primary"
                        icon={<UndoOutlined />}
                        onClick={() => handleReturnClick(order)}
                        style={{ background: "#1890ff" }}
                      >
                        Hoàn đơn hàng
                      </Button>
                    ) : (
                      <div style={{ textAlign: "left" }}>
                        <Button
                          disabled
                          icon={<UndoOutlined />}
                          style={{ marginBottom: 4 }}
                        >
                          Hoàn đơn hàng
                        </Button>
                        <div style={{ fontSize: 12, color: "#ff4d4f" }}>
                          Đã quá 24 giờ kể từ khi nhận hàng
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          )}
        />
      )}

      <Modal
        title="Hủy đơn hàng"
        open={cancelModalOpen}
        onOk={handleCancelOrder}
        onCancel={() => {
          setCancelModalOpen(false);
          setCancelReason("");
          setSelectedOrderId(null);
        }}
        okText="Gửi yêu cầu hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true, loading: cancelling }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>
            Bạn có chắc chắn muốn hủy đơn hàng này? Vui lòng nhập lý do hủy đơn hàng.
            Yêu cầu của bạn sẽ được gửi đến admin để xác nhận.
          </Text>
        </div>
        <TextArea
          rows={4}
          placeholder="Nhập lý do hủy đơn hàng..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          maxLength={500}
          showCount
        />
      </Modal>

      <Modal
        title="Hoàn đơn hàng"
        open={returnModalOpen}
        onOk={handleReturnOrder}
        onCancel={() => {
          setReturnModalOpen(false);
          setReturnReason("");
          setReturnBankAccount("");
          setSelectedOrderId(null);
          setSelectedOrder(null);
        }}
        okText="Gửi yêu cầu hoàn đơn"
        cancelText="Đóng"
        okButtonProps={{ 
          type: "primary", 
          loading: returning,
          disabled: selectedOrder && !canReturnOrder(selectedOrder)
        }}
        width={600}
      >
        {selectedOrder && (
          <div style={{ marginBottom: 16 }}>
            {canReturnOrder(selectedOrder) ? (
              <Alert
                message={`Bạn có ${Math.max(0, 24 - getHoursSinceDelivery(selectedOrder))} giờ còn lại để hoàn đơn hàng`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            ) : (
              <Alert
                message={`Đã quá 24 giờ kể từ khi nhận hàng (${getHoursSinceDelivery(selectedOrder)} giờ trước), không thể hoàn đơn`}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <Text>
            Bạn có chắc chắn muốn hoàn đơn hàng này? Vui lòng điền đầy đủ thông tin bên dưới.
            Yêu cầu của bạn sẽ được gửi đến admin để xác nhận.
          </Text>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Lý do hoàn đơn hàng <span style={{ color: "#ff4d4f" }}>*</span>
          </Text>
          <TextArea
            rows={4}
            placeholder="Nhập lý do hoàn đơn hàng (ví dụ: sản phẩm bị lỗi, không đúng mô tả, không vừa, v.v.)..."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            maxLength={500}
            showCount
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Số tài khoản ngân hàng để hoàn tiền <span style={{ color: "#ff4d4f" }}>*</span>
          </Text>
          <Input
            placeholder="Nhập số tài khoản ngân hàng (8-20 chữ số)"
            value={returnBankAccount}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setReturnBankAccount(value);
            }}
            maxLength={20}
            style={{ fontSize: 16 }}
          />
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
            Số tiền sẽ được hoàn vào tài khoản này sau khi admin xác nhận
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default MyOrders;

