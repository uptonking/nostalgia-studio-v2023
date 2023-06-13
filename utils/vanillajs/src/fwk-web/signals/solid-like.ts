// [从 Signals 看响应式状态管理 - 掘金](https://juejin.cn/post/7148001367947214856)
// [Building a Reactive Library from Scratch - DEV Community](https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p)
// 不到 100 行的代码就能实现一个基础的细粒度更新的状态管理（当然我们这里用的是方法去取值，也可以用 proxy 等方式，例如 valtio 等

/** 包含effect中的方法及其依赖 */
// @ts-expect-error fix-types
const context = [];

const createSignal = (value?: any) => {
  const subscriptions = new Set();

  const read = () => {
    const running = context.pop();
    if (running) {
      // @ts-expect-error fix-types
      subscriptions.add({ execute: running.execute });
      // @ts-expect-error fix-types
      running.deps.add(subscriptions);
    }
    return value;
  };

  const write = (v) => {
    value = v;
    for (const sub of [...subscriptions]) {
      // @ts-expect-error fix-types
      sub.execute();
    }
  };

  return [read, write];
};

const createEffect = (fn) => {
  // @ts-expect-error fix-types
  const running = { execute, deps: new Set() };

  const execute = () => {
    running.deps.clear();
    // @ts-expect-error fix-types
    context.push(running);

    fn();
    // @ts-expect-error fix-types
    context.pop(running);
  };

  execute();
};

const createMemo = (fn) => {
  const [memo, setMemo] = createSignal();
  createEffect(() => setMemo(fn()));
  return memo;
};

// @ts-expect-error fix-types
const [name, setName] = createSignal('a');
// @ts-expect-error fix-types
createEffect(() => console.log(name()));
setName('b');
