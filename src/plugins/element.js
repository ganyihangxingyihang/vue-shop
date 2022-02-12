import Vue from 'vue'

import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
//将组件挂载到Vue原型对象上，这样该组件可以用this访问
Vue.prototype.$message = Message
