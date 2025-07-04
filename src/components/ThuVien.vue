<template>
  <div class="container">
    <div class="list">
      <h2>Danh sách phiếu mượn</h2>
      <button class="btn them-moi" @click="moModalThemMoi">+ Thêm phiếu mượn</button>
      <div class="row header">
        <div>STT</div>
        <div>Mã PM</div>
        <div>Tên KH</div>
        <div>Ngày mượn</div>
        <div>Ngày trả</div>
        <div>Trạng thái</div>
        <div>Hành động</div>
      </div>

      <!-- Dòng dữ liệu -->
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
          <button class="btn sua" @click="suaPhieu(pm)">Sửa</button>
          <button class="btn xoa" @click="xoaPhieu(pm)">Xóa</button>
          <button class="btn them-sach" @click="moModalChonSach(pm.id)">+ Thêm sách</button>
        </div>
      </div>
    </div>

    <!-- Modal Sửa -->
    <div v-if="hienModalSua" class="modal-overlay" @click.self="hienModalSua = false">
      <div class="modal-content">
        <h3>Sửa phiếu mượn</h3>
        <div class="form-group">
          <label>Mã phiếu:</label>
          <input v-model="phieuDangSua.maPhieuMuon" />
        </div>
        <div class="form-group">
          <label>Ngày mượn:</label>
          <input type="date" v-model="phieuDangSua.ngayMuon" />
        </div>
        <div class="form-group">
          <label>Khách hàng:</label>
          <input type="text" :value="layTenKhachHang(phieuDangSua.khachHang)" disabled />
        </div>
        <div class="form-group">
          <label>Trạng thái:</label>
          <select v-model="phieuDangSua.trangThai">
            <option :value="true">Đã trả</option>
            <option :value="false">Chưa trả</option>
          </select>
        </div>
        <div style="text-align:right;">
          <button class="btn-luu" @click="capNhatPhieu">Lưu</button>
          <button class="btn-huy" @click="hienModalSua = false" style="margin-left:10px;">Hủy</button>
        </div>
      </div>
    </div>

    <!-- Modal thêm -->
    <div v-if="hienModalThem" class="modal-overlay" @click.self="hienModalThem = false">
      <div class="modal-content">
        <h3>Thêm phiếu mượn</h3>
        <div class="form-group">
          <label>Mã phiếu:</label>
          <input v-model="phieuMoi.maPhieuMuon" />
        </div>
        <div class="form-group">
          <label>Ngày mượn:</label>
          <input type="date" v-model="phieuMoi.ngayMuon" />
        </div>
          <div class="form-group">
          <label>Khách hàng:</label>
          <select v-model="phieuMoi.khachHang">
            <option v-for="kh in khachHangs" :key="kh.id" :value="kh.id">
              {{ kh.tenKhachHang }}
            </option>
          </select>
        </div>
        <div style="text-align:right;">
          <button class="btn-luu" @click="themPhieuMoi">Lưu</button>
          <button class="btn-huy" @click="hienModalThem = false" style="margin-left:10px;">Hủy</button>
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
          <div>STT</div>
          <div>Mã sách</div>
          <div>Tên sách</div>
          <div>Tác giả</div>
          <div>NXB</div>
          <div>Năm</div>
          <div>Thể loại</div>
          <div>Số lượng</div>
          <div>Số lượng mượn</div>
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
    <!-- danh sách khách hàng -->
    <div class="list" style="margin-top: 40px;">
      <h2>Danh sách khách hàng</h2>
      <button class="btn them-moi" @click="moModalThemMoiKh">+ Thêm khách hàng</button>
      <div class="row-kh header-kh">
        <div>STT</div>
        <div>Mã KH</div>
        <div>Tên KH</div>
        <div>Địa chỉ</div>
        <div>Email</div>
        <div>SĐT</div>
        <div>Hoạt động</div>
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
                            <th>STT</th>
                            <th>Mã sách</th>
                            <th>Tên sách</th>
                            <th>Tác giả</th>
                            <th>Nhà xuất bản</th>
                            <th>Ngày mượn</th>
                            <th>Ngày hết hạn</th>
                            <th>Số lượng mượn</th>
                            <th>Hành động</th>
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


     <div v-if="hienModalKhachMuon" class="modal-overlay" @click.self="hienModalKhachMuon = false">
      <div class="modal-content sach-modal">
        <h3>Danh sách khách mượn sách</h3>
        <table v-if="danhSachKhachMuon.length > 0">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã KH</th>
              <th>Tên KH</th>
              <th>Email</th>
              <th>SDT</th>
              <th>Ngày mượn</th>
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

const phieuMuons = ref([])
const danhSachSach = ref([])
const khachHangs = ref([])
const idsDaChon = ref([])
const sachDaMuon = ref([])
const danhSachKhachMuon = ref([])

const soLuongTheoSach = reactive({})

const hienModalChonSach = ref(false)
const hienModalThem = ref(false)
const hienModalSua = ref(false)
const hienModalThemKh = ref(false)
const hienModalSuaKh = ref(false)
const hienModalSachDaMuon = ref(false)
const hienModalKhachMuon = ref(false)

const phieuMuonIdChonSach = ref(null)
const ngayHetHan = ref(null)
const soLuongSachMuon = ref(null)

const khachHangMoi = ref({})
const khachHangSua = ref({})
const phieuMoi = ref({})
const phieuDangSua = ref({})
const khachHangMuon = ref({})
const sachMuon = ref({})

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

function giam(id) {
  if (soLuongTheoSach[id] > 1) {
    soLuongTheoSach[id]--
  }
}

function tang(id) {
  soLuongTheoSach[id]++
} 

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

async function xemKhachMuon(sach) {
  try{
    sachMuon.value=sach
    const res = await axios.get(`http://localhost:8080/api/phieu-muon-chi-tiet/khach-muon-sach/${sach.id}`)
    danhSachKhachMuon.value=res.data
    hienModalKhachMuon.value=true
  }catch(err){
    console.log(err)
    toast.error('Lỗi khi tải danh sách')
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

function moModalThemMoi() {
  hienModalThem.value = true
  phieuMoi.value = {
    maPhieuMuon: '',
    ngayMuon: '',
    ngayTra: '',
    khachHang: '',
    trangThai: true
  }
}
async function themPhieuMoi() {
  await axios.post(`http://localhost:8080/api/phieu-muon/add`, phieuMoi.value)
  toast.success('Thêm thành công')
  hienModalThem.value = false
  await loadPhieuMuon()
}

function suaPhieu(pm) {
  const khach = khachHangs.value.find(kh => kh.tenKhachHang === pm.khachHang)
  phieuDangSua.value = {
    id: pm.id,
    maPhieuMuon: pm.maPhieuMuon,
    ngayMuon: pm.ngayMuon,
    ngayTra: pm.ngayTra,
    trangThai: pm.trangThai,
    khachHang: khach ? khach.id : null
  }
  hienModalSua.value = true
}

async function capNhatPhieu() {
  await axios.put(`http://localhost:8080/api/phieu-muon/update/${phieuDangSua.value.id}`, phieuDangSua.value)
  toast.success('Cập nhật thành công')
  hienModalSua.value = false
  await loadPhieuMuon()
}

async function xoaPhieu(pm) {
  if (confirm(`Bạn có muốn xóa phiếu: ${pm.maPhieuMuon}?`)) {
    await axios.delete(`http://localhost:8080/api/phieu-muon/delete/${pm.id}`)
    toast.success('Xóa thành công')
    await loadPhieuMuon()
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
}


function getTrangThaiClass(trangThai) {
  return trangThai === true || trangThai === 'true' ? 'da-tra' : 'chua-tra'
}

function layTenKhachHang(id) {
  const kh = khachHangs.value.find(k => k.id === id)
  return kh ? kh.tenKhachHang : 'Không rõ'
}

function moModalChonSach(idPhieu) {
  phieuMuonIdChonSach.value = idPhieu
  hienModalChonSach.value = true
  idsDaChon.value = []
  ngayHetHan.value = null
  axios.get('http://localhost:8080/api/sach/getAll').then(res => {
    danhSachSach.value = res.data
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
    toast.error('Vui lòng chọn sách và ngày hết hạn')
    return
  }
  try {
    const body = {
      phieuMuonId: phieuMuonIdChonSach.value,
      sachChiTiet: idsDaChon.value.map(id => ({
        sachId: id,
        soLuong: soLuongTheoSach[id] || 1
      })),
      ngayHetHan: ngayHetHan.value,
    }
    console.log('Gửi dữ liệu:', body)
    await axios.post('http://localhost:8080/api/phieu-muon-chi-tiet/add', body)
    toast.success('Thêm sách thành công')
    hienModalChonSach.value = false
    await loadPhieuMuon()
  } catch (err) {
    const mesage = err.response?.data?.message || err.response?.data || "Lỗi không xác định";
    console.log(err)
    toast.error(mesage);
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
  grid-template-columns: 1fr 2fr 3fr 3fr 3fr 3fr 5fr;
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
@keyframes fadeIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
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
.modal.large {
  width: 800px;
  max-width: 95vw;
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

/* Trạng thái */
.chua-muon {
  background-color: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  text-align: center;
  font-weight: bold;
}
.da-muon {
  background-color: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  text-align: center;
  font-weight: bold;
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
  background-color: #28a745; /* màu xanh */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.traSachBtn:hover {
  background-color: #218838; /* đậm hơn khi hover */
}
.box {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: fit-content;
}

.box button {
  padding: 6px 12px;
  background: none;
  border: none;
  font-size: 18px;
  color: gray;
  cursor: pointer;
}

.box span {
  padding: 6px 16px;
  color: red;
  font-weight: bold;
}

</style>
