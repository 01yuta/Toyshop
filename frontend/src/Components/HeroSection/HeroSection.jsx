import React from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import img1 from "../Assets/hero1.jpg";
import img2 from "../Assets/hero2.jpg";
import img3 from "../Assets/hero3.jpg";
import img4 from "../Assets/hero4.jpg";

export const HeroSection = () => {
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: true,
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-slider">
          <Slider {...settings}>
            <div>
              <img src={img1} alt="Gundam 1" />
            </div>
            <div>
              <img src={img2} alt="Gundam 2" />
            </div>
            <div>
              <img src={img3} alt="Gundam 3" />
            </div>
            <div>
              <img src={img4} alt="Gundam 4" />
            </div>
          </Slider>
        </div>
        <div className="hero-content">
          <h1>
            Build Your <br />
            <span>Gundam Legacy</span>
          </h1>
          <p>
            Khám phá bộ mô hình Gundam cao cấp từ Real Grade đến Perfect Grade.
            Lắp ráp, tùy chỉnh và trưng bày các mobile suit huyền thoại với chi tiết
            và chất lượng chính hãng.
          </p>

          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => navigate("/models")}
            >
              Mua ngay
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate("/models?new=true")}
            >
              Sản phẩm mới
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <h3>500+</h3>
              <p>Mô hình có sẵn</p>
            </div>
            <div>
              <h3>50k+</h3>
              <p>Người xây dựng hài lòng</p>
            </div>
            <div>
              <h3>15+</h3>
              <p>Năm kinh nghiệm</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
