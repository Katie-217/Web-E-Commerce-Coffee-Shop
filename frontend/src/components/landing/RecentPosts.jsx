
import React from "react";
import '../../styles/recentpost.css';
const posts = [
  {
    id: 1,
    img: "/images/coffee1.jpg",
    title: "Cách nhận biết hương vị cà phê Robusta nguyên chất",
    date: "28 Tháng 08, 2025",
    desc: "Cùng Arabica, Robusta cũng là loại cà phê nổi tiếng được sử dụng phổ biến ở Việt Nam và nhiều...",
  },
  {
    id: 2,
    img: "/images/coffee3.jpg",
    title: "Bắt gặp Sài Gòn xưa trong món uống hiện đại của giới trẻ",
    date: "28 Tháng 08, 2025",
    desc: "Cùng Arabica, Robusta cũng là loại cà phê nổi tiếng được sử dụng phổ biến ở Việt Nam và nhiều...",
  },
  {
    id: 3,
    img: "/images/coffee2.jpg",
    title: "Bật mí nhiệt độ lý tưởng để pha cà phê ngon và đậm đà hương vị",
    date: "28 Tháng 08, 2025",
    desc: "Cùng Arabica, Robusta cũng là loại cà phê nổi tiếng được sử dụng phổ biến ở Việt Nam và nhiều...",
  },
  {
    id: 4,
    img: "/images/coffee4.jpg",
    title: "Arabica và Robusta - 2 cá tính, 2 trải nghiệm độc đáo",
    date: "28 Tháng 08, 2025",
    desc: "Cùng Arabica, Robusta cũng là loại cà phê nổi tiếng được sử dụng phổ biến ở Việt Nam và nhiều...",
  },
];

const RecentPosts = () => {
  return (
    <section className="recent-posts"
     style={{ 
        backgroundImage: `url('/images/origin-bg.png')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        
      }}>
      <div className="container">
        <div className="blog-layout">
          {/* Left section - Dark background with title and description */}
          <div className="blog-intro">
            <div className="intro-content">
              <h1 className="bg-text">Blogs</h1>
              <h2>Fresh roasted coffee Blogs</h2>
              <p>Coffee is a beverage brewed from the roasted and ground seeds of the tropical evergreen coffee plant.</p>
              <a href="#" className="show-blogs">Show Blogs</a>
            </div>
          </div>

          {/* Right section - Light background with blog cards */}
          <div className="blog-cards">
            <div className="cards-container">
              {posts.slice(0, 2).map((post) => (
                <div className="post-card" key={post.id}>
                  <div className="post-image">
                    <img src={post.img} alt={post.title} />
                    <div className="date-badge">30 DEC, 2022</div>
                  </div>
                  <div className="post-content">
                    <span className="post-author">WorkDo</span>
                    <h3>{post.title}</h3>
                    <p>{post.desc}</p>
                    <a href="#" className="read-more">READ MORE</a>
                  </div>
                </div>
              ))}
            </div>
           
          </div>
        </div>
      </div>
      
    </section>
    
  );
};

export default RecentPosts;
