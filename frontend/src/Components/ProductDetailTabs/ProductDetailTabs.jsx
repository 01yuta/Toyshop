import React, { useEffect, useMemo, useState } from "react";
import {
  TabsContainer,
  TabList,
  TabButton,
  TabContent,
  RelatedSection,
  RelatedGrid,
  RelatedCard,
} from "./style";
import { useParams } from "react-router-dom";
import { Spin, Rate, Input, Button, List, Avatar, Typography, message, Empty } from "antd";
import { UserOutlined, StarFilled } from "@ant-design/icons";
import { fetchProductById, fetchRelatedProducts } from "../../api/productApi";
import { getProductReviews, createProductReview } from "../../api/reviewApi";
import { useAuth } from "../../Context/AuthContext";

const { TextArea } = Input;
const { Text, Title } = Typography;

const ProductDetailTabs = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("description");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product for tabs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
    loadRelated();
  }, [id]);

  useEffect(() => {
    if (activeTab === "reviews" && id) {
      loadReviews();
    }
  }, [activeTab, id]);

  const loadReviews = async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const data = await getProductReviews(id, { limit: 20 });
      setReviews(data.items || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      message.error("Không thể tải đánh giá");
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }

    if (reviewRating === 0) {
      message.warning("Vui lòng chọn số sao đánh giá");
      return;
    }

    try {
      setSubmittingReview(true);
      await createProductReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      message.success("Đánh giá của bạn đã được gửi!");
      setReviewRating(0);
      setReviewComment("");
      const data = await fetchProductById(id);
      setProduct(data);
      await loadReviews();
    } catch (error) {
      console.error("Submit review error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        "Gửi đánh giá thất bại, vui lòng thử lại";
      message.error(errorMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const description = product?.description || "";
  const specificationLines = useMemo(() => {
    if (!product?.specifications) return [];
    return product.specifications
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [product]);

  const loadRelated = async () => {
    if (!id) return;
    try {
      setRelatedLoading(true);
      const data = await fetchRelatedProducts(id, { limit: 3 });
      const items = data.items || data || [];
      setRelated(items);
    } catch (error) {
      console.error("Failed to load related products:", error);
      try {
        if (product) {
          const all = await fetchRelatedProducts(id, { fallback: true });
          const basePrice = Number(product.price) || 0;
          const filtered = (all.items || all || [])
            .filter((p) => p._id !== product._id)
            .filter((p) => {
              const sameSeries = p.series && product.series && p.series === product.series;
              const price = Number(p.price) || 0;
              const priceClose = basePrice && Math.abs(price - basePrice) <= basePrice * 0.2;
              return sameSeries || priceClose;
            })
            .slice(0, 3);
          setRelated(filtered);
        }
      } catch (e) {
      }
    } finally {
      setRelatedLoading(false);
    }
  };

  if (loading) {
    return (
      <TabsContainer>
        <TabContent>
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin tip="Đang tải thông tin sản phẩm..." />
          </div>
        </TabContent>
      </TabsContainer>
    );
  }

  return (
    <TabsContainer>
      <TabList>
        <TabButton
          active={activeTab === "description"}
          onClick={() => setActiveTab("description")}
        >
          Mô tả
        </TabButton>
        <TabButton
          active={activeTab === "specifications"}
          onClick={() => setActiveTab("specifications")}
        >
          Thông số kỹ thuật
        </TabButton>
        <TabButton
          active={activeTab === "reviews"}
          onClick={() => setActiveTab("reviews")}
        >
          Đánh giá ({product?.ratingCount || 0})
        </TabButton>
      </TabList>
      <TabContent>
        {activeTab === "description" && (
          <div className="fade">
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 8 }}>
                Mô tả sản phẩm
              </Title>
            </div>

            {description ? (
              <div
                style={{
                  padding: 24,
                  background: "#f9fafb",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Text style={{ fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {description}
                </Text>
              </div>
            ) : (
              <div
                style={{
                  padding: 24,
                  background: "#fff7e6",
                  borderRadius: 8,
                  border: "1px solid #ffd591",
                  textAlign: "center",
                }}
              >
                <Text type="secondary">
                  Mô tả sản phẩm sẽ được cập nhật bởi admin.
                </Text>
              </div>
            )}
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="fade">
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 8 }}>
                Thông số kỹ thuật
              </Title>
            </div>

            {specificationLines.length > 0 ? (
              <div
                style={{
                  padding: 24,
                  background: "#f9fafb",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              >
                {specificationLines.map((line, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px 0",
                      borderBottom:
                        index < specificationLines.length - 1
                          ? "1px solid #e5e7eb"
                          : "none",
                    }}
                  >
                    <Text style={{ fontSize: 15, lineHeight: 1.8 }}>{line}</Text>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: 24,
                  background: "#fff7e6",
                  borderRadius: 8,
                  border: "1px solid #ffd591",
                  textAlign: "center",
                }}
              >
                <Text type="secondary">
                  Thông số kỹ thuật sẽ được cập nhật bởi admin.
                </Text>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="fade">
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 8 }}>
                Đánh giá sản phẩm
              </Title>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StarFilled style={{ color: "#facc15", fontSize: 24 }} />
                  <Text strong style={{ fontSize: 20 }}>
                    {(product?.avgRating ?? 0).toFixed(1)}
                  </Text>
                  <Text type="secondary">/ 5</Text>
                </div>
                <Text type="secondary">
                  Dựa trên {product?.ratingCount || 0} đánh giá
                </Text>
              </div>
            </div>

            {user ? (
              <div
                style={{
                  padding: 24,
                  background: "#f9fafb",
                  borderRadius: 8,
                  marginBottom: 32,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Title level={5} style={{ marginBottom: 16 }}>
                  Viết đánh giá của bạn
                </Title>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    Đánh giá: *
                  </Text>
                  <Rate
                    value={reviewRating}
                    onChange={setReviewRating}
                    style={{ fontSize: 24 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    Bình luận (tùy chọn):
                  </Text>
                  <TextArea
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength={500}
                    showCount
                  />
                </div>
                <Button
                  type="primary"
                  onClick={handleSubmitReview}
                  loading={submittingReview}
                  disabled={reviewRating === 0}
                >
                  Gửi đánh giá
                </Button>
              </div>
            ) : (
              <div
                style={{
                  padding: 24,
                  background: "#fff7e6",
                  borderRadius: 8,
                  marginBottom: 32,
                  border: "1px solid #ffd591",
                  textAlign: "center",
                }}
              >
                <Text>
                  Vui lòng{" "}
                  <a href="/login">đăng nhập</a> để viết đánh giá
                </Text>
              </div>
            )}

            <div>
              <Title level={5} style={{ marginBottom: 16 }}>
                Tất cả đánh giá ({reviews.length})
              </Title>
              {reviewsLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Spin />
                </div>
              ) : reviews.length === 0 ? (
                <Empty description="Chưa có đánh giá nào" />
              ) : (
                <List
                  dataSource={reviews}
                  renderItem={(review) => (
                    <List.Item
                      style={{
                        padding: "16px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<UserOutlined />}
                            src={review.user?.avatar}
                          >
                            {review.user?.username?.charAt(0)?.toUpperCase() ||
                              review.user?.email?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </Avatar>
                        }
                        title={
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Text strong>
                              {review.user?.username ||
                                review.user?.email ||
                                "Người dùng"}
                            </Text>
                            <Rate
                              disabled
                              value={review.rating}
                              style={{ fontSize: 14 }}
                            />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                            </Text>
                          </div>
                        }
                        description={
                          review.comment ? (
                            <Text>{review.comment}</Text>
                          ) : (
                            <Text type="secondary" style={{ fontStyle: "italic" }}>
                              Không có bình luận
                            </Text>
                          )
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
        )}
      </TabContent>
      <RelatedSection>
        <h3>Sản phẩm liên quan</h3>
        {relatedLoading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
          </div>
        ) : related && related.length > 0 ? (
          <RelatedGrid>
            {related.map((item) => {
              const price = Number(item.price) || 0;
              const oldPrice = Number(item.oldPrice) || null;
              const images = Array.isArray(item.images) ? item.images : [];
              const image =
                images[0] ||
                item.image ||
                "https://via.placeholder.com/300x200?text=Gundam+Model";

              return (
                <RelatedCard
                  key={item._id || item.id}
                  onClick={() =>
                    (window.location.href = `/products/${item._id || item.id}`)
                  }
                >
                  <img src={image} alt={item.name} />
                  <div className="info">
                    <p className="series">{item.series}</p>
                    <p className="name">{item.name}</p>
                    <div className="price">
                      <span className="new">
                        {price.toLocaleString("vi-VN")} đ
                      </span>
                      {oldPrice ? (
                        <span className="old">
                          {oldPrice.toLocaleString("vi-VN")} đ
                        </span>
                      ) : null}
                    </div>
                  </div>
                </RelatedCard>
              );
            })}
          </RelatedGrid>
        ) : (
          <Empty description="Chưa có sản phẩm liên quan" />
        )}
      </RelatedSection>
    </TabsContainer>
  );
};

export default ProductDetailTabs;
