import styled from "styled-components";
import { Row } from "antd";

export const WrapperHeader = styled(Row)`
  padding: 8px 40px;
  background: white;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  gap: 12px;
  flex-wrap: wrap;
  height: auto;
  justify-content: space-between;

  @media (max-width: 1024px) {
    padding: 12px 24px;
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 20px;
  color: #204fcf;

  img {
    width: 50px;
    height: 50px;
    object-fit: contain;
  }
`;

export const NavMenu = styled.div`
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #222;
  cursor: pointer;
  font-weight: 500;
  flex-wrap: wrap;
  justify-content: center;

  a {
    color: inherit;
    text-decoration: none;
  }

  a:hover {
    color: #204fcf;
    transition: color 0.2s ease;
  }
`;

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  width: 260px;

  /* Cho AutoComplete + Input.Search full width */
  .ant-select,
  .ant-select-selector,
  .ant-input-group,
  .ant-input-search {
    width: 100%;
  }

  /* Bo góc, font cho input */
  .ant-input-search .ant-input {
    border-radius: 6px 0 0 6px;
    font-size: 13px;
    color: #444;
  }

  .ant-input-search-button {
    border-radius: 0 6px 6px 0;
  }

  /* Màu border & icon giống style cũ */
  .ant-input,
  .ant-input-search-button {
    border-color: #97b2ff;
  }

  .ant-input:focus,
  .ant-input-focused {
    box-shadow: 0 0 0 2px rgba(151, 178, 255, 0.25);
  }

  .ant-input-search-button .anticon {
    color: #97b2ff;
  }
  @media (max-width: 1200px) {
    width: 220px;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const UserActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  color: #204fcf;
  font-size: 14px;

  svg {
    font-size: 20px;
  }

  span {
    cursor: pointer;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;
