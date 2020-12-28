# vue3:ref-Sugar 体验
[体验项目-传送门](https://github.com/GeekQiaQia/vue-next/tree/dev/packages/vue/examples/vite-app/viteApp)
个人感觉`ref-Sugar` 这颗糖很甜，简化了`.value`的这种书写方式；
## 升级最新编译器
如图所示：我们的项目为vite-app,当前package.json中vue版本以及compiler-sfc版本均为^3.0.4；

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33abb3795d1b449596b7787275672f3e~tplv-k3u1fbpfcp-watermark.image)

### 执行版本更新命令
```
npm i vue@next -S 

npm i @vue/compiler-sfc -D

```
当前最新版本即为 ^3.0.4
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f9e7052414e4915a1022aa4da85942e~tplv-k3u1fbpfcp-watermark.image)
#### 新建RefSugar.vue组件；如下所示：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6018426d07b246f3a83a34b5902e89a5~tplv-k3u1fbpfcp-watermark.image)
<details>
<summary>RefSugar.vue</summary>

```vue
<template>
    <div>
    <span>refSugar </span>    
    <button @click="inc">{{ count }}</button>

    </div>
</template>

<script setup>
import {watch} from 'vue'
// declaring a variable that compiles to a ref
ref: count = 1

function inc() {
  // the variable can be used like a plain value
  count++
}

// access the raw ref object by prefixing with $
console.log($count.value)

watch($count,()=>{
    console.log(count);
})
</script>

<style scoped>

</style>
```
</details>
<p></p>

####  在app.vue引入组件

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3baeaac9d329446bae6bc9afa4d42a3d~tplv-k3u1fbpfcp-watermark.image)
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0bfdaaa6daa849c9a7a442d49879c0e5~tplv-k3u1fbpfcp-watermark.image)



