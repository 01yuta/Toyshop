import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: move 20s linear infinite;
    top: -50%;
    left: -50%;
  }

  @keyframes move {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(50px, 50px);
    }
  }
`;

const ContentWrapper = styled.div`
  text-align: center;
  z-index: 1;
  position: relative;
`;

const ErrorCode = styled.h1`
  font-size: 150px;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: float 3s ease-in-out infinite;
  background: linear-gradient(135deg, #ffffff 0%, #dbeafe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @media (max-width: 768px) {
    font-size: 100px;
  }
`;

const ErrorTitle = styled.h2`
  font-size: 36px;
  color: #ffffff;
  margin: 20px 0;
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const ErrorMessage = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 10px 0 40px;
  max-width: 500px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 16px;
    margin: 10px 0 30px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const HomeButton = styled.button`
  padding: 15px 40px;
  font-size: 16px;
  font-weight: 600;
  color: #3b82f6;
  background: #ffffff;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: #ffffff;
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const BackButton = styled.button`
  padding: 15px 40px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: transparent;
  border: 2px solid #ffffff;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const IconWrapper = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  animation: rotate 4s linear infinite;

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    font-size: 60px;
  }
`;

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <NotFoundContainer>
      <ContentWrapper>
        <IconWrapper>🔍</IconWrapper>
        <ErrorCode>404</ErrorCode>
        <ErrorTitle>Trang không tìm thấy</ErrorTitle>
        <ErrorMessage>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </ErrorMessage>
        <ButtonGroup>
          <HomeButton onClick={handleGoHome}>Về trang chủ</HomeButton>
          <BackButton onClick={handleGoBack}>Quay lại</BackButton>
        </ButtonGroup>
      </ContentWrapper>
    </NotFoundContainer>
  );
};

export default NotFoundPage;