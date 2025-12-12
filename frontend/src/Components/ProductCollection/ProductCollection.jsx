import React, { useState, useEffect } from "react";
import { Select, message, Spin } from "antd";
import {
  Wrapper,
  Header,
  Filters,
  Grid,
  ProductCard,
  AddButton,
  Badge,
} from "./style";
import { useCart } from "../../Context/CartContext.jsx";
import { fetchProducts } from "../../api/productApi";
import { useNavigate } from "react-router-dom";
import placeholderImage from "../Assets/sanpham1.jpg";
import { formatVnd } from "../../utils/currency";

const { Option } = Select;

export const ProductCollection = ({
  scaleFilter,
  limit,
  initialSortOrder = "Tên A-Z",
  showFilters = true,
}) => {
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [selectedScale, setSelectedScale] = useState("Tất cả tỷ lệ");
  const [selectedSeries, setSelectedSeries] = useState("Tất cả series");
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setSortOrder(initialSortOrder);
  }, [initialSortOrder]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts();
        const normalized = (data.items || data).map((item) => {
          const images = Array.isArray(item.images) ? item.images : [];
          return {
            ...item,
            id: item._id || item.id,
            createdAt: item.createdAt,
            image: item.image || images[0] || placeholderImage,
            hoverImage: item.hoverImage || images[1] || images[0] || placeholderImage,
          };
        });
        setProducts(normalized);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (scaleFilter) {
      filtered = filtered.filter(
        (p) =>
          typeof p.scale === "string" &&
          p.scale.toLowerCase().includes(scaleFilter.toLowerCase())
      );
    }

    if (selectedScale !== "All Scales" && selectedScale !== "Tất cả tỷ lệ") {
      filtered = filtered.filter(
        (p) => typeof p.scale === "string" && p.scale === selectedScale
      );
    }

    if (selectedSeries !== "All Series" && selectedSeries !== "Tất cả series") {
      filtered = filtered.filter((p) => p.series === selectedSeries);
    }

    if (sortOrder === "Price Low-High" || sortOrder === "Giá thấp-cao") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "Price High-Low" || sortOrder === "Giá cao-thấp") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "Name A-Z" || sortOrder === "Tên A-Z") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "Name Z-A" || sortOrder === "Tên Z-A") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === "Newest" || sortOrder === "Mới nhất") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    setDisplayedProducts(filtered);
  }, [products, sortOrder, selectedScale, selectedSeries, scaleFilter, limit]);

  const handleAddToCart = (product) => {
    addToCart(product);
    message.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const handleViewDetail = (product) => {
    if (!product?.id) {
      message.error("Thiếu thông tin sản phẩm.");
      return;
    }
    navigate(`/products/${product.id}`);
  };

  return (
    <Wrapper>
      <Header>
        <h2>Gundam Model Collection</h2>
        <p>
          Từ High Grade đến Perfect Grade, khám phá bộ sưu tập rộng lớn của chúng tôi về
          các bộ mô hình Gundam chính hãng.
        </p>
      </Header>

      {!scaleFilter && showFilters && (
        <Filters>
          <div>
            <span>Lọc theo: </span>
            <Select
              value={selectedScale}
              onChange={(val) => setSelectedScale(val)}
              style={{ width: 140, marginRight: 10 }}
            >
              <Option value="All Scales">Tất cả tỷ lệ</Option>
              <Option value="1/144 HG">1/144 HG</Option>
              <Option value="1/100 MG">1/100 MG</Option>
            </Select>

            <Select
              value={selectedSeries}
              onChange={(val) => setSelectedSeries(val)}
              style={{ width: 180 }}
            >
              <Option value="All Series">Tất cả series</Option>
              <Option value="Seed">Seed</Option>
              <Option value="Iron-Blooded Orphans">Iron-Blooded Orphans</Option>
              <Option value="Wing">Wing</Option>
            </Select>
          </div>

          <div>
            <span>Sắp xếp theo: </span>
            <Select
              value={sortOrder}
              onChange={(val) => setSortOrder(val)}
              style={{ width: 160 }}
            >
              <Option value="Newest">Mới nhất</Option>
              <Option value="Name A-Z">Tên A-Z</Option>
              <Option value="Name Z-A">Tên Z-A</Option>
              <Option value="Price Low-High">Giá thấp-cao</Option>
              <Option value="Price High-Low">Giá cao-thấp</Option>
            </Select>
          </div>
        </Filters>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Spin />
        </div>
      )}

      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      {!loading && !error && (
        <Grid>
          {displayedProducts.map((item) => (
          <ProductCard key={item.id} onClick={() => handleViewDetail(item)}>
            <div className="image-container">
              <img src={item.image} alt={item.name} className="default-img" />
              {item.hoverImage && (
                <img
                  src={item.hoverImage}
                  alt={`${item.name} hover`}
                  className="hover-img"
                />
              )}
            </div>

            {item.new && <Badge type="new">Mới</Badge>}
            {item.sale && <Badge type="sale">-15%</Badge>}
            {item.stock === false && <Badge type="out">Hết hàng</Badge>}

            <div className="product-info">
              <div className="name">{item.name}</div>
              <div className="scale">{item.scale || "—"}</div>
              <div className="price">{formatVnd(item.price)}</div>
            </div>

            <div className="add-to-cart-container" onClick={(e) => e.stopPropagation()}>
              <AddButton onClick={() => handleAddToCart(item)}>
                Thêm vào giỏ
              </AddButton>
            </div>
          </ProductCard>
        ))}
        </Grid>
      )}
    </Wrapper>
  );
};

export default ProductCollection;
