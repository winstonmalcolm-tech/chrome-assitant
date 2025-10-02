import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from './stores/user';
import { useDocumentStore } from './stores/document';
import "./index.css";
import App from './App.vue'
import router from './router'

import '@mdi/font/css/materialdesignicons.css';
import 'quill-mention/autoregister';
import 'quill-mention/dist/quill.mention.min.css';

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';


( 
  function () {
    const app = createApp(App)


    app.use(createPinia())
    
    const userStore = useUserStore();
    const documentStore = useDocumentStore();
     
    userStore.init();
    documentStore.loadCurrentDocument();

    app.use(router)
    app.component('QuillEditor', QuillEditor)

    app.mount('#app')
  }
)()
