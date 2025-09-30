import React from 'react';
import {HeroBanner} from '../components/HeroBanner';
import {AboutSection} from '../components/AboutSection';
import {HighLightSection} from '../components/HighLightSection';
import {MenuSection} from '../components/MenuSection';
import {InformationSection} from '../components/InformationSection';
import {TestimonialFooterSection} from '../components/TestimonialFooterSection';
import {FooterSection} from '../components/FooterSection';
import '../styles/home.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroBanner />
      <AboutSection />
      <HighLightSection />
      <MenuSection />
      <InformationSection />
      <TestimonialFooterSection />
      <FooterSection />
    </div>
  );
};

export default HomePage; 