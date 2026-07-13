import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/theme.css'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/themeStore.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)

useThemeStore().init()

app.mount('#app')