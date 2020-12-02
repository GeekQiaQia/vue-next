/*
Run Rollup in watch mode for development.

To specific the package to watch, simply pass its name and the desired build
formats to watch (defaults to "global"):

```
# name supports fuzzy match. will watch all packages with name containing "dom"
yarn dev dom

# specify the format to output
yarn dev core --formats cjs

# Can also drop all __DEV__ blocks with:
__DEV__=false yarn dev
```
*/

const execa = require('execa') // 异步执行函数；
const { fuzzyMatchTarget } = require('./utils') // 模糊匹配目标参数；
const args = require('minimist')(process.argv.slice(2)) //  命令行工具参数；
const target = args._.length ? fuzzyMatchTarget(args._)[0] : 'vue' // 没有名字的参数 _ ;  判断packages 中参数是否是包名；比如package.json size 命令；
const formats = args.formats || args.f
const sourceMap = args.sourcemap || args.s
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)
// 执行rollup 以及相关配置； 环境(最终传递给rollup) 、git  、输出 、 格式、

execa(
  'rollup',
  [
    '-wc',
    '--environment',
    [
      `COMMIT:${commit}`,
      `TARGET:${target}`,
      `FORMATS:${formats || 'global'}`,
      sourceMap ? `SOURCE_MAP:true` : ``
    ]
      .filter(Boolean)
      .join(',')
  ],
  {
    stdio: 'inherit'
  }
)
