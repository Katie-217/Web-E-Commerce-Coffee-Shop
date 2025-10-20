import React, { useState } from 'react';
import '../styles/contact.css';
import Footer from '../components/Footer';
import Newsletter from '../components/landing/Newsletter';
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
  };

  return (
    <div className="contact-page">
  {/* Hero Section */}
  <section className="contact-hero">
    <div className="container">
      <div className="hero-content">
        <h1>Contact</h1>
        <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
      </div>
    </div>
  </section>

  {/* Contact Wrapper */}
  <div className="contact-wrapper ">
    {/* Left Side: Info + Form */}
    <div className="contact-left">
      <div className="contact-details">
        <p><strong>Address:</strong> TDTU University</p>
        <p><strong>Phone Number:</strong> 1800 1080</p>
        <p><strong>Email:</strong> support@gmail.vn</p>
      </div>

      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="name" 
          placeholder="Họ và tên" 
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea 
          name="message" 
          placeholder="Nội dung" 
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>

    {/* Right Side: Google Map */}
    <div className="contact-right">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.640785906673!2d105.816234!3d21.005624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab7a2f5c59f7%3A0x9f7e8c81b4f1a3a9!2zMjY2IMSQ4buZaSBD4bqlbiwgTMOgbmcgVGjhu6UsIELDoCDEkMOibmgsIEjDoCBO4buZaQ!5e0!3m2!1svi!2s!4v1696018215530!5m2!1svi!2s"
        allowFullScreen=""
        loading="lazy"
        title="Google Map"
      ></iframe>
    </div>
  </div>

  {/* <Newsletter/>
  <Footer/> */}
</div>

  );
};

export default ContactPage;

