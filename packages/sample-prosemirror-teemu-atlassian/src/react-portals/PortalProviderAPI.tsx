import React from 'react';
import {
  createPortal,
  unmountComponentAtNode,
  unstable_renderSubtreeIntoContainer,
} from 'react-dom';

import { EventDispatcher } from '../utils/event-dispatcher';

type MountedPortal = {
  children: () => React.ReactChild | null;
  hasReactContext: boolean;
};

/** 通过ReactDOM.unstable_renderSubtreeIntoContainer渲染react组件 */
export class PortalProviderAPI extends EventDispatcher {
  /** 保存dom对象和其中包含的portal元素 */
  portals: Map<HTMLElement, MountedPortal> = new Map();
  /** 保存PortalRenderer对象 */
  context: React.Component;

  setContext = (contextRendererComp: React.Component) => {
    this.context = contextRendererComp;
  };

  /** 注意这里~~并没有挂载到全局的react tree~~，只是保存了react元素，实际通过`<PortalRenderer />`挂载，
   * todo ？？？还是已经挂载了
   */
  render(
    children: () => React.ReactChild | JSX.Element | null,
    container: HTMLElement,
    hasReactContext: boolean = false,
  ) {
    this.portals.set(container, { children, hasReactContext });

    // 计算出react element
    const wrappedChildren = children() as JSX.Element;

    // 参数与createPortal不同，依次是 父组件、当前组件、domContainer，返回值也不同
    unstable_renderSubtreeIntoContainer(
      this.context,
      wrappedChildren,
      container,
    );
  }

  // TODO: until https://product-fabric.atlassian.net/browse/ED-5013
  // we (unfortunately) need to re-render to pass down any updated context.
  // selectively do this for nodeviews that opt-in via `hasReactContext`
  /**
   * 覆盖react组件的forceUpdate()，会更新所有portal中的react元素
   */
  forceUpdate() {
    this.portals.forEach((portal, container) => {
      if (!portal.hasReactContext) {
        return;
      }

      // /若使用了react context

      const wrappedChildren = portal.children() as JSX.Element;

      unstable_renderSubtreeIntoContainer(
        this.context,
        wrappedChildren,
        container,
      );
    });
  }

  remove(container: HTMLElement) {
    this.portals.delete(container);

    // There is a race condition that can happen caused by Prosemirror vs React,
    // where Prosemirror removes the container from the DOM before React gets
    // around to removing the child from the container
    // This will throw a NotFoundError: The node to be removed is not a child of this node
    // Both Prosemirror and React remove the elements asynchronously, and in edge
    // cases Prosemirror beats React
    try {
      unmountComponentAtNode(container);
    } catch (error) {
      console.warn(
        'Race condition in PortalProviderAPI where PM removed DOM node before React unmounted it',
      );
    }
  }
}
