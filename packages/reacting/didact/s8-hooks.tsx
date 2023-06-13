// * 实现useState hook

import * as React from 'react';

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

/** add a `hooks` array prop to the fiber to support calling useState several times in the same component. */
let wipFiber = null;
/**  */
let hookIndex = null;

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

  currentRoot = wipRoot;
  // 每次commit完会清空，setState又会设置
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

/**
 * 拆分同步构建vdom的大任务为可区分优先级的小任务，
 * React doesn’t use `requestIdleCallback` anymore.
 * Now it uses the `scheduler` package. But for this use case it’s conceptually the same.
 */
function workLoop(deadline) {
  // 构建vdom的任务是否该让路
  let shouldYield = false;

  // 🚨 实测浏览器会无限执行此workLoop方法，因为递归，所以
  console.log(';; in-workLoop ', shouldYield, nextUnitOfWork, wipRoot);

  while (nextUnitOfWork && !shouldYield) {
    // 执行完一个任务就返回下一个任务
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 若剩余的空闲时间不足 1 毫秒，应该让出时间；精度可以到5微秒
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    // 若vdom构建已完成

    commitRoot();
  }

  // 允许浏览器打断任务的执行，将vdom构建任务入队
  // 会在main event loop空闲时执行，一般是低优先级的任务
  // ! safari不支持此方法
  // [Using requestIdleCallback - Chrome Developers](https://developer.chrome.com/blog/using-requestidlecallback/#faq)
  // What happens if I set a new idle callback inside of another? The new idle callback
  // will be scheduled to run as soon as possible, starting from the next frame (rather than the current one).
  // 对于内层嵌套，浏览器会放在下一祯执行
  requestIdleCallback(workLoop);

  // [How to stop recursive loop with `requestAnimationFrame` - Stack Overflow](https://stackoverflow.com/questions/63964705/how-to-stop-recursive-loop-with-requestanimationframe)
  // 注意对于嵌套的requestIdleCallback(fn)这里fn并不是递归，而是基于event-loop的队列，而不入队而停止
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
  wipFiber = fiber;
  hookIndex = 0;
  // add a hooks array to the fiber to support calling useState several times in the same component.
  wipFiber.hooks = [];

  // 💡 这里会执行hook-useState，获取到最新的state
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

  // 注意这里用的是 !=，会检查null和undefined
  while (index < elements.length || oldFiber) {
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

/**
 * useState()调用时机由浏览器决定
 */
function useState(initialState) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  /** 保存state、queue，queue中存放会更新state的action */
  const hook = {
    state: oldHook ? oldHook.state : initialState,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];

  // 在updateFunctionComponent中执行useState从而执行状态更新
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  /** 👇🏻 只是注册更新事件，由浏览器决定空闲时的执行时间
   */
  const setState = (action) => {
    hook.queue.push(action);

    // 👇🏻 每次setState会触发从根节点全量渲染
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    // wipRoot会作为nextUnitOfWork开始执行
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;

  return [hook.state, setState];
}

const Didact = {
  createElement,
  render,
  useState,
};

function Counter() {
  const [count, setCount] = Didact.useState(1);
  const [count1, setCount1] = Didact.useState(1);

  return (
    <div>
      <button onClick={() => setCount((count) => count - 1)}> - </button>
      <span> {count} </span>
      <button onClick={() => setCount((count) => count + 1)}> + </button>
      <hr />
      <button onClick={() => setCount1((count) => count - 1)}> - </button>
      <span> {count1} </span>
      <button onClick={() => setCount1((count) => count + 1)}> + </button>
    </div>
  );
}
const element = <Counter />;

const container = document.getElementById('root');

Didact.render(element, container);
