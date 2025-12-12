import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const TabsContainer = styled.div`
  background: #f9fbff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 0;
`;

export const TabList = styled.div`
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #dbe2f3;
  margin-bottom: 20px;
  width: 100%;
  max-width: 1200px;
`;

export const TabButton = styled.button`
  background: ${(p) => (p.active ? "#fff" : "transparent")};
  border: ${(p) => (p.active ? "1.5px solid #204fcf" : "1px solid transparent")};
  border-bottom: ${(p) => (p.active ? "none" : "1px solid transparent")};
  color: ${(p) => (p.active ? "#0e1a4a" : "#555")};
  padding: 10px 20px;
  margin-right: 10px;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #204fcf;
  }
`;

export const TabContent = styled.div`
  background: white;
  padding: 25px 40px;
  border: 1px solid #e1e6f0;
  border-radius: 8px;
  animation: ${fadeIn} 0.4s ease;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 40px auto;

  p {
    color: #444;
    line-height: 1.6;
  }

  h4 {
    margin-top: 20px;
    color: #0e1a4a;
  }

  ul {
    margin-top: 10px;
    padding-left: 18px;
    li {
      line-height: 1.8;
    }
  }
`;

export const RelatedSection = styled.div`
  margin-top: 50px;
  width: 100%;
  padding: 0 120px; /* giữ lề trái như Figma */

  h3 {
    color: #0e1a4a;
    margin-bottom: 20px;
    text-align: left;
  }
`;

export const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
`;

export const RelatedCard = styled.div`
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
  }

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  .info {
    padding: 12px;
    .series {
      font-size: 12px;
      color: #666;
    }
    .name {
      font-weight: 600;
      color: #0e1a4a;
      margin: 4px 0;
    }
    .price {
      display: flex;
      gap: 6px;
      .new {
        color: #204fcf;
        font-weight: 700;
      }
      .old {
        text-decoration: line-through;
        color: #888;
        font-size: 13px;
      }
    }
  }
`;