import axios from "axios";

// Dùng biến môi trường để thay cho URL cứng
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

// Hàm login
export const login = (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};

// Hàm register
export const register = (data) => {
  return axios.post(`${API_URL}/register`, data);
};
