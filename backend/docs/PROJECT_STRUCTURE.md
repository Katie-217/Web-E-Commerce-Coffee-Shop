# Cấu Trúc Dự Án - Coffee Shop Management System

## Tổng Quan
Dự án gồm 2 phần chính:
- **Backend** (Node.js + Express + MongoDB)
- **Frontend** (React + TypeScript + Tailwind + CRA)

Toàn bộ source nằm trong thư mục `Final-pro/` và được chia tách rõ ràng giữa API server và web app.

---

## 🌳 Cấu Trúc Thư Mục Tổng Quan

```text
Final-pro/
├── backend/               # REST API, kết nối MongoDB, xử lý nghiệp vụ server
├── frontend/              # Web app React (landing site + admin panel)
├── package.json*          # (nếu có) cấu hình workspace root
├── package-lock.json      # Lock file cho workspace root
└── README.md              # Tài liệu chung
```

> Khi làm việc chủ yếu chỉ cần quan tâm 2 thư mục `backend/` và `frontend/`.

---

## 🔧 Backend Tree (`/backend`)

```text
backend/
├── index.js                       # Khởi tạo Express server, connect DB, mount routes
├── package.json                   # Scripts + dependencies backend
├── package-lock.json              # Lock version cho backend
├── README.md                      # Hướng dẫn chạy backend + cấu hình .env
├── config/
│   ├── database.js                # Hàm connectDB, log trạng thái kết nối MongoDB
│   └── cloudinary.js              # Cấu hình Cloudinary (upload ảnh)
├── data/
│   └── addressData.js             # Dataset địa chỉ dùng cho API address
├── docs/
│   ├── PROJECT_STRUCTURE.md       # (file này) mô tả cấu trúc dự án
│   ├── API_ENDPOINTS.md           # Danh sách endpoint backend
│   ├── mongodb-connection-guide.md# Hướng dẫn kết nối MongoDB Compass
│   ├── customersList.json         # Dump mẫu khách hàng
│   ├── ordersList.json            # Dump mẫu đơn hàng
│   ├── productsList.json          # Dump mẫu sản phẩm
│   └── shipping_activity_data.json# Dump mẫu dữ liệu shipping activity
├── models/
│   ├── Customer.js                # Schema khách hàng
│   ├── Order.js                   # Schema đơn hàng
│   └── Product.js                 # Schema sản phẩm
├── routes/
│   ├── index.js                   # Router tổng, combine các route con
│   ├── customers.js               # CRUD khách hàng + đơn hàng của khách
│   ├── orders.js                  # CRUD đơn hàng + shipping activity
│   ├── products.js                # CRUD sản phẩm + danh mục
│   ├── categories.js              # API danh mục sản phẩm (category list)
│   ├── addresses.js               # API dữ liệu địa chỉ (country/city/district/ward)
│   └── upload.js                  # API upload ảnh (Cloudinary)
├── scripts/                       # Script tiện ích xử lý dữ liệu
│   ├── fix_wishlist_product_ids.js
│   ├── generate_display_codes.js
│   ├── import_display_codes_to_mongodb.js
│   ├── sync_orders_to_mongodb.js
│   ├── update_wishlist_is_on_sale.js
│   └── upload-*-to-cloudinary.js  # Các script upload ảnh sản phẩm lên Cloudinary
├── utils/
│   └── loyalty.js                 # Logic tính điểm loyalty / ưu đãi
└── node_modules/                  # Dependencies backend
```

---

## 🎨 Frontend Tree (`/frontend`)

```text
frontend/
├── package.json                  # Scripts + dependencies frontend
├── package-lock.json             # Lock version cho frontend
├── README.md                     # Hướng dẫn chạy frontend
├── tailwind.config.js            # Cấu hình Tailwind CSS (admin panel)
├── tsconfig.json                 # Cấu hình TypeScript cho phần Admin
├── public/
│   ├── index.html                # HTML template gốc
│   └── images/                   # Asset tĩnh (logo, banner, icons, video,…)
├── src/
│   ├── index.js                  # Entry point React
│   ├── App.jsx                   # Root component + routing cho site public
│   ├── index.css                 # CSS global
│   ├── api/                      # Wrapper gọi backend API (axios client)
│   │   ├── client.js             # Cấu hình axios
│   │   ├── orders.js             # API đơn hàng
│   │   ├── customers.js          # API khách hàng
│   │   ├── products.js           # API sản phẩm
│   │   ├── categories.js         # API danh mục
│   │   ├── addresses.js          # API dữ liệu địa chỉ
│   │   ├── upload.js             # API upload ảnh
│   │   ├── auth.js / users.js    # API auth & user
│   │   └── index.js              # Export tập trung
│   ├── components/
│   │   ├── NavBar/               # Navbar chung cho landing site
│   │   ├── Footer/               # Footer landing
│   │   ├── landing/              # Các section landing page (Hero, Menu, Process,…)
│   │   ├── order-teamplate/      # Cart & modal đặt hàng dùng lại
│   │   ├── ModalDialog.tsx       # Modal dialog dùng chung (admin + form)
│   │   └── ExportDropdown.tsx    # Dropdown export CSV/Excel/PDF dùng trong admin
│   ├── pages/
│   │   ├── Home/, About/, Contact/
│   │   ├── Menu/, Catalog/
│   │   ├── Cart/, Checkout/
│   │   ├── Orders/               # Lịch sử đơn hàng khách
│   │   ├── Auth/, Account/
│   │   ├── NotFound/
│   │   └── Admin/                # Admin panel (TypeScript + Tailwind)
│   │       ├── index.tsx         # Entry admin (ReactDOM render)
│   │       ├── App.tsx           # Layout chính admin, điều hướng sidebar
│   │       ├── components/       # Header, Sidebar, Badge, BackButton, Pagination,…
│   │       └── pages/
│   │           ├── dashboard/    # Dashboard widgets, analytics, advanced chart
│   │           ├── products/     # CRUD sản phẩm, category list, product detail
│   │           ├── orders/       # Order list/detail, shipping timeline
│   │           └── customers/    # Customer list/detail, address, analytics
│   ├── styles/                   # File CSS global (reset, responsive, landing…)
│   └── utils/
│       ├── currency.ts           # Hàm format tiền (đ)
│       ├── exportUtils.ts        # Logic export CSV/Excel/PDF dùng trong admin
│       ├── statePersistence.ts   # Wrapper lưu state vào sessionStorage
│       └── các helper khác       # avatar, statusColors, orderDisplayCode, …
├── build/                        # Output khi chạy `npm run build`
└── node_modules/                 # Dependencies frontend
```

---

## 🔄 Luồng Dữ Liệu (Tóm tắt)

```text
Client (React) ──> src/api/* ──HTTP──> backend/routes/* ──> models/* ──> MongoDB
                                       ↑                                    ↓
                                       └──────── logging/debug (docs, scripts)
```

- **Frontend state**: React hooks + `sessionStorage` (`statePersistence.ts`) giúp giữ form/order detail.
- **Backend state**: MongoDB với nhiều collection (`ordersList`, `customersList`, `productsList`, …) được truy cập theo thứ tự ưu tiên (orders DB → customers DB → CoffeeDB → models mặc định).

---

## 🧩 Yêu Cầu Môi Trường & Phiên Bản Khuyến Nghị

Khi clone/pull dự án về máy mới, nên chuẩn bị môi trường như sau:

- **Node.js**: >= 18 LTS (khuyến nghị 18.x hoặc 20.x)
- **npm**: >= 9 (dùng kèm bản Node tương ứng)
- **MongoDB**: >= 6.x (cài local hoặc dùng MongoDB Atlas)
- **Git**: bản mới bất kỳ
- **Cloudinary account** (tùy chọn nhưng nên có) để upload ảnh sản phẩm.

Tất cả phiên bản thư viện chi tiết đã được cố định trong `package-lock.json` của từng phần (`backend/`, `frontend/`). Chỉ cần dùng Node + npm ở mức tối thiểu phía trên là cài được đúng dependency.

---

## ⚙️ Thiết Lập Backend Sau Khi Pull

1. **Cài dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Tạo file `.env`** (tham khảo thêm trong `backend/README.md`):

   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017
   DATABASE_NAME=coffeeshop

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Cloudinary (nếu dùng upload ảnh)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Chạy server backend**

   ```bash
   cd backend
   npm start          # hoặc: node index.js
   ```

4. **Kiểm tra kết nối MongoDB**
   - Mở MongoDB Compass, kết nối `mongodb://localhost:27017`
   - Database và collection sẽ được tạo tự động khi ghi dữ liệu đầu tiên.

---

## 🌐 Thiết Lập Frontend Sau Khi Pull

1. **Cài dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Chạy web app (landing + admin)**

   ```bash
   cd frontend
   npm start
   ```

   Ứng dụng sẽ chạy trên `http://localhost:3000` (mặc định CRA).  
   Admin panel thường map vào một route riêng (ví dụ `/admin` hoặc tương đương).

3. **Kết nối tới backend**

   - Endpoint backend được cấu hình trong `src/api/client.js` (baseURL).
   - Đảm bảo backend đã chạy (mặc định `http://localhost:3001` hoặc port bạn cấu hình trong `.env`).

---

## 📝 Ghi Chú Quan Trọng

1. **MongoDB Collections**: Backend hỗ trợ nhiều pattern database/collection:
   - `orders` database → `ordersList` collection
   - `customers` database → `customersList` collection
   - `products` database → `productsList` collection
   - Hoặc các collection trong database mặc định (CoffeeDB)

2. **State Persistence**: Admin panel sử dụng `sessionStorage` để lưu state tạm thời (form data, shipping activities, v.v.) để tránh mất dữ liệu khi reload.

3. **TypeScript**: Admin panel (`/frontend/src/pages/Admin`) dùng TypeScript; phần landing vẫn dùng JavaScript (JSX).

4. **Styling**: 
   - Landing pages: CSS modules + file CSS riêng.
   - Admin panel: Tailwind CSS + utility classes.
   - Global styles: các file trong `/src/styles` và `src/index.css`.

---

## 🔖 Thông Tin Phiên Bản Tài Liệu

- **Cập nhật lần cuối**: 2025  
- **Phiên bản tài liệu**: 2.0.0


