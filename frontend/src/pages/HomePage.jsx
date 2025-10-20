import React from 'react';
import HeroBanner from '../components/HeroBanner';
import SalePoints from '../components/landing/SalePoints';
import WhyChooseUs from '../components/landing/Whychooseus';
import VoucherList from '../components/landing/VoucherList';
import ProductCarousel from '../components/landing/ProductCarousel';
import Menu from '../components/landing/Menu';
import TestimonialFooterSection from '../components/landing/TestimonialFooterSection';
import Process from '../components/landing/Process';
import RecentPosts from '../components/landing/RecentPosts';
import Newsletter from '../components/landing/Newsletter';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/home.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroBanner />
      <SalePoints />
      <Process />
      <ProductCarousel />
      <VoucherList/>
      <Menu />
      <TestimonialFooterSection />
      <WhyChooseUs />
      <RecentPosts />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default HomePage; 