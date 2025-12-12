import React from "react";
import { LeftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Models from "../../Components/Models/Models";
import "./modelspage.css";

const ModelsPage = () => {
  return (
    <div className="models-page">
      <div className="models-top">
        <Link to="/" className="models-back">
          <LeftOutlined />
          <span>Quay lại trang chủ</span>
        </Link>

        <h1 className="models-title">Gundam Model Kits</h1>
        <p className="models-subtitle">
          Khám phá bộ sưu tập đầy đủ với 20 mô hình Gundam cao cấp
        </p>
      </div>

      <Models />
    </div>
  );
};

export default ModelsPage;
