// * 在之前支持渲染react element的基础上，支持FunctionComponent，要点是修改区分Host、commit阶段查找dom

// Function components are different in two ways:
// 1. the fiber from a function component doesn’t have a DOM node
// 2. and the children come from running the function instead of getting them directly from the props

import * as React from 'react';

/**
 * create a React element that is an object with type and props.
 * children一直都会是数组，默认值是空数组。
 */
function createElement(type, props = null, ...children) {
  return {
    type,
    props: {
      ...props,

      children: children.map((child) =>
        // 若child为react element vdom，则不变；若为文本，则生成文本节点vdom
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

/**
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

const isEvent = (key) => key.startsWith('on');

/** 检查属性名称，将children和onXxx类的属性排除，符合条件的就是组件的普通属性 */
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
const isFunctionComponent = (fiber) => fiber.type instanceof Function;

function createDom(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props);
  return dom;
}

/** 更新dom属性值，包含删除属性；
 * 特殊处理onXxx形式的事件属性
 */
function updateDom(dom, prevProps, nextProps) {
  // Remove old properties or changed event listeners 移除旧属性
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // Set new or changed properties 更新属性值
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

/** 根据vdom更新dom的入口方法 */
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);

  wipRoot = null;
}

/** recursively append all the nodes to the dom. */
function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  }
  if (fiber.effectTag === 'DELETION') {
    // domParent.removeChild(fiber.dom);
    commitDeletion(fiber, domParent);
  }
  if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/** 递归查找并删除第一个持有真实dom对象的child fiber */
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function render(element, container: HTMLElement) {
  // set nextUnitOfWork to the root of the fiber tree.
  // nextUnitOfWork = {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };

  deletions = [];

  nextUnitOfWork = wipRoot;
}

/** 即将开始执行的vdom构建任务 */
let nextUnitOfWork = null;
/**  save a reference to that “last fiber tree we committed to the DOM”. */
let currentRoot = null;
/** keep track of the root of the fiber tree;
 * 能够获取正在构建的vdom信息，当浏览器打断时可以移除未完成构建的vdom，以免显示出不完整的ui。
 * 不保存oldFiber
 */
let wipRoot = null;
/** 待删除的节点数据 */
let deletions = null;

/**
 * 拆分同步构建vdom的大任务为可区分优先级的小任务，
 * React doesn’t use `requestIdleCallback` anymore.
 * Now it uses the `scheduler` package. But for this use case it’s conceptually the same.
 */
function workLoop(deadline) {
  // 构建vdom的任务是否该让路
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 若剩余的空闲时间不足 1 毫秒，应该让出时间；精度可以到5微秒
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  // 允许浏览器打断任务的执行，将vdom构建任务入队
  // 会在main event loop空闲时执行，一般是低优先级的任务
  // ! safari不支持此方法
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

/**
 * 本方法会被 workLoop 递归执行
 * not only performs the current unit of work, but also returns the next unit of work.
 * To organize the units of work we’ll need a data structure: a fiber tree.
 * We’ll have one fiber for each element and each fiber will be a unit of work.
 * we will do three things for each fiber:
 * 1. add the element to the DOM
 * 2. create the fibers for the element’s children
 * 3. select the next unit of work
 * One of the goals of this data structure is to make it easy to find the next unit of work.
 * That’s why each fiber has a link to its first child, its next sibling and its parent.
 */
function performUnitOfWork(fiber): any {
  if (isFunctionComponent(fiber)) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  // const elements = fiber.props.children;

  // / we search for the next unit of work.
  // / We first try with the child, then with the sibling, then with the uncle, and so on.

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];

  reconcileChildren(fiber, children);
}
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

/**
 * The element is the thing we want to render to the DOM and the oldFiber is what we rendered the last time.
 * todo Here React also uses `key`, that makes a better reconciliation.
 */
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;

  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  while (index < elements.length || oldFiber !== null) {
    const element = elements[index];
    let newFiber = null;

    const isSameType = oldFiber && element && element.type === oldFiber.type;

    if (isSameType) {
      // 若存在新节点且类型相同，则只需更新属性

      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    if (element && !isSameType) {
      // 若存在新节点且类型不同，则创建新节点

      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !isSameType) {
      // 若类型不同，？新节点不存在，则删除旧节点

      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

const Didact = {
  createElement,
  render,
};

function App(props) {
  return <h1>Hello {props.name}</h1>;
}

const element = <App name='世界很大； s7-function-comp' />;

// const element = (
//   <div id='jsxTranspile'>
//     <input />
//     <h2>Hello {value}</h2>
//   </div>
// );

const container = document.getElementById('root');

Didact.render(element, container);
