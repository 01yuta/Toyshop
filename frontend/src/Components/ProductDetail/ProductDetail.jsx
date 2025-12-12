import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ProductWrapper,
  BackButton,
  ProductGrid,
  ProductImages,
  MainImage,
  ThumbnailList,
  ProductInfo,
  ProductTitle,
  PriceBox,
  QuantityControl,
  AddToCartButton,
  BuyNowButton,
  FeatureRow,
  Badge,
} from "./style";

import {
  StarFilled,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  ArrowLeftOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Spin, message } from "antd";
import { fetchProductById } from "../../api/productApi";
import placeholderImage from "../Assets/sanpham1.jpg";
import { useCart } from "../../Context/CartContext.jsx";
import { useAuth } from "../../Context/AuthContext";
import { useWishlist } from "../../Context/WishlistContext";
import { formatVnd } from "../../utils/currency";

export const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(placeholderImage);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductById(id);
        setProduct(data);
        const firstImage =
          (Array.isArray(data.images) && data.images[0]) ||
          data.image ||
          placeholderImage;
        setSelectedImage(firstImage);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const images = useMemo(() => {
    if (product?.images?.length) {
      return product.images;
    }
    if (product?.image) {
      return [product.image];
    }
    return [placeholderImage];
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      id: product._id || product.id,
      quantity,
      image: selectedImage,
      price: product.price || 0,
      name: product.name || "Unnamed product",
    });
    message.success("Đã thêm vào giỏ hàng");
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (product.stock <= 0) {
      message.warning("Sản phẩm đã hết hàng");
      return;
    }

    addToCart({
      ...product,
      id: product._id || product.id,
      quantity,
      image: selectedImage,
      price: product.price || 0,
      name: product.name || "Unnamed product",
    });

    if (!user) {
      const returnUrl = "/checkout/shipping";
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
      navigate("/checkout/shipping");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/products");
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const wasAdded = toggleWishlist(product);
    if (wasAdded) {
      message.success("Đã thêm vào wishlist");
    } else {
      message.success("Đã xóa khỏi wishlist");
    }
  };

  const productId = product?._id || product?.id;
  const inWishlist = productId ? isInWishlist(productId) : false;

  if (loading) {
    return (
      <ProductWrapper>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Spin />
        </div>
      </ProductWrapper>
    );
  }

  if (error) {
    return (
      <ProductWrapper>
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        <BackButton onClick={handleBack}>
          <ArrowLeftOutlined /> Quay lại sản phẩm
        </BackButton>
      </ProductWrapper>
    );
  }

  if (!product) {
    return null;
  }

  const formattedPrice = formatVnd(product.price);
  const formattedComparePrice =
    product.compareAtPrice || product.oldPrice
      ? formatVnd(product.compareAtPrice || product.oldPrice)
      : null;

  return (
    <ProductWrapper>
      <BackButton onClick={handleBack}>
        <ArrowLeftOutlined /> Back to Products
      </BackButton>

      <ProductGrid>
        <ProductImages>
          <MainImage>
            <img src={selectedImage} alt={product.name} />
            {product.sale && <Badge>-15% OFF</Badge>}
          </MainImage>

          <ThumbnailList>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${product.name} ${i}`}
                onClick={() => setSelectedImage(img)}
                className={selectedImage === img ? "selected" : ""}
              />
            ))}
          </ThumbnailList>
        </ProductImages>

        <ProductInfo>
          <span className="series">{product.series}</span>
          <ProductTitle>{product.name}</ProductTitle>

          <div className="rating">
            {[...Array(Math.round(product.avgRating || 0))].map((_, i) => (
              <StarFilled key={i} style={{ color: "#facc15" }} />
            ))}
            <span>
              {product.avgRating?.toFixed
                ? product.avgRating.toFixed(1)
                : product.avgRating || 0}{" "}
              ({product.ratingCount || 0} đánh giá)
            </span>
          </div>

          <PriceBox>
            <h2>{formattedPrice}</h2>
            {formattedComparePrice && (
              <>
                <span className="old-price">{formattedComparePrice}</span>
                <span className="discount">
                  {product.compareAtPrice
                    ? `Tiết kiệm ${formatVnd(
                        product.compareAtPrice - product.price
                      )}`
                    : null}
                </span>
              </>
            )}
          </PriceBox>

          <div className="stock-status">
            {product.stock > 0 ? (
              <span className="in-stock">
                ✓ Còn hàng ({product.stock}) - Giao hàng trong 24-48 giờ
              </span>
            ) : (
              <span className="out-stock">✗ Hết hàng</span>
            )}
          </div>

          <FeatureRow>
            <div>📦 {product.scale || "N/A"}</div>
            <div>🚚 Miễn phí vận chuyển</div>
            <div>🛡️ Hàng chính hãng</div>
          </FeatureRow>

          <div className="quantity-box">
            <span>Số lượng:</span>
            <QuantityControl>
              <MinusOutlined onClick={() => quantity > 1 && setQuantity(quantity - 1)} />
              <span>{quantity}</span>
              <PlusOutlined onClick={() => setQuantity(quantity + 1)} />
            </QuantityControl>
          </div>

          <div className="actions">
            <AddToCartButton onClick={handleAddToCart} disabled={product.stock <= 0}>
              🛒 Thêm vào giỏ
            </AddToCartButton>
            <BuyNowButton onClick={handleBuyNow} disabled={product.stock <= 0}>
              💳 Mua ngay
            </BuyNowButton>
            {inWishlist ? (
              <HeartFilled 
                className="icon" 
                style={{ color: "#ff4d4f" }}
                onClick={handleToggleWishlist}
              />
            ) : (
              <HeartOutlined 
                className="icon" 
                onClick={handleToggleWishlist}
              />
            )}
            <ShareAltOutlined className="icon" />
          </div>
        </ProductInfo>
      </ProductGrid>
    </ProductWrapper>
  );
};

export default ProductDetail;
