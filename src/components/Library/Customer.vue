<template>
  <div class="container">
    <!-- danh sách khách hàng -->
    <div class="list" style="margin-top: 40px;">
      <h2>List Customer</h2>
      <div class="row-kh header-kh">
        <div v-for="(title,i) in customerHeader" :key="i">{{ title }}</div>
      </div>
      <div class="row-kh" v-for="(kh, index) in customer" :key="kh.id" @click="viewBookBorrow(kh)">
        <div>{{ index + 1 }}</div>
        <div>{{ kh.customerCode }}</div>
        <div>{{ kh.customerName }}</div>
        <div>{{ kh.address }}</div>
        <div>{{ kh.email }}</div>
        <div>{{ kh.phoneNumber }}</div>
        <div class="status">
          <button class="btn update" @click.stop="updateCus(kh)">Update</button>
          <button v-if="isAdmin" class="btn delete" @click.stop="deleteCus(kh)">Delete</button>
        </div>
      </div>
    </div>

    <!-- update khách hàng -->
    <div v-if="showModalUpdateCus" class="modal-overlay" @click.self="showModalUpdateCus = false">
      <div class="modal-content">
        <h3>Update Customer</h3>
        <div class="form-group">
          <label>Customer Code:</label>
          <input v-model="UCustomer.customerCode"/>
        </div>
        <div class="form-group">
          <label>Customer Name:</label>
          <input type="text" v-model="UCustomer.customerName" />
        </div>
        <div class="form-group">
          <label>Address:</label>
          <input type="text" v-model="UCustomer.address" />
        </div>
        <div class="form-group">
          <label>Email:</label>
          <input type="email" v-model="UCustomer.email" />
        </div>
        <div class="form-group">
          <label>Phone number:</label>
          <input type="text" v-model="UCustomer.phoneNumber" />
        </div>
        <div style="text-align:right;">
          <button class="btn-save" @click="customerUpdate">Save</button>
          <button class="btn-cancel" @click="showModalUpdateCus = false" style="margin-left:10px;">Cancel</button>
        </div>
      </div>
    </div>

    <!-- modal xem khách hàng mượn những sách nào -->
     <div v-if="showModalBookBorrow" class="modal-overlay" @click.self="showModalBookBorrow = false">
        <div class="modal-content book-modal">
            <h3 style="margin-bottom: 16px;">Quantity book {{ customerBorrow.customerName }} borrow</h3>
            <div v-if="bookBorrow.length>0">
                <table>
                    <thead>
                        <tr>
                            <th v-for="(title,i) in bookBorrowHeader" :key="i">{{ title }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(s,index) in bookBorrow":key="index">
                            <td>{{ index+1 }}</td>
                            <td>{{ s.bookCode }}</td>
                            <td>{{ s.bookName }}</td>
                            <td>{{ s.author }}</td>
                            <td>{{ s.publisher }}</td>
                            <td>{{ formatDate(s.borrowDate) }}</td>
                            <td>{{ formatDate(s.expiryDate) }}</td>
                            <td>{{ s.numberBookBorrow }}</td>
                            <td>
                            <button class="returnBookBtn" @click="bookReturn(s)">Return</button>
                          </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else>
                <p>{{ customerBorrow.customerName }} don't borrow books</p>
            </div>
            <div class="modal-actions">
                <button @click="showModalBookBorrow = false" class="btn cancel">Cancel</button>
            </div>
        </div>
     </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import { deleteCustomer, getAllCustomer, getAllLoanVoucher, returnBook, updateCustomer, getBookBorrow } from '../api/api'
import { hasRole, hasAnyRole } from '../api/axiosInstance';

const isAdmin = hasRole("ROLE_ADMIN");

const toast = useToast()
const emit = defineEmits(['afterReturnBook', 'reload']) // Thêm 'reload' vào

const loanVoucher = ref([])
const customer = ref([])
const selectBook = ref([])
const bookBorrow = ref([])

const quantityByBook = reactive({})

const showModalUpdateCus = ref(false)
const showModalBookBorrow = ref(false)

const UCustomer = ref({})
const customerBorrow = ref({})

const props = defineProps(['reloadKey'])

watch(() => props.reloadKey, async () => {
  await loadCustomer();
}, { immediate: true });

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


const customerHeader = ['STT','Code','Name','Address','Email','Phone number','Activate']
const bookBorrowHeader = ['STT','Code','Name','Author','Publishing','Borrowed date','Expiration date','Borrowed quantity','Activate']


async function loadLoanVoucher() {
  try {
    const res = await getAllLoanVoucher();
    loanVoucher.value = res.data
    console.log(res.data)
  } catch (err) {
    console.error("Cannot load loan voucher form:", err)
  }
}

async function loadCustomer() {
  try {
    const res = await getAllCustomer();
    customer.value = res.data
  } catch (err) {
    console.log("Cannot load customer", err)
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

function updateCus(kh) {
  UCustomer.value = {...kh}
  showModalUpdateCus.value = true
}

async function customerUpdate() {
    console.log("ID:", UCustomer.value.id)
    console.log("Data gửi lên:", UCustomer.value)
  try{
    await updateCustomer(UCustomer.value.id,UCustomer.value)
    toast.success('Updated successfully')
    showModalUpdateCus.value = false
    await loadCustomer() 
  }catch(err){
    if (err.response && err.response.status === 403) {
      toast.error('You do not have permission to perform this action.!');
    } else {
      const message = err.response?.data?.message || err.response?.data || 'An error has occurred';
      toast.error(message);
    }
    console.error('Sua Kh loi:', err);
  }
}

async function deleteCus(kh) {
  if (confirm(`Do you want to delete the customer?: ${kh.customerCode}?`)) {
    try{
      await deleteCustomer(kh.id)
      toast.success('Deleted successfully')
      await loadCustomer()
    }catch(err){
      if (err.response && err.response.status === 403) {
      toast.error('You do not have permission to perform this action!');
    } else {
      const message = err.response?.data?.message || err.response?.data || 'An error has occurred';
      toast.error(`Delete failed: ${message}`);
    }
      console.error('Xóa KH lỗi:', err); 
    }
  }
}

async function viewBookBorrow(kh) {
  customerBorrow.value = kh
  try {
    const res = await getBookBorrow(kh.id);
    bookBorrow.value = res.data
    showModalBookBorrow.value = true
  } catch (err) {
    toast.error('Error loading list book')
    console.log(err)
  }
}

async function bookReturn(s) {
  const quantityWanted = s.numberBookBorrow || 0
  const input = prompt(`Enter the amount you want to pay:`)
  if (!input) return
  const quantityReturn = parseInt(input)
  if (isNaN(quantityReturn) || quantityReturn <= 0) {
    toast.error('Invalid payment quantity')
    return
  }
  if (quantityReturn > quantityWanted) {
    toast.error(`You just have ${quantityWanted} book to pay`)
    return
  }
  const check = confirm(`Are you sure you want to pay ${quantityReturn} for the book "${s.bookName}"?`)
  if (!check) return
  try {
    await returnBook(s.id, quantityReturn)
    toast.success('Returned books successfully')
  } catch (error) {
    const message = error?.response?.data?.message || "An error occurred while returning the book."
    toast.error(message)
    console.error("Chi tiết lỗi trả sách:", error)
  }
  await viewBookBorrow(customerBorrow.value)
  await loadLoanVoucher()
  emit('afterReturnBook')
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

.modal-content.book-modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  overflow-x: auto;
}

.book-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.book-table th,
.book-table td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: center;
  font-size: 14px;
}

.book-table th {
  background-color: #f5f5f5;
  font-weight: bold;
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
.row-kh:hover {
  background-color: #c7e9d3;
  cursor: pointer;
  transition: background-color 0.2s;
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
.returnBookBtn {
  padding: 5px 25px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.returnBookBtn:hover {
  background-color: #218838;
}
</style>