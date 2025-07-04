  import './assets/main.css'

  import { createApp } from 'vue'
  import GoogleSignInPlugin from 'vue3-google-login'
  import App from './App.vue'
  import router from './router'
  // Bootstrap
  import 'bootstrap/dist/css/bootstrap.min.css'
  import 'bootstrap-icons/font/bootstrap-icons.css'
  import 'bootstrap/dist/js/bootstrap.bundle.min.js'

  // Vue toastification
  import Toast, {POSITION} from 'vue-toastification'
  import 'vue-toastification/dist/index.css'

  const app = createApp(App)


  app.use(GoogleSignInPlugin, {
    clientId: '273682109206-tvf7rcovsndooh1elknopdpilevjnreb.apps.googleusercontent.com',
  })  
  app.use(router)
  app.config.globalProperties.$toast = app._context.provides['__toast']
  app.use(Toast, {
    position: POSITION.TOP_RIGHT, // vị trí hiển thị thông báo trên màn hình
    timeout: 3000,  // tgian tự động ẩn thông báo
    closeOnClick: true, // cho phép đóng khi người dùng click vào
    pauseOnFocusLoss: true, //tạm dừng đếm tgian khi người dùng chuyển tab
    pauseOnHover: true, // tạm dừng đếm tgian khi di chuột vào
    draggable: true, // cho phép người dùng kéo thả để đóng
    draggablePercent: 0.6, //phần trăm chiều rộng của thông báo để tính khoảng kéo
    showCloseButtonOnHover: false, // chỉ hiện thị nút đóng khi di chuột vào (false là luôn hiển thị hoặc mặc định)
    hideProgressBar: false, // hiển thị thanh tiến trình đếm tgain (false là hiện)
    closeButton: 'button', //kiểu nút đóng
    icon: true, // hiện icon trong thông báo
    rtl: false // đặt văn bản thông báo từ phải sang trái
  })

  app.mount('#app')
