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
    this.render()[RENDER_TO_DOM](range);
  }
  rerender() {
    let oldrange = this._range;

    let range = document.createRange();
    range.setStart(oldrange.startContainer, oldrange.startOffSet);
    range.setEnd(oldrange.startContainer, oldrange.startOffSet);
    this.render()[RENDER_TO_DOM](range);

    oldrange.setStart(range.startContainer, range.endOffset);
    oldrange.deleteContents();
  }
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
    this.rerender();
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
    return this;
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
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

    for (let child of this.children) {
      let childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);
      child[RENDER_TO_DOM](childRange);
    }

    // root 是局部root
    range.insertNode(root);
  }
}

class TextNodeWrapper extends Component {
  constructor(textNode) {
    super(textNode);
    this.type = "#text";
    this.textNode = textNode;
    this.root = document.createTextNode(textNode);
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }

  get vdom() {
    return this;
  }
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
