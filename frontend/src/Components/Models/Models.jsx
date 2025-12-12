import React, { useCallback, useEffect, useState } from "react";
import {
  Row,
  Col,
  Slider,
  Checkbox,
  Select,
  Card,
  Button,
  Tag,
  Rate,
  Spin,
  message,
  Pagination,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./models.css";
import { useCart } from "../../Context/CartContext";
import { fetchProducts } from "../../api/productApi";
import { formatVnd } from "../../utils/currency";

const Models = () => {
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [newArrivals, setNewArrivals] = useState(false);
  const [priceMax, setPriceMax] = useState(0);
  const [selectedScales, setSelectedScales] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [productType, setProductType] = useState("all");
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);
  const [showPreorderOnly, setShowPreorderOnly] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "true") {
      setNewArrivals(true);
    }
    if (params.get("scale")) {
      const scale = params.get("scale");
      setSelectedScales([scale]);
    }
    if (params.get("category")) {
      const category = params.get("category");
      setProductType(category);
    }
    if (params.get("discount") === "true") {
      setShowDiscountOnly(true);
    }
    if (params.get("preorder") === "true") {
      setShowPreorderOnly(true);
    }
    if (params.get("sort")) {
      setSortBy(params.get("sort"));
    }
  }, [location.search]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchProducts({ limit: 100 });
      const productsData = response.items || [];
      const highestPrice =
        productsData.length > 0
          ? Math.max(...productsData.map((p) => Number(p.price) || 0))
          : 90;
      setProducts(productsData);
      setPriceMax(highestPrice || 90);
    } catch (error) {
      console.error("Error loading products:", error);
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return undefined;
    }
    const channel = new BroadcastChannel("products");
    const handleMessage = (event) => {
      if (event?.data?.type === "refresh") {
        loadProducts();
      }
    };
    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [loadProducts]);
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleScaleChange = (value, checked) => {
    setSelectedScales((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  };

  const handleSeriesChange = (value, checked) => {
    setSelectedSeries((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  };

  const handleAddToCart = (item, e) => {
    e.stopPropagation();
    addToCart({ ...item, quantity: 1 });
  };

  const handleViewDetail = (product) => {
    navigate(`/products/${product._id || product.id}`);
  };

  const mapProductToDisplay = (product) => {
    return {
      id: product._id || product.id,
      name: product.name,
      line: product.series,
      scale: product.scale,
      rating: product.avgRating || 0,
      reviews: product.ratingCount || 0,
      price: product.price,
      oldPrice: product.oldPrice || null,
      isNew: product.isNewProduct || false,
      discountText: product.discountText || "",
      inStock: (product.stock || 0) > 0,
      image: product.images && product.images.length > 0 ? product.images[0] : "",
      category: product.category || "Model Kits",
    };
  };

  let filteredProducts = products
    .map(mapProductToDisplay)
    .filter((p) => {
      if (productType === "Model Kits" && p.category !== "Model Kits") return false;
      if (productType === "Accessories" && p.category !== "Accessories") return false;
      if (priceMax > 0 && p.price > priceMax) return false;
      if (onlyInStock && !p.inStock) return false;
      if (newArrivals && !p.isNew) return false;
      if (selectedScales.length && p.scale && !selectedScales.includes(p.scale)) return false;
      if (selectedSeries.length && !selectedSeries.includes(p.line)) return false;
      if (showDiscountOnly && !p.oldPrice) return false;
      if (showPreorderOnly && p.inStock) return false;
      return true;
    });

  if (sortBy === "priceAsc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "priceDesc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "bestseller") {
    filteredProducts.sort((a, b) => {
      if (b.reviews !== a.reviews) {
        return b.reviews - a.reviews;
      }
      return b.rating - a.rating;
    });
  }
  const totalProducts = filteredProducts.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [onlyInStock, newArrivals, priceMax, selectedScales, selectedSeries, productType, showDiscountOnly, showPreorderOnly, sortBy]);

  const PRICE_RANGE_MAX = 10_000_000;
  const sliderMax = PRICE_RANGE_MAX;
  const sliderValue =
    priceMax > 0 ? Math.min(priceMax, sliderMax) : sliderMax;
  const handlePriceChange = (value) =>
    setPriceMax(Math.min(Math.max(value, 0), sliderMax));

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={24} align="stretch">
      <Col xs={24} md={6}>
        <div className="models-filter">
          <div className="models-filter-header">
            <span className="models-filter-title">Bộ lọc</span>
            <button
              className="models-filter-clear"
              onClick={() => {
                setOnlyInStock(false);
                setNewArrivals(false);
                setPriceMax(0);
                setSelectedScales([]);
                setSelectedSeries([]);
                setProductType("all");
              }}
            >
              Xóa tất cả
            </button>
          </div>
          <div className="models-filter-section">
            <p className="models-filter-label">Loại sản phẩm</p>
            <div className="models-filter-row">
              <Checkbox
                checked={productType === "all"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProductType("all");
                  }
                }}
              >
                Tất cả sản phẩm
              </Checkbox>
            </div>
            <div className="models-filter-row">
              <Checkbox
                checked={productType === "Model Kits"}
                onChange={(e) => {
                  setProductType(e.target.checked ? "Model Kits" : "all");
                }}
              >
                Model Kits
              </Checkbox>
            </div>
            <div className="models-filter-row">
              <Checkbox
                checked={productType === "Accessories"}
                onChange={(e) => {
                  setProductType(e.target.checked ? "Accessories" : "all");
                }}
              >
                Accessories
              </Checkbox>
            </div>
          </div>
          <div className="models-filter-section">
            <p className="models-filter-label">Bộ lọc nhanh</p>
            <div className="models-filter-row">
              <Checkbox
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
              >
                Chỉ còn hàng
              </Checkbox>
            </div>
            <div className="models-filter-row">
              <Checkbox
                checked={newArrivals}
                onChange={(e) => setNewArrivals(e.target.checked)}
              >
                Sản phẩm mới
              </Checkbox>
            </div>
          </div>
          <div className="models-filter-section">
            <p className="models-filter-label">Khoảng giá</p>
        <div className="models-price-row">
          <span>{formatVnd(0)}</span>
          <span>{formatVnd(sliderValue)}</span>
        </div>
        <Slider
          min={0}
          max={sliderMax}
          value={sliderValue}
          onChange={handlePriceChange}
        />
          </div>
          {productType !== "Accessories" && (
            <div className="models-filter-section">
              <p className="models-filter-label">Tỷ lệ</p>

              <div className="models-filter-row between">
                <Checkbox
                  checked={selectedScales.includes("1/100 MG")}
                  onChange={(e) =>
                    handleScaleChange("1/100 MG", e.target.checked)
                  }
                  tabIndex={0}
                >
                  1/100 MG
                </Checkbox>
                <span className="models-count">(12)</span>
              </div>

            <div className="models-filter-row between">
              <Checkbox
                checked={selectedScales.includes("1/144 HG")}
                onChange={(e) =>
                  handleScaleChange("1/144 HG", e.target.checked)
                }
              >
                1/144 HG
              </Checkbox>
              <span className="models-count">(3)</span>
            </div>

            <div className="models-filter-row between">
              <Checkbox
                checked={selectedScales.includes("1/144 RG")}
                onChange={(e) =>
                  handleScaleChange("1/144 RG", e.target.checked)
                }
              >
                1/144 RG
              </Checkbox>
              <span className="models-count">(4)</span>
            </div>

            <div className="models-filter-row between">
              <Checkbox
                checked={selectedScales.includes("1/60 PG")}
                onChange={(e) =>
                  handleScaleChange("1/60 PG", e.target.checked)
                }
              >
                1/60 PG
              </Checkbox>
              <span className="models-count">(1)</span>
            </div>
            </div>
          )}
          <div className="models-filter-section">
            <p className="models-filter-label">Series</p>

            <div className="models-filter-row between">
              <Checkbox
                checked={selectedSeries.includes("Char's Counterattack")}
                onChange={(e) =>
                  handleSeriesChange("Char's Counterattack", e.target.checked)
                }
              >
                Char&apos;s Counterattack
              </Checkbox>
              <span className="models-count">(3)</span>
            </div>

            <div className="models-filter-row between">
              <Checkbox
                checked={selectedSeries.includes("G Gundam")}
                onChange={(e) =>
                  handleSeriesChange("G Gundam", e.target.checked)
                }
              >
                G Gundam
              </Checkbox>
              <span className="models-count">(1)</span>
            </div>

            <div className="models-filter-row between">
              <Checkbox
                checked={selectedSeries.includes("Gundam SEED")}
                onChange={(e) =>
                  handleSeriesChange("Gundam SEED", e.target.checked)
                }
              >
                Gundam SEED
              </Checkbox>
              <span className="models-count">(1)</span>
            </div>

            <div className="models-filter-row between">
              <Checkbox
                checked={selectedSeries.includes("Gundam SEED Destiny")}
                onChange={(e) =>
                  handleSeriesChange("Gundam SEED Destiny", e.target.checked)
                }
              >
                Gundam SEED Destiny
              </Checkbox>
              <span className="models-count">(3)</span>
            </div>
          </div>
        </div>
      </Col>
      <Col xs={24} md={18}>
        <div className="models-list-header">
          <span>{totalProducts} mô hình</span>
          <div className="models-sort">
            <span>Sắp xếp theo</span>
            <Select
              size="small"
              defaultValue="featured"
              value={sortBy || "featured"}
              onChange={(value) => setSortBy(value)}
              options={[
                { label: "Nổi bật", value: "featured" },
                { label: "Giá: Thấp đến cao", value: "priceAsc" },
                { label: "Giá: Cao đến thấp", value: "priceDesc" },
              ]}
            />
          </div>
        </div>

        <Row gutter={[12, 12]} align="stretch">
          {paginatedProducts.map((p) => (
            <Col
              xs={12}
              sm={8}
              md={8}
              lg={6}
              key={p.id}
              className="models-card-col"
            >
              <div className="models-card-wrapper">
                <Card
                  hoverable
                  className="models-card"
                  onClick={() => handleViewDetail(p)}
                  style={{ cursor: "pointer" }}
                  cover={
                    <div className="models-card-image-wrap">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="models-card-image"
                      />
                      <div className="models-card-tags">
                        {p.isNew && (
                          <Tag color="blue" className="models-chip">
                            Mới
                          </Tag>
                        )}
                        {p.discountText && (
                          <Tag color="red" className="models-chip">
                            {p.discountText}
                          </Tag>
                        )}
                        {!p.inStock && (
                          <Tag color="default" className="models-chip">
                            Hết hàng
                          </Tag>
                        )}
                      </div>
                    </div>
                  }
                >
                  <p className="models-card-line">{p.line}</p>
                  <h3 className="models-card-name">{p.name}</h3>

                  <div className="models-card-rating">
                    <Rate
                      disabled
                      allowHalf
                      defaultValue={p.rating}
                      style={{ fontSize: 12 }}
                    />
                    <span className="models-card-reviews">
                      ({p.reviews.toLocaleString()})
                    </span>
                  </div>

                  <p className="models-card-scale">{p.scale || "\u00a0"}</p>

                  <div className="models-card-price">
                    <div className="models-price-col">
                      <span className="models-card-price-main">
                        {formatVnd(p.price)}
                      </span>
                    </div>

                    {p.oldPrice && (
                      <div className="models-price-col old">
                        <span className="models-card-price-old">
                          {formatVnd(p.oldPrice)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="primary"
                    block
                    className="models-card-button"
                    icon={<ShoppingCartOutlined />}
                    disabled={!p.inStock}
                    onClick={(e) => handleAddToCart(p, e)}
                  >
                    {p.inStock ? "Thêm vào giỏ" : "Hết hàng"}
                  </Button>
                </Card>
              </div>
            </Col>
          ))}
        </Row>

        {totalProducts > 0 && (
          <div className="models-pagination">
            <Pagination
              current={currentPage}
              total={totalProducts}
              pageSize={pageSize}
              showSizeChanger={false}
              onChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </Col>
    </Row>
  );
};
export default Models;
