import React from "react";
import { Card, Typography, Button } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Title, Text } = Typography;

const CheckoutSuccessPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const total = location.state?.total;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Card
        style={{ maxWidth: 500, width: "100%", textAlign: "center" }}
        bordered={false}
      >
        <Title level={3}>Cảm ơn bạn đã đặt hàng! 🎉</Title>
        {orderId && (
          <Text>
            Mã đơn hàng của bạn: <strong>{orderId}</strong>
          </Text>
        )}
        <br />
        {total != null && (
          <Text>
            Tổng thanh toán: <strong>₫{total.toLocaleString()}</strong>
          </Text>
        )}
        <br />
        <br />
        <Link to="/">
          <Button type="primary">Quay lại cửa hàng</Button>
        </Link>
      </Card>
    </div>
  );
};

export default CheckoutSuccessPage;
