import React from 'react';
import HighLightSection from '../components/HighLightSection';
import FooterSection from '../components/FooterSection';
import '../styles/highlight.css';

const HighlightPage = () => {
  return (
    <div className="highlight-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Món Ăn Nổi Bật</h1>
          <p>Những món ăn chay được yêu thích nhất</p>
        </div>
      </div>
      
      <HighLightSection />
      <FooterSection />
    </div>
  );
};

export default HighlightPage; 