import styled from "styled-components";

export const FooterWrapper = styled.footer`
  background: linear-gradient(180deg, #204fcf 0%, #1736a0 100%);
  color: white;
  padding: 40px 100px 15px 100px; 
  font-size: 14px;

  @media (max-width: 900px) {
    padding: 30px 20px;
  }
`;

export const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 30px; 
`;

export const FooterSection = styled.div`
  color: #dbe4ff;

  p {
    margin: 6px 0; 
    line-height: 1.5;
  }

  h4 {
    font-weight: 700;
    margin-top: 15px; 
    color: white;
  }

  a {
    display: block;
    margin: 3px 0;
    color: white;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #a8c1ff;
    }
  }
`;

export const FooterTitle = styled.h3`
  font-size: 16px; 
  font-weight: 700;
  color: white;
  margin-bottom: 10px; 
`;

export const FooterText = styled.p`
  max-width: 240px; 
  line-height: 1.5;
`;

export const SocialIcons = styled.div`
  display: flex;
  gap: 12px; 
  margin-top: 12px;
  font-size: 16px; 

  i {
    cursor: pointer;
    color: white;
    transition: color 0.3s ease;

    &:hover {
      color: #a8c1ff;
    }
  }
`;

export const FooterLinkGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const BottomBar = styled.div`
  margin-top: 35px; 
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  p {
    font-size: 13px; 
    color: #dbe4ff;
  }

  div {
    display: flex;
    gap: 16px;

    a {
      color: white;
      font-size: 13px;
      text-decoration: none;

      &:hover {
        color: #a8c1ff;
      }
    }
  }
`;
