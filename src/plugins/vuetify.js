import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import es from 'vuetify/src/locale/es.ts'
import en from 'vuetify/src/locale/en.ts'

Vue.use(Vuetify, {
    lang: {
      locales: { es, en },
      current: 'es',
      locale: 'es'
    }
  });

const opts = {
    icons: {
        iconfont: 'mdi'
      },
    theme:{
        themes:{
            light:{
                primary : '#37b34a',
                secondary : '#F6921E',
                warning: '#F6921E'
            }
        }
    }
}

export default new Vuetify(opts)

