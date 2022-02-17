import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
//导入字体图标样式表
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false

//导入axios包
import axios from 'axios'
//配置请求根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// 配置axios拦截器
axios.interceptors.request.use(config => {
  // 在请求头中使用 Authorization 字段提供 token 令牌
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//将其挂载到Vue的原型对象上
Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
