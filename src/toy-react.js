const RENDER_TO_DOM = Symbol('render');
class ElementWrapper {
  constructor(tag) {
    this.root = document.createElement(tag)
  }
  setAttribute(key, value) {
    this.root.setAttribute(key, value)
  }
  appendChild(child) {
    let range = document.createRange();
    range.setStart(this.root, this.root.childNodes.length);
    range.setEnd(this.root, this.root.childNodes.length);
    child[RENDER_TO_DOM](range);
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextNodeWrapper{
  constructor(textNode) {
    this.root = document.createTextNode(textNode)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export function createElement(target, attribute, ...children) {
  let e;
  if (typeof target === 'string') {
    e = new ElementWrapper(target)
  } else {
    e = new target()
  }
  for (const key in attribute) {
    e.setAttribute(key, attribute[key])
  }
  const insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === 'string') {
        child = new TextNodeWrapper(child)
      } 
      if (typeof child === 'object' && child instanceof Array) {
        insertChildren(child)
      } else {
        e.appendChild(child)
      }
    }
  }
  insertChildren(children)
  
  return e
}

export class Component {
  constructor() {
    // Object.create而不是Object.assign
    this.props = Object.create(null)
    this.children = []
    this._root = null
  }

  setAttribute(key, value) {
    this.props[key] = value
  }

  appendChild(child) {
    this.children.push(child)
  }

  [RENDER_TO_DOM](range) {
    this.render()[RENDER_TO_DOM](range);
  }
}

export function render(component, parentElement) {
  let range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}