 import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import ScaleList from "../../Components/Scale/ScaleList";
import ProductCollection from "../../Components/ProductCollection/ProductCollection";
import "./ScalePage.css";

const ScalePage = () => {
  const navigate = useNavigate();

  return (
    <div className="scale-page">
      <div className="scale-header-section">
        <button className="scale-back" onClick={() => navigate("/")}>
          <ArrowLeftOutlined /> Quay lại cửa hàng
        </button>

        <h2 className="scale-title">Hướng dẫn tỷ lệ mô hình</h2>

        <p className="scale-description">
          Khám phá bộ sưu tập đầy đủ các bộ mô hình Gundam được sắp xếp theo
          tỷ lệ. Từ các bộ High Grade 1/144 chi tiết đến các kiệt tác Perfect
          Grade 1/60 khổng lồ, tìm tỷ lệ hoàn hảo cho bộ sưu tập của bạn.
        </p>
        <div className="scale-underline"></div>
      </div>
      <ScaleList />
      <div className="scale-subsection">
        <h3>1/144 HG</h3>
        <p>3 mô hình có sẵn</p>
      </div>
      <ProductCollection scaleFilter="1/144 HG" limit={3} />

    </div>
  );
};

export default ScalePage;
