# @vue/reactivity

## 使用注意

这个包内联到面向用户的渲染器的全局和浏览器ESM构建中(e.g. `@vue/runtime-dom`),但也可以作为一个独立发布使用的包。独立构建不应该与面向用户的渲染器的预绑定构建一起使用，
因为它们对响应式联系有着不同的内部存储。面向用户的渲染器应该从这个包中重新导出所有api。

对于完全导出的api, 查看 `src/index.ts`. 你也可以从repo root 运行 `yarn build reactivity --types` , 它将在 `temp/reactivity.api.md`上生成一个API报告.

## 借鉴

这个模块的实现灵感来源自Javascript生态系统中的以下技术：

- [Meteor Tracker](https://docs.meteor.com/api/tracker.html)
- [nx-js/reactivity-util](https://github.com/nx-js/reactivity-util)
- [salesforce/observable-membrane](https://github.com/salesforce/observable-membrane)

## 警告

- 内置对象不回被观察，除了 `Map`, `WeakMap`, `Set` 以及 `WeakSet`.
