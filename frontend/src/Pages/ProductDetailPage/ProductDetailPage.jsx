import React from "react";
import ProductDetail from "../../Components/ProductDetail/ProductDetail";
import ProductDetailTabs from "../../Components/ProductDetailTabs/ProductDetailTabs";
import { Footer } from "../../Components/Footer/Footer";

const ProductDetailPage = () => {
  return (
    <div>
      <ProductDetail />
      <ProductDetailTabs />
      <Footer />
    </div>
  );
};

export default ProductDetailPage;

