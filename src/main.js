function createElement(target, attribute, ...children) {
  const e = document.createElement(target)
  for (const key in attribute) {
    e.setAttribute(key, attribute[key])
  }
  for (const child of children) {
    if (typeof child === 'string') {
      e.appendChild(document.createTextNode(child))
    } else {
      e.appendChild(child)
    }
  }
  return e
}

// 因为有jsx plugin，以下代码会转换为createElement的形式
// 注意直接在document直接appendChild,`document.appendChild`是不对的
document.body.appendChild(<div class="outer-div">
  <span>child1</span>
  <span id="inner-span">child2</span>
  <span>child3</span>
</div>)