import PropTypes from 'prop-types';
import applyDevTools from 'prosemirror-dev-tools';
import { Node as PMNode } from 'prosemirror-model';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { DirectEditorProps, EditorView } from 'prosemirror-view';
import * as React from 'react';
import { intlShape } from 'react-intl';

import type { Transformer } from '../../editor-common';
import { ProviderFactory, browser } from '../../editor-common';
import { Dispatch, EventDispatcher, createDispatch } from '../event-dispatcher';
import { createFeatureFlagsFromProps } from '../plugins/feature-flags-context/feature-flags-from-props';
import { getEnabledFeatureFlagKeys } from '../plugins/feature-flags-context/get-enabled-feature-flag-keys';
import type {
  EditorAppearance,
  EditorConfig,
  EditorPlugin,
  EditorProps,
  EditorReactContext,
} from '../types';
import type { FeatureFlags } from '../types/feature-flags';
import { PortalProviderAPI } from '../ui/PortalProvider';
import { processRawValue } from '../utils';
import { countNodes } from '../utils/count-nodes';
import { getNodesCount } from '../utils/document';
import { SimplifiedNode, getDocStructure } from '../utils/document-logger';
import { isFullPage } from '../utils/is-full-page';
import {
  findChangedNodesFromTransaction,
  validNode,
  validateNodes,
} from '../utils/nodes';
import { createPMPlugins, processPluginsList } from './create-editor';
import createPluginList from './create-plugins-list';
import { createSchema } from './create-schema';

// import measurements from '../utils/performance/measure-enum';
// import { PluginPerformanceObserver } from '../utils/performance/plugin-performance-observer';
// import { PluginPerformanceReportData } from '../utils/performance/plugin-performance-report';
// import { TransactionTracker } from '../utils/performance/track-transactions';
// import { FireAnalyticsEventPayload } from '../plugins/analytics/fire-analytics-event';
// import { getContextIdentifier } from '../plugins/base/pm-plugins/context-identifier';
// import { getParticipantsCount } from '../plugins/collab-edit/get-participants-count';
// import { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';

type CreateUIAnalyticsEvent = any;

export interface EditorViewProps {
  editorProps: EditorProps;
  createAnalyticsEvent?: CreateUIAnalyticsEvent;
  providerFactory: ProviderFactory;
  portalProviderAPI: PortalProviderAPI;
  allowAnalyticsGASV3?: boolean;
  disabled?: boolean;
  render?: (props: {
    editor: JSX.Element;
    view?: EditorView;
    config: EditorConfig;
    eventDispatcher: EventDispatcher;
    transformer?: Transformer<string>;
    // dispatchAnalyticsEvent: DispatchAnalyticsEvent;
    dispatchAnalyticsEvent?: any;
  }) => JSX.Element;
  onEditorCreated: (instance: {
    view: EditorView;
    config: EditorConfig;
    eventDispatcher: EventDispatcher;
    transformer?: Transformer<string>;
  }) => void;
  onEditorDestroyed: (instance: {
    view: EditorView;
    config: EditorConfig;
    eventDispatcher: EventDispatcher;
    transformer?: Transformer<string>;
  }) => void;
}

const EMPTY: EditorPlugin[] = [];
export enum FULL_WIDTH_MODE {
  FIXED_WIDTH = 'fixedWidth',
  FULL_WIDTH = 'fullWidth',
}

export function shouldReconfigureState(
  props: EditorProps,
  nextProps: EditorProps,
) {
  const prevPlugins = props.dangerouslyAppendPlugins?.__plugins ?? EMPTY;
  const nextPlugins = nextProps.dangerouslyAppendPlugins?.__plugins ?? EMPTY;

  if (
    nextPlugins.length !== prevPlugins.length ||
    prevPlugins.some((p) =>
      nextPlugins.some((n) => n.name === p.name && n !== p),
    )
  ) {
    return true;
  }

  const properties: Array<keyof EditorProps> = [
    'appearance',
    'persistScrollGutter',
    'UNSAFE_predictableLists',
    'placeholder',
  ];

  return properties.reduce(
    (acc, curr) => acc || props[curr] !== nextProps[curr],
    false,
  );
}

/** 基于render props定义的编辑器组件，pm-EditorView及各种全局配置会作为数据被渲染，
 * 还基于prosemirror-EditorView，
 * 注意本组件没有使用react state，但ref cb里面有调用forceUpdate */
export default class ReactEditorView<T = {}> extends React.Component<
  EditorViewProps & T,
  {},
  EditorReactContext
> {
  /** 保存编辑器对应的prosemirror-EditorView对象 */
  view?: EditorView;
  editorState: EditorState;
  /** 将EditorPlugins的配置计算转换后得到的适合prosemirror使用的各项配置数据 */
  config!: EditorConfig;
  /** 全局事件管理器，会被传递给所有prosemirror-plugins */
  eventDispatcher: EventDispatcher;
  /** !非常重要，能执行全局事件管理器中所有注册过的callback函数 */
  dispatch: Dispatch;

  contentTransformer?: Transformer<string>;
  errorReporter: any;
  proseMirrorRenderedSeverity?: any;
  transactionTracker?: any;
  validTransactionCount?: number;

  static contextTypes = {
    getAtlaskitAnalyticsEventHandlers: PropTypes.func,
    intl: intlShape,
  };

  /** ProseMirror is instantiated prior to the initial React render cycle,
   * so we allow transactions by default, to avoid discarding the initial one.
   */
  private canDispatchTransactions = true;

  private featureFlags: FeatureFlags;
  private focusTimeoutId: number | undefined;
  private pluginPerformanceObserver: any;
  private onPluginObservation = (report: any, editorState: EditorState) => {
    // this.dispatchAnalyticsEvent({
    //   action: ACTION.TRANSACTION_DISPATCHED,
    //   actionSubject: ACTION_SUBJECT.EDITOR,
    //   eventType: EVENT_TYPE.OPERATIONAL,
    //   attributes: {
    //     report,
    //     participants: getParticipantsCount(editorState),
    //   },
    // });
  };

  get transactionTracking() {
    return (
      this.props.editorProps.performanceTracking?.transactionTracking ?? {
        enabled: false,
      }
    );
  }

  private getPluginNames() {
    return this.editorState.plugins.map((p: any) => p.key);
  }

  private countNodes() {
    return countNodes(this.editorState);
  }

  /** 创建 pm-EditorState */
  constructor(props: EditorViewProps & T, context: EditorReactContext) {
    super(props, context);

    this.eventDispatcher = new EventDispatcher();

    this.dispatch = createDispatch(this.eventDispatcher);

    // this.errorReporter = createErrorReporter(
    //   props.editorProps.errorReporterHandler,
    // );

    // this.transactionTracker = new TransactionTracker();
    // this.pluginPerformanceObserver = new PluginPerformanceObserver((report) =>
    //   this.onPluginObservation(report, this.editorState),
    // )
    //   .withPlugins(() => this.getPluginNames())
    //   .withNodeCounts(() => this.countNodes())
    //   .withOptions(() => this.transactionTracking)
    //   .withTransactionTracker(() => this.transactionTracker);
    // this.validTransactionCount = 0;
    this.featureFlags = createFeatureFlagsFromProps(this.props.editorProps);
    const featureFlagsEnabled = this.featureFlags
      ? getEnabledFeatureFlagKeys(this.featureFlags)
      : [];
    // // START TEMPORARY CODE ED-10584
    // if (this.props.createAnalyticsEvent) {
    //   (this.props.createAnalyticsEvent as any).__queueAnalytics =
    //     this.featureFlags.queueAnalytics;
    // }
    // END TEMPORARY CODE ED-10584

    // This needs to be before initialising editorState because
    // we dispatch analytics events in plugin initialisation
    // this.eventDispatcher.on(analyticsEventKey, this.handleAnalyticsEvent);

    // 创建 pm-EditorState
    this.editorState = this.createEditorState({
      props,
      context,
      replaceDoc: true,
    });

    // this.dispatchAnalyticsEvent({
    //   action: ACTION.STARTED,
    //   actionSubject: ACTION_SUBJECT.EDITOR,
    //   attributes: {
    //     platform: PLATFORMS.WEB,
    //     featureFlags: featureFlagsEnabled,
    //   },
    //   eventType: EVENT_TYPE.UI,
    // });
  }

  componentDidMount() {
    // Transaction dispatching is already enabled by default prior to
    // mounting, but we reset it here, just in case the editor view
    // instance is ever recycled (mounted again after unmounting) with
    // the same key.
    // Although storing mounted state is an anti-pattern in React,
    // we do so here so that we can intercept and abort asynchronous
    // ProseMirror transactions when a dismount is imminent.
    this.canDispatchTransactions = true;

    if (this.transactionTracking.enabled) {
      // this.pluginPerformanceObserver.observe();
    }
  }

  /**
   * Clean up any non-PM resources when the editor is unmounted
   */
  componentWillUnmount() {
    // We can ignore any transactions from this point onwards.
    // This serves to avoid potential runtime exceptions which could arise
    // from an async dispatched transaction after it's unmounted.
    this.canDispatchTransactions = false;

    this.eventDispatcher.destroy();

    clearTimeout(this.focusTimeoutId);

    this.pluginPerformanceObserver.disconnect();

    if (this.view) {
      // Destroy the state if the Editor is being unmounted
      const editorState = this.view.state;
      editorState.plugins.forEach((plugin) => {
        const state = plugin.getState(editorState);
        if (state && state.destroy) {
          state.destroy();
        }
      });
    }
    // this.view will be destroyed when React unmounts in handleEditorViewRef

    // this.eventDispatcher.off(analyticsEventKey, this.handleAnalyticsEvent);
  }

  UNSAFE_componentWillReceiveProps(nextProps: EditorViewProps) {
    // START TEMPORARY CODE ED-10584
    if (
      nextProps.createAnalyticsEvent &&
      nextProps.createAnalyticsEvent !== this.props.createAnalyticsEvent
    ) {
      // const featureFlags = createFeatureFlagsFromProps(nextProps.editorProps);
      // (nextProps.createAnalyticsEvent as any).__queueAnalytics =
      //   featureFlags.queueAnalytics;
    }
    // END TEMPORARY CODE ED-10584

    if (
      this.view &&
      this.props.editorProps.disabled !== nextProps.editorProps.disabled
    ) {
      // Disables the contentEditable attribute of the editor if the editor is disabled
      this.view.setProps({
        editable: (_state) => !nextProps.editorProps.disabled,
      } as DirectEditorProps);

      if (
        !nextProps.editorProps.disabled &&
        nextProps.editorProps.shouldFocus
      ) {
        this.focusTimeoutId = handleEditorFocus(this.view);
      }
    }

    const { appearance } = this.props.editorProps;
    const { appearance: nextAppearance } = nextProps.editorProps;

    if (shouldReconfigureState(this.props.editorProps, nextProps.editorProps)) {
      this.reconfigureState(nextProps);
    }

    if (nextAppearance !== appearance) {
      if (nextAppearance === 'full-width' || appearance === 'full-width') {
        // this.dispatchAnalyticsEvent({
        //   action: ACTION.CHANGED_FULL_WIDTH_MODE,
        //   actionSubject: ACTION_SUBJECT.EDITOR,
        //   eventType: EVENT_TYPE.TRACK,
        //   attributes: {
        //     previousMode: this.formatFullWidthAppearance(appearance),
        //     newMode: this.formatFullWidthAppearance(nextAppearance),
        //   },
        // });
      }
    }

    if (!this.transactionTracking.enabled) {
      // this.pluginPerformanceObserver.disconnect();
    }
  }

  formatFullWidthAppearance = (
    appearance: EditorAppearance | undefined,
  ): FULL_WIDTH_MODE => {
    if (appearance === 'full-width') {
      return FULL_WIDTH_MODE.FULL_WIDTH;
    }
    return FULL_WIDTH_MODE.FIXED_WIDTH;
  };

  // #region /folded reconfigureState
  reconfigureState = (props: EditorViewProps) => {
    if (!this.view) {
      return;
    }

    // We cannot currently guarantee when all the portals will have re-rendered during a reconfigure
    // so we blur here to stop ProseMirror from trying to apply selection to detached nodes or
    // nodes that haven't been re-rendered to the document yet.
    if (this.view.dom instanceof HTMLElement && this.view.hasFocus()) {
      this.view.dom.blur();
    }

    this.config = processPluginsList(
      this.getPlugins(
        props.editorProps,
        this.props.editorProps,
        this.props.createAnalyticsEvent,
      ),
    );

    const state = this.editorState;
    const plugins = createPMPlugins({
      schema: state.schema,
      dispatch: this.dispatch,
      errorReporter: this.errorReporter,
      editorConfig: this.config,
      eventDispatcher: this.eventDispatcher,
      providerFactory: props.providerFactory,
      portalProviderAPI: props.portalProviderAPI,
      reactContext: () => this.context,
      dispatchAnalyticsEvent: this.dispatchAnalyticsEvent,
      performanceTracking: props.editorProps.performanceTracking,
      transactionTracker: this.transactionTracker,
      // featureFlags: createFeatureFlagsFromProps(props.editorProps),
      featureFlags: undefined,
    });

    const newState = state.reconfigure({ plugins });

    // need to update the state first so when the view builds the nodeviews it is
    // using the latest plugins
    this.view.updateState(newState);

    return this.view.update({ ...this.view.props, state: newState });
  };
  // #endregion /folded reconfigureState

  handleAnalyticsEvent = (payload: any) => {
    if (!this.props.allowAnalyticsGASV3) {
      return;
    }
    // fireAnalyticsEvent(this.props.createAnalyticsEvent)(payload);
  };

  /** 添加内置的编辑器插件集合。Helper to allow tests to inject plugins directly. */
  getPlugins(
    editorProps: EditorProps,
    prevEditorProps?: EditorProps,
    createAnalyticsEvent?: any,
  ): EditorPlugin[] {
    const editorPlugins = editorProps.dangerouslyAppendPlugins?.__plugins ?? [];

    const builtinPlugins = createPluginList(
      editorProps,
      prevEditorProps,
      createAnalyticsEvent,
    );
    if (editorPlugins && editorPlugins.length > 0) {
      builtinPlugins.push(...editorPlugins);
    }
    return builtinPlugins;
  }

  /** 根据EditorPlugins提供的配置，创建pm-EditorState */
  createEditorState = (options: {
    props: EditorViewProps; // 传给本组件ReactEditorView的props
    context: EditorReactContext;
    replaceDoc?: boolean; // 传入的是true
  }) => {
    if (this.view) {
      /**
       * There's presently a number of issues with changing the schema of a
       * editor inflight. A significant issue is that we lose the ability
       * to keep track of a user's history as the internal plugin state
       * keeps a list of Steps to undo/redo (which are tied to the schema).
       * Without a good way to do work around this, we prevent this for now.
       */
      console.warn('The editor doesnot support changing schema dynamically.');
      return this.editorState;
    }

    // 添加内置支持的编辑器插件，符合ak-EditorPlugin规范的结构
    const editorPlugins = this.getPlugins(
      options.props.editorProps,
      undefined,
      options.props.createAnalyticsEvent,
    );

    // 综合计算各项配置数据，返回prosemirror可用的数据结构
    this.config = processPluginsList(editorPlugins);
    // console.log(';;AkEditorPlugins-config, ', this.config);

    const schema = createSchema(this.config);

    const { contentTransformerProvider, defaultValue } =
      options.props.editorProps;

    // 创建符合prosemirror规范的plugins
    const plugins = createPMPlugins({
      schema,
      dispatch: this.dispatch,
      editorConfig: this.config,
      eventDispatcher: this.eventDispatcher,
      providerFactory: options.props.providerFactory,
      portalProviderAPI: this.props.portalProviderAPI,
      errorReporter: this.errorReporter,
      reactContext: () => options.context,
      dispatchAnalyticsEvent: this.dispatchAnalyticsEvent,
      performanceTracking: this.props.editorProps.performanceTracking,
      transactionTracker: this.transactionTracker,
      featureFlags: this.featureFlags,
    });

    this.contentTransformer = contentTransformerProvider
      ? contentTransformerProvider(schema)
      : undefined;

    let doc;

    if (options.replaceDoc) {
      // /默认为true，会执行这里

      // 将编辑器文档的初始默认值计算出PMNode
      doc = processRawValue(
        schema,
        defaultValue,
        options.props.providerFactory,
        options.props.editorProps.sanitizePrivateContent,
        this.contentTransformer,
        this.dispatchAnalyticsEvent,
      );
    }

    let selection: Selection | undefined;
    if (doc) {
      // ED-4759: Don't set selection at end for full-page editor - should be at start.
      selection = isFullPage(options.props.editorProps.appearance)
        ? Selection.atStart(doc)
        : Selection.atEnd(doc);
    }
    // Workaround for ED-3507: When media node is the last element, scrollIntoView throws an error
    const patchedSelection = selection
      ? Selection.findFrom(selection.$head, -1, true) || undefined
      : undefined;

    console.log(';;EditorState.create() creating');

    return EditorState.create({
      schema,
      plugins,
      doc,
      selection: patchedSelection,
    });
  };

  // #region /folded tracking
  private onEditorViewStateUpdated = ({
    originalTransaction,
    transactions,
    oldEditorState,
    newEditorState,
  }: {
    originalTransaction: Transaction;
    transactions: Transaction[];
    oldEditorState: EditorState;
    newEditorState: EditorState;
  }) => {
    const { enabled: trackingEnabled } = this.transactionTracking;

    // this.config.onEditorViewStateUpdatedCallbacks.forEach((entry) => {
    //   trackingEnabled &&
    //     startMeasure(`🦉 ${entry.pluginName}::onEditorViewStateUpdated`);
    //   entry.callback({
    //     originalTransaction,
    //     transactions,
    //     oldEditorState,
    //     newEditorState,
    //   });
    //   trackingEnabled &&
    //     stopMeasure(`🦉 ${entry.pluginName}::onEditorViewStateUpdated`);
    // });
  };

  private trackValidTransactions = () => {
    const { editorProps } = this.props;
    if (editorProps?.trackValidTransactions) {
      // this.validTransactionCount++;
      // const samplingRate =
      //   (typeof editorProps.trackValidTransactions === 'object' &&
      //     editorProps.trackValidTransactions.samplingRate) ||
      //   DEFAULT_SAMPLING_RATE_VALID_TRANSACTIONS;
      // if (this.validTransactionCount >= samplingRate) {
      //   this.dispatchAnalyticsEvent({
      //     action: ACTION.DISPATCHED_VALID_TRANSACTION,
      //     actionSubject: ACTION_SUBJECT.EDITOR,
      //     eventType: EVENT_TYPE.OPERATIONAL,
      //   });
      //   this.validTransactionCount = 0;
      // }
    }
  };
  // #endregion /folded tracking

  private dispatchingTransaction = (transaction: Transaction) => {
    if (!this.view) {
      return;
    }

    // this.transactionTracker.bumpDispatchCounter(this.transactionTracking);
    // const { startMeasure, stopMeasure } =
    //   this.transactionTracker.getMeasureHelpers(this.transactionTracking);
    // startMeasure(EVENT_NAME_DISPATCH_TRANSACTION);

    // 计算要更新的节点
    const nodes: PMNode[] = findChangedNodesFromTransaction(transaction);
    const changedNodesValid = validateNodes(nodes);

    if (changedNodesValid) {
      const oldEditorState = this.view.state;

      // go ahead and update the state now we know the transaction is good
      // startMeasure(EVENT_NAME_STATE_APPLY);
      const { state: editorState, transactions } =
        this.view.state.applyTransaction(transaction);
      // stopMeasure(EVENT_NAME_STATE_APPLY);

      console.log(
        ';;EditorView.dispatchingTransaction()-newState, ',
        editorState,
      );

      // this.trackValidTransactions();

      // pm-state没变化，就不需要更新EditorView
      if (editorState === oldEditorState) {
        return;
      }

      // startMeasure(EVENT_NAME_UPDATE_STATE);
      this.view.updateState(editorState);
      // stopMeasure(EVENT_NAME_UPDATE_STATE);

      // startMeasure(EVENT_NAME_VIEW_STATE_UPDATED);
      // 暂时只做tracking，可忽略
      this.onEditorViewStateUpdated({
        originalTransaction: transaction,
        transactions,
        oldEditorState,
        newEditorState: editorState,
      });
      // stopMeasure(EVENT_NAME_VIEW_STATE_UPDATED);

      if (this.props.editorProps.onChange && transaction.docChanged) {
        const source = transaction.getMeta('isRemote') ? 'remote' : 'local';

        // startMeasure(EVENT_NAME_ON_CHANGE);

        this.props.editorProps.onChange(this.view, { source });
        // stopMeasure(
        //   EVENT_NAME_ON_CHANGE,
        //   (duration: number, startTime: number) => {
        //     if (
        //       this.props.editorProps.performanceTracking
        //         ?.onChangeCallbackTracking?.enabled !== true
        //     ) {
        //       return;
        //     }
        //     this.dispatchAnalyticsEvent({
        //       action: ACTION.ON_CHANGE_CALLBACK,
        //       actionSubject: ACTION_SUBJECT.EDITOR,
        //       eventType: EVENT_TYPE.OPERATIONAL,
        //       attributes: {
        //         duration,
        //         startTime,
        //       },
        //     });
        //   },
        // );
      }
      this.editorState = editorState;
    } else {
      const invalidNodes = nodes
        .filter((node) => !validNode(node))
        .map<SimplifiedNode | string>((node) =>
          getDocStructure(node, { compact: true }),
        );

      //   this.dispatchAnalyticsEvent({
      //     action: ACTION.DISPATCHED_INVALID_TRANSACTION,
      //     actionSubject: ACTION_SUBJECT.EDITOR,
      //     eventType: EVENT_TYPE.OPERATIONAL,
      //     attributes: {
      //       analyticsEventPayloads:
      //         getAnalyticsEventsFromTransaction(transaction),
      //       invalidNodes,
      //     },
      //   });
    }
    // stopMeasure(EVENT_NAME_DISPATCH_TRANSACTION);
  };

  /** 计算会传入pm-EditorView(place,EditorProps)的参数对象 */
  getDirectEditorProps = (state?: EditorState): DirectEditorProps => {
    return {
      state: state || this.editorState,
      dispatchTransaction: (tr: Transaction) => {
        // Block stale transactions:
        // Prevent runtime exceptions from async transactions that would attempt to
        // update the DOM after React has unmounted the Editor.
        if (this.canDispatchTransactions) {
          this.dispatchingTransaction(tr);
        }
      },
      // Disables the contentEditable attribute of the editor if the editor is disabled
      editable: (_state) => !this.props.editorProps.disabled,
      attributes: { 'data-gramm': 'false' },
    };
  };

  /** 创建pm-EditorView */
  createEditorView = (node: HTMLDivElement) => {
    // measureRender(measurements.PROSEMIRROR_RENDERED, (duration, startTime) => {
    //   const proseMirrorRenderedTracking =
    //     this.props.editorProps?.performanceTracking
    //       ?.proseMirrorRenderedTracking;

    //   const forceSeverityTracking =
    //     typeof proseMirrorRenderedTracking === 'undefined' &&
    //     shouldForceTracking();

    //   this.proseMirrorRenderedSeverity =
    //     !!forceSeverityTracking || proseMirrorRenderedTracking?.trackSeverity
    //       ? getAnalyticsEventSeverity(
    //           duration,
    //           proseMirrorRenderedTracking?.severityNormalThreshold ??
    //             PROSEMIRROR_RENDERED_NORMAL_SEVERITY_THRESHOLD,
    //           proseMirrorRenderedTracking?.severityDegradedThreshold ??
    //             PROSEMIRROR_RENDERED_DEGRADED_SEVERITY_THRESHOLD,
    //         )
    //       : undefined;

    //   if (this.view) {
    //     this.dispatchAnalyticsEvent({
    //       action: ACTION.PROSEMIRROR_RENDERED,
    //       actionSubject: ACTION_SUBJECT.EDITOR,
    //       attributes: {
    //         duration,
    //         startTime,
    //         nodes: getNodesCount(this.view.state.doc),
    //         ttfb: getResponseEndTime(),
    //         severity: this.proseMirrorRenderedSeverity,
    //         objectId: getContextIdentifier(this.editorState)?.objectId,
    //       },
    //       eventType: EVENT_TYPE.OPERATIONAL,
    //     });
    //   }
    // });

    console.log(';;/new EditorView() creating');

    // Creates the editor-view from this.editorState. If an editor has been mounted
    // previously, this will contain the previous state of the editor.
    this.view = new EditorView({ mount: node }, this.getDirectEditorProps());

    applyDevTools(this.view!);
  };

  /** 作为callbackRef，主要创建pm-EditorView，并注册create和destroy相关事件监听器函数 */
  handleEditorViewRef = (node: HTMLDivElement) => {
    if (!this.view && node) {
      // /首次创建EditorView对象

      this.createEditorView(node);
      const view = this.view!;

      // 默认为空
      this.props.onEditorCreated({
        view,
        config: this.config,
        eventDispatcher: this.eventDispatcher,
        transformer: this.contentTransformer,
      });

      if (
        this.props.editorProps.shouldFocus &&
        view.props.editable &&
        view.props.editable(view.state)
      ) {
        this.focusTimeoutId = handleEditorFocus(view);
      }

      // Force React to re-render so consumers get a reference to the editor view
      // ? 下一行注释掉也能正常渲染
      this.forceUpdate();
    } else if (this.view && !node) {
      // When the appearance is changed, React will call handleEditorViewRef with node === null
      // to destroy the old EditorView, before calling this method again with node === div to
      // create the new EditorView
      this.props.onEditorDestroyed({
        view: this.view,
        config: this.config,
        eventDispatcher: this.eventDispatcher,
        transformer: this.contentTransformer,
      });
      this.view.destroy(); // Destroys the dom node & all node views
      this.view = undefined;
    }
  };

  dispatchAnalyticsEvent = (payload: any): void => {
    // if (this.props.allowAnalyticsGASV3 && this.eventDispatcher) {
    //   const dispatch: AnalyticsDispatch = createDispatch(this.eventDispatcher);
    //   dispatch(analyticsEventKey, {
    //     payload,
    //   });
    // }
  };

  /** 编辑器所在div对应的react元素 */
  private editor = (
    <div
      ref={this.handleEditorViewRef}
      className={getUAPrefix()}
      key='ProseMirror'
      aria-label='Main content area'
      role='textbox'
    />
  );

  render() {
    // console.log(';;ReactEditorView rendering');

    return this.props.render
      ? this.props.render({
          editor: this.editor,
          view: this.view,
          config: this.config,
          eventDispatcher: this.eventDispatcher,
          transformer: this.contentTransformer,
          dispatchAnalyticsEvent: this.dispatchAnalyticsEvent,
        })
      : this.editor;
  }
}

function getUAPrefix() {
  if (browser.chrome) return 'ua-chrome';
  if (browser.ie) return 'ua-ie';
  if (browser.gecko) return 'ua-firefox';
  return '';
}

/** 执行editorView.focus() */
function handleEditorFocus(view: EditorView): number | undefined {
  if (view.hasFocus()) {
    return;
  }
  return window.setTimeout(() => {
    view.focus();
  }, 0);
}
