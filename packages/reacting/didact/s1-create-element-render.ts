// * vanillajs 实现最简单的react app，简单实现react api

/**
 * 创建典型的react元素。
 * create a React element that is an object with type and props。
 * children一直都会是数组，默认值是空数组。
 */
function createElement(type, props = null, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children?.map((child) =>
        // 若child为react element vdom，则不变；若为文本，则生成文本节点vdom
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

/**
 * 创建文本类型的vdom/react元素。
 * for children item, wrap everything that isn’t an object inside its own element
 * and create a special type for them。
 * 纯文本节点不需要额外的html标签，type仅作为标且不会生成到dom，没有children。
 * React doesn’t wrap primitive values or create empty arrays when there aren’t children,
 * but we do it because it will simplify our code, and for our library we prefer simple code than performant code.
 */
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

/**
 * 递归地依次创建每个vdom对应的dom，然后添加到容器parentDom。
 * 这里只关注创建真实dom的过程，不关注更新。
 * todo 递归创建真实dom在节点很多时存在长时间阻塞的问题。
 * if the browser needs to do high priority stuff like handling user input or
 * keeping an animation smooth, it will have to wait until the render finishes.
 */
function render(element, container: HTMLElement) {
  /** 对当前react元素/vdom，先创建无属性值的初始dom对象 */
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  const isProperty = (key) => key !== 'children';

  // 添加react组件参数代表的属性值到dom对象，文本节点的文字在这里传入
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  // 递归地创建children中的vdom对应的真实dom
  element.props.children.forEach((child) => render(child, dom));

  // 将当前vdom对应的dom添加到parentDom
  container.appendChild(dom);
}

const Didact = {
  createElement,
  render,
};

const element = Didact.createElement(
  'div',
  { color: 'coral', id: 'idForDiv' },
  Didact.createElement('a', { href: '#' }, 'link text'),
  Didact.createElement('h2', null, 's1-create-element-render'),
);
console.log(';;element, ', element);

const container = document.getElementById('root');

// renders the React element into the dom container.
Didact.render(element, container);
