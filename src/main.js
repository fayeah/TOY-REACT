// createElement虽然在这个文件么有显示的被需要，但是在编译之后plugin-transform-react-jsx插件会将jsx转换为以createElement的函数来对dom进行渲染。
import {createElement, Component, render} from './toy-react';
class MyComponent extends Component{
  constructor() {
    super();
    this.state = {
      a: 1
    }
  }
  render() {
    // 需要return，否则Component的getRoot里面的render值为udnefined
    return <div>
      <button onClick={() => {this.state.a++;this.rerender()}}>click</button>
      {this.state.a.toString()}
    </div>
  }
}

render(<MyComponent class="outer-div">
<span>child1</span>
<span id="inner-span">child2</span>
<span>child3</span>
</MyComponent>, document.body)