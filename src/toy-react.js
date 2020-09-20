const RENDER_TO_DOM = Symbol("render");

// Component 要放在ElementWrapper和TextWrapper之前，否则继承不到Component实例
export class Component {
  constructor() {
    // Object.create而不是Object.assign
    this.props = Object.create(null);
    this.children = [];
    this._range = null;
  }

  setAttribute(key, value) {
    this.props[key] = value;
  }

  appendChild(child) {
    this.children.push(child);
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this._vdom = this.vdom;
    this._vdom[RENDER_TO_DOM](range);
  }
  update() {

    let isSameNode = (oldNode, newNode) => {
      if (oldNode.type !== newNode.type) return false
      for(let name in newNode.props) {
        if (newNode.props[name] !== oldNode.props[name]) return false
      }
      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) return false
      if (newNode.type === '#text') {
        if (newNode.textNode !== oldNode.textNode) return false
      }

      return true
    }
    let update = (oldNode, newNode) => {
      if (!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range);
        return;
      }

      newNode._range = oldNode._range;
      const oldChildren = oldNode.vchildren;
      const newChildren = newNode.vchildren;

      if (!oldChildren.length || !newChildren.length) return
      let tailRange = oldChildren[oldChildren.length-1]._range;

      for(var i=0;i<newChildren.length;i++) {
        const newChild = newChildren[i];
        const oldChild = oldChildren[i];
        if (i<oldChildren.length) {
          update(oldChild, newChild);
        } else {
          let range = document.createRange();
          range.setStart(tailRange.endContainer, tailRange.endOffSet);
          range.setEnd(tailRange.endContainer, tailRange.endOffSet);
          newChild[RENDER_TO_DOM](range);
          tailRange = range;
        }
      }

    }

    let vdom = this.vdom;
    update(this._vdom, this.vdom);
    this._vdom = vdom;
  }
  // rerender() {
  //   let oldrange = this._range;

  //   let range = document.createRange();
  //   range.setStart(oldrange.startContainer, oldrange.startOffSet);
  //   range.setEnd(oldrange.startContainer, oldrange.startOffSet);
  //   this.render()[RENDER_TO_DOM](range);

  //   oldrange.setStart(range.startContainer, range.endOffset);
  //   oldrange.deleteContents();
  // }
  setState(newState) {
    let merge = (oldState, newState) => {
      for (const key in newState) {
        if (oldState[key] === null || typeof oldState[key] !== "object") {
          oldState[key] = newState[key];
        } else {
          merge(oldState[key], newState[key]);
        }
      }
    };
    merge(this.state, newState);
    this.update();
  }

  get vdom() {
    return this.render().vdom;
  }
}
class ElementWrapper extends Component {
  constructor(tag) {
    super(tag);
    this.type = tag;
  }

  get vdom() {
    this.vchildren = this.children.map(child => child.vdom);
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    let root =  document.createElement(this.type)
    for (let key in this.props) {
      const value = this.props[key];
      if (key.match(/^on([\s\S]+)$/)) {
        root.addEventListener(
          RegExp.$1.replace(/^[\s\S]/, (a) => a.toLowerCase()),
          value
        );
      } else {
        if (key.toLowerCase() === "classname") {
          root.setAttribute("class", value);
        } else {
          root.setAttribute(key, value);
        }
      }
    }

    if (!this.vchildren) {
      this.vchildren = this.children.map(child => child.vdom);
    }

    // 这个地方也需要修改children为vchildren
    for (let child of this.vchildren) {
      let childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);
      child[RENDER_TO_DOM](childRange);
    }

    // root 是局部root
    replaceContent(range, root);
  }
}

class TextNodeWrapper extends Component {
  constructor(textNode) {
    super(textNode);
    this.type = "#text";
    this.textNode = textNode;
    
  }
  [RENDER_TO_DOM](range) {
    this._range = range;
    const root = document.createTextNode(this.textNode);
    replaceContent(range, root);
  }

  get vdom() {
    return this;
  }
}

// 函数，在调用者后面无所谓。空range处理
function replaceContent(range, node) {
  range.insertNode(node);
  range.setStartAfter(node);
  range.deleteContents();

  range.setStartBefore(node);
  range.setEndAfter(node);
}

export function createElement(target, attribute, ...children) {
  let e;
  if (typeof target === "string") {
    e = new ElementWrapper(target);
  } else {
    e = new target();
  }
  for (const key in attribute) {
    e.setAttribute(key, attribute[key]);
  }
  const insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === "string") {
        child = new TextNodeWrapper(child);
      }
      if (child === null) {
        continue;
      }
      if (typeof child === "object" && child instanceof Array) {
        insertChildren(child);
      } else {
        e.appendChild(child);
      }
    }
  };
  insertChildren(children);

  return e;
}

export function render(component, parentElement) {
  let range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}
