# backend/Dockerfile
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json + lock vào trước để cache layer npm install
COPY package*.json ./

# Cài dependency (chỉ prod, nếu cần dev thì bỏ --omit=dev)
RUN npm ci --omit=dev

# Copy toàn bộ source code backend vào image
COPY . .

# Biến môi trường cơ bản
ENV NODE_ENV=production
ENV PORT=3001

# Expose port backend
EXPOSE 3001

# Chạy backend (giả sử trong package.json có "start": "node index.js")
CMD ["npm", "run", "start"]
