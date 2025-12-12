import React from "react";
import { useNavigate } from "react-router-dom";
import { Empty, Button, Card, Space, Typography, message, Popconfirm } from "antd";
import { HeartFilled, DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useWishlist } from "../../Context/WishlistContext";
import { useCart } from "../../Context/CartContext";
import { formatVnd } from "../../utils/currency";
import "./WishlistPage.css";

const { Title, Text } = Typography;

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
    message.success("Đã xóa khỏi wishlist");
  };

  const handleClearAll = () => {
    clearWishlist();
    message.success("Đã xóa tất cả khỏi wishlist");
  };

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      id: product._id || product.id,
      quantity: 1,
      image: product.images?.[0] || product.image,
      price: product.price || 0,
      name: product.name || "Unnamed product",
    });
    message.success("Đã thêm vào giỏ hàng");
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-header">
          <Title level={2}>Wishlist của tôi</Title>
        </div>
        <Empty
          image={<HeartFilled style={{ fontSize: 64, color: "#ff4d4f" }} />}
          description={
            <span style={{ fontSize: 16, color: "#666" }}>
              Wishlist của bạn đang trống
            </span>
          }
        >
          <Button type="primary" onClick={() => navigate("/products")}>
            Khám phá sản phẩm
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <Title level={2}>
          Wishlist của tôi <span style={{ color: "#ff4d4f" }}>({wishlistItems.length})</span>
        </Title>
        <Popconfirm
          title="Xóa tất cả khỏi wishlist?"
          description="Thao tác này không thể hoàn tác"
          okText="Xóa tất cả"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={handleClearAll}
        >
          <Button danger icon={<DeleteOutlined />}>
            Xóa tất cả
          </Button>
        </Popconfirm>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map((product) => {
          const productId = product._id || product.id;
          const imageUrl = product.images?.[0] || product.image || "";
          const isOutOfStock = product.stock <= 0;

          return (
            <Card
              key={productId}
              hoverable
              className="wishlist-card"
              cover={
                <div className="product-image-wrapper">
                  <img
                    alt={product.name}
                    src={imageUrl}
                    onClick={() => navigate(`/products/${productId}`)}
                  />
                  <Button
                    className="remove-btn"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(productId)}
                  />
                  {isOutOfStock && (
                    <div className="out-of-stock-badge">Hết hàng</div>
                  )}
                </div>
              }
              actions={[
                <Button
                  key="cart"
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  disabled={isOutOfStock}
                  onClick={() => handleAddToCart(product)}
                  block
                >
                  Thêm vào giỏ
                </Button>,
              ]}
            >
              <Card.Meta
                title={
                  <div
                    onClick={() => navigate(`/products/${productId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {product.name}
                  </div>
                }
                description={
                  <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {product.series || "N/A"}
                    </Text>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Text strong style={{ color: "#1d4ed8", fontSize: 16 }}>
                        {formatVnd(product.price || 0)}
                      </Text>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <Text delete type="secondary" style={{ fontSize: 12 }}>
                          {formatVnd(product.oldPrice)}
                        </Text>
                      )}
                    </div>
                    {product.stock > 0 ? (
                      <Text type="success" style={{ fontSize: 12 }}>
                        ✓ Còn hàng ({product.stock})
                      </Text>
                    ) : (
                      <Text type="danger" style={{ fontSize: 12 }}>
                        ✗ Hết hàng
                      </Text>
                    )}
                  </Space>
                }
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;

