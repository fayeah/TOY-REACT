node version: v12.4.0

- package.json文件中'main'是nodejs的入口文件；
- 注意browser中babel的虚拟文件；
- 打包之后想要在browser中看，在dis目录下创建一个html文件，然后引入main.js


### 为什么需要range
因为root不能满足state更新而重新触发dom渲染的需要；

tic tac toe 链接：
https://codepen.io/gaearon/pen/gWWZgR

### 实dom实现React之后，发现每次点击都是root级别的更新，消耗实极大的，后面引入虚拟dom。
