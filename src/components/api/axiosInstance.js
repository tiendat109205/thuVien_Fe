import axios from "axios";

// Sử dụng biến môi trường thay vì hard-code
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Gắn token tự động nếu có
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hàm kiểm tra quyền
export const hasRole = (expectedRole) => {
  return localStorage.getItem("role") === expectedRole;
};

export const hasAnyRole = (...roles) => {
  return roles.includes(localStorage.getItem("role"));
};

export default axiosInstance;
