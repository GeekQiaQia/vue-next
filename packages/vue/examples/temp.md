# 快速起步 vue-next
## [vue3中文文档](https://v3.cn.vuejs.org/)
## [vue3英文文档](https://v3.vuejs.org/)


## 安装和使用
### CDN
```
<script src="https://unpkg.com/vue@next"></script>

```
对于生产环境，我们推荐链接到一个明确的版本号和构建文件，以避免新版本造成的不可预期的破坏

### npm 安装
```
# 最新稳定版
$ npm install vue@next

```
### 命令行工具（CLI）

对于 Vue 3，你应该使用 npm 上可用的 Vue CLI v4.5 作为 @vue/cli
```
yarn global add @vue/cli
# OR
npm install -g @vue/cli

#升级最新版本

vue upgrade --next

```

### Vite 构建工具
[Vite](https://github.com/vitejs/vite)是一个 web 开发构建工具，由于其原生 ES 模块导入方式，可以实现闪电般的冷服务器启动。

```
npm init vite-app <project-name>
cd <project-name>
npm install
npm run dev

```
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a3184180dd54fd38aa8fa1d56cecbbb~tplv-k3u1fbpfcp-watermark.image)

npm run dev

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c711914de3a4f989ff7689fb6a9e82c~tplv-k3u1fbpfcp-watermark.image)

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fdb0770c689b44d4bc9ef42b1e50d8e3~tplv-k3u1fbpfcp-watermark.image)

## vue-next 新特性
### Composition API 
[Composition API 英文官方介绍](https://v3.vuejs.org/guide/composition-api-introduction.html) 

[Composition API 中文官方介绍](https://v3.cn.vuejs.org/guide/composition-api-introduction.html#%E4%BB%80%E4%B9%88%E6%98%AF%E7%BB%84%E5%90%88%E5%BC%8F-api)

一个大型组件的示例，其中逻辑关注点是按颜色分组。
这种碎片化使得理解和维护复杂组件变得困难

![Vue 选项 API: 按选项类型分组的代码](https://user-images.githubusercontent.com/499550/62783021-7ce24400-ba89-11e9-9dd3-36f4f6b1fae2.png)

如果我们能够将与同一个逻辑关注点相关的代码配置在一起会更好。而这正是组合式 API 使我们能够做到的
#### setup 选项
 vue3中我们在setup()选项中使用组合式API.

新的 setup 组件选项在创建组件之前执行，一旦 props 被解析，并充当合成 API 的入口点。

:::warning
由于在执行 `setup` 时尚未创建组件实例，因此在 `setup` 选项中没有 `this`。这意味着，除了 `props` 之外，你将无法访问组件中声明的任何属性——**本地状态**、**计算属性**或**方法**。
:::


##### setup()函数接受两个参数：
 * props 属性对象；Proxy对象；
    * 不能使用es6解构它，否则将失去响应式；
    * 如需解构：可通过toRefs，在setup内部解构；
        * const {msg} =toRefs(props);
 * context 组件上下文普通对象;暴露3个组件的property
    * ctx.attrs:(ps非响应式对象) 访问组件所有特性
    * ctx.slots:(ps非响应式对象) 访问插槽内容，插槽在vue3中函数化；
        * 即ctx.slots.xxx();的方式来访问插槽内容；
    * ctx.emit:(ps触发事件方法) 向外部派发自定义事件；    

##### setup()函数中的this指向：
 * setup中的`this`就是它执行时的上下文；
    * 如果是esm方式打包的，this为undefined;
    * 如果是单文件的方式运行的，this为window;
    * 源码中，setup()在解析其他组件选项之前被调用；this不再指向当前活跃实例的引用；
 * **结论**：forget about `this`;vue3的setup中无需考虑`this`即可;
 #### setup()中，三种方式实现数据响应式：
  * ref() 返回响应式对象；
  * reactive();将一个对象响应化；
  * toRefs(); 将一个响应式对象ref处理；
```
<script>
  import { ref } from 'vue'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
   // 当setup中定义的响应式数据和data()选项中定义的重复时，vue3优先获取data中的数据；
  setup(props,ctx){
    
    const counter = ref(0)  // ref 返回响应式对象 {value:0}
    
    console.log(counter.value);  // 0 
    
    return {counter }
  },
  data() {
    return {
      counter: 1
    }
  }
}
</script>

```
#### 使用ref响应式变量（创建一个响应式引用）

```
console.log(counter) // { value: 0 }

```
##### 如上：为什么使用包装器对象，来包裹一个基本数据类型值？

答：`
因为
1、在 JavaScript 中，Number 或 String 等基本类型是通过值传递的，而不是通过引用传递的：
在任何值周围都有一个包装器对象，这样我们就可以在整个应用程序中安全地传递它，而不必担心在某个地方失去它的响应性。
`
![按引用传递与按值传递](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2d0015cae9e4bab94339628900b9153~tplv-k3u1fbpfcp-zoom-1.image)


#### 生命周期钩子注册内部setup
 * composition API生命周期钩子名称为： option API 名称前缀加 `on`

* 你可以通过在生命周期钩子前面加上 “on” 来访问组件的生命周期钩子。

下表包含如何在 [setup ()](composition-api-setup.html) 内部调用生命周期钩子：

|    选项 API       | Hook inside `setup` |
| ----------------- | -------------------------- |
| `beforeCreate`    | Not needed\*               |
| `created`         | Not needed\*               |
| `beforeMount`     | `onBeforeMount`            |
| `mounted`         | `onMounted`                |
| `beforeUpdate`    | `onBeforeUpdate`           |
| `updated`         | `onUpdated`                |
| `beforeUnmount`   | `onBeforeUnmount`          |
| `unmounted`       | `onUnmounted`              |
| `errorCaptured`   | `onErrorCaptured`          |
| `renderTracked`   | `onRenderTracked`          |
| `renderTriggered` | `onRenderTriggered`        |


```
<script>
  import { getCurrentInstance, onMounted, ref,watch,computed  } from 'vue'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
   // 当setup中定义的响应式数据和data()选项中定义的重复时，vue3优先获取data中的数据；
  setup(props,ctx){
    
    const instance= getCurrentInstance();  // 获组件实例

    const counter = ref(0)  // ref 返回响应式对象 {value:0}
    const twiceTheCounter = computed(() => counter.value * 2)
    console.log(counter.value);  // 0 

     onMounted(()=>{
       // 在组件挂载的时候，通过组件实例的上下文获取setup外部属性；
        console.log(instance.ctx.counter);  // 1;
     });
    console.log(twiceTheCounter);
    watch(()=>{return counter.value}, (newValue, oldValue) => {
        console.log('The new counter value is: ' + counter.value)
      })
    return {counter,twiceTheCounter }
  },
  data() {
    return {
      counter2: 1
    }
  }
}
</script>

```
setup()执行时间很早，甚至早于created; 因此在setup()中访问外部属性，需要在`onMounted`钩子中进行访问才有效；

#### wantch && computed 响应式更改；
watch()函数侦听器，接受3个参数
* 一个`响应式引用`或我们想要侦听的 getter 函数 ()=>{}
* 一个回调
* 可选的配置选项

```

<script>
  import { getCurrentInstance, onMounted, ref,watch,computed  } from 'vue'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
   // 当setup中定义的响应式数据和data()选项中定义的重复时，vue3优先获取data中的数据；
   //  在源码中先从setupState中取值，再从data中取值；
  setup(props,ctx){
    
    const instance= getCurrentInstance();  // 获组件实例

    const counter = ref(0)  // ref 返回响应式对象 {value:0}
    const twiceTheCounter = computed(() => counter.value * 2)  // 输出只读属性的响应式引用；
    console.log(counter.value);  // 0 

     onMounted(()=>{
       // 在组件挂载的时候，通过组件实例的上下文获取setup外部属性；
        console.log(instance.ctx.counter);  // 1;
     });
    console.log(twiceTheCounter);
    watch(()=>{return counter.value}, (newValue, oldValue) => {
        console.log('The new counter value is: ' + counter.value)
      })
    return {counter,twiceTheCounter }
  },
  data() {
    return {
        // 与setup中变量相同时；counter从data中取值；
      counter2: 1
    }
  }
}
</script>


```

#### Provide/Inject

* `只能` 在当前活动实例的 `setup()` 期间调用

#### use 组合式函数；

 使用组合函数组织代码； useCounter();

```
<script>
  import { getCurrentInstance, onMounted, ref,watch,computed  } from 'vue'
  // 也可单独封装到一个js文件中；
  function useCounter(){
     const counter = ref(0)  // ref 返回响应式对象 {value:0}
     const twiceTheCounter = computed(() => counter.value * 2)
     console.log(counter.value);  // 0 

     watch(()=>{return counter.value}, (newValue, oldValue) => {
        console.log('The new counter value is: ' + counter.value)
      })

      return {
         counter,twiceTheCounter
      }
  }

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
   // 当setup中定义的响应式数据和data()选项中定义的重复时，vue3优先获取data中的数据；
   //  在源码中先从setupState中取值，再从data中取值；
  setup(props,ctx){
      const { counter,twiceTheCounter }=useCounter();
      const instance= getCurrentInstance();  // 获组件实例

    // const counter = ref(0)  // ref 返回响应式对象 {value:0}
    // const twiceTheCounter = computed(() => counter.value * 2)
    // console.log(counter.value);  // 0 
    
    // console.log(twiceTheCounter);
    // watch(()=>{return counter.value}, (newValue, oldValue) => {
    //     console.log('The new counter value is: ' + counter.value)
    //   })

       onMounted(()=>{
       // 在组件挂载的时候，通过组件实例的上下文获取setup外部属性；
        console.log(instance.ctx.counter);  // 1;
     });

    return {counter,twiceTheCounter }
  },
  data() {
    return {
        // 与setup中变量相同时；counter从data中取值；
      counter2: 1
    }
  }
};


</script>

```
baseCreateRender() 
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9234009f8b5a487bbf53d1886f52fc46~tplv-k3u1fbpfcp-watermark.image)
createAppContext();
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/21c9d4687e3d4d9ea049d899bce6a543~tplv-k3u1fbpfcp-watermark.image)
app.mount();app挂载
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97119d82c58740b5a9141b8055c732f5~tplv-k3u1fbpfcp-watermark.image)
	normalizeContainer
   ![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ca6d3183af374a658f31fa45860c0967~tplv-k3u1fbpfcp-watermark.image)
    mount(container) 挂载根节点
   ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ee7a0cc617f3429ba178c6552a9afd6d~tplv-k3u1fbpfcp-watermark.image)
   _createVnode()
   ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/98eb64e388194b75aaac6a60e54f2ecd~tplv-k3u1fbpfcp-watermark.image)
   vnode:
   ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/55bdd4dd75d74ce09c2a46e06e28dad0~tplv-k3u1fbpfcp-watermark.image)
   	 render()
     ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ac61c754b8f54b1a8cac593e6ac7dcc7~tplv-k3u1fbpfcp-watermark.image)
     	patch()
        ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7b9e6afd91eb4c39965e7b8040f07308~tplv-k3u1fbpfcp-watermark.image)
        mountComponent() 初始化
        ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b5b6a0aae06a4484bff4da4ffbe0d17d~tplv-k3u1fbpfcp-watermark.image)
        ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d833e2f6e0aa4c80b85a3fad5381ebe8~tplv-k3u1fbpfcp-watermark.image)
        	创建组件实例：createComponentInstance()
            ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4bc32109b5a441c68378cfee5b080ea7~tplv-k3u1fbpfcp-watermark.image)
        		creatRenderContext()
                ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/584872b147be4b638939b641a1fe85ef~tplv-k3u1fbpfcp-watermark.image)
                shallowReactive();createReactiveObject
            ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5cdff711f35148418493b98796aa159b~tplv-k3u1fbpfcp-watermark.image)
        setupStatefulComponent()
        ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/75a8eab2b66a47bb94768a7f27db11e7~tplv-k3u1fbpfcp-watermark.image)
        setup  reactive()
        ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d8524d5bea5d48a5a28eefdf88d9fc47~tplv-k3u1fbpfcp-watermark.image)
       createReactiveObject();
     ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f8b48be3306a42b898d3cdb7ffcd163b~tplv-k3u1fbpfcp-watermark.image)
     finishComponentSetup
     ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d42d6075800b44388a5d3bf9044789b3~tplv-k3u1fbpfcp-watermark.image)
        compileToFunction
		![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a4013ebf1829497a8f36dc866d868f32~tplv-k3u1fbpfcp-watermark.image)
          baseCompile();
          ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/298caae84b8744778a54dadfd23712ed~tplv-k3u1fbpfcp-watermark.image)
          baseParse()/createParserContext()
          ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/71ec02889d9848ba9ea74a19adeb7f0f~tplv-k3u1fbpfcp-watermark.image)
          ![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a080b8566d6d466b88aa2b463685f74e~tplv-k3u1fbpfcp-watermark.image)
          pushNode()
          ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19905ec143dd41dda7a580ef5c87d8b5~tplv-k3u1fbpfcp-watermark.image)
          ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4d42e15baf4940689f96791ecffc5146~tplv-k3u1fbpfcp-watermark.image)
     // applyOptions(); support for 2.x options
    ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2c47b9fcc8ec4783b57e90ef53e12bcc~tplv-k3u1fbpfcp-watermark.image)
    // 源码中对应的生命周期
    ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/99c0677d88554346809f510444952407~tplv-k3u1fbpfcp-watermark.image)
    setupRenderEffect()
runtime-core/src/renderer.ts
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b0b3ee94d7c54826bf368c3aeea72863~tplv-k3u1fbpfcp-watermark.image)

 unRef()定义：
 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/333b3be0e2e243dba2d5f3cb1dfc8689~tplv-k3u1fbpfcp-watermark.image)
 isRef()定义：
 
 normalizeChildren()
 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3073c3c2c99d4e4fac467af9f157e546~tplv-k3u1fbpfcp-watermark.image)
 
 // 虚拟节点 vnode的数据结构类型；
 ![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/38f9463f140040418afdb507b76e0607~tplv-k3u1fbpfcp-watermark.image)
 
 ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae4854573e4e4e6bac6f175899897120~tplv-k3u1fbpfcp-watermark.image)
 
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/436ca8446da54f7cb083b22a0eef2bd6~tplv-k3u1fbpfcp-watermark.image)

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/448df2c0cac54cf282592844eaad3db0~tplv-k3u1fbpfcp-watermark.image)

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9cd0de5abb7041ae952b485d4518a4de~tplv-k3u1fbpfcp-watermark.image)

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/238a04fb97014ee0a5aa02eca3d294fe~tplv-k3u1fbpfcp-watermark.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cbb97760c5ab4fbb9018aa2b628469d3~tplv-k3u1fbpfcp-watermark.image)

mountComponent(); 挂载组件；
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/de91744702b74615863557ca1f81c3a2~tplv-k3u1fbpfcp-watermark.image)

setupRenderEffect(instance,initialVNode,container,anchor,parentSuspense,isSVG,optimized)

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c697f3bbf1a4a87acc637d572c91534~tplv-k3u1fbpfcp-watermark.image)

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f705e68b4cdc4e969a443096574d767f~tplv-k3u1fbpfcp-watermark.image)


createGetter()
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a7ab0819a489430d8ffa7cff89fc22e2~tplv-k3u1fbpfcp-watermark.image)
PublicInstanceProxyHandlers

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e4a03c79de1c4cb0910f4253f3ef5dda~tplv-k3u1fbpfcp-watermark.image)
track
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/be915b5286a449c3bf88d4deaea0aabe~tplv-k3u1fbpfcp-watermark.image)
// 创建虚拟节点 _createVNode
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d58e9b1879f24a439dc86e1ff8a4fe57~tplv-k3u1fbpfcp-watermark.image)

vnode 

`源码路径:`/packages/runtime-core/src/vnode.ts
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b13df20f91694f169e4cb5a86b609db2~tplv-k3u1fbpfcp-watermark.image)

normalizeChildren

`源码路径:`/packages/runtime-core/src/vnode.ts
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3f2e74df41eb4d1ba4be6d87f9d66378~tplv-k3u1fbpfcp-watermark.image)


