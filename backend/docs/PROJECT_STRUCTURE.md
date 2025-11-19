# Cấu Trúc Dự Án - Coffee Shop Management System

## Tổng Quan
Dự án gồm 2 phần chính:
- **Backend** (Node.js + Express + MongoDB)
- **Frontend** (React + TypeScript + Tailwind)

Mỗi phần được tổ chức dạng cây rõ ràng như dưới đây.

---

## 🌳 Cấu Trúc Thư Mục Tổng Quan

```
Final-pro/
├── backend/               # REST API, kết nối MongoDB, xử lý nghiệp vụ trên server
├── frontend/              # Web app React (landing + admin panel)
├── package-lock.json      # Lock file cho workspace root
└── tools/                 # Công cụ/scripts bổ sung (nếu có)
```

---

## 🔧 Backend Tree (`/backend`)

```
backend/
├── index.js                       # Khởi tạo Express server, connect DB, mount routes
├── package.json                   # Scripts + dependencies backend
├── README.md                      # Hướng dẫn chạy backend
├── TEST_CONNECTION.js             # Script test kết nối MongoDB (dev tool)
├── debug-collections.js           # Liệt kê & kiểm tra collections (dev tool)
├── config/
│   └── database.js                # Hàm connectDB, log trạng thái kết nối MongoDB
├── models/
│   ├── Customer.js                # Schema khách hàng
│   ├── Order.js                   # Schema đơn hàng
│   └── Product.js                 # Schema sản phẩm
├── routes/
│   ├── index.js                   # Router tổng, combine các route con
│   ├── customers.js               # CRUD khách hàng + đơn hàng của khách
│   ├── orders.js                  # CRUD đơn hàng + shipping activity
│   ├── products.js                # CRUD sản phẩm + danh mục
│   └── debug.js                   # Route debug (chỉ dùng dev)
├── docs/
│   ├── PROJECT_STRUCTURE.md       # (file này) mô tả cấu trúc dự án
│   ├── API_ENDPOINTS.md           # Danh sách endpoint backend
│   ├── mongodb-connection-guide.md# Hướng dẫn kết nối MongoDB Compass
│   ├── customersList.json         # Dump mẫu khách hàng
│   ├── ordersList.json            # Dump mẫu đơn hàng
│   └── productsList.json          # Dump mẫu sản phẩm
├── scripts/                       # Chứa script tiện ích (nếu có)
└── node_modules/                  # Dependencies backend
```

---

## 🎨 Frontend Tree (`/frontend`)

```
frontend/
├── package.json                  # Scripts + dependencies frontend
├── README.md                     # Hướng dẫn chạy frontend
├── tailwind.config.js            # Cấu hình Tailwind CSS
├── tsconfig.json                 # Cấu hình TypeScript
├── public/
│   ├── index.html                # HTML template gốc
│   └── images/                   # Asset tĩnh (logo, banner, icons, video,…)
├── src/
│   ├── index.js                  # Entry point React
│   ├── App.jsx                   # Root component + routing
│   ├── index.css                 # CSS global
│   ├── api/                      # Wrapper gọi backend API (axios client)
│   │   ├── client.js             # Cấu hình axios
│   │   ├── orders.js             # API đơn hàng
│   │   ├── customers.js          # API khách hàng
│   │   ├── products.js           # API sản phẩm
│   │   ├── auth.js / users.js    # API auth & user
│   │   └── categories.js         # API danh mục
│   ├── components/
│   │   ├── NavBar/               # Navbar chung cho landing site
│   │   ├── Footer/               # Footer landing
│   │   ├── landing/              # Các section của landing page (Hero, Menu, Process,…)
│   │   └── order-template/       # Cart & modal đặt hàng dùng lại
│   ├── pages/
│   │   ├── Home/                 # Trang chủ (landing)
│   │   ├── About/, Contact/      # Trang giới thiệu & liên hệ
│   │   ├── Menu/, Catalog/       # Trang liệt kê sản phẩm
│   │   ├── Cart/, Checkout/      # Trang giỏ hàng, thanh toán
│   │   ├── Orders/               # Lịch sử đơn hàng khách
│   │   ├── Auth/, Account/       # Đăng nhập/đăng ký + trang tài khoản
│   │   ├── NotFound/             # Trang 404
│   │   └── Admin/                # Admin panel (TypeScript)
│   │       ├── index.tsx         # Entry admin (ReactDOM render)
│   │       ├── App.tsx           # Layout chính admin, wrap router
│   │       ├── components/       # Header, Sidebar, Badge, BackButton…
│   │       └── pages/
│   │           ├── dashboard/    # Dashboard widgets, analytics
│   │           ├── products/     # CRUD sản phẩm (Products.tsx, ProductForm,…)
│   │           ├── orders/       # Order list/detail, shipping timeline
│   │           ├── customers/    # Customer list/detail, tabs detail view
│   │           └── settings/     # Store details, shipping, payment settings
│   ├── styles/                   # File CSS global (reset, responsive, landing…)
│   └── utils/
│       ├── currency.ts           # Hàm format tiền (đ)
│       └── statePersistence.ts   # Wrapper lưu state vào sessionStorage
├── build/                        # Output khi chạy `npm run build`
└── node_modules/                 # Dependencies frontend
```

---

## 🔄 Luồng Dữ Liệu (Tóm tắt)

```
Client (React) ──> src/api/* ──HTTP──> backend/routes/* ──> models/* ──> MongoDB
                                       ↑                                    ↓
                                       └──────── logging/debug (docs, scripts)
```

- **Frontend state**: React hooks + `sessionStorage` (`statePersistence.ts`) giúp giữ form/order detail.
- **Backend state**: MongoDB với nhiều collection (`ordersList`, `customersList`, `productsList`) được truy cập theo thứ tự ưu tiên (orders DB → CoffeeDB → models mặc định).

---

## 📝 Ghi chú nhanh

1. **Schemas chuẩn** nằm trong `/backend/models`. Tất cả routes đều dùng chung các schema này.
2. **Admin Panel** viết bằng TypeScript, tách thành nhiều module nhỏ trong `/frontend/src/pages/Admin`.
3. **Landing site** dùng CSS modules truyền thống; Admin dùng Tailwind + utility classes.
4. **Dev tools** (`debug-collections.js`, `TEST_CONNECTION.js`) chỉ dùng khi cần kiểm tra dữ liệu.

---

## 🚀 Chạy dự án

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

---

**Cập nhật**: 2024  
**Phiên bản tài liệu**: 1.1.0

---

## 🔄 Luồng Dữ Liệu

### Backend → Frontend
1. **API Routes** (`/backend/routes/*.js`) xử lý HTTP requests
2. **Models** (`/backend/models/*.js`) tương tác với MongoDB
3. **API Clients** (`/frontend/src/api/*.js`) gọi API từ frontend
4. **Pages/Components** (`/frontend/src/pages/*`, `/frontend/src/components/*`) hiển thị dữ liệu

### State Management
- **Frontend**: React hooks (useState, useEffect) + sessionStorage (statePersistence.ts)
- **Backend**: MongoDB collections (ordersList, customersList, productsList)

---

## 📝 Ghi Chú Quan Trọng

1. **MongoDB Collections**: Backend hỗ trợ nhiều database/collection patterns:
   - `orders` database → `ordersList` collection
   - `customers` database → `customersList` collection
   - `products` database → `productsList` collection
   - Hoặc collections trong database mặc định (CoffeeDB)

2. **State Persistence**: Admin panel sử dụng `sessionStorage` để lưu state tạm thời (form data, shipping activities) để tránh mất dữ liệu khi rebuild.

3. **TypeScript**: Admin panel sử dụng TypeScript, các phần còn lại dùng JavaScript (JSX).

4. **Styling**: 
   - Landing pages: CSS modules
   - Admin panel: Tailwind CSS
   - Global styles: CSS files trong `/src/styles`

---

## 🚀 Cách Chạy Dự Án

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

**Cập nhật lần cuối**: 2024
**Phiên bản**: 1.0.0

