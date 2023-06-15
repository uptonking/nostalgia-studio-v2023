import React from 'react';

const reactionsMap = {};

let currentFn: Function | null = null;

let counter = 0;

const handler = {
  get(target, key) {
    // if (!currentFn) {
    //   return target[key];
    // }

    if (!reactionsMap[key]) {
      reactionsMap[key] = [currentFn];
    }
    const hasComponent = reactionsMap[key].find(
      (c) => c.id === currentFn?.['id'],
    );

    if (!hasComponent) {
      // 保存react组件和它访问过的属性值的映射
      reactionsMap[key].push(currentFn);
    }

    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    reactionsMap[key].forEach((c) => c.forceUpdate());
    return true;
  },
};

export function createStore(object) {
  return new Proxy(object, handler);
}

export function view(MyComponent) {
  return class Observer extends MyComponent {
    id = counter++;

    render() {
      // @ts-expect-error fix-types
      currentFn = this;
      const renderValue = super.render();
      currentFn = null;
      return renderValue;
    }
  };
}

const state = createStore({ text: 'Hello World!' });

class Hello extends React.Component {
  render() {
    return React.createElement('div', {}, state.text);
  }
}
