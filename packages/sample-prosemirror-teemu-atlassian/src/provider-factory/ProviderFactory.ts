import type {
  ProviderHandler,
  ProviderName,
  ProviderType,
  Providers,
} from './types';

function isUndefined(x: any): x is undefined {
  return x === undefined;
}

/**
 * 典型的事件管理器，使用了pubsub模式。
 * 在provider变化执行setProvider后，会执行所有事件处理函数。
 */
export class ProviderFactory {
  /** 名称，名称对应的provider对象 的集合，映射表，provider一般用作参数传入cb函数 */
  private providers: Map<string, Promise<any>> = new Map();

  /** 映射表：名称，名称对应的事件处理函数的数组 */
  private subscribers: Map<string, ProviderHandler[]> = new Map();

  /** 创建自身ProviderFactory对象的静态方法，只是简单的遍历赋值 */
  static create(
    providers: Providers & { [key: string]: Promise<any> | undefined },
  ): ProviderFactory {
    const providerFactory = new ProviderFactory();

    const keys = Object.keys(providers) as Array<ProviderName>;

    keys.forEach((name) => {
      providerFactory.setProvider(name, providers[name]);
    });

    return providerFactory;
  }

  destroy() {
    this.providers.clear();
    this.subscribers.clear();
  }

  isEmpty(): boolean {
    return !this.providers.size && !this.subscribers.size;
  }

  hasProvider<T extends string>(name: T | ProviderName): boolean {
    return this.providers.has(name);
  }

  /** 这里在更新映射表的kv后，还会执行所有cb函数 */
  setProvider<T extends string>(name: T, provider?: ProviderType<T>): void {
    // Do not trigger notifyUpdate if provider is the same.
    if (this.providers.get(name) === provider) {
      return;
    }

    if (!isUndefined(provider)) {
      this.providers.set(name, provider);
    } else {
      this.providers.delete(name);
    }

    // 执行所有cb
    this.notifyUpdated(name, provider);
  }

  removeProvider<T extends string>(name: T | ProviderName): void {
    this.providers.delete(name);
    this.notifyUpdated(name);
  }

  /** 注册事件处理函数handler到this.subscribers映射表，再立即执行一次handler() */
  subscribe<T extends string>(
    name: T,
    handler: ProviderHandler<typeof name>,
  ): void {
    const handlers = this.subscribers.get(name) || [];
    handlers.push(handler);

    this.subscribers.set(name, handlers);

    const provider = this.providers.get(name);

    if (provider) {
      handler(name as T, provider as ProviderType<T>);
    }
  }

  /** 从this.subscribers映射表删除事件处理函数handler */
  unsubscribe<T extends string>(
    name: T,
    handler: ProviderHandler<typeof name>,
  ): void {
    const handlers = this.subscribers.get(name);
    if (!handlers) {
      return;
    }

    const index = handlers.indexOf(handler);

    if (index !== -1) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      this.subscribers.delete(name);
    } else {
      this.subscribers.set(name, handlers);
    }
  }

  unsubscribeAll<T extends string>(name: T | ProviderName): void {
    const handlers = this.subscribers.get(name);
    if (!handlers) {
      return;
    }

    this.subscribers.delete(name);
  }

  /** 执行name对应的所有事件处理函数，传入name,provider作为参数 */
  notifyUpdated<T extends string>(
    name: T,
    provider?: ProviderType<typeof name>,
  ): void {
    const handlers = this.subscribers.get(name);
    if (!handlers) {
      return;
    }

    handlers.forEach((handler) => {
      handler(name, provider);
    });
  }
}
