class ElementWrapper {
  constructor(tag) {
    this.root = document.createElement(tag)
  }
  setAttribute(key, value) {
    this.root.setAttribute(key, value)
  }
  appendChild(child) {
    // 此时不论是原生元素还是自定义组件，都是以root来获取element，child也只是一个包含root的对象
    this.root.appendChild(child.root)
  }
}

class TextNodeWrapper{
  constructor(textNode) {
    this.root = document.createTextNode(textNode)
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
  for (const child of children) {
    if (typeof child === 'string') {
      e.appendChild(new TextNodeWrapper(child))
    } else {
      e.appendChild(child)
    }
  }
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

  get root() {
    if (!this._root) {
      this._root = this.render().root
    }
    return this._root
  }
}

export function render(component, parentElement) {
  // 都是拿root为element
  parentElement.appendChild(component.root)
}