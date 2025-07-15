import axiosInstance from "./axiosInstance";

const API_URL = 'http://localhost:8080/api';

// khách hàng
export const getAllPhieuMuon = () => {
    return axiosInstance.get(`${API_URL}/phieu-muon/getAll`)
}

export const getAllKhachHang = () => {
    return axiosInstance.get(`${API_URL}/khach-hang/getAll`)
}

export const addKhachHang = (listData) => {
    return axiosInstance.post(`${API_URL}/khach-hang/add`,listData)
}

export const updateKhachHang = (id,listData) => {
    return axiosInstance.put(`${API_URL}/khach-hang/update/${id}`,listData)
}

export const deleteKhachHang = (id) => {
    return axiosInstance.delete(`${API_URL}/khach-hang/delete/${id}`)
}

export const xemSachMuon = (id) => {
    return axiosInstance.get(`${API_URL}/phieu-muon-chi-tiet/sach-da-muon/${id}`)
}

export const traSachh = (id, soLuongTra) => {
  return axiosInstance.put(`${API_URL}/phieu-muon-chi-tiet/tra-sach/${id}?soLuongTra=${soLuongTra}`);
};

export const checkThongTinKhachHang = () => {
  const taiKhoanId = localStorage.getItem("userId");
  if (!taiKhoanId) {
    return Promise.reject(new Error("Không tìm thấy userId trong localStorage"));
  }
  return axiosInstance.get(`${API_URL}/khach-hang/check-thong-tin?taiKhoanId=${taiKhoanId}`);
};


// phiếu mượn
export const xemKhachMuonn = (id) => {
    return axiosInstance.get(`${API_URL}/phieu-muon-chi-tiet/khach-muon-sach/${id}`)
}

export const addPhieuMuon = (listData) => {
    return axiosInstance.post(`${API_URL}/phieu-muon/add`,listData)
}

export const updatePhieuMuon = (id,listData) => {
    return axiosInstance.put(`${API_URL}/phieu-muon/update/${id}`,listData)
}

export const deletePhieuMuon = (id) => {
    return axiosInstance.delete(`${API_URL}/phieu-muon/delete/${id}`)
}
// sách
export const getAllSach = (id) => {
    return axiosInstance.get(`${API_URL}/sach/getAll`)
}

export const addChiTietPhieuMuon = (listData) => {
    return axiosInstance.post(`${API_URL}/phieu-muon-chi-tiet/add`,listData)
}
