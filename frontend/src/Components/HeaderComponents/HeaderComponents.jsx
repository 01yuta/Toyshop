import React, { useState, useCallback, useRef } from "react";
import {
  Col,
  Drawer,
  Button,
  Badge,
  AutoComplete,
  Input,
  Dropdown,
  Avatar,
  Spin,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  DownOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { WrapperHeader, Logo, NavMenu, SearchBox, UserActions } from "./style";
import logo from "../Assets/mechazone.png";
import { TopBanner } from "./TopBanner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import { useWishlist } from "../../Context/WishlistContext";
import { formatVnd } from "../../utils/currency";
import { fetchProducts } from "../../api/productApi";

export const HeaderComponents = () => {
  const [open, setOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const productIdMapRef = useRef(new Map());

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    cartItems,
    addToCart,
    decreaseQty,
    removeFromCart,
    totalPrice,
    getTotalQuantity,
  } = useCart();
  const { wishlistItems } = useWishlist();
  const hideAccount =
    location.pathname === "/login" || location.pathname === "/register";

  const handleSearchChange = useCallback(async (value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value || value.trim().length < 2) {
      setSearchOptions([]);
      productIdMapRef.current.clear();
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await fetchProducts({
          keyword: value.trim(),
          limit: 8,
        });
        
      const products = response.items || response.data || response || [];
        const productList = Array.isArray(products) ? products : [];
        
        productIdMapRef.current.clear();
        
        const options = productList.map((product) => {
          const productId = product._id || product.id;
          const optionValue = product.name;
          
          productIdMapRef.current.set(optionValue, productId);
          
          return {
            value: optionValue,
            label: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "4px 0",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/products/${productId}`);
                  setSearchOptions([]);
                  productIdMapRef.current.clear();
                }}
              >
                <img
                  src={product.images?.[0] || ""}
                  alt={product.name}
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1px solid #e0e0e0",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.name}
                  </div>
                  <div
                    style={{
                      color: "#1d4ed8",
                      fontSize: 13,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    {formatVnd(product.price)}
                  </div>
                </div>
              </div>
            ),
          };
        });

        setSearchOptions(options);
      } catch (error) {
        console.error("Search error:", error);
        setSearchOptions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [navigate]);

  const handleSelectSuggestion = (value) => {
    const productId = productIdMapRef.current.get(value);
    if (productId) {
      navigate(`/products/${productId}`);
      setSearchOptions([]);
      productIdMapRef.current.clear();
    }
  };

  const handleSubmitSearch = (value) => {
    if (!value) return;
    navigate(`/products?search=${encodeURIComponent(value)}`);
    setSearchOptions([]);
  };

  const showPopup = (msg) => {
    const popup = document.createElement("div");
    popup.innerHTML = `<span style="margin-right:8px;">🛒</span>${msg}`;
    popup.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #fff;
      border: 1px solid #e0e0e0;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 500;
      color: #1d4ed8;
      z-index: 9999;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.4s ease;
    `;
    document.body.appendChild(popup);

    requestAnimationFrame(() => {
      popup.style.opacity = "1";
      popup.style.transform = "translateX(0)";
    });

    setTimeout(() => {
      popup.style.opacity = "0";
      popup.style.transform = "translateX(100%)";
      setTimeout(() => popup.remove(), 400);
    }, 2000);
  };

  const handleAdd = (item) => {
    addToCart(item);
    const existing = cartItems.find((i) => i.id === item.id);
    const msg = existing
      ? `Đã thêm thêm ${item.name} vào giỏ hàng`
      : `Đã thêm ${item.name} vào giỏ hàng`;
    showPopup(msg);
  };
  const accountMenuItems = [
    {
      key: "profile",
      label: <span>Hồ sơ của tôi</span>, 
    },
    {
      key: "orders",
      label: <span>Đơn hàng của tôi</span>, 
    },
    {
      key: "wishlist",
      label: <span>Yêu thích ({wishlistItems.length})</span>, 
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: <span style={{ color: "#e11d48" }}>Đăng xuất</span>,
    },
  ];

  const handleAccountMenuClick = ({ key }) => {
    if (key === "profile") {
      navigate("/profile"); 
    }
    if (key === "orders") {
      navigate("/orders");
    }
    if (key === "wishlist") {
      navigate("/wishlist");
    }
    if (key === "logout") {
      logout();
      navigate("/");
    }
  };

  const userInitial =
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <>
      <TopBanner />

      <WrapperHeader justify="space-between">
        <Col>
          <Logo>
            <img src={logo} alt="Mecha Zone Logo" />
            <span>MECHA ZONE</span>
          </Logo>
        </Col>

        <Col>
          <NavMenu>
            <Link to="/">Trang chủ</Link>
            <Link to="/models">Mô hình</Link>
            <Link to="/scales">Tỷ lệ</Link>
            <Link to="/about">Giới thiệu</Link>
          </NavMenu>
        </Col>

        <Col>
          <SearchBox>
            <AutoComplete
              style={{ width: "100%" }}
              options={searchOptions}
              onSearch={handleSearchChange}
              onSelect={handleSelectSuggestion}
              dropdownMatchSelectWidth={400}
              notFoundContent={
                searchLoading ? (
                  <div style={{ textAlign: "center", padding: 12 }}>
                    <Spin size="small" />
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 12, color: "#999" }}>
                    Không tìm thấy sản phẩm
                  </div>
                )
              }
              filterOption={false}
            >
              <Input.Search
                placeholder="Tìm kiếm sản phẩm..."
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleSubmitSearch}
                size="middle"
              />
            </AutoComplete>
          </SearchBox>
        </Col>

        <Col>
          <UserActions>
            {user?.isAdmin && (
              <Button
                type="primary"
                size="middle"
                onClick={() => navigate("/admin/orders")}
                style={{ borderRadius: 20 }}
              >
                Bảng điều khiển Admin
              </Button>
            )}
            {!hideAccount && (
              <>
                {user ? (

                  <Dropdown
                    menu={{
                      items: accountMenuItems,
                      onClick: handleAccountMenuClick,
                    }}
                    trigger={["click"]}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <Avatar
                        size={32}
                        src={user?.avatar}
                        icon={!user?.avatar && !userInitial && <UserOutlined />}
                        style={{ backgroundColor: "#1d4ed8" }}
                      >
                        {!user?.avatar && userInitial}
                      </Avatar>
                      <span style={{ fontWeight: 500 }}>
                        {user.username || user.email}
                      </span>
                      <DownOutlined style={{ fontSize: 10 }} />
                    </div>
                  </Dropdown>
                ) : (
                  <>
                    <UserOutlined />
                    <Link to="/login">Đăng nhập</Link>
                  </>
                )}
              </>
            )}
            <Badge
              count={wishlistItems.length}
              size="default"
              offset={[0, 5]}
              style={{
                backgroundColor: "#ff4d4f",
                fontSize: 13,
                fontWeight: 600,
                minWidth: 22,
                height: 22,
                lineHeight: "22px",
                boxShadow: "0 0 6px rgba(0,0,0,0.3)",
              }}
            >
              <HeartOutlined
                onClick={() => navigate("/wishlist")}
                style={{
                  fontSize: 26,
                  marginLeft: 18,
                  cursor: "pointer",
                  color: "#ff4d4f",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1.0)")
                }
              />
            </Badge>
            <Badge
              count={getTotalQuantity()}
              size="default"
              offset={[0, 5]}
              style={{
                backgroundColor: "#1d4ed8",
                fontSize: 13,
                fontWeight: 600,
                minWidth: 22,
                height: 22,
                lineHeight: "22px",
                boxShadow: "0 0 6px rgba(0,0,0,0.3)",
              }}
            >
              <ShoppingCartOutlined
                onClick={() => setOpen(true)}
                style={{
                  fontSize: 26,
                  marginLeft: 18,
                  cursor: "pointer",
                  color: "#1d4ed8",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1.0)")
                }
              />
            </Badge>
          </UserActions>
        </Col>
      </WrapperHeader>

      <Drawer
        title={`Giỏ hàng (${getTotalQuantity()})`}
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={400}
      >
        {cartItems.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <p>Giỏ hàng của bạn đang trống. Thêm một số mô hình để bắt đầu!</p>
            <Button type="primary" onClick={() => setOpen(false)}>
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  borderBottom: "1px solid #ddd",
                  paddingBottom: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h4>{item.name}</h4>
                    <p>{formatVnd(item.price)}</p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Button
                        icon={<MinusOutlined />}
                        size="small"
                        onClick={() => decreaseQty(item.id)}
                      />
                      <span>{item.quantity}</span>
                      <Button
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => handleAdd(item)}
                      />
                    </div>
                  </div>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromCart(item.id)}
                    danger
                  />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 20, textAlign: "right" }}>
              <h3>Tổng cộng: {formatVnd(totalPrice)}</h3>
              <Button
                type="primary"
                block
                onClick={() => {
                  setOpen(false);
                  const hasToken = localStorage.getItem("accessToken");
                  if (!user && !hasToken) {
                    navigate(
                      `/login?returnUrl=${encodeURIComponent(
                        "/checkout/shipping"
                      )}`
                    );
                  } else {
                    navigate("/checkout/shipping");
                  }
                }}
              >
                Thanh toán
              </Button>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
};

export default HeaderComponents;
