import React from "react";
import { Row, Col, Card, Button } from "antd";
import {
  LeftOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  LockOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./About.css";
import Baoduy1 from "../Assets/baoduy.jpg";
import atsh from "../Assets/baoduy1.jpg";

const About = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="about-hero-inner">
          <Link to="/" className="about-back">
            <LeftOutlined />
            <span>Quay lại cửa hàng</span>
          </Link>

          <h1 className="about-title">
            Điểm đến hàng đầu của bạn cho các bộ Gundam model kits chính hãng và
            phụ kiện lắp ráp.
          </h1>

          <p className="about-subtitle">
            Chúng tôi đam mê mang thế giới Gunpla đến với
            những người xây dựng ở mọi cấp độ kỹ năng.
          </p>
          <div className="about-underline"></div>
        </div>
      </div>
      <div className="about-content">
        <section className="about-section about-story">
          <Row gutter={32} align="middle">
            <Col xs={24} md={14}>
              <h2>Câu chuyện của chúng tôi</h2>
              <p>
                Được thành lập vào năm 2015, MECHA ZONE bắt đầu như một cửa hàng sở thích nhỏ được điều hành bởi
                những người xây dựng đam mê muốn chia sẻ tình yêu của họ dành cho Gundam
                model kits với cộng đồng. Điều bắt đầu như một dự án phụ ở
                một góc nhỏ của thành phố đã phát triển thành một trong những
                nhà bán lẻ trực tuyến hàng đầu cho Gunpla và mecha kits.
              </p>
              <p>
                Trong những năm qua, chúng tôi đã mở rộng danh mục của mình để bao gồm
                mọi thứ từ các bộ High Grade thân thiện với người mới bắt đầu đến các bộ
                Perfect Grade phức tạp và các bản phát hành Premium Bandai giới hạn. Sứ mệnh của chúng tôi
                luôn giống nhau: làm cho thế giới Gunpla dễ tiếp cận,
                chào đón và thú vị cho mọi người.
              </p>
              <p>
                Ngày nay, chúng tôi phục vụ hàng nghìn người xây dựng trên toàn thế giới—từ những người
                lần đầu làm mô hình cầm kìm cắt lần đầu tiên đến những người
                kỳ cựu đang theo đuổi các bản phát hành Ver.Ka mới nhất.
              </p>
            </Col>
            <Col xs={24} md={10}>
              <div className="about-image-card">
                <img src={Baoduy1} alt="Team working on Gundam models" />
              </div>
            </Col>
          </Row>
        </section>
        <section className="about-section about-why">
          <h2 className="about-center-title">Tại sao chọn MECHA ZONE</h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card className="about-feature-card" bordered={false}>
                <SafetyCertificateOutlined className="about-feature-icon" />
                <h3>100% Chính hãng</h3>
                <p>
                  Tất cả sản phẩm của chúng tôi được lấy trực tiếp từ các nhà phân phối
                  chính thức. Không có hàng giả, được đảm bảo.
                </p>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card className="about-feature-card" bordered={false}>
                <ThunderboltOutlined className="about-feature-icon" />
                <h3>Giao hàng nhanh</h3>
                <p>
                  Đơn hàng được xử lý trong vòng 24–48 giờ với theo dõi trên mỗi
                  lần giao hàng. Miễn phí vận chuyển cho đơn hàng trên $150.
                </p>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card className="about-feature-card" bordered={false}>
                <LockOutlined className="about-feature-icon" />
                <h3>Đóng gói an toàn</h3>
                <p>
                  Mỗi bộ được đóng gói cẩn thận với bảo vệ góc để hộp của bạn
                  đến trong tình trạng chất lượng sưu tập.
                </p>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card className="about-feature-card" bordered={false}>
                <TeamOutlined className="about-feature-icon" />
                <h3>Hỗ trợ chuyên nghiệp</h3>
                <p>
                  Đội ngũ của chúng tôi được tạo thành từ những người xây dựng. Nhận lời khuyên thực tế, mẹo xây dựng,
                  và đề xuất qua chat hoặc email.
                </p>
              </Card>
            </Col>
          </Row>
        </section>
        <section className="about-stats-strip">
          <Row gutter={24} justify="space-between">
            <Col xs={12} md={6}>
              <div className="about-stat-item">
                <h3>50,000+</h3>
                <p>Khách hàng hài lòng</p>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="about-stat-item">
                <h3>500+</h3>
                <p>Model Kits có sẵn</p>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="about-stat-item">
                <h3>4.9</h3>
                <p>Đánh giá trung bình</p>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="about-stat-item">
                <h3>9</h3>
                <p>Năm kinh nghiệm</p>
              </div>
            </Col>
          </Row>
        </section>
        <section className="about-section about-mission">
          <Row gutter={32} align="middle">
            <Col xs={24} md={10}>
              <div className="about-image-card">
                <img src={atsh} alt="Warehouse shelves" />
              </div>
            </Col>
            <Col xs={24} md={14}>
              <h2>Sứ mệnh của chúng tôi</h2>
              <p>
                Chúng tôi tin rằng Gunpla là tự do—tự do để xây dựng, sửa đổi,
                và tạo ra thứ gì đó độc đáo của riêng bạn. Mục tiêu của chúng tôi là làm cho
                sở thích này dễ tiếp cận với mọi người, bất kể trình độ kỹ năng hay
                nền tảng.
              </p>
              <p>
                Bằng cách cung cấp các bộ, công cụ và phụ kiện được tuyển chọn cẩn thận,
                kết hợp với hỗ trợ thân thiện và hướng dẫn xây dựng, chúng tôi hướng tới việc trở thành
                đối tác đáng tin cậy của bạn trong mọi bước của hành trình Gunpla của bạn.
              </p>

              <ul className="about-mission-list">
                <li>
                  <CheckCircleOutlined />
                  <span>Chất lượng được đảm bảo trên mỗi bộ chúng tôi có trong kho.</span>
                </li>
                <li>
                  <CheckCircleOutlined />
                  <span>Sự kiện, cuộc thi và stream do cộng đồng thúc đẩy.</span>
                </li>
                <li>
                  <CheckCircleOutlined />
                  <span>
                    Được xây dựng bởi những người xây dựng — chúng tôi đề xuất các bộ mà chúng tôi thực sự yêu thích.
                  </span>
                </li>
              </ul>
            </Col>
          </Row>
        </section>
        <section className="about-section about-cta">
          <div className="about-cta-inner">
            <div className="about-cta-text">
              <h2>Liên hệ với chúng tôi</h2>
              <p>
                Có câu hỏi về sản phẩm hoặc cần trợ giúp với bản dựng tiếp theo của bạn?
                Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ.
              </p>
            </div>
            <div className="about-cta-actions">
              <Button 
                icon={<MessageOutlined />}
                onClick={() => window.open('https://www.facebook.com/profile.php?id=61584267031884', '_blank')}
              >
                Liên hệ hỗ trợ
              </Button>
              <Button 
                type="primary"
                onClick={() => window.open('https://www.facebook.com/groups/910979310740951', '_blank')}
              >
                Tham gia cộng đồng
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
export default About;
