

# multiCascaderBaseEle
Componente de selector en cascada multiselección basado en element-ui, que hereda completamente las funcionalidades del componente en cascada de element-ui

# Uso
## Instalación
``` bash
npm i multi-cascader-base-ele --save
```
## Uso
``` js
import Vue from 'vue'
import Element from 'element-ui'
import App from './App.vue'
import multiCascader from 'multi-cascader-base-ele'
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
Vue.config.devtools = true


Vue.use(Element)
Vue.use(multiCascader)

new Vue({
    el: '#app',
    components: { App },
    template: '<App/>'
})
```

``` html
<el-multi-cascader class="multi-cascader" :options="options" multiple filterable select-children clearable collapse-tags
only-out-put-leaf-node
change-on-select v-model="selectedOptions"> </el-multi-cascader>
```
# Ejemplos de funcionalidad y opciones
[Ver demo](https://zhenyucheng.github.io/multiCascaderBaseEle/dist/index.html)
