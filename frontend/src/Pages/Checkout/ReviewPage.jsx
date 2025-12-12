import React, { useMemo, useState, useEffect } from "react";
import { Steps, Typography, Button, Space, Divider, message } from "antd";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useCheckout } from "../../Context/CheckoutContext";
import { useAuth } from "../../Context/AuthContext";
import api from "../../api/axiosClient";

const { Title, Text } = Typography;

const ReviewPage = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { shippingInfo, paymentInfo, resetCheckout } = useCheckout();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const userId = user?._id;

  const orderItems = useMemo(
    () =>
      cartItems?.map((item) => ({
        name: item.name,
        qty: item.quantity,
        image: item.image || "",
        price: item.price,
        product: item.id,
      })) || [],
    [cartItems]
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!userId) {
      const returnUrl = "/checkout/review";
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [userId, navigate, authLoading]);

  if (!shippingInfo) {
    return (
      <div style={{ padding: 40 }}>
        <Text>
          Thiếu thông tin giao hàng. Vui lòng quay lại{" "}
          <Link to="/checkout/shipping">Thông tin giao hàng</Link>.
        </Text>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  if (!paymentInfo) {
    return (
      <div style={{ padding: 40 }}>
        <Text>
          Thiếu thông tin thanh toán. Vui lòng quay lại{" "}
          <Link to="/checkout/payment">Thanh toán</Link>.
        </Text>
      </div>
    );
  }

  const shippingPrice = shippingInfo?.shippingPrice || 0;
  const taxPrice = 0;
  const grandTotal = (totalPrice || 0) + shippingPrice + taxPrice;

  const handleConfirm = async () => {
    if (!userId) {
      message.error("Bạn cần đăng nhập để đặt hàng.");
      navigate("/login");
      return;
    }
    if (!shippingInfo) {
      message.error("Thiếu thông tin shipping.");
      navigate("/checkout/shipping");
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      message.error("Giỏ hàng trống.");
      navigate("/");
      return;
    }

    const paymentMethod = paymentInfo?.method || "COD";

    const payload = {
      userId,
      orderItems,
      shippingAddress: {
        fullName: shippingInfo.fullName,
        address: shippingInfo.address,
        city: shippingInfo.city,
        country: shippingInfo.country,
        phone: shippingInfo.phone,
      },
      paymentMethod,
      paymentResult:
        paymentMethod === "CARD"
          ? {
              id: paymentInfo.paymentIntentId || null,
              status: paymentInfo.status || "pending",
              amount: paymentInfo.amount || grandTotal,
              currency: paymentInfo.currency || "vnd",
            }
          : undefined,
      itemsPrice: totalPrice,
      shippingPrice,
      taxPrice,
      totalPrice: grandTotal,
    };

    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      if (paymentMethod === "CARD" && paymentInfo?.paymentIntentId) {
        if (paymentInfo.status === "succeeded") {
          payload.paymentResult = {
            ...payload.paymentResult,
            status: "succeeded",
          };
        } else {
          try {
            const verifyRes = await api.post("/api/payments/verify", {
              paymentIntentId: paymentInfo.paymentIntentId,
            });

            const verifyData = verifyRes.data;

            if (!verifyData || verifyData.status !== "succeeded") {
              message.error(verifyData?.message || "Lỗi xác minh thanh toán. Vui lòng thử lại.");
              setLoading(false);
              return;
            }

            payload.paymentResult = {
              ...payload.paymentResult,
              status: verifyData.status,
            };
          } catch (verifyErr) {
            message.error("Lỗi xác minh thanh toán. Vui lòng thử lại.");
            setLoading(false);
            return;
          }
        }
      }

      const response = await api.post("/api/orders", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      clearCart();
      resetCheckout();
      message.success("Đặt hàng thành công!");

      navigate("/checkout/success", {
        state: {
          orderId: data.data?._id || data._id,
          total: grandTotal,
        },
      });
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "Lỗi server.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Link to="/">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{ marginBottom: 24, padding: "4px 8px" }}
          >
            Quay lại giỏ hàng
          </Button>
        </Link>

        <Steps
          current={2}
          items={[
            {
              title: "Giao hàng",
              icon: <ShoppingOutlined />,
            },
            {
              title: "Thanh toán",
              icon: <CreditCardOutlined />,
            },
            {
              title: "Xác nhận",
              icon: <CheckCircleOutlined />,
            },
          ]}
          style={{
            marginBottom: 40,
            background: "white",
            padding: "24px",
            borderRadius: 8,
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "32px",
              borderRadius: "8px",
              border: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <CheckCircleOutlined style={{ fontSize: 20, color: "#1890ff" }} />
              <Title level={4} style={{ margin: 0 }}>
                Xem lại đơn hàng của bạn
              </Title>
            </div>

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={5}>Địa chỉ giao hàng</Title>
                <Text style={{ display: "block", lineHeight: 1.8 }}>
                  {shippingInfo.fullName}
                  <br />
                  {shippingInfo.address}
                  <br />
                  {shippingInfo.city}
                  {shippingInfo.state ? `, ${shippingInfo.state}` : ""}
                  {shippingInfo.zip ? ` ${shippingInfo.zip}` : ""}
                  <br />
                  {shippingInfo.country}
                  <br />
                  <br />
                  {shippingInfo.email}
                  <br />
                  {shippingInfo.phone}
                </Text>
              </div>

              <Divider />

              <div>
                <Title level={5}>Phương thức thanh toán</Title>
                <Space>
                  <CreditCardOutlined style={{ fontSize: 16 }} />
                  <Text>
                    {paymentInfo?.method === "CARD"
                      ? "Thẻ tín dụng/Ghi nợ"
                      : "Thanh toán khi nhận hàng (COD)"}
                  </Text>
                </Space>
                {paymentInfo?.method === "CARD" &&
                  paymentInfo.paymentIntentId && (
                    <>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Mã thanh toán: {paymentInfo.paymentIntentId}
                      </Text>
                    </>
                  )}
              </div>

              <Divider />

              <div>
                <Title level={5}>Phương thức vận chuyển</Title>
                <Text>
                  {shippingInfo.shippingMethod === "standard"
                    ? "Giao hàng tiêu chuẩn (5-7 ngày làm việc) - ₫80,000"
                    : "Giao hàng nhanh (2-3 ngày làm việc) - ₫150,000"}
                </Text>
              </div>

              <Divider />

              <div>
                <Title level={5}>Sản phẩm đặt hàng</Title>
                {orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text>
                      {item.name} (x{item.qty})
                    </Text>
                    <Text strong>
                      ₫{(item.price * item.qty).toLocaleString()}
                    </Text>
                  </div>
                ))}
              </div>

              <Divider />

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Tạm tính</Text>
                <Text>₫{totalPrice?.toLocaleString() || 0}</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Phí vận chuyển</Text>
                <Text>₫{shippingPrice.toLocaleString()}</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>Thuế</Text>
                <Text>₫{taxPrice.toLocaleString()}</Text>
              </div>

              <Divider />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  Tổng cộng
                </Title>
                <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                  ₫{grandTotal.toLocaleString()}
                </Title>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <Button
                  size="large"
                  onClick={() => navigate("/checkout/payment")}
                >
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={handleConfirm}
                  loading={loading}
                >
                  Đặt hàng
                </Button>
              </div>
            </Space>
          </div>

          <div style={{ position: "sticky", top: 24 }}>
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderSummary = () => {
  const { cartItems, totalPrice } = useCart();
  const { shippingInfo } = useCheckout();

  const shippingPrice = shippingInfo?.shippingPrice || 0;
  const grandTotal = (totalPrice || 0) + shippingPrice;

  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #f0f0f0",
      }}
    >
      <Title level={4} style={{ marginBottom: 20 }}>
        Tóm tắt đơn hàng
      </Title>
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {cartItems?.map((item) => (
          <div
            key={item.id}
            style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: "block" }}>
                {item.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Số lượng: {item.quantity}
              </Text>
            </div>
            <Text strong>₫{(item.price * item.quantity).toLocaleString()}</Text>
          </div>
        ))}

        <Divider style={{ margin: "16px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text>Tạm tính</Text>
          <Text>₫{totalPrice?.toLocaleString() || 0}</Text>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text>Phí vận chuyển</Text>
          <Text>₫{shippingPrice.toLocaleString()}</Text>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Tổng cộng
          </Title>
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            ₫{grandTotal.toLocaleString()}
          </Title>
        </div>
      </Space>
    </div>
  );
};

export default ReviewPage;