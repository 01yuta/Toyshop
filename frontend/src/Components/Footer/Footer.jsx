import React from "react";
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Input, Button } from "antd";
import { Link } from "react-router-dom";
import {
  FooterWrapper,
  FooterGrid,
  FooterSection,
  FooterTitle,
  FooterText,
  SocialIcons,
  BottomBar,
  FooterLinkGroup,
} from "./Style";

export const Footer = () => {
  return (
    <FooterWrapper>
      <FooterGrid>
        
        <FooterSection>
          <FooterTitle>Mecha Zone</FooterTitle>
          <FooterText>
            Điểm đến hàng đầu của bạn cho các bộ mô hình Gundam chính hãng. Chúng tôi đã phục vụ cộng đồng Gunpla
            hơn 15 năm với sản phẩm chất lượng và dịch vụ chuyên nghiệp.
          </FooterText>

          <SocialIcons>
            <i className="fa-brands fa-facebook-f"></i>
            <i className="fa-brands fa-twitter"></i>
            <i className="fa-brands fa-instagram"></i>
            <i className="fa-brands fa-youtube"></i>
          </SocialIcons>
        </FooterSection>

        
        <FooterSection>
          <FooterTitle>Liên kết nhanh</FooterTitle>
          <FooterLinkGroup>
            <Link to="/models">Tất cả mô hình</Link>
            <Link to="/models?new=true">Sản phẩm mới</Link>
            <Link to="/models?sort=bestseller">Bán chạy nhất</Link>
            <Link to="/models?discount=true">Sản phẩm giảm giá</Link>
            <Link to="/models?preorder=true">Đặt trước</Link>
          </FooterLinkGroup>
        </FooterSection>

        
        <FooterSection>
          <FooterTitle>Danh mục</FooterTitle>
          <FooterLinkGroup>
            <Link to="/models?scale=Real Grade">Real Grade (RG)</Link>
            <Link to="/models?scale=High Grade">High Grade (HG)</Link>
            <Link to="/models?scale=Master Grade">Master Grade (MG)</Link>
            <Link to="/models?scale=Perfect Grade">Perfect Grade (PG)</Link>
            <Link to="/models?category=Accessories">Dụng cụ & Phụ kiện</Link>
          </FooterLinkGroup>
        </FooterSection>

        
        <FooterSection>
          <FooterTitle>Kết nối</FooterTitle>
          <p>
            <MailOutlined /> fuszxjemechazone@gmail.com
          </p>
          <p>
            <PhoneOutlined /> 0783921461
          </p>
          <p>
            <EnvironmentOutlined /> 345A, To Ngoc Van, P.Thanh Xuan, Q.12, TP.HCM
          </p>

          <h4>Bản tin</h4>
          <p>Nhận cập nhật về sản phẩm mới và ưu đãi độc quyền</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <Input placeholder="Nhập email của bạn" />
            <Button type="primary">Đăng ký</Button>
          </div>
        </FooterSection>
      </FooterGrid>

      
      <BottomBar>
        <p>© 2025 MechaZone. All rights reserved.</p>
        <div>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Điều khoản dịch vụ</a>
          <a href="#">Thông tin vận chuyển</a>
          <a href="#">Trả hàng</a>
        </div>
      </BottomBar>
    </FooterWrapper>
  );
};

export default Footer;
