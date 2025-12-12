import styled from "styled-components";
import { Card, Button, Row } from "antd";

export const Wrapper = styled.div`
  padding: 60px 120px;
  background: #f8fbff;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h2 {
    font-size: 30px;
    font-weight: 800;
    color: #0e1a4a;
  }

  p {
    font-size: 15px;
    color: #666;
    max-width: 600px;
    margin: 10px auto 0;
  }
`;

export const Filters = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

export const Grid = styled(Row)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
`;

export const Badge = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${(props) =>
    props.type === "new" ? "#4caf50" : props.type === "sale" ? "#f44336" : "#999"};
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
`;

export const ProductCard = styled(Card)`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
  }

  .image-container {
    position: relative;
    width: 100%;
    height: 230px;
    overflow: hidden;
  }

  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.4s ease;
  }

  &:hover .image-container img {
    transform: scale(1.05);
    filter: brightness(0.9);
  }

  .product-info {
    padding: 14px;
    text-align: center;
  }

  .name {
    font-weight: 600;
    color: #0e1a4a;
  }

  .scale {
    font-size: 13px;
    color: #666;
  }

  .price {
    margin: 8px 0;
    color: #204fcf;
    font-weight: 700;
  }

  /* --- Add to Cart button animation --- */
  .add-to-cart-container {
    position: absolute;
    bottom: -60px;
    left: 0;
    width: 100%;
    text-align: center;
    transition: all 0.4s ease;
    opacity: 0;
  }

  &:hover .add-to-cart-container {
    bottom: 14px;
    opacity: 1;
  }
`;

export const AddButton = styled(Button)`
  width: 90%;
  background: #204fcf;
  color: white;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: #1736a0 !important;
    transform: translateY(-2px);
  }
`;
