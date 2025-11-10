import axios from "axios";

// Đổi 8000 thành PORT backend bạn đang chạy
export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, // nhận cookie httpOnly từ backend
});
