import Vue from 'vue'
import App from './App.vue'
//import Vuetify from 'vuetify'
import vuetify from './plugins/vuetify'
import 'vuetify/dist/vuetify.min.css'
//import { TiptapVuetifyPlugin } from 'tiptap-vuetify'
import 'tiptap-vuetify/dist/main.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@mdi/font/css/materialdesignicons.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
 
Vue.use(VueAxios, axios)

Vue.config.productionTip = false

  
new Vue({
  vuetify,
  
   render: h => h(App),
}).$mount('#app')







 
