<template>
  <div class="container">
    <div class="list">
      <h2>Danh sách phiếu mượn</h2>
      <button class="btn them-moi" @click="taoPhieuMuonNhanh">+ Tạo phiếu mượn</button>
      <div class="row header">
        <div v-for="(title,i) in phieuMuonHeader" :key="i">{{ title }}</div>
      </div>
      <div class="row" v-for="(pm, index) in phieuMuons" :key="pm.id">
        <div>{{ index + 1 }}</div>
        <div>{{ pm.maPhieuMuon }}</div>
        <div>{{ pm.khachHang }}</div>
        <div>{{ formatDate(pm.ngayMuon) }}</div>
        <div>{{ formatDate(pm.ngayHetHan) }}</div>
        <div :class="getTrangThaiClass(pm.trangThai)">
          {{ pm.trangThai === true || pm.trangThai === 'true' ? 'Đã trả' : 'Chưa trả' }}
        </div>
        <div class="hanh-dong">
          <button v-if="isAdmin" class="btn xoa" @click="xoaPhieu(pm)">Xóa</button>
          <button class="btn them-sach" @click="moModalChonSach(pm.id)">+ Thêm sách</button>
        </div>
      </div>
    </div>

    <!-- Modal chọn sách -->
    <div v-if="hienModalChonSach" class="modal-overlay" @click.self="resetModalChonSach">
      <div class="modal-content">
        <h3>Chọn sách để thêm vào phiếu (ID: {{ phieuMuonIdChonSach }})</h3>
        <!-- Header -->
        <div class="row-sach header-sach">
          <div><input type="checkbox" @change="chonTatCa($event)" /></div>
          <div v-for="(title,i) in chonSachHeader" :key="i">{{ title }}</div>
        </div>

        <div class="row-sach" v-for="(sach, index) in danhSachSach" :key="sach.id" @click="xemKhachMuon(sach)">
          <div><input type="checkbox" :value="sach.id" v-model="idsDaChon" @click.stop/></div>
          <div>{{ index + 1 }}</div>
          <div>{{ sach.maSach }}</div>
          <div>{{ sach.tenSach }}</div>
          <div>{{ sach.tacGia }}</div>
          <div>{{ sach.nhaXuatBan }}</div>
          <div>{{ sach.namPhatHanh }}</div>
          <div>{{ sach.theLoai }}</div>
          <div>{{ sach.soLuong }}</div>
          <div v-if="idsDaChon.includes(sach.id)" class="box">
            <button @click.stop="giam(sach.id)">-</button>
            <input type="number" min="1" :max="sach.soLuong" v-model.number="soLuongTheoSach[sach.id]" @click.stop style="width: 60px; text-align: center"/>
            <button @click.stop="tang(sach.id)">+</button>
          </div>
        </div>

        <div class="form-group">
          <label>Ngày hết hạn:</label>
          <input type="date" v-model="ngayHetHan" />
        </div>
        <div style="text-align:right; margin-top:12px">
          <button class="btn-luu" @click="luuChiTietPhieuMuon">Lưu</button>
          <button class="btn-huy" @click="resetModalChonSach" style="margin-left: 10px">Hủy</button>
        </div>
      </div>
    </div>
     <div v-if="hienModalKhachMuon" class="modal-overlay" @click.self="hienModalKhachMuon = false">
      <div class="modal-content sach-modal">
        <h3>Danh sách khách mượn sách</h3>
        <table v-if="danhSachKhachMuon.length > 0">
          <thead>
            <tr>
              <th v-for="(title,i) in khachMuonHeader" :key="i">{{ title }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(kh, i) in danhSachKhachMuon" :key="i">
              <td>{{ i + 1 }}</td>
              <td>{{ kh.maKhachHang }}</td>
              <td>{{ kh.tenKhachHang }}</td>
              <td>{{ kh.email }}</td>
              <td>{{ kh.sdt }}</td>
              <td>{{ formatDate(kh.ngayMuon) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>Chưa có khách nào mượn sách này.</p>
        <div class="modal-actions">
          <button @click="hienModalKhachMuon = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Modal bắt buộc nhập thông tin KH khi chưa có -->
      <div v-if="hienModalNhapThongTinKh" class="modal-overlay" @click.self="hienModalNhapThongTinKh = false">
        <div class="modal-content">
          <h3>Vui lòng nhập thông tin khách hàng để tiếp tục mượn sách</h3>
          <div class="form-group">
            <label>Mã KH:</label>
            <input v-model="khachHangMoi.maKhachHang" />
          </div>
          <div class="form-group">
            <label>Tên KH:</label>
            <input v-model="khachHangMoi.tenKhachHang" />
          </div>
          <div class="form-group">
            <label>Địa chỉ:</label>
            <input v-model="khachHangMoi.diaChi" />
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input v-model="khachHangMoi.email" />
          </div>
          <div class="form-group">
            <label>SDT:</label>
            <input v-model="khachHangMoi.sdt" />
          </div>
          <div style="text-align:right;">
            <button class="btn-luu" @click="themKhachHang">Lưu</button>
            <button class="btn-huy" @click="hienModalNhapThongTinKh = false" style="margin-left:10px;">Hủy</button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import {
  addChiTietPhieuMuon,
  addPhieuMuon,
  deletePhieuMuon,
  getAllKhachHang,
  getAllPhieuMuon,
  getAllSach,
  xemKhachMuonn,
  checkThongTinKhachHang,
  addKhachHang
} from '../api/api'
import { hasRole } from '../api/axiosInstance'

const isAdmin = hasRole("ROLE_ADMIN")
const toast = useToast()

const phieuMuons = ref([])
const danhSachSach = ref([])
const khachHangs = ref([])
const idsDaChon = ref([])
const danhSachKhachMuon = ref([])
const soLuongTheoSach = reactive({})

const hienModalNhapThongTinKh = ref(false)
const hienModalChonSach = ref(false)
const hienModalKhachMuon = ref(false)

const phieuMuonIdChonSach = ref(null)
const ngayHetHan = ref(null)

const khachHangMoi = ref({})
const phieuMoi = ref({})
const sachMuon = ref({})

const props = defineProps(['reloadKey'])

watch(() => props.reloadKey, async () => {
  await loadPhieuMuon()
})

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

const phieuMuonHeader = ['STT','Mã PM','Tên KH','Ngày mượn','Ngày trả','Trạng thái','Hành động']
const chonSachHeader = ['STT','Mã sách','Tên sách','Tác giả','NXB','Năm','Thể loại','Số lượng', 'Số lượng mượn']
const khachMuonHeader = ['STT','Mã KH','Tên KH','Email','SDT','Ngày Mượn']

function giam(id) {
  if (soLuongTheoSach[id] > 1) {
    soLuongTheoSach[id]--
  }
}

function tang(id) {
  soLuongTheoSach[id]++
} 

async function loadPhieuMuon() {
  try {
    const res = await getAllPhieuMuon()
    phieuMuons.value = res.data
  } catch (err) {
    toast.error("Lỗi khi load phiếu mượn")
    console.log(err)
  }
}

async function loadKhachHang() {
  try {
    const res = await getAllKhachHang()
    khachHangs.value = res.data
  } catch (err) {
    toast.error("Lỗi khi load khách hàng")
    console.log(err)
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '---'
  const date = new Date(dateStr)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

async function xemKhachMuon(sach) {
  try {
    sachMuon.value = sach
    const res = await xemKhachMuonn(sach.id)
    danhSachKhachMuon.value = res.data
    hienModalKhachMuon.value = true
  } catch (err) {
    toast.error("Lỗi xem khách mượn")
    console.log(err)
  }
}

async function taoPhieuMuonNhanh() {
  try {
    const res = await checkThongTinKhachHang()
    const thongTin = res.data
    console.log("Kết quả check thông tin KH:", thongTin)

    if (thongTin === false) {
      hienModalNhapThongTinKh.value = true
      return
    }

    const phieu = {
      maPhieuMuon: '',
      ngayMuon: '',
      ngayTra: '',
      khachHang: thongTin.idKhachHang,
      trangThai: true
    }

    await addPhieuMuon(phieu)
    toast.success("Tạo phiếu mượn thành công")
    await loadPhieuMuon()
  } catch (err) {
    const msg = err?.response?.data?.message || "Tạo phiếu thất bại"
    toast.error(msg)
    console.error("Chi tiết lỗi:", err)
  }
}

async function themKhachHang() {
  try {
    const isUser = hasRole("ROLE_USER")
    const userId = localStorage.getItem("userId")
    if (isUser && userId) {
      khachHangMoi.value.idTaiKhoan = userId
    }
    await addKhachHang(khachHangMoi.value)
    toast.success("Thêm khách hàng thành công")
    hienModalNhapThongTinKh.value = false
    await loadKhachHang()
    await loadPhieuMuon()

  } catch (err) {
    toast.error("Thêm KH thất bại")
    console.log(err)
  }
}


async function xoaPhieu(pm) {
  if (confirm(`Xóa phiếu ${pm.maPhieuMuon}?`)) {
    try {
      await deletePhieuMuon(pm.id)
      toast.success("Xóa thành công")
      await loadPhieuMuon()
    } catch (err) {
      toast.error("Xóa thất bại")
      console.log(err)
    }
  }
}

function getTrangThaiClass(trangThai) {
  return trangThai === true || trangThai === 'true' ? 'da-tra' : 'chua-tra'
}

function moModalChonSach(idPhieu) {
  phieuMuonIdChonSach.value = idPhieu
  hienModalChonSach.value = true
  idsDaChon.value = []
  ngayHetHan.value = null
  getAllSach().then(res => {
    danhSachSach.value = res.data
  }).catch(err => {
    toast.error("Lỗi khi load sách")
    console.log(err)
  })
}

function chonTatCa(event) {
  if (event.target.checked) {
    idsDaChon.value = danhSachSach.value.map(s => s.id)
  } else {
    idsDaChon.value = []
  }
}

async function luuChiTietPhieuMuon() {
  if (!ngayHetHan.value || idsDaChon.value.length === 0) {
    toast.error('Chọn sách & ngày hết hạn')
    return
  }
  try {
    const body = {
      phieuMuonId: phieuMuonIdChonSach.value,
      sachChiTiet: idsDaChon.value.map(id => ({
        sachId: id,
        soLuong: soLuongTheoSach[id] || 1
      })),
      ngayHetHan: ngayHetHan.value
    }
    await addChiTietPhieuMuon(body)
    toast.success('Mượn sách thành công')
    hienModalChonSach.value = false
    await loadPhieuMuon()
  } catch (err) {
    const errorMsg = err?.response?.data?.message || "Thêm chi tiết phiếu thất bại"
    toast.error(errorMsg)
    console.error("Chi tiết lỗi thêm chi tiết phiếu:", err)
  }
}

function resetModalChonSach() {
  hienModalChonSach.value = false
  idsDaChon.value = []
  ngayHetHan.value = null
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
.row {
  display: grid;
  grid-template-columns: 1fr 2fr 3fr 3fr 3fr 3fr 4fr;
  padding: 8px 0;
  border: 1px solid #eee;
  align-items: center;
}
.row.header {
  font-weight: bold;
  background-color: #f9f9f9;
}
.da-tra {
  background-color: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
}
.chua-tra {
  background-color: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
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

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
}
.row-sach {
  display: grid;
  grid-template-columns: 1fr 1.5fr 3fr 5fr 4fr 4fr 2fr 3fr 3fr 5fr;
  padding: 8px 0;
  border: 1px solid #eee;
  align-items: center;
}
.header-sach {
  font-weight: bold;
  background-color: #f9f9f9;
  border-bottom: 2px solid #ccc;
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
</style>