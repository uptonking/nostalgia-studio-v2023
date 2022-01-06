import type {
  ProviderHandler,
  ProviderName,
  ProviderType,
  Providers,
} from './types';

function isUndefined(x: any): x is undefined {
  return x === undefined;
}

/** 管理providers对象，当provider更新时会自动执行注册过的事件处理函数 */
export default class ProviderFactory {
  /** 映射表：名称，对应的provider对象 */
  private providers: Map<string, Promise<any>> = new Map();
  /** 映射表：名称，对应的事件处理函数 */
  private subscribers: Map<string, ProviderHandler[]> = new Map();

  /** 创建自身对象，并保存参数中传入的providers */
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

  /** 保存name和provider到映射表，再执行name对应的所有注册过的事件处理函数；
   * 若provider为undefined，则会从映射表中删除name-kv
   */
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

    // 执行cb
    this.notifyUpdated(name, provider);
  }

  /** 从映射表中删除name-kv，并执行cb */
  removeProvider<T extends string>(name: T | ProviderName): void {
    this.providers.delete(name);
    this.notifyUpdated(name);
  }

  /** 注册name及对应的事件处理函数handler到映射表，并执行一次handler() */
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

  /** 从映射表中删除name对应的事件处理函数之一handler */
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

  /** 从映射表中删除name对应的所有事件处理函数，整个name-kv都删除了 */
  unsubscribeAll<T extends string>(name: T | ProviderName): void {
    const handlers = this.subscribers.get(name);
    if (!handlers) {
      return;
    }

    this.subscribers.delete(name);
  }

  hasProvider<T extends string>(name: T | ProviderName): boolean {
    return this.providers.has(name);
  }

  /** 执行name对应的所有注册过的事件处理函数cb， 并且name和provider都会作为参数传入cb */
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
