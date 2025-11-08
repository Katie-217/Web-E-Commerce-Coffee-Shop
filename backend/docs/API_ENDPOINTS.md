# API Endpoints Documentation

## Database: CoffeeDB

### Collections Mapping

| Model | Collection Name | Description |
|-------|----------------|-------------|
| Product | `products` | Sản phẩm trong cửa hàng |
| Customer | `customers` | Khách hàng |
| Order | `orders` | Đơn hàng |

---

## Products API

**Base URL:** `/api/products`

### GET `/api/products`
Lấy danh sách tất cả sản phẩm từ collection `products`

**Query Parameters:**
- `page` (number, default: 1) - Số trang
- `limit` (number, default: 10) - Số lượng items mỗi trang
- `status` (string) - Filter theo status: `Publish`, `Inactive`, `Draft`
- `category` (string) - Filter theo category
- `stock` (boolean) - Filter theo stock: `true` hoặc `false`
- `search` (string) - Tìm kiếm theo name, description, hoặc sku

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 30,
    "totalPages": 3
  }
}
```

**MongoDB Query:**
- Collection: `products`
- Model: `Product`

---

### GET `/api/products/:id`
Lấy chi tiết một sản phẩm từ collection `products`

**Parameters:**
- `id` (number/string) - ID của product

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "...",
    "imageUrl": "...",
    "description": "...",
    "category": "...",
    "stock": true,
    "sku": "...",
    "price": 0,
    "quantity": 0,
    "status": "Publish"
  }
}
```

**MongoDB Query:**
- Collection: `products`
- Model: `Product`
- Query: `Product.findOne({ id: parseInt(id) })` hoặc `Product.findById(id)`

---

### PUT `/api/products/:id`
Cập nhật thông tin sản phẩm trong collection `products`

**Parameters:**
- `id` (number/string) - ID của product

**Body:**
```json
{
  "name": "...",
  "imageUrl": "...",
  "description": "...",
  "category": "...",
  "stock": true,
  "sku": "...",
  "price": 0,
  "quantity": 0,
  "status": "Publish"
}
```

**MongoDB Query:**
- Collection: `products`
- Model: `Product`
- Query: `Product.findOneAndUpdate({ id: nId }, { $set: data }, { new: true })`

---

## Customers API

**Base URL:** `/api/customers`

### GET `/api/customers`
Lấy danh sách tất cả khách hàng từ collection `customers`

**Query Parameters:**
- `q` (string) - Tìm kiếm theo fullName, firstName, lastName, email, phone
- `page` (number, default: 1) - Số trang
- `limit` (number, default: 20) - Số lượng items mỗi trang

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

**MongoDB Query:**
- Collection: `customers`
- Model: `Customer`

---

### GET `/api/customers/ping`
Health check endpoint

**Response:**
```json
{
  "ok": true,
  "total": 10,
  "sample": {...}
}
```

**MongoDB Query:**
- Collection: `customers`
- Model: `Customer`
- Query: `Customer.countDocuments({})` và `Customer.findOne({})`

---

### GET `/api/customers/:id`
Lấy chi tiết một khách hàng từ collection `customers`

**Parameters:**
- `id` (string) - ID của customer (ObjectId hoặc email)

**MongoDB Query:**
- Collection: `customers`
- Model: `Customer`
- Query: `Customer.findById(id)` hoặc `Customer.findOne({ email: id })`

---

### GET `/api/customers/:id/orders`
Lấy danh sách orders của một khách hàng

**Parameters:**
- `id` (string) - ID của customer

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**MongoDB Query:**
- Collection: `orders`
- Model: `Order`
- Query: `Order.find({ customerEmail: email })`

---

## Orders API

**Base URL:** `/api/orders`

### GET `/api/orders`
Lấy danh sách tất cả đơn hàng từ collection `orders`

**Query Parameters:**
- `q` (string) - Tìm kiếm theo id hoặc customerEmail
- `status` (string) - Filter theo status
- `email` (string) - Filter theo customerEmail
- `page` (number, default: 1) - Số trang
- `limit` (number, default: 20) - Số lượng items mỗi trang

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1
  }
}
```

**MongoDB Query:**
- Collection: `orders`
- Model: `Order`

---

### GET `/api/orders/:id`
Lấy chi tiết một đơn hàng từ collection `orders`

**Parameters:**
- `id` (string) - ID của order

**MongoDB Query:**
- Collection: `orders`
- Model: `Order`
- Query: `Order.findById(id)` hoặc `Order.findOne({ id })`

---

### PATCH `/api/orders/:id`
Cập nhật status của đơn hàng

**Parameters:**
- `id` (string) - ID của order

**Body:**
```json
{
  "status": "processing"
}
```

**MongoDB Query:**
- Collection: `orders`
- Model: `Order`

---

## Debug API

**Base URL:** `/api/debug`

### GET `/api/debug/collections`
Liệt kê tất cả collections trong database CoffeeDB

**Response:**
```json
{
  "ok": true,
  "dbName": "CoffeeDB",
  "collections": [
    { "name": "products", "count": 30 },
    { "name": "customers", "count": 10 },
    { "name": "orders", "count": 4 }
  ]
}
```

---

### GET `/api/debug/models`
Kiểm tra số lượng documents trong mỗi collection thông qua models

**Response:**
```json
{
  "ok": true,
  "modelCounts": {
    "customers": 10,
    "products": 30,
    "orders": 4
  }
}
```

---

### GET `/api/debug/db`
Thông tin chi tiết về database và collections

---

## API Info

### GET `/api/info`
Thông tin tổng quan về API

**Response:**
```json
{
  "success": true,
  "message": "CoffeeDB API",
  "database": "CoffeeDB",
  "collections": {
    "products": {
      "name": "products",
      "model": "Product",
      "endpoints": [...]
    },
    "customers": {
      "name": "customers",
      "model": "Customer",
      "endpoints": [...]
    },
    "orders": {
      "name": "orders",
      "model": "Order",
      "endpoints": [...]
    }
  },
  "version": "1.0.0"
}
```

---

## Notes

- Tất cả các endpoints đều query trực tiếp từ MongoDB collection trong database `CoffeeDB`
- Không có code nào đọc từ file JSON trong runtime
- Models tự động map với collection names:
  - `Product` model → `products` collection
  - `Customer` model → `customers` collection
  - `Order` model → `orders` collection

