import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
//导入字体图标样式表
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false

//导入axios包，并将其挂载到Vue的原型对象上
import axios from 'axios'
Vue.prototype.$http = axios
//配置请求根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
