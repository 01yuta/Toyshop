import React, { useState, useEffect } from "react";
import {
  Steps,
  Input,
  Select,
  Radio,
  Button,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useCheckout } from "../../Context/CheckoutContext";
import { useAuth } from "../../Context/AuthContext";

const { Title, Text } = Typography;
const { Option } = Select;

const ShippingPage = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice, addToCart, decreaseQty } = useCart();
  const { setShippingInfo } = useCheckout();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      const returnUrl = "/checkout/shipping";
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [user, navigate, authLoading]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Vietnam",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.username || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "Vietnam",
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleContinue = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const fullName = formData.fullName.trim();
    const shippingPrice = shippingMethod === "standard" ? 80000 : 150000;

    setShippingInfo({
      fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      shippingMethod,
      shippingPrice,
    });

    navigate("/checkout/payment");
  };

  const calculateSubtotal = () => {
    return cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    if (subtotal >= 2000000) return 0; 
    return shippingMethod === "express" ? 150000 : 80000;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const getFreeShippingRemaining = () => {
    const remaining = 2000000 - calculateSubtotal();
    return remaining > 0 ? remaining : 0;
  };

  if (!user) {
    return null;
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
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        {cartItems?.map((item) => (
          <div
            key={item.id}
            style={{ display: "flex", gap: "12px", alignItems: "center" }}
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Số lượng:
                </Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Button
                    size="small"
                    icon={<MinusOutlined />}
                    onClick={() => decreaseQty(item.id)}
                    disabled={item.quantity <= 1}
                  />
                  <Text>{item.quantity}</Text>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => addToCart(item)}
                  />
                </div>
              </div>
            </div>
            <Text strong>₫{(item.price * item.quantity).toLocaleString()}</Text>
          </div>
        ))}

        <Divider style={{ margin: "16px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text>Tạm tính</Text>
          <Text>₫{calculateSubtotal().toLocaleString()}</Text>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text>Phí vận chuyển</Text>
          <Text>
            {calculateShipping() === 0
              ? "MIỄN PHÍ"
              : `₫${calculateShipping().toLocaleString()}`}
          </Text>
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
            ₫{calculateTotal().toLocaleString()}
          </Title>
        </div>

        {getFreeShippingRemaining() > 0 && (
          <div
            style={{
              padding: "12px",
              background: "#e6f7ff",
              borderRadius: 4,
              marginTop: 12,
              border: "1px solid #91d5ff",
            }}
          >
            <Text style={{ fontSize: 13 }}>
              Thêm ₫{getFreeShippingRemaining().toLocaleString()} để được miễn phí
              ship!
            </Text>
          </div>
        )}
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
          current={0}
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
              <ShoppingOutlined style={{ fontSize: 20, color: "#1890ff" }} />
              <Title level={4} style={{ margin: 0 }}>
                Thông tin giao hàng
              </Title>
            </div>

            <Space orientation="vertical" style={{ width: "100%" }} size="large">
                <div>
                  <Text style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                  Họ và tên *
                  </Text>
                  <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                    size="large"
                  placeholder="Nguyễn Văn A"
                  />
              </div>

              <div>
                <Text style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                  Email *
                </Text>
                <Input
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  size="large"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Text style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                  Số điện thoại *
                </Text>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  size="large"
                  placeholder="+84 912 345 678"
                />
              </div>

              <div>
                <Text style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                  Địa chỉ đường phố *
                </Text>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  size="large"
                  placeholder="123 Le Loi Street"
                />
              </div>

                <div>
                  <Text style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                    Thành phố *
                  </Text>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    size="large"
                    placeholder="Ho Chi Minh"
                  />
              </div>

              <div>
                <Text style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                  Quốc gia *
                </Text>
                <Select
                  value={formData.country}
                  onChange={(val) => handleInputChange("country", val)}
                  style={{ width: "100%" }}
                  size="large"
                >
                  <Option value="Vietnam">Vietnam</Option>
                  <Option value="United States">United States</Option>
                  <Option value="Canada">Canada</Option>
                </Select>
              </div>

              <Divider />

              <div>
                <Title level={5} style={{ marginBottom: 16 }}>
                  Phương thức vận chuyển
                </Title>
                <Radio.Group
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    <Radio value="standard" style={{ width: "100%", padding: "8px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          paddingRight: 40,
                        }}
                      >
                        <span>Giao hàng tiêu chuẩn (5-7 ngày làm việc)</span>
                        <Text strong>₫80,000</Text>
                      </div>
                    </Radio>
                    <Radio value="express" style={{ width: "100%", padding: "8px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          paddingRight: 40,
                        }}
                      >
                        <span>Giao hàng nhanh (2-3 ngày làm việc)</span>
                        <Text strong>₫150,000</Text>
                      </div>
                    </Radio>
                  </Space>
                </Radio.Group>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleContinue}
                style={{ marginTop: 8 }}
              >
                Tiếp tục đến thanh toán
              </Button>
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

export default ShippingPage;