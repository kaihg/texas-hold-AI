import { createApp } from 'vue'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

const app = createApp(App)
app.mount('#app')

// 註冊 Service Worker
if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
      // 當有新版本時，詢問用戶是否更新
      if (confirm('有新版本可用，是否更新？')) {
        registerSW(true)
      }
    },
    onOfflineReady() {
      // 當應用可以離線使用時
      console.log('應用已準備好離線使用')
    }
  })
} 