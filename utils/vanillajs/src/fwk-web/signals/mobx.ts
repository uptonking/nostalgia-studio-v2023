/** 表示当前的 autorun 中的 handler 方法 */
let currentFn = null;
/** 记录一个计数器值作为每个 observable 属性的 id 值进行和 currentFn 进行绑定 */
let counter = 0;

class Reaction {
  /** 每次对 observable 属性进行 Proxy 的时候，对 Proxy 进行标记 */
  id: number;
  /** 存储当前可观察对象的nowFn, { id: [currentFn] } */
  store: object;

  constructor() {
    this.id = ++counter;
    this.store = {};
  }

  /** 依赖搜集 */
  collect() {
    if (currentFn) {
      // 只在当前有autorun绑定了相关属性观察后才会进行绑定
      this.store[this.id] = this.store[this.id] || [];
      this.store[this.id].push(currentFn);
    }
  }

  /** 运行依赖函数 */
  run() {
    if (this.store[this.id]) {
      this.store[this.id].forEach((fn) => fn());
    }
  }

  static start(handler) {
    currentFn = handler;
  }

  static end() {
    currentFn = null;
  }
}

function deepProxy(val, handler) {
  if (typeof val !== 'object') return val;

  // for (const key in val) {
  //   // 从后往前依次实现代理的功能，相当于是后序遍历
  //   val[key] = deepProxy(val[key], handler)
  // }
  for (const [k, v] of Object.entries(val)) {
    val[k] = deepProxy(v, handler);
  }

  // 👇🏻 注意构造函数中的参数是handler()的返回值，而不是handler函数
  return new Proxy(val, handler());
}

function makeObservable(val) {
  const handler = () => {
    const reaction = new Reaction();

    return {
      get(target, key) {
        reaction.collect();
        return Reflect.get(target, key);
      },
      set(target, key, value) {
        // 对于数组的值设置处理: 当对数组进行观察监听时，由于对数组的操作会有两步执行:
        // 更新数组元素值
        // 更改数组的length属性，所以需要将更改length属性的操作给拦截，避免一次操作数组，多次触发handler
        if (key === 'length') return true;
        const res = Reflect.set(target, key, value);
        reaction.run();
        return res;
      },
    };
  };

  return deepProxy(val, handler);
}

function observable(target, key?: string, descriptor?: any) {
  if (typeof key === 'string') {
    // 装饰器写法：先把装饰的对象进行深度代理
    let v = descriptor.initializer();
    v = makeObservable(v);
    const reaction = new Reaction();
    return {
      enumerable: true,
      configurable: true,
      get() {
        reaction.collect();
        return v;
      },
      set(value) {
        v = value;
        reaction.run();
      },
    };
  }

  return makeObservable(target);
}

function autorun(handler) {
  Reaction.start(handler);
  handler();
  Reaction.end();
}

const obj = observable({
  name: 'jacky',
  age: 22,
});

// autorun方法这个回调函数会在初始化的时候被执行一次，之后每次内部相关的observable中的依赖发生变动时被再次调用
autorun(() => {
  console.log('autorun', obj.name, obj.age);
});

obj.name = 'xxx';
obj.age = 44;
