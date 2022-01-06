import PropTypes from 'prop-types';
import { PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React from 'react';

import { EditorActions } from '../../EditorActions';
import { EditorConfig } from '../../types';
import { EventDispatcher } from '../../utils/event-dispatcher';

export type PluginsConfig = { [name: string]: PluginKey };
export type Context = {
  editorActions?: EditorActions;
  editorConfig?: EditorConfig;
};

export interface Props {
  eventDispatcher?: EventDispatcher;
  editorView?: EditorView;
  /** 要观察的插件映射表集合 */
  plugins: PluginsConfig;
  render: (pluginsState: any) => React.ReactElement<any> | null;
}

export interface State {
  [name: string]: any;
}

/**
 * 基于render props实现的react组件，最终返回 this.props.render(this.state)。
 *
 * Wraps component in a high order component that watches state changes of given plugins
 * and passes those states to the wrapped component.
 *
 * Example:
 * <WithPluginState
 *   eventDispatcher={eventDispatcher}
 *   editorView={editorView}
 *   plugins={{
 *     hyperlink: hyperlinkPluginKey
 *   }}
 *   render={renderComponent}
 * />
 *
 * renderComponent: ({ hyperlink }) => React.Component;
 */
export default class WithPluginState extends React.Component<Props, State> {
  static displayName = 'WithPluginState';

  /** 事件映射表： pm-plugin,plugin.state变化时要执行的函数，会执行本组件的setState */
  private listeners = {};

  private debounce: number | null = null;
  private notAppliedState = {};
  private isSubscribed = false;

  static contextTypes = {
    editorActions: PropTypes.object,
    editorConfig: PropTypes.object,
  };

  /** 插件名,插件状态 构成的映射表 */
  state: State = {};
  context!: Context;

  constructor(props: Props, context: Context) {
    super(props);
    // 计算所有要观察的plugins的state集合
    this.state = this.getPluginsStates(
      props.plugins,
      this.getEditorView(props, context),
    );
  }

  componentDidMount() {
    // 注册state变化的监听器函数
    this.subscribe(this.props);
    // 注册EditorContext的value变化时的监听器函数，会将this.subscribe()注册到editorActions的映射表
    this.subscribeToContextUpdates(this.context);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (!this.isSubscribed) {
      this.subscribe(nextProps);
    }
  }

  componentWillUnmount() {
    if (this.debounce) {
      window.clearTimeout(this.debounce);
    }
    this.unsubscribeFromContextUpdates(this.context);
    this.unsubscribe();
  }

  private getEditorView(
    maybeProps?: Props,
    maybeContext?: Context,
  ): EditorView | undefined {
    const props = maybeProps || this.props;
    const context = maybeContext || this.context;
    return (
      props.editorView ||
      (context &&
        context.editorActions &&
        context.editorActions._privateGetEditorView())
    );
  }

  private getEventDispatcher(maybeProps?: Props): EventDispatcher | undefined {
    const props = maybeProps || this.props;
    return (
      props.eventDispatcher ||
      (this.context &&
        this.context.editorActions &&
        this.context.editorActions._privateGetEventDispatcher())
    );
  }

  /** 高阶函数，当一个插件的状态发生变化时，调用setState更新状态，从而触发本组件rerender */
  private handlePluginStateChange =
    (propName: string, pluginName: string, skipEqualityCheck?: boolean) =>
    (pluginState: any) => {
      // skipEqualityCheck is being used for old plugins since they are mutating plugin state instead of creating a new one
      if ((this.state as any)[propName] !== pluginState || skipEqualityCheck) {
        this.updateState({
          stateSubset: { [propName]: pluginState },
          pluginName,
        });
      }
    };

  /**
   * 调用setState。
   * Debounces setState calls in order to reduce number of re-renders caused by several plugin state changes.
   */
  private updateState = ({
    stateSubset,
    pluginName,
  }: {
    stateSubset: State;
    pluginName: string;
  }) => {
    this.notAppliedState = { ...this.notAppliedState, ...stateSubset };

    if (this.debounce) {
      window.clearTimeout(this.debounce);
    }

    this.debounce = window.setTimeout(() => {
      this.setState(this.notAppliedState);
      this.debounce = null;
      this.notAppliedState = {};
    }, 0);
  };

  /** 从editorView中计算指定plugins的state值构成的映射表 */
  private getPluginsStates(
    plugins: { [name: string]: PluginKey },
    editorView?: EditorView,
  ) {
    if (!editorView || !plugins) {
      return {};
    }

    return Object.keys(plugins).reduce<Record<string, any>>((acc, propName) => {
      const pluginKey = plugins[propName];
      if (!pluginKey) {
        return acc;
      }
      acc[propName] = pluginKey.getState(editorView.state);
      return acc;
    }, {});
  }

  /** 注册props.plugins中插件状态变化的事件处理函数 */
  private subscribe(props: Props): void {
    const plugins = props.plugins;
    const eventDispatcher = this.getEventDispatcher(props);
    const editorView = this.getEditorView(props);

    if (!eventDispatcher || !editorView || this.isSubscribed) {
      return;
    }

    this.isSubscribed = true;

    // 计算props中指定所有插件的最新states
    const pluginsStates = this.getPluginsStates(plugins, editorView);

    // rerender一次
    this.setState(pluginsStates);

    // 遍历要观察的插件，注册监听函数，当插件状态变化时，触发setState更新本组件
    Object.keys(plugins).forEach((propName) => {
      const pluginKey = plugins[propName];
      if (!pluginKey) {
        return;
      }

      const pluginName = (pluginKey as any).key;
      const pluginState = (pluginsStates as any)[propName];
      const isPluginWithSubscribe = pluginState && pluginState.subscribe;

      // 获取一个方法，若当前pluginstate发生变化，就可以调用setState
      const handler = this.handlePluginStateChange(
        propName,
        pluginName,
        isPluginWithSubscribe,
      );

      if (isPluginWithSubscribe) {
        // 将本组件的setState方法注册到pluginState
        pluginState.subscribe(handler);
      } else {
        eventDispatcher.on((pluginKey as any).key, handler);
      }

      // 将当前监听器也保存到本组件的实例变量
      (this.listeners as any)[(pluginKey as any).key] = { handler, pluginKey };
    });
  }

  private unsubscribe() {
    const eventDispatcher = this.getEventDispatcher();
    const editorView = this.getEditorView();

    if (!eventDispatcher || !editorView || !this.isSubscribed) {
      return;
    }

    Object.keys(this.listeners).forEach((key) => {
      const pluginState = (this.listeners as any)[key].pluginKey.getState(
        editorView.state,
      );

      if (pluginState && pluginState.unsubscribe) {
        pluginState.unsubscribe((this.listeners as any)[key].handler);
      } else {
        eventDispatcher.off(key, (this.listeners as any)[key].handler);
      }
    });

    this.listeners = [];
  }

  /** 当EditorContext的value变化时，执行一次注册 this.subscribe(this.props); */
  private onContextUpdate = () => {
    this.subscribe(this.props);
  };

  /** 先执行一次回调函数，再注册 */
  private subscribeToContextUpdates(context?: Context) {
    if (context && context.editorActions) {
      context.editorActions._privateSubscribe(this.onContextUpdate);
    }
  }

  private unsubscribeFromContextUpdates(context?: Context) {
    if (context && context.editorActions) {
      context.editorActions._privateUnsubscribe(this.onContextUpdate);
    }
  }

  render() {
    const { render } = this.props;
    return render(this.state);
  }
}
