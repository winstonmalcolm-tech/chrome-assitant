import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from './stores/user';
import "./style.css";
import App from './App.vue'
import router from './router'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

( 
  function () {
    const app = createApp(App)

    const vuetify = createVuetify({
      theme:{
        defaultTheme: 'light'
      },
      components,
      directives,
      icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        }
      }
    })

    app.use(createPinia())
    app.use(vuetify)
    
    const userStore = useUserStore();

    userStore.init()

    app.use(router)

    app.mount('#app')
  }
)()
