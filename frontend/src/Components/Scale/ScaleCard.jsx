import React from "react";
import "./scale.css";

const ScaleCard = ({ title, subtitle, description, skill, price }) => {
  return (
    <div className="scale-card">
      <h3 className="scale-card-title">{title}</h3>
      <h4 className="scale-card-subtitle">{subtitle}</h4>

      <p className="scale-card-desc">{description}</p>

      <div className="scale-card-info">
        <p><strong>Mức độ kỹ năng:</strong> {skill}</p>
        <p><strong>Khoảng giá:</strong> {price}</p>
      </div>
    </div>
  );
};

export default ScaleCard;
