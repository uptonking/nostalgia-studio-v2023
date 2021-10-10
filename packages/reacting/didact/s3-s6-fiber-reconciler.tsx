// * 简单实现类似react fiber结构vdom树，并协调vdom的更新，最后统一commit更新dom

import * as React from 'react';

/** one fiber for each react element and each fiber will be a unit of work */
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

/** 创建fiber节点对应的dom对象 */
function createDom(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props);
  return dom;
}

/** 更新dom对象的属性值，包含删除属性；
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

/** commit phase的入口 */
function commitRoot() {
  deletions.forEach(commitWork);

  currentRoot = wipRoot;
  commitWork(wipRoot.child);

  wipRoot = null;
}

/** recursively append all the nodes to the dom.
 * * 递归处理所有fiber的dom节点的添加、删除，这里会导致layout。
 */
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    domParent.appendChild(fiber.dom);
  }
  if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom);
  }
  if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/**
 * 递归地依次创建每个vdom对应的dom，然后添加到容器parentDom。
 * 将根据vdom创建dom的循环计算过程拆分成可暂停分优先级的小任务。
 * 重构后render不再直接触发创建dom，这里只是提供配置信息。
 * 具体的创建dom由 requestIdleCallback 触发执行 workLoop
 * we are going to break the work into small units, and after we finish each unit
 * we’ll let the browser interrupt the rendering if there’s anything else that needs to be done.
 */
function render(element, container: HTMLElement) {
  /** 构建dom树的起点 */
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
 * * 拆分同步构建dom的大任务为可区分优先级的小任务。
 * ! safari不支持requestIdleCallback。
 * React doesn’t use `requestIdleCallback` anymore.
 * Now it uses the `scheduler` package. But for this use case it’s conceptually the same.
 */
function workLoop(deadline) {
  // 构建dom的任务是否该让路
  let shouldYield = false;

  // 任务存在且不需要让路时
  while (nextUnitOfWork && !shouldYield) {
    // 执行构建真实dom
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 若剩余的空闲时间不足 1 毫秒，应该让出时间；精度可以到5微秒
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    // 如果没有下个任务了，就执行commit phase

    console.log(';;workLoop-commitRoot');
    commitRoot();
  }

  // ? 为什么递归执行
  requestIdleCallback(workLoop);
}

// 允许浏览器打断任务的执行，将vdom构建任务入队
// 会在main event loop空闲时执行，一般是低优先级的任务
requestIdleCallback(workLoop);

/**
 * * 只是render phase，会更新vdom，更新后的dom对象已创建但未挂载。
 * 本方法会被workLoop递归执行。
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
  if (!fiber.dom) {
    // 只创建dom对象，并未添加到容器dom
    fiber.dom = createDom(fiber);
  }

  // 若每次都将fiber的dom添加到容器dom，问题是浏览器打断时可能显示不完整的ui
  // 解决方案是移到单独的commitRoot代表的commit phase
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

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

/**
 * * 计算wipFiber节点的children中的要更新的vdom，将children标记为child和sibling。
 * The element is the thing we want to render to the DOM and the oldFiber is what we rendered the last time.
 * todo Here React also uses `key`, that makes a better reconciliation.
 */
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;

  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  // 遍历当前vdom的children，创建fiber
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

    // 当前vdom，第一个child，其他是sibling，方便导航查找nextUnitOfWork
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

const container = document.getElementById('root');

const handleInputChange = (e) => {
  renderer(e.target.value);
};

const renderer = (value) => {
  const element = (
    <div id='jsxTranspile'>
      <input onInput={handleInputChange} value={value} />
      <h2>Hello {value}</h2>
    </div>
  );

  console.log(';;element, ', element);

  Didact.render(element, container);
};

renderer('react小玩具; s3-s6-fiber-reconciler');
