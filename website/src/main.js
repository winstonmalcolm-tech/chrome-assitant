import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from './stores/user';
import "./style.css";
import App from './App.vue'
import router from './router'

( 
  function () {
    const app = createApp(App)

    app.use(createPinia())
    const userStore = useUserStore();

    userStore.init()

    app.use(router)

    app.mount('#app')
  }
)()
