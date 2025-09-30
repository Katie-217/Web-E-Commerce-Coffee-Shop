// import React from 'react';

// const posts = [
//   { id: 1, title: 'Cách chọn serum phù hợp', date: '25 Sep' },
//   { id: 2, title: 'Dưỡng ẩm đúng cách', date: '26 Sep' },
//   { id: 3, title: 'Kem chống nắng nào tốt', date: '27 Sep' }
// ];

// const RecentPosts = () => {
//   return (
//     <section className="landing recent-posts reveal">
//       <div className="container">
//         <h2>Recent posts</h2>
//         <div className="grid posts">
//           {posts.map(p => (
//             <article key={p.id} className="post-card">
//               <div className="thumb" style={{backgroundImage: `url(/images/img${(p.id%4)||4}.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center'}} />
//               <h3>{p.title}</h3>
//               <time>{p.date}</time>
//             </article>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default RecentPosts;


import React from "react";
import '../../styles/recentpost.css';

const posts = [
  {
    id: 1,
    img: "/images/coffee1.jpg",
    title: "Cách nhận biết hương vị cà phê Robusta nguyên chất",
    date: "28 Tháng 09, 2025",
    desc: "Cùng Arabica, Robusta cũng là loại cà phê nổi tiếng được sử dụng phổ biến ở Việt Nam và nhiều...",
  },
  {
    id: 2,
    img: "/images/coffee3.jpg",
    title: "Bắt gặp Sài Gòn xưa trong món uống hiện đại của giới trẻ",
    date: "28 Tháng 09, 2025",
    desc: "Cùng Arabica, Robusta cũng là loại cà phê nổi tiếng được sử dụng phổ biến ở Việt Nam và nhiều...",
  },
  {
    id: 3,
    img: "/images/coffee2.jpg",
    title: "Bật mí nhiệt độ lý tưởng để pha cà phê ngon và đậm đà hương vị",
    date: "28 Tháng 09, 2025",
    desc: "Cùng Arabica, Robusta cũng là loại cà phê nổi tiếng được sử dụng phổ biến ở Việt Nam và nhiều...",
  },
  {
    id: 4,
    img: "/images/coffee4.jpg",
    title: "Arabica và Robusta - 2 cá tính, 2 trải nghiệm độc đáo",
    date: "28 Tháng 09, 2025",
    desc: "Cùng Arabica, Robusta cũng là loại cà phê nổi tiếng được sử dụng phổ biến ở Việt Nam và nhiều...",
  },
];

const RecentPosts = () => {
  return (
    <section className="recent-posts">
      <div className="container">
        <div className="header-post">
        <h1 className="bg-text">Blog</h1>
        <span className="pc-eyebrow">Our Blog</span>
        <h2>RECENT POSTS</h2>       
        <div className="line"></div>
        </div>

        <div className="posts-grid">
        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <img src={post.img} alt={post.title} />
            <div className="post-content">
              <div className="post-meta">
                <span>☕ Recent Post</span>
                <span>📅 {post.date}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.desc}</p>
              <a href="#">XEM CHI TIẾT →</a>
            </div>
          </div>
        ))}
      </div>

        <div className="see-more">
          <button>XEM THÊM</button>
        </div>
      </div>
    </section>
  );
};

export default RecentPosts;
