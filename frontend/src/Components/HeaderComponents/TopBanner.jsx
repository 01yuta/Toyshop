import React, { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import "./TopBanner.css";

export const TopBanner = () => {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <div className={`top-banner ${closing ? "fade-out" : "fade-in"}`}>
      🎉 <b>KHUYẾN MÃI KHAI TRƯƠNG!</b> • Giảm 20% cho tất cả bộ Master Grade •
      Miễn phí vận chuyển cho đơn hàng trên 1,800,000 VND • Sử dụng mã: <b>MECHA20</b>
      <span className="close-btn" onClick={handleClose}>
        <CloseOutlined />
      </span>
    </div>
  );
};
