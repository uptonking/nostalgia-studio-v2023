// * 与s1-示例相同，只是react app示例使用jsx，而不是直接调用createElement()

import * as React from 'react';

function createElement(type, props = null, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element, container: HTMLElement) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  const isProperty = (key) => key !== 'children';

  // 添加自定义属性值到dom元素，文本节点的文字在这里传入
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  // 递归处理children中的react元素
  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

const Didact = {
  createElement,
  render,
};

const element = (
  <div id='jsxTranspile'>
    <h1>didact jsx 使用babel转译</h1>
    <ul>
      <li>✅️ support HostComponent</li>
      <li>❌️ no support for FunctionComponent</li>
    </ul>
  </div>
);
console.log(';;element, ', element);

const container = document.getElementById('root');

Didact.render(element, container);
