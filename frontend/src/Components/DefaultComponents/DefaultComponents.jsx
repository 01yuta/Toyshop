import React from 'react';
import { HeaderComponents } from '../HeaderComponents/HeaderComponents';
import SupportChat from '../SupportChat/SupportChat';

export const DefaultComponents = ({ children }) => {
  return (
    <div>
      <HeaderComponents />
      {children}
      <SupportChat />
    </div>
  );
};

export default DefaultComponents;
