import React, { createContext, useContext, useState } from "react";

const CheckoutContext = createContext(null);

export const CheckoutProvider = ({ children }) => {
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const resetCheckout = () => {
    setShippingInfo(null);
    setPaymentInfo(null);
  };

  const value = {
    shippingInfo,
    setShippingInfo,
    paymentInfo,
    setPaymentInfo,
    resetCheckout,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout phải được dùng bên trong <CheckoutProvider>");
  }
  return ctx;
};
