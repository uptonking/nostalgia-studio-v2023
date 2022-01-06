import React from 'react';
import { createPortal } from 'react-dom';

/** 监听器是一个普通函数，无返回值 */
type Listener<T = any> = (data: T) => void;

/** 通过ReactDOM.createPortal()渲染react元素到dom container，
 * 主要是为了支持用react组件作为NodeView。
 * 这里不是标准的react组件，没有继承React.Component.
 */
export class PortalProvider {
  shouldUpdatePortals: boolean = true;

  /** 保存dom元素对象及其对应的子元素ReactNodeView所在的portal，
   * todo 分析下，这个portals对象引用一直不会变化，只是自身内容变化而已，所以能减少rerender
   */
  portals: Map<HTMLElement, React.ReactPortal> = new Map();

  /** 映射表：dom元素，对应的ReactNodeView中的新属性值 */
  pendingUpdatedProps: Map<HTMLElement, any> = new Map();

  /** 事件映射表： dom元素对象，对应的ReactNodeView中要执行的事件处理函数Set集合 */
  nodeViewListeners: Map<HTMLElement, Set<Listener>> = new Map();

  /** 所有NodeView更新完成后要执行的callback */
  portalRendererCallback?: (
    newPortals: Map<HTMLElement, React.ReactPortal>,
  ) => void;

  /** 执行ReactDOM.createPortal()，并保存对应的container dom对象，
   * 注意这里并没有挂载到全局的react tree，只是保存了react元素，实际通过<PortalRenderer />挂载.
   * 这不是React.Component的render()方法，没有return react元素。
   */
  render(component: React.ReactElement<any>, container: HTMLElement) {
    // 这里的component是ReactNode类型，已经是react element了，不是React.Component
    const portalReactElement = createPortal(component, container);
    this.portals.set(container, portalReactElement);
    this.shouldUpdatePortals = true;
  }

  /** 只是放入待更新的映射表，实际实际更新计算发生在flush()方法 */
  update(container: HTMLElement, props: any) {
    this.pendingUpdatedProps.set(container, props);
  }

  remove(container: HTMLElement) {
    this.portals.delete(container);
    this.shouldUpdatePortals = true;
  }

  /** 遍历所有ReactNodeView组件对应的所有事件处理函数并执行，最后强制更新所有NodeView处的react元素
   * todo，降低算法复杂度
   */
  flush() {
    // Array.from(this.pendingUpdatedProps.entries()).map(([container, props]) => {
    Array.from(this.pendingUpdatedProps.entries()).forEach(
      ([container, props]: [HTMLElement, any]) => {
        const set = this.nodeViewListeners.get(container);
        if (set) {
          // 执行所有事件函数，计算新的vdom
          set.forEach((cb) => cb(props));
        }
        this.pendingUpdatedProps.delete(container);
      },
    );

    if (this.portalRendererCallback && this.shouldUpdatePortals) {
      // 强制刷新所有reactNodeView组件，注意性能影响，，，这里才会diff和commit dom元素
      this.portalRendererCallback!(this.portals);
      this.shouldUpdatePortals = false;
    }
  }

  /** 将cb函数加入Set集合 */
  subscribe(container: HTMLElement, cb: (data: any) => void) {
    const set = this.nodeViewListeners.get(container) ?? new Set();
    set.add(cb);
    this.nodeViewListeners.set(container, set);
  }

  unsubscribe(container: HTMLElement, cb: (data: any) => void) {
    const set = this.nodeViewListeners.get(container);
    if (!set) return;
    if (set.has(cb)) {
      set.delete(cb);
    }
    if (set.size === 0) {
      this.nodeViewListeners.delete(container);
    } else {
      this.nodeViewListeners.set(container, set);
    }
  }

  /** 将所有portals传入参数代表的函数，立即刷新PortalRenderer组件及其所有子组件
   */
  addPortalRendererCallback(
    fn: (newPortals: Map<HTMLElement, React.ReactPortal>) => void,
  ) {
    this.portalRendererCallback = fn;
    // Render the portals immediately
    fn(this.portals);
  }
}
