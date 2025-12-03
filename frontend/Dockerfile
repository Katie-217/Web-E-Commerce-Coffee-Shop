# frontend/Dockerfile

# ----- STAGE 1: build React app -----
FROM node:20-alpine AS build

WORKDIR /app

# Copy file package để cache npm ci
COPY package*.json ./

# Cài dependency
RUN npm ci

# Copy toàn bộ source
COPY . .

# Build production
RUN npm run build

# ----- STAGE 2: serve bằng nginx -----
FROM nginx:1.27-alpine

# Copy build output sang nginx html
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 trong container
EXPOSE 80

# Chạy nginx
CMD ["nginx", "-g", "daemon off;"]
