import styled from "styled-components";

export const ProductWrapper = styled.div`
  padding: 40px 120px;
  background: linear-gradient(to bottom, #ffffff 0%, #f8fbff 100%);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;

  @media (max-width: 1024px) {
    padding: 30px 60px;
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #1d4ed8;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  transition: 0.2s;

  &:hover {
    color: #0f172a;
  }
`;

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 50px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    gap: 35px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 25px;
  }
`;

export const ProductImages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const MainImage = styled.div`
  position: relative;
  width: 100%;
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    height: 350px;
  }
`;

export const ThumbnailList = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 6px 0;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  img {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:hover {
      border-color: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    &.selected {
      border-color: #1d4ed8;
      box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.2);
    }
  }
`;

export const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  .series {
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  h1 {
    font-size: 30px;
    font-weight: 700;
    color: #1e3a8a;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #6b7280;
    padding: 6px 0;
    
    span {
      font-weight: 500;
    }
  }

  .stock-status {
    margin: 6px 0;
    
    .in-stock {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      color: #15803d;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(21, 128, 61, 0.15);
    }

    .out-stock {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #fee2e2;
      color: #dc2626;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
  }

  .quantity-box {
    display: flex;
    align-items: center;
    gap: 14px;
    font-weight: 600;
    color: #111827;
    padding: 10px 0;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
    margin: 6px 0;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
    flex-wrap: wrap;

    .icon {
      font-size: 20px;
      color: #475569;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      transition: 0.3s;
      flex-shrink: 0;

      &:hover {
        color: #1d4ed8;
        border-color: #1d4ed8;
      }
    }
  }
`;

export const ProductTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
  margin: 6px 0;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

export const PriceBox = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  margin: 6px 0;

  h2 {
    color: #1d4ed8;
    font-size: 32px;
    font-weight: 800;
    margin: 0;
    text-shadow: 0 2px 4px rgba(29, 78, 216, 0.1);
  }

  .old-price {
    text-decoration: line-through;
    color: #9ca3af;
    font-size: 18px;
    font-weight: 500;
  }

  .discount {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    color: #1d4ed8;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 12px;
    box-shadow: 0 2px 6px rgba(29, 78, 216, 0.2);
  }
`;

export const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 14px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #cbd5e1;
    background: #f1f5f9;
  }

  span {
    min-width: 28px;
    text-align: center;
    font-weight: 600;
    font-size: 15px;
    color: #0f172a;
  }

  svg {
    cursor: pointer;
    color: #1e3a8a;
    font-size: 14px;
    padding: 3px;
    border-radius: 5px;
    transition: all 0.2s ease;

    &:hover {
      color: #2563eb;
      background: #e0e7ff;
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }
`;

export const AddToCartButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #1739a3 0%, #1d4ed8 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(29, 78, 216, 0.4);

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
  }
`;

export const BuyNowButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
  }
`;

export const FeatureRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;

  div {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 10px 16px;
    border-radius: 8px;
    font-weight: 600;
    color: #1e3a8a;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    font-size: 13px;

    &:hover {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }
`;

export const Badge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ef4444;
  color: white;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
`;
