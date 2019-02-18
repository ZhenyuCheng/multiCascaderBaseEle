import Vue from 'vue'
import Element from 'element-ui'
import App from './App.vue'
import multiCascader from '../multiCascader/index'
import JsonViewer from 'vue-json-viewer'
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
Vue.config.devtools = true


Vue.use(Element)
Vue.use(multiCascader)
Vue.use(JsonViewer)

new Vue({
    el: '#app',
    components: { App },
    template: '<App/>'
})