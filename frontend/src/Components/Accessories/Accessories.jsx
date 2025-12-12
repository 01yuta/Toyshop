import React, { useState, useMemo } from "react";
import { Row, Col, Card, Button, Rate, Tag } from "antd";
import { LeftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./Accessories.css";

const accessoriesData = [
  {
    id: 1,
    name: "Professional Nippers Set",
    desc: "Premium single-blade nippers for clean cuts. Essential for any model builder.",
    rating: 4.8,
    reviews: 342,
    price: 24,
    oldPrice: 32,
    sale: "Save $8.00",
    category: "Tools",
    image:
      "https://images.pexels.com/photos/3951845/pexels-photo-3951845.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 2,
    name: "Precision Hobby Knife Set",
    desc: "Set of precision knives with multiple blade types for detailed cutting work.",
    rating: 4.6,
    reviews: 178,
    price: 15,
    oldPrice: 19,
    category: "Tools",
    image:
      "https://images.pexels.com/photos/3951843/pexels-photo-3951843.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    name: "Sanding Sponge Set (6 Grits)",
    desc: "Complete sanding solution from 400 to 3000 grit for perfect surface finishing.",
    rating: 4.7,
    reviews: 267,
    price: 12,
    oldPrice: 17,
    category: "Tools",
    image:
      "https://images.pexels.com/photos/3951844/pexels-photo-3951844.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 4,
    name: "Panel Line Accent Color Set",
    desc: "Essential panel lining tools including black, brown, and gray accent colors.",
    rating: 4.8,
    reviews: 193,
    price: 18,
    oldPrice: 23,
    category: "Paints & Finishes",
    image:
      "https://images.pexels.com/photos/3951628/pexels-photo-3951628.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 5,
    name: "Gundam Marker Basic Set",
    desc: "6 essential markers for detailing and touch-ups. Perfect for beginners.",
    rating: 4.7,
    reviews: 212,
    price: 21,
    oldPrice: 27,
    category: "Paints & Finishes",
    image:
      "https://images.pexels.com/photos/3951630/pexels-photo-3951630.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 6,
    name: "Metallic Paint Set (6 Colors)",
    desc: "Premium metallic paints including gold, silver, bronze, and gunmetal.",
    rating: 4.8,
    reviews: 268,
    price: 28,
    oldPrice: 34,
    sale: "Save $6.00",
    category: "Paints & Finishes",
    image:
      "https://images.pexels.com/photos/3951634/pexels-photo-3951634.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 7,
    name: "Acrylic Display Stand Set",
    desc: "Clear display stands to pose and support your completed builds.",
    rating: 4.6,
    reviews: 154,
    price: 19,
    oldPrice: 22,
    category: "Display",
    image:
      "https://images.pexels.com/photos/2738508/pexels-photo-2738508.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 8,
    name: "LED Display Base",
    desc: "Illuminated display base to showcase your favorite mobile suits.",
    rating: 4.9,
    reviews: 301,
    price: 32,
    oldPrice: 39,
    category: "Display",
    image:
      "https://images.pexels.com/photos/7161070/pexels-photo-7161070.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 9,
    name: "Universal Caution Decal Set",
    desc: "Water slide decals with caution markings, numbers, and logos for any kit.",
    rating: 4.5,
    reviews: 126,
    price: 9,
    oldPrice: 11,
    category: "Decals",
    image:
      "https://images.pexels.com/photos/4484078/pexels-photo-4484078.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 10,
    name: "Metal Logo Emblem Pack",
    desc: "Self-adhesive metal emblems to add a premium finish to your bases.",
    rating: 4.7,
    reviews: 98,
    price: 14,
    oldPrice: 18,
    category: "Decals",
    image:
      "https://images.pexels.com/photos/3951841/pexels-photo-3951841.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

const categories = [
  { key: "all", label: "All Products (16)" },
  { key: "Tools", label: "Tools (4)" },
  { key: "Paints & Finishes", label: "Paints & Finishes (4)" },
  { key: "Display", label: "Display (4)" },
  { key: "Decals", label: "Decals (4)" },
];

const Accessories = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    if (activeCategory === "all") return accessoriesData;
    return accessoriesData.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="acc-page">
      <section className="acc-hero">
        <div className="acc-hero-inner">
          <Link to="/" className="acc-back">
            <LeftOutlined />
            <span>Back to Shop</span>
          </Link>

          <h1 className="acc-title">Model Building Accessories</h1>
          <p className="acc-subtitle">
            Everything you need to build, paint, and display your Gundam models
            like a professional. From essential tools to premium finishing
            supplies.
          </p>
          <div className="acc-underline"></div>
        </div>
      </section>
      <main className="acc-container">
        <div className="acc-tabs">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={
                "acc-tab" + (activeCategory === cat.key ? " acc-tab-active" : "")
              }
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <Row gutter={[16, 16]}>
          {filtered.map((item) => (
            <Col xs={24} md={12} lg={8} key={item.id}>
              <Card
                hoverable
                className="acc-card"
                cover={
                  <div className="acc-img-wrap">
                    <img src={item.image} alt={item.name} />
                    {item.sale && (
                      <Tag color="red" className="acc-sale-tag">
                        {item.sale}
                      </Tag>
                    )}
                  </div>
                }
              >
                <h3 className="acc-name">{item.name}</h3>
                <p className="acc-desc">{item.desc}</p>

                <div className="acc-rating-row">
                  <Rate
                    disabled
                    allowHalf
                    defaultValue={item.rating}
                    style={{ fontSize: 12 }}
                  />
                  <span className="acc-reviews">({item.reviews})</span>
                </div>

                <div className="acc-price-row">
                  <span className="acc-price-new">${item.price}.99</span>
                  <span className="acc-price-old">${item.oldPrice}.99</span>
                </div>

                <Button
                  type="primary"
                  block
                  icon={<ShoppingCartOutlined />}
                  className="acc-btn"
                >
                  Add to Cart
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </main>
    </div>
  );
};

export default Accessories;
