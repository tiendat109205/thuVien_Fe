<template>
  <div class="container">
    <!-- danh sách khách hàng -->
    <div class="list" style="margin-top: 40px;">
      <h2>Danh sách khách hàng</h2>
      <button class="btn them-moi" @click="moModalThemMoiKh">+ Thêm khách hàng</button>
      <div class="row-kh header-kh">
        <div v-for="(title,i) in khachHangHeader" :key="i">{{ title }}</div>
      </div>
      <div class="row-kh" v-for="(kh, index) in khachHangs" :key="kh.id" @click="xemSachDaMuon(kh)">
        <div>{{ index + 1 }}</div>
        <div>{{ kh.maKhachHang }}</div>
        <div>{{ kh.tenKhachHang }}</div>
        <div>{{ kh.diaChi }}</div>
        <div>{{ kh.email }}</div>
        <div>{{ kh.sdt }}</div>
        <div class="hanh-dong">
          <button class="btn sua" @click.stop="suaKhachHang(kh)">Sửa</button>
          <button class="btn xoa" @click.stop="xoaKhachHang(kh)">Xóa</button>
        </div>
      </div>
    </div>

    <!-- update khách hàng -->
    <div v-if="hienModalSuaKh" class="modal-overlay" @click.self="hienModalSuaKh = false">
      <div class="modal-content">
        <h3>Sửa khách hàng</h3>
        <div class="form-group">
          <label>Mã KH:</label>
          <input v-model="khachHangSua.maKhachHang"/>
        </div>
        <div class="form-group">
          <label>Tên KH:</label>
          <input type="text" v-model="khachHangSua.tenKhachHang" />
        </div>
        <div class="form-group">
          <label>Địa chỉ:</label>
          <input type="text" v-model="khachHangSua.diaChi" />
        </div>
        <div class="form-group">
          <label>Email:</label>
          <input type="email" v-model="khachHangSua.email" />
        </div>
        <div class="form-group">
          <label>Sdt:</label>
          <input type="text" v-model="khachHangSua.sdt" />
        </div>
        <div style="text-align:right;">
          <button class="btn-luu" @click="capNhatKhachHang">Lưu</button>
          <button class="btn-huy" @click="hienModalSuaKh = false" style="margin-left:10px;">Hủy</button>
        </div>
      </div>
    </div>

    <!-- Modal thêm -->
    <div v-if="hienModalThemKh" class="modal-overlay" @click.self="hienModalThemKh = false">
      <div class="modal-content">
        <h3>Thêm khách hàng</h3>
        <div class="form-group">
          <label>Mã KH:</label>
          <input v-model="khachHangMoi.maKhachHang" />
        </div>
        <div class="form-group">
          <label>Tên KH:</label>
          <input type="text" v-model="khachHangMoi.tenKhachHang" />
        </div>
        <div class="form-group">
          <label>Địa chỉ:</label>
          <input type="text" v-model="khachHangMoi.diaChi" />
        </div>
        <div class="form-group">
          <label>Email:</label>
          <input type="email" v-model="khachHangMoi.email" />
        </div>
        <div class="form-group">
          <label>SDT:</label>
          <input type="text" v-model="khachHangMoi.sdt" />
        </div>
        <div style="text-align:right;">
          <button class="btn-luu" @click="themKhachHang">Lưu</button>
          <button class="btn-huy" @click="hienModalThemKh = false" style="margin-left:10px;">Hủy</button>
        </div>
      </div>
    </div>

    <!-- modal xem khách hàng mượn những sách nào -->
     <div v-if="hienModalSachDaMuon" class="modal-overlay" @click.self="hienModalSachDaMuon = false">
        <div class="modal-content sach-modal">
            <h3 style="margin-bottom: 16px;">Số sách {{ khachHangMuon.tenKhachHang }} mượn</h3>
            <div v-if="sachDaMuon.length>0">
                <table>
                    <thead>
                        <tr>
                            <th v-for="(title,i) in sachMuonHeader" :key="i">{{ title }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(s,index) in sachDaMuon":key="index">
                            <td>{{ index+1 }}</td>
                            <td>{{ s.maSach }}</td>
                            <td>{{ s.tenSach }}</td>
                            <td>{{ s.tacGia }}</td>
                            <td>{{ s.nhaXuatBan }}</td>
                            <td>{{ formatDate(s.ngayMuon) }}</td>
                            <td>{{ formatDate(s.ngayHetHan) }}</td>
                            <td>{{ s.soLuongSachMuon }}</td>
                            <td>
                            <button class="traSachBtn" @click="traSach(s)">Trả</button>
                          </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else>
                <p>{{ khachHangMuon.tenKhachHang }} không mượn sách</p>
            </div>
            <div class="modal-actions">
                <button @click="hienModalSachDaMuon = false" class="btn dong">Đóng</button>
            </div>
        </div>
     </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

const emit = defineEmits(['sauKhiTraSach'])

const phieuMuons = ref([])
const khachHangs = ref([])
const idsDaChon = ref([])
const sachDaMuon = ref([])

const soLuongTheoSach = reactive({})

const hienModalThemKh = ref(false)
const hienModalSuaKh = ref(false)
const hienModalSachDaMuon = ref(false)

const khachHangMoi = ref({})
const khachHangSua = ref({})
const khachHangMuon = ref({})

watch(idsDaChon, (newIds) => {
  newIds.forEach(id => {
    if (!soLuongTheoSach[id]) {
      soLuongTheoSach[id] = 1
    }
  })
})

onMounted(async () => {
  await loadPhieuMuon()
  await loadKhachHang()
})

const khachHangHeader = ['STT','Mã KH','Tên KH','Địa chỉ','Email','SĐT','Hành động']
const sachMuonHeader = ['STT','Mã sách','Tên sách','Tác giả','Nhà xuất bản','Ngày mượn','Ngày hết hạn','Số lượng mượn','Hành động']

async function loadPhieuMuon() {
  const res = await axios.get('http://localhost:8080/api/phieu-muon/getAll')
  phieuMuons.value = res.data
  console.log(res.data)
}

async function loadKhachHang() {
  const res = await axios.get('http://localhost:8080/api/khach-hang/getAll')
  khachHangs.value = res.data
}

function formatDate(dateStr) {
  if (!dateStr) return '---'
  const date = new Date(dateStr)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function moModalThemMoiKh() {
  hienModalThemKh.value = true
  khachHangMoi.value = {
    maKhachHang: '',
    tenKhachHang: '',
    diaChi: '',
    email: '',
    sdt: ''
  }
}

async function themKhachHang() {
  await axios.post(`http://localhost:8080/api/khach-hang/add`, khachHangMoi.value)
  toast.success('Thêm thành công')
  hienModalThemKh.value = false
  await loadKhachHang()
}

function suaKhachHang(kh) {
  khachHangSua.value = {...kh}
  hienModalSuaKh.value = true
}

async function capNhatKhachHang() {
  await axios.put(`http://localhost:8080/api/khach-hang/update/${khachHangSua.value.id}`, khachHangSua.value)
  toast.success('Cập nhật thành công')
  hienModalSuaKh.value = false
  await loadKhachHang()
}

async function xoaKhachHang(kh) {
  if (confirm(`Bạn có muốn xóa khách: ${kh.maKhachHang}?`)) {
    await axios.delete(`http://localhost:8080/api/khach-hang/delete/${kh.id}`)
    toast.success('Xóa thành công')
    await loadKhachHang()
  }
}

async function xemSachDaMuon(kh) {
    khachHangMuon.value = kh
    try{
        const res = await axios.get(`http://localhost:8080/api/phieu-muon-chi-tiet/sach-da-muon/${kh.id}`)
        sachDaMuon.value=res.data
        hienModalSachDaMuon.value=true
    }catch(err){
        toast.error('Lỗi khi tải danh sách')
        console.log(err)
    }
}

async function traSach(s) {
  const soLuongDangMuon = s.soLuongSachMuon || 0
  const input = prompt(`Nhập số lượng muốn trả:`)

  if (!input) return

  const soLuongTra = parseInt(input)

  if (isNaN(soLuongTra) || soLuongTra <= 0) {
    toast.error('Số lượng trả không hợp lệ')
    return
  }

  if (soLuongTra > soLuongDangMuon) {
    toast.error(`Bạn chỉ có ${soLuongDangMuon} cuốn`)
    return
  }

  if (confirm(`Bạn có chắc chắn muốn trả ${soLuongTra} cuốn sách "${s.tenSach}"?`)) {
    try {
      await axios.put(`http://localhost:8080/api/phieu-muon-chi-tiet/tra-sach/${s.id}?soLuongTra=${soLuongTra}`)
      toast.success('Trả sách thành công')
      await xemSachDaMuon(khachHangMuon.value)
      await loadPhieuMuon()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi trả sách')
      console.error(error)
    }
  }
  // Cuối hàm traSach()
  await xemSachDaMuon(khachHangMuon.value)
  // Phát sự kiện báo cho cha biết
  emit('sauKhiTraSach')

}
</script>
<style scoped>
.container {
  gap: 20px;
  padding: 30px;
  justify-content: center;
  align-items: flex-start;
  font-family: Arial, sans-serif;
}
.list {
  width: 80%;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.list h2 {
  font-size: 20px;
  margin-bottom: 12px;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}
.hanh-dong {
  display: flex;
  gap: 6px;
}
.btn {
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 12px;
}
.btn.sua {
  background: #ffc107;
}
.btn.xoa {
  background: #dc3545;
  color: white;
}
.btn.them-moi {
  background: #28a745;
  color: white;
  margin-bottom: 12px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 800px;
  max-width: 90vw;
  z-index: 2000;
  animation: fadeIn 0.2s ease-in-out;
}

.form-group {
  margin-bottom: 10px;
}
.form-group label {
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
}

.row-kh {
  display: grid;
  grid-template-columns: 1fr 2fr 2fr 2fr 2fr 2fr 1.5fr;
  padding: 8px 0;
  border: 1px solid #eee;
  align-items: center;
}
.row-kh.header-kh {
  font-weight: bold;
  background-color: #f9f9f9;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content.sach-modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  overflow-x: auto;
}

.sach-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.sach-table th,
.sach-table td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: center;
  font-size: 14px;
}

.sach-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.modal-actions {
  text-align: right;
  margin-top: 16px;
}

.btn.dong {
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn.dong:hover {
  background-color: #555;
}
.row-kh:hover {
  background-color: #c7e9d3;
  cursor: pointer;
  transition: background-color 0.2s;
}
.row-sach:hover {
  background-color: #c7e9d3;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-luu{
  padding: 3px 16px;
  background-color: green;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-huy{
  padding: 3px 16px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.traSachBtn {
  padding: 5px 25px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.traSachBtn:hover {
  background-color: #218838;
}
</style>