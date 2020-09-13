import {createElement, Component, render} from './toy-react';
class MyComponent extends Component{
  render() {
    // 需要return，否则Component的getRoot里面的render值为udnefined
    return <div>
      <h1>My Component</h1>
      {this.children}
    </div>
  }
}

render(<MyComponent class="outer-div">
<span>child1</span>
<span id="inner-span">child2</span>
<span>child3</span>
</MyComponent>, document.body)