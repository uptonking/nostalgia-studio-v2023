import PropTypes from 'prop-types';
import * as React from 'react';
import {
  createPortal,
  unmountComponentAtNode,
  unstable_renderSubtreeIntoContainer,
} from 'react-dom';

import { EventDispatcher } from '../../event-dispatcher';
import type { FireAnalyticsCallback } from '../../plugins/analytics/fire-analytics-event';

// import {
//   ACTION,
//   ACTION_SUBJECT,
//   ACTION_SUBJECT_ID,
//   EVENT_TYPE,
// } from '../../plugins/analytics/types/enums';
// import { default as AnalyticsReactContext } from '@atlaskit/analytics-next-stable-react-context';

export type PortalProviderProps = {
  render: (
    portalProviderAPI: PortalProviderAPI,
  ) => React.ReactChild | JSX.Element | null;
  // onAnalyticsEvent?: FireAnalyticsCallback;
  onAnalyticsEvent?: any;
  useAnalyticsContext?: boolean;
};

export type Portals = Map<HTMLElement, React.ReactChild>;

export type PortalRendererState = {
  portals: Portals;
};

type MountedPortal = {
  children: () => React.ReactChild | null;
  hasReactContext: boolean;
};

/** 事件管理器的子类，非react组件，通过ReactDOM.unstable_renderSubtreeIntoContainer渲染react元素。
 * 因为不是react组件，所有没有使用react context，不要被名称迷惑。
 */
export class PortalProviderAPI extends EventDispatcher {
  /** 映射表：dom对象，对应的portal元素 */
  portals: Map<HTMLElement, MountedPortal> = new Map();
  /** 保存PortalRenderer对象 */
  context: any;

  onAnalyticsEvent?: FireAnalyticsCallback;
  useAnalyticsContext?: boolean;

  constructor(
    onAnalyticsEvent?: FireAnalyticsCallback,
    analyticsContext?: boolean,
  ) {
    super();
    this.onAnalyticsEvent = onAnalyticsEvent;
    this.useAnalyticsContext = analyticsContext;
  }

  /** 简单地将参数赋值到实例变量 */
  setContext = (context: any) => {
    this.context = context;
  };

  /**
   * 不是react组件，所以是自定义render方法；
   * 通过ReactDOM.unstable_renderSubtreeIntoContainer渲染react元素；
   * @param children 待渲染的react元素，工厂方法
   * @param container portal渲染到的目标dom
   * @param hasReactContext 参数默认值false
   */
  render(
    children: () => React.ReactChild | JSX.Element | null,
    container: HTMLElement,
    hasReactContext: boolean = false,
  ) {
    this.portals.set(container, { children, hasReactContext });

    // const wrappedChildren = this.useAnalyticsContext ? (
    //   <AnalyticsContextWrapper>{children()}</AnalyticsContextWrapper>
    // ) : (
    //   (children() as JSX.Element)
    // );
    // 计算出react element
    const wrappedChildren = children() as JSX.Element;

    // 参数与createPortal不同，依次是 父组件、当前组件、domContainer，返回值也不同
    unstable_renderSubtreeIntoContainer(
      this.context,
      wrappedChildren,
      container,
    );
  }

  /**
   * TODO: until https://product-fabric.atlassian.net/browse/ED-5013.
   * we (unfortunately) need to re-render to pass down any updated context.
   * selectively do this for nodeviews that opt-in via `hasReactContext`.
   * 强制重新计算children()，再执行ReactDOM.unstable_renderSubtreeIntoContainer，
   * 会触发更新portals中的所有react元素。
   */
  forceUpdate() {
    this.portals.forEach((portal, container) => {
      if (!portal.hasReactContext && !this.useAnalyticsContext) {
        return;
      }

      // const wrappedChildren = this.useAnalyticsContext ? (
      //   <AnalyticsContextWrapper>{portal.children()}</AnalyticsContextWrapper>
      // ) : (
      //   (portal.children() as JSX.Element)
      // );

      // /若使用了react context

      const wrappedChildren = portal.children() as JSX.Element;

      unstable_renderSubtreeIntoContainer(
        this.context,
        wrappedChildren,
        container,
      );
    });
  }

  /** 从映射表中删除kv */
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
      // if (this.onAnalyticsEvent) {
      //   this.onAnalyticsEvent({
      //     payload: {
      //       action: ACTION.FAILED_TO_UNMOUNT,
      //       actionSubject: ACTION_SUBJECT.EDITOR,
      //       actionSubjectId: ACTION_SUBJECT_ID.REACT_NODE_VIEW,
      //       attributes: {
      //         error,
      //         domNodes: {
      //           container: container ? container.className : undefined,
      //           child: container.firstElementChild
      //             ? container.firstElementChild.className
      //             : undefined,
      //         },
      //       },
      //       eventType: EVENT_TYPE.OPERATIONAL,
      //     },
      //   });
      // }
    }
  }
}

/** 基于render props定义的普通react组件，this.portalProviderAPI作为数据，会传给render组件渲染。
 * 主要逻辑都由PortalProviderAPI实现。
 * componentDidUpdate中会调用this.portalProviderAPI.forceUpdate();
 */
export class PortalProvider extends React.Component<PortalProviderProps> {
  static displayName = 'PortalProvider';

  portalProviderAPI: PortalProviderAPI;

  constructor(props: PortalProviderProps) {
    super(props);
    this.portalProviderAPI = new PortalProviderAPI(
      props.onAnalyticsEvent,
      props.useAnalyticsContext,
    );
  }

  componentDidUpdate() {
    // 每次rerender后，都会更新portal中所有react元素
    this.portalProviderAPI.forceUpdate();
  }

  render() {
    return this.props.render(this.portalProviderAPI);
  }
}

/** 本组件自身是一个普通react组件(注意返回值)，基于ReactDOM.createPortal渲染react元素。
 * 还将包含自身setState的更新方法注册到了portalProviderAPI，允许被更新。
 * 调用setState会触发本组件更新，但注册后从未被执行。
 * 所以PortalRenderer组件起到的作用仅仅是挂载到vdom tree中占个位置。
 */
export class PortalRenderer extends React.Component<
  { portalProviderAPI: PortalProviderAPI },
  PortalRendererState
> {
  constructor(props: { portalProviderAPI: PortalProviderAPI }) {
    super(props);
    props.portalProviderAPI.setContext(this);

    // 将更新本组件的方法暴露出去，但注册后从未被调用，所以this.state.portals一直为空
    props.portalProviderAPI.on('update', this.handleUpdate);
    this.state = { portals: new Map() };
  }

  /** 更新本组件，会更新portal中所有react元素 */
  handleUpdate = (portals: Portals) => this.setState({ portals });

  render() {
    const { portals } = this.state;
    console.log(';; /PortalRenderer.state.portals, ', this.state.portals);

    return portals.size > 0 ? (
      <>
        {Array.from(portals.entries()).map(([container, children]) =>
          createPortal(children, container),
        )}
      </>
    ) : null;
  }
}

/**
 * Wrapper to re-provide modern analytics context to ReactNodeViews.
 */
const dummyAnalyticsContext = {
  getAtlaskitAnalyticsContext() {},
  getAtlaskitAnalyticsEventHandlers() {},
};

// class AnalyticsContextWrapper extends React.Component<any> {
//   static contextTypes = {
//     contextAdapter: PropTypes.object,
//   };

//   analytics = this.context.contextAdapter.analytics || {
//     value: dummyAnalyticsContext,
//   };

//   render() {

//     return (
//       <AnalyticsReactContext.Provider value={this.analytics.value}>
//         {this.props.children}
//       </AnalyticsReactContext.Provider>
//     );
//   }
// }
