# Backend API

## Cài Đặt

```bash
npm install
```

## Cấu Hình

Tạo file `.env` trong thư mục `backend/`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=coffeeshop

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Khởi Động Server

```bash
npm start
```

Hoặc:

```bash
node index.js
```

## Kết Nối MongoDB Compass

1. Đảm bảo MongoDB service đang chạy:
   - Windows: `net start MongoDB`
   - Hoặc kiểm tra trong Services (services.msc)

2. Mở MongoDB Compass và kết nối với:
   ```
   mongodb://localhost:27017
   ```

3. Database sẽ được tạo tự động khi có dữ liệu đầu tiên.

## API Endpoints

- `GET /` - Home endpoint
- `GET /health` - Health check (kiểm tra kết nối MongoDB)

## Xem Thêm

- [Hướng dẫn kết nối MongoDB Compass](./docs/mongodb-connection-guide.md)
- [Cấu trúc dữ liệu Product List](./docs/product-list-data-structure.md)











