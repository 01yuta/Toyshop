import React, { useState, useEffect } from "react";
import {
  Steps,
  Input,
  Radio,
  Button,
  Typography,
  Space,
  Divider,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useCheckout } from "../../Context/CheckoutContext";
import { useAuth } from "../../Context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../../api/axiosClient";

const { Title, Text } = Typography;

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CardPaymentForm = ({ 
  clientSecret, 
  cartItems, 
  loading,
  setLoading, 
  shippingInfo, 
  totalPrice, 
  setPaymentInfo, 
  navigate 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardName, setCardName] = useState("");
  const [isCardReady, setIsCardReady] = useState(false);

  const handlePayment = async () => {
    if (!cartItems || cartItems.length === 0) {
      message.error("Giỏ hàng trống.");
      return;
    }

    if (!stripe || !elements || !clientSecret) {
      message.error("Stripe chưa sẵn sàng. Vui lòng đợi...");
      return;
    }

    if (!cardName.trim()) {
      message.warning("Vui lòng nhập tên trên thẻ");
      return;
    }

    if (!isCardReady) {
      message.warning("Vui lòng đợi form thanh toán tải xong");
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        message.error("Card element chưa sẵn sàng. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardName,
        },
      });

      if (pmError) {
        message.error(pmError.message || "Lỗi tạo payment method");
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        message.error(confirmError.message || "Lỗi xác nhận thanh toán");
        setLoading(false);
        return;
      }

      if (paymentIntent.status !== "succeeded") {
        message.error("Thanh toán chưa hoàn tất. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      const shippingPrice = shippingInfo.shippingPrice || 0;
      const totalWithShipping = (totalPrice || 0) + shippingPrice;

      setPaymentInfo({
        method: "CARD",
        amount: Math.round(totalWithShipping),
        currency: "vnd",
        paymentIntentId: paymentIntent.id,
        paymentMethodId: paymentMethod.id,
        status: paymentIntent.status,
      });

      navigate("/checkout/review");
    } catch (err) {
      message.error("Lỗi xử lý thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Text style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Tên trên thẻ *
        </Text>
        <Input
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="NGUYEN VAN A"
          size="large"
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Thông tin thẻ *
        </Text>
        <div
          style={{
            padding: "12px",
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            background: "white",
            minHeight: "40px",
          }}
        >
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
            onReady={() => setIsCardReady(true)}
          />
        </div>
      </div>

      <div
        style={{
          padding: "12px 16px",
          background: "#f0f9ff",
          borderRadius: 6,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          border: "1px solid #bae7ff",
          marginBottom: 16,
        }}
      >
        <SafetyOutlined style={{ color: "#1890ff", fontSize: 16, marginTop: 2 }} />
        <Text style={{ fontSize: 13, color: "#595959" }}>
          Thông tin thanh toán của bạn được mã hóa và bảo mật. Chúng tôi không bao giờ lưu trữ chi tiết thẻ của bạn.
        </Text>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <Button
          size="large"
          onClick={() => navigate("/checkout/shipping")}
        >
          Quay lại
        </Button>
        <Button
          type="primary"
          size="large"
          style={{ flex: 1 }}
          onClick={handlePayment}
          loading={loading}
          disabled={!stripe || !elements || !clientSecret || !isCardReady}
        >
          Thanh toán & Xem lại đơn hàng
        </Button>
      </div>
    </>
  );
};

const CODPaymentForm = ({ 
  cartItems, 
  loading,
  setLoading, 
  shippingInfo, 
  totalPrice, 
  setPaymentInfo, 
  navigate 
}) => {
  const handlePayment = () => {
    if (!cartItems || cartItems.length === 0) {
      message.error("Giỏ hàng trống.");
      return;
    }

    const shippingPrice = shippingInfo.shippingPrice || 0;
    const totalWithShipping = (totalPrice || 0) + shippingPrice;
    
    setPaymentInfo({
      method: "COD",
      amount: Math.round(totalWithShipping),
      currency: "vnd",
    });
    
    navigate("/checkout/review");
  };

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
      <Button
        size="large"
        onClick={() => navigate("/checkout/shipping")}
      >
        Quay lại
      </Button>
      <Button
        type="primary"
        size="large"
        style={{ flex: 1 }}
        onClick={handlePayment}
        loading={loading}
      >
        Xem lại đơn hàng
      </Button>
    </div>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice } = useCart();
  const { shippingInfo, setPaymentInfo } = useCheckout();
  const { user, loading: authLoading } = useAuth();

  const [method, setMethod] = useState("CARD");
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      navigate(`/login?returnUrl=${encodeURIComponent("/checkout/payment")}`);
    }
  }, [user, navigate, authLoading]);

  useEffect(() => {
    if (method === "CARD" && !clientSecret && shippingInfo && totalPrice) {
      const createIntent = async () => {
        const shippingPrice = shippingInfo.shippingPrice || 0;
        const totalWithShipping = (totalPrice || 0) + shippingPrice;
        
        try {
          const res = await api.post("/api/payments/create-intent", {
            amount: Math.round(totalWithShipping),
            currency: "vnd",
          });
          
          const data = res.data;
          if (data && data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            message.error(data?.message || "Lỗi tạo payment intent");
          }
        } catch (err) {
          console.error("Payment intent error:", err);
          const errorMsg = err.response?.data?.message || err.message || "Lỗi kết nối server. Vui lòng thử lại.";
          message.error(errorMsg);
        }
      };
      createIntent();
    } else if (method !== "CARD") {
      setClientSecret(null);
    }
  }, [method, shippingInfo, totalPrice, clientSecret]);

  if (!user) {
    return null;
  }

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

  const OrderSummary = () => (
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
          <Text>₫{shippingInfo.shippingPrice?.toLocaleString() || 0}</Text>
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
            ₫
            {(
              (totalPrice || 0) + (shippingInfo.shippingPrice || 0)
            ).toLocaleString()}
          </Title>
        </div>
      </Space>
    </div>
  );

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
          current={1}
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
              <CreditCardOutlined style={{ fontSize: 20, color: "#1890ff" }} />
              <Title level={4} style={{ margin: 0 }}>
                Thông tin thanh toán
              </Title>
            </div>

            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <div>
                <Title level={5} style={{ marginBottom: 16 }}>
                  Phương thức thanh toán
                </Title>
                <Radio.Group
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value);
                    setClientSecret(null);
                  }}
                >
                  <Space direction="vertical">
                    <Radio value="CARD">Thẻ tín dụng/Ghi nợ</Radio>
                    <Radio value="COD">Thanh toán khi nhận hàng (COD)</Radio>
                  </Space>
                </Radio.Group>
              </div>

              {method === "CARD" ? (
                clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CardPaymentForm 
                      clientSecret={clientSecret}
                      cartItems={cartItems}
                      loading={loading}
                      setLoading={setLoading}
                      shippingInfo={shippingInfo}
                      totalPrice={totalPrice}
                      setPaymentInfo={setPaymentInfo}
                      navigate={navigate}
                    />
                  </Elements>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text>Đang tải form thanh toán...</Text>
                  </div>
                )
              ) : (
                <CODPaymentForm 
                  cartItems={cartItems}
                  loading={loading}
                  setLoading={setLoading}
                  shippingInfo={shippingInfo}
                  totalPrice={totalPrice}
                  setPaymentInfo={setPaymentInfo}
                  navigate={navigate}
                />
              )}
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

export default PaymentPage;
