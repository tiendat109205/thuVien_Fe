import axiosInstance from "./axiosInstance";

// Dùng biến môi trường
const API_URL = import.meta.env.VITE_API_BASE_URL;

// ---------------- Khách hàng ----------------
export const getAllLoanVoucher = () => {
  return axiosInstance.get(`${API_URL}/phieu-muon/getAll`);
};

export const getAllCustomer = () => {
  return axiosInstance.get(`${API_URL}/khach-hang/getAll`);
};

export const addCustomer = (listData) => {
  return axiosInstance.post(`${API_URL}/khach-hang/add`, listData);
};

export const updateCustomer = (id, listData) => {
  return axiosInstance.put(`${API_URL}/khach-hang/update/${id}`, listData);
};

export const deleteCustomer = (id) => {
  return axiosInstance.delete(`${API_URL}/khach-hang/delete/${id}`);
};

export const getBookBorrow = (id) => {
  return axiosInstance.get(`${API_URL}/phieu-muon-chi-tiet/sach-da-muon/${id}`);
};

export const returnBook = (id, quantityReturn) => {
  return axiosInstance.put(`${API_URL}/phieu-muon-chi-tiet/tra-sach/${id}?quantity=${quantityReturn}`);
};

export const checkInfomation = () => {
  return axiosInstance.get(`${API_URL}/khach-hang/check-thong-tin`);
};


// ---------------- Phiếu mượn ----------------
export const getCustomerBorrow = (id) => {
  return axiosInstance.get(`${API_URL}/phieu-muon-chi-tiet/khach-muon-sach/${id}`);
};

export const addLoanVoucher = (listData) => {
  return axiosInstance.post(`${API_URL}/phieu-muon/add`, listData);
};

export const deleteLoanVoucher = (id) => {
  return axiosInstance.delete(`${API_URL}/phieu-muon/delete/${id}`);
};

// ---------------- Sách ----------------
export const getAllBook = () => {
  return axiosInstance.get(`${API_URL}/sach/getAll`);
};

export const addLoanVoucherDetail = (listData) => {
  return axiosInstance.post(`${API_URL}/phieu-muon-chi-tiet/add`, listData);
};
