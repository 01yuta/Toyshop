import React from 'react'
import HeaderComponents from '../../Components/HeaderComponents/HeaderComponents';
import { HeroSection } from '../../Components/HeroSection/HeroSection';
import {ProductCollection} from '../../Components/ProductCollection/ProductCollection';
import { Footer } from '../../Components/Footer/Footer';

 const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <ProductCollection
        limit={6}
        initialSortOrder="Mới nhất"
        showFilters={false}
      />
      <Footer />  
    </div>
  )
}

export default HomePage;