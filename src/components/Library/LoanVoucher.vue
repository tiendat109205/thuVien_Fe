<template>
  <div class="container">
    <div class="list">
      <h2>List Loan Voucher</h2>
      <button class="btn add" @click="createLoanVoucherFast">+ Create loan voucher</button>
      <div class="row header">
        <div v-for="(title,i) in loanVoucherHeader" :key="i">{{ title }}</div>
      </div>
      <div class="row" v-for="(pm, index) in loanVoucher" :key="pm.id">
        <div>{{ index + 1 }}</div>
        <div>{{ pm.loanVoucherCode }}</div>
        <div>{{ pm.customer }}</div>
        <div>{{ formatDate(pm.borrowDate) }}</div>
        <div>{{ formatDate(pm.expiryDate) }}</div>
        <div :class="getStatusClass(pm.status)">
          {{ pm.status === true || pm.status === 'true' ? 'Returned' : 'Not Returned' }}
        </div>
        <div class="status">
          <button v-if="isAdmin" class="btn delete" @click="loanVoucherDelete(pm)">Delete</button>
          <button class="btn" @click="openModalSelectBook(pm.id)">+ Create book</button>
        </div>
      </div>
    </div>

    <!-- Modal chọn sách -->
    <div v-if="showModalSelectBook" class="modal-overlay" @click.self="resetModalSelectBook">
      <div class="modal-content">
        <h3>Select books to add to the voucher (ID: {{ loanVoucherIdSelectBook }})</h3>
        <!-- Header -->
        <div class="row-book header-book">
          <div><input type="checkbox" @change="selectAll($event)" /></div>
          <div v-for="(title,i) in selectBookHeader" :key="i">{{ title }}</div>
        </div>

        <div class="row-book" v-for="(book, index) in listBook" :key="book.id" @click="viewCustomerBorrow(book)">
          <div><input type="checkbox" :value="book.id" v-model="selectBook" @click.stop/></div>
          <div>{{ index + 1 }}</div>
          <div>{{ book.bookCode }}</div>
          <div>{{ book.bookName }}</div>
          <div>{{ book.author }}</div>
          <div>{{ book.publisher }}</div>
          <div>{{ book.yearToRelease }}</div>
          <div>{{ book.genre }}</div>
          <div>{{ book.quantity }}</div>
          <div v-if="selectBook.includes(book.id)" class="box">
            <button @click.stop="prison(book.id)">-</button>
            <input type="number" min="1" :max="book.quantity" v-model.number="quantityByBook[book.id]" @click.stop style="width: 60px; text-align: center"/>
            <button @click.stop="next(book.id)">+</button>
          </div>
        </div>

        <div class="form-group">
          <label>Expiry Date:</label>
          <input type="date" v-model="expiryDate" />
        </div>
        <div style="text-align:right; margin-top:12px">
          <button class="btn-save" @click="saveLoanVoucherDetail">Save</button>
          <button class="btn-cancel" @click="resetModalSelectBook" style="margin-left: 10px">Cancel</button>
        </div>
      </div>
    </div>
     <div v-if="showModalCustomerBorrow" class="modal-overlay" @click.self="showModalCustomerBorrow = false">
      <div class="modal-content book-modal">
        <h3>List of book borrowers</h3>
        <table v-if="listCustomerBorrow.length > 0">
          <thead>
            <tr>
              <th v-for="(title,i) in customerBorrowHeader" :key="i">{{ title }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(kh, i) in listCustomerBorrow" :key="i">
              <td>{{ i + 1 }}</td>
              <td>{{ kh.customerCode }}</td>
              <td>{{ kh.customerName }}</td>
              <td>{{ kh.email }}</td>
              <td>{{ kh.phoneNumber }}</td>
              <td>{{ formatDate(kh.borrowDate) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No one has borrowed this book yet.</p>
        <div class="modal-actions">
          <button @click="showModalCustomerBorrow = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Modal bắt buộc nhập thông tin KH khi chưa có -->
      <div v-if="showModalEnterInformation" class="modal-overlay" @click.self="showModalEnterInformation = false">
        <div class="modal-content">
          <h3>Please enter customer information to continue borrowing books.</h3>
          <div class="form-group">
            <label>Customer Code:</label>
            <input v-model="newCustomer.customerCode" />
          </div>
          <div class="form-group">
            <label>Customer Name:</label>
            <input v-model="newCustomer.customerName" />
          </div>
          <div class="form-group">
            <label>Address:</label>
            <input v-model="newCustomer.address" />
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input v-model="newCustomer.email" />
          </div>
          <div class="form-group">
            <label>Phone Number:</label>
            <input v-model="newCustomer.phoneNumber" />
          </div>
          <div style="text-align:right;">
            <button class="btn-save" @click="createCustomer">Save</button>
            <button class="btn-cancel" @click="showModalEnterInformation = false" style="margin-left:10px;">Cancel</button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import {
  addLoanVoucherDetail,
  addLoanVoucher,
  deleteLoanVoucher,
  getAllCustomer,
  getAllLoanVoucher,
  getAllBook,
  getCustomerBorrow,
  checkInfomation,
  addCustomer
} from '../api/api'
import { hasRole } from '../api/axiosInstance'

const isAdmin = hasRole("ROLE_ADMIN")
const toast = useToast()

const loanVoucher = ref([])
const listBook = ref([])
const customer = ref([])
const selectBook = ref([])
const listCustomerBorrow = ref([])
const quantityByBook = reactive({})

const showModalEnterInformation = ref(false)
const showModalSelectBook = ref(false)
const showModalCustomerBorrow = ref(false)

const loanVoucherIdSelectBook= ref(null)
const expiryDate = ref(null)

const newCustomer = ref({})
const bookBorrow = ref({})

const emit = defineEmits(['reload'])
const props = defineProps(['reloadKey'])

watch(() => props.reloadKey, async () => {
  await loadLoanVoucher()
})

watch(selectBook, (newIds) => {
  newIds.forEach(id => {
    if (!quantityByBook[id]) {
      quantityByBook[id] = 1
    }
  })
})

onMounted(async () => {
  await loadLoanVoucher()
  await loadCustomer()
})

const loanVoucherHeader = ['STT','Code','Name','Borrow Date','Return Date','Status','Activate']
const selectBookHeader = ['STT','Code','Name','Author','Publisher','Year To Release','Genre','Quantity', 'Quantity Borrow']
const customerBorrowHeader = ['STT','Code','Name','Email','Phone Number','Borrow Date']

function prison(id) {
  if (quantityByBook[id] > 1) {
    quantityByBook[id]--
  }
}

function next(id) {
  quantityByBook[id]++
} 

async function loadLoanVoucher() {
  try {
    const res = await getAllLoanVoucher()
    loanVoucher.value = res.data
  } catch (err) {
    toast.error("Error loading loan voucher form")
    console.log(err)
  }
}

async function loadCustomer() {
  try {
    const res = await getAllCustomer();
    customer.value = res.data
  } catch (err) {
    console.log("Cannot load client", err)
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

async function viewCustomerBorrow(book) {
  try {
    bookBorrow.value = book
    const res = await getCustomerBorrow(book.id)
    listCustomerBorrow.value = res.data
    showModalCustomerBorrow.value = true
  } catch (err) {
    toast.error("Error viewing borrowed customers")
    console.log(err)
  }
}

async function createLoanVoucherFast() {
  try {
    const res = await checkInfomation()
    const information = res.data
    console.log("Kết quả check thông tin KH:", information)
    if (information === false) {
      showModalEnterInformation.value = true
      return
    }

    const voucher = {
      loanVoucherCode: '',
      borrowDate: '',
      returnDate: '',
      customer: information.idAccount,
      status: true
    }
    console.log("Data gửi đi:", voucher);
    await addLoanVoucher(voucher)
    toast.success("Loan voucher created successfully")
    await loadLoanVoucher()
    await loadCustomer()
  } catch (err) {
    const msg = err?.response?.data?.message || "Loan voucher creation failed"
    toast.error(msg)
    console.error("Chi tiết lỗi:", err)
  }
}

async function createCustomer() {
  try {
    const isUser = hasRole("ROLE_USER");
    const userId = localStorage.getItem("userId");
    if (isUser && userId) {
      newCustomer.value.idAccount = userId;
    }
    await addCustomer(newCustomer.value);
    toast.success("Add customer successfully");
    showModalEnterInformation.value = false;

    await loadCustomer();
    await loadLoanVoucher();
    emit('reloadCustomer');
  } catch (err) {
    toast.error("Add failed customers");
    console.log(err);
  }
}


async function loanVoucherDelete(pm) {
  if (confirm(`Delete loan voucher ${pm.loanVoucherCode}?`)) {
    try {
      await deleteLoanVoucher(pm.id)
      toast.success("Deleted successfully")
      await loadLoanVoucher()
    } catch (err) {
      toast.error("Delete failed")
      console.log(err)
    }
  }
}

function getStatusClass(status) {
  return status === true || status === 'true' ? 'returned' : 'not-returned'
}

function openModalSelectBook(idPhieu) {
  loanVoucherIdSelectBook.value = idPhieu
  showModalSelectBook.value = true
  selectBook.value = []
  expiryDate.value = null
  getAllBook().then(res => {
    listBook.value = res.data
  }).catch(err => {
    toast.error("Error loading books")
    console.log(err)
  })
}

function selectAll(event) {
  if (event.target.checked) {
    selectBook.value = listBook.value.map(s => s.id)
  } else {
    selectBook.value = []
  }
}

async function saveLoanVoucherDetail() {
  if (!expiryDate.value || selectBook.value.length === 0) {
    toast.error('Select book and due date')
    return
  }
  try {
    const body = {
      loanVoucherId: loanVoucherIdSelectBook.value,
      bookDetails: selectBook.value.map(id => ({
        bookId: id,
        quantityBorrow: quantityByBook[id] || 1
      })),
      expiryDate: expiryDate.value
    }
    await addLoanVoucherDetail(body)
    toast.success('Borrowed book successfully')
    showModalSelectBook.value = false
    await loadLoanVoucher()
  } catch (err) {
    const errorMsg = err?.response?.data?.message || "Add details of failed ticket"
    toast.error(errorMsg)
    console.error("Chi tiết lỗi thêm chi tiết phiếu:", err)
  }
}

function resetModalSelectBook() {
  showModalSelectBook.value = false
  selectBook.value = []
  expiryDate.value = null
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
  grid-template-columns: 1fr 2fr 3fr 3fr 3fr 3fr 3fr;
  padding: 8px 0;
  border: 1px solid #eee;
  align-items: center;
}
.row.header {
  font-weight: bold;
  background-color: #f9f9f9;
}
.returned {
  background-color: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
}
.not-returned {
  background-color: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
}
.status {
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
.btn.update {
  background: #ffc107;
}
.btn.delete {
  background: #dc3545;
  color: white;
}
.btn.add {
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
.row-book {
  display: grid;
  grid-template-columns: 1fr 1.5fr 3fr 5fr 4fr 4fr 2fr 3fr 3fr 5fr;
  padding: 8px 0;
  border: 1px solid #eee;
  align-items: center;
}
.header-book {
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
 
.modal-content.book-modal {
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

.btn.cancel {
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn.cancel:hover {
  background-color: #555;
}

.row-book:hover {
  background-color: #c7e9d3;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-save{
  padding: 3px 16px;
  background-color: green;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-cancel{
  padding: 3px 16px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>