# Hướng Dẫn Kết Nối MongoDB Compass

## Bước 1: Cài Đặt MongoDB

Nếu chưa cài đặt MongoDB, bạn có thể:
- Tải MongoDB Community Server từ: https://www.mongodb.com/try/download/community
- Hoặc sử dụng MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

## Bước 2: Khởi Động MongoDB Service

### Windows:
1. Mở **Services** (Windows + R → services.msc)
2. Tìm **MongoDB** service
3. Đảm bảo service đang **Running**
4. Nếu chưa chạy, click chuột phải → **Start**

### Hoặc dùng Command Prompt (Admin):
```bash
net start MongoDB
```

## Bước 3: Kết Nối với MongoDB Compass

### Connection String Mặc Định:
```
mongodb://localhost:27017
```

### Các Trường Hợp Kết Nối:

#### 1. Kết nối Local (Không có authentication):
```
mongodb://localhost:27017
```

#### 2. Kết nối với Database Name:
```
mongodb://localhost:27017/coffeeshop
```

#### 3. Kết nối với Username/Password:
```
mongodb://username:password@localhost:27017
```

#### 4. Kết nối với Authentication Database:
```
mongodb://username:password@localhost:27017/coffeeshop?authSource=admin
```

#### 5. Kết nối với MongoDB Atlas (Cloud):
```
mongodb+srv://username:password@cluster.mongodb.net/coffeeshop?retryWrites=true&w=majority
```

## Bước 4: Cấu Hình Backend

### 1. Tạo file `.env` trong thư mục `backend/`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=coffeeshop

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. Connection String trong MongoDB Compass:

Khi mở MongoDB Compass, bạn sẽ thấy màn hình "New Connection":
- Nhập connection string: `mongodb://localhost:27017`
- Hoặc click "Fill in connection fields individually" và điền:
  - **Hostname**: `localhost`
  - **Port**: `27017`
  - **Authentication**: None (nếu không có username/password)

### 3. Click "Connect"

## Bước 5: Khởi Động Backend Server

```bash
cd backend
node index.js
```

Hoặc nếu có script trong package.json:
```bash
npm start
```

Bạn sẽ thấy log:
```
✅ MongoDB Connected Successfully!
📊 Database: coffeeshop
🔗 Connection String: mongodb://localhost:27017/coffeeshop
🚀 Server is running at http://localhost:3000
📊 Environment: development
```

## Bước 6: Kiểm Tra Kết Nối

### 1. Kiểm tra trong MongoDB Compass:
- Mở MongoDB Compass
- Kết nối với `mongodb://localhost:27017`
- Bạn sẽ thấy database `coffeeshop` (nếu đã tạo)
- Nếu chưa có, database sẽ được tạo tự động khi có dữ liệu đầu tiên

### 2. Kiểm tra qua API:
```bash
# Health check endpoint
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "mongodb": "Connected"
}
```

## Troubleshooting

### Lỗi: "MongoServerError: connect ECONNREFUSED"

**Nguyên nhân**: MongoDB service chưa chạy

**Giải pháp**:
1. Kiểm tra MongoDB service đang chạy:
   ```bash
   # Windows
   net start MongoDB
   
   # Hoặc kiểm tra trong Services
   services.msc
   ```

2. Kiểm tra MongoDB đang listen trên port 27017:
   ```bash
   netstat -an | findstr 27017
   ```

### Lỗi: "MongooseServerSelectionError: connect ECONNREFUSED"

**Nguyên nhân**: Connection string không đúng hoặc MongoDB chưa khởi động

**Giải pháp**:
1. Kiểm tra connection string trong file `.env`
2. Đảm bảo MongoDB đang chạy
3. Thử kết nối trực tiếp trong MongoDB Compass trước

### Lỗi: "Authentication failed"

**Nguyên nhân**: Username/password không đúng

**Giải pháp**:
1. Kiểm tra lại username/password trong connection string
2. Đảm bảo `authSource` đúng (thường là `admin`)
3. Kiểm tra user có quyền truy cập database

### Port 27017 đã được sử dụng:

**Giải pháp**:
1. Tìm process đang sử dụng port:
   ```bash
   netstat -ano | findstr :27017
   ```
2. Kill process nếu cần:
   ```bash
   taskkill /PID <PID> /F
   ```
3. Hoặc thay đổi port MongoDB trong config (không khuyến nghị)

## Cấu Trúc Thư Mục

```
backend/
├── config/
│   └── database.js          # File kết nối MongoDB
├── .env                      # File cấu hình (không commit lên git)
├── .env.example              # File mẫu cấu hình
├── index.js                  # Entry point
└── package.json
```

## Tạo Collection và Dữ Liệu

Sau khi kết nối thành công, bạn có thể:

1. **Tạo collection trong MongoDB Compass**:
   - Click vào database `coffeeshop`
   - Click "Create Collection"
   - Nhập tên collection: `products`
   - Click "Create"

2. **Import dữ liệu mẫu**:
   - Xem file `docs/product-list-sample-data.json`
   - Copy từng document vào collection `products`
   - Hoặc import từ file JSON

## Lưu Ý

1. **File `.env` không nên commit lên git**:
   - Đảm bảo có trong `.gitignore`
   - Chỉ commit `.env.example`

2. **MongoDB Connection String**:
   - Local: `mongodb://localhost:27017`
   - Với database: `mongodb://localhost:27017/coffeeshop`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database`

3. **Security**:
   - Không commit connection string có password lên git
   - Sử dụng environment variables
   - Sử dụng MongoDB Atlas cho production

4. **Port mặc định**:
   - MongoDB: `27017`
   - Backend API: `3000`

## Kiểm Tra Kết Nối Nhanh

```bash
# 1. Kiểm tra MongoDB đang chạy
net start MongoDB

# 2. Khởi động backend
cd backend
node index.js

# 3. Test API
curl http://localhost:3000/health
```

## Kết Nối Thành Công!

Khi thấy log này, bạn đã kết nối thành công:
```
✅ MongoDB Connected Successfully!
📊 Database: coffeeshop
🔗 Connection String: mongodb://localhost:27017/coffeeshop
🚀 Server is running at http://localhost:3000
```

Bây giờ bạn có thể:
- Tạo collections trong MongoDB Compass
- Import dữ liệu mẫu từ `docs/product-list-sample-data.json`
- Xây dựng API endpoints cho products








