import {
  collab,
  getVersion,
  receiveTransaction,
  sendableSteps,
} from 'prosemirror-collab';
import applyDevTools from 'prosemirror-dev-tools';
import { Node as PMNode } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { DirectEditorProps, EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';

import { EditorProps } from './Editor';
import { fetchEvents, getDocument, sendSteps } from './collab-api';
import { useEditorContext } from './core/EditorContext';
import {
  createPMPlugins,
  processPluginsList,
} from './core/create/create-plugins';
import { createSchema } from './core/create/create-schema';
import { createDefaultEditorPlugins } from './create-defaults';
import useSsrLayoutEffect from './react/hooks/useSsrLayoutEffect';
import { SimplifiedNode, getDocStructure } from './utils/document-logger';
import {
  findChangedNodesFromTransaction,
  validNode,
  validateNodes,
} from './utils/nodes';

// import { INewStepsResponse } from '@pm-react-example/shared';

interface IProps {
  editorProps: EditorProps;
  EditorLayoutComponent: (props: any) => JSX.Element;
}

let collabVersion = 0;

/** 基于prosemirror封装EditorPlugin，实现的react编辑器组件 */
export function ReactEditorView(props: IProps) {
  /** 传入这个ReactEditorView组件的所有props，EditorLayoutComponent属性除外 */
  const editorProps = props.editorProps;
  const EditorLayoutComponent = props.EditorLayoutComponent;
  const { viewProvider, pluginsProvider, portalProvider, analyticsProvider } =
    useEditorContext();

  const editorViewRef = useRef(null);
  /** 一直true，没意义 */
  const [canDispatchTransactions, _] = useState(true);

  useSsrLayoutEffect(() => {
    // 创建 plugins、schema、EditorState
    const state = createEditorState();
    const editorViewDOM = editorViewRef.current;
    if (editorViewDOM) {
      const pmEditorProps = createDirectEditorProps(state);

      const view = createEditorView(editorViewDOM, pmEditorProps);

      viewProvider.init(view);

      editorProps.onEditorReady && editorProps.onEditorReady(viewProvider);

      if (editorProps.collab) {
        getDocument().then((data) => {
          viewProvider.replaceDocument(data.doc);
          collabVersion = data.version;
          subscribeToCollab();
        });
      }
    }
    return () => {
      viewProvider.editorView.destroy();
    };
  }, []);

  /** 先计算plugins、schema，再创建EditorState */
  function createEditorState() {
    // 获取内置的plugins
    const editorPlugins = createDefaultEditorPlugins(editorProps);
    // 将配置数据转换成prosemirror可用的结构
    const config = processPluginsList(editorPlugins);
    const schema = createSchema(config);

    const plugins = createPMPlugins({
      schema,
      editorConfig: config,
      portalProvider: portalProvider,
      pluginsProvider: pluginsProvider,
    });

    if (editorProps.collab) plugins.push(collab());

    return EditorState.create({
      schema,
      plugins,
    });
  }

  function createEditorView(
    element: HTMLDivElement,
    editorProps: DirectEditorProps,
  ) {
    const view = new EditorView({ mount: element }, editorProps);
    applyDevTools(view);
    return view;
  }

  function createDirectEditorProps(state: EditorState): DirectEditorProps {
    return {
      state,
      dispatchTransaction: (tr: Transaction) => {
        // Block stale transactions:
        // Prevent runtime exceptions from async transactions that would attempt to
        // update the DOM after React has unmounted the Editor.
        if (canDispatchTransactions) {
          dispatchingTransaction(tr);
        }
      },
      // Disables the contentEditable attribute of the editor if the editor is disabled
      editable: (_state) => !editorProps.disabled,
      attributes: { 'data-gramm': 'false' },
    };
  }

  function dispatchingTransaction(transaction: Transaction) {
    const { editorView } = viewProvider;
    if (!editorView) {
      return;
    }

    const { shouldTrack } = editorProps;
    analyticsProvider.perf.warn('EditorView', 'dispatchTransaction');

    // 查找要修改的所有一级节点 PMNodes
    const nodes: PMNode[] = findChangedNodesFromTransaction(transaction);
    const changedNodesValid = validateNodes(nodes);

    if (changedNodesValid) {
      const oldEditorState = editorView.state;

      // go ahead and update the state now we know the transaction is good
      analyticsProvider.perf.info(
        'EditorView',
        'dispatchTransaction state::apply',
      );

      const newState = editorView.state.apply(transaction);

      analyticsProvider.perf.stop(
        'EditorView',
        'dispatchTransaction state::apply',
        200,
      );

      // 若pm-editor的state没变，则只更新所有ReactNodeViews组件
      if (newState === oldEditorState) {
        // I don't think it's possible for the React nodeviews to change without changing PM editorState but
        // it's better to be safe than sorry I guess.
        portalProvider.flush();
        return;
      }
      analyticsProvider.perf.warn(
        'EditorView',
        'dispatchTransaction updateState',
      );

      // 更新editorView
      editorView.updateState(newState);
      analyticsProvider.perf.stop(
        'EditorView',
        'dispatchTransaction updateState',
        100,
      );
      analyticsProvider.perf.debug('EditorView', 'dispatchTransaction flush');

      // 再更新所有ReactNodeViews组件
      portalProvider.flush();
      analyticsProvider.perf.stop(
        'EditorView',
        'dispatchTransaction flush',
        100,
      );

      editorProps.collab && sendStepsToCollabServer(newState);

      if (
        editorProps.onDocumentEdit &&
        !transaction.getMeta('dontTriggerOnDocumentEdit')
      ) {
        editorProps.onDocumentEdit(editorView);
      }
    } else {
      // 处理无效节点
      const invalidNodes = nodes
        .filter((node) => !validNode(node))
        .map<SimplifiedNode | string>((node) => getDocStructure(node));

      if (shouldTrack) {
        console.error('Invalid nodes in transaction');
        console.log(transaction);
        console.log(invalidNodes);
      }
    }

    analyticsProvider.perf.stop('EditorView', 'dispatchTransaction', 1000);
  }

  useEffect(() => {
    if (editorProps.collab?.documentId) {
      getDocument().then((data) => {
        viewProvider.replaceDocument(data.doc);
        collabVersion = data.version;
        subscribeToCollab();
      });
    }
  }, [editorProps.collab?.documentId, subscribeToCollab, viewProvider]);

  async function subscribeToCollab() {
    if (!editorProps.collab) return;
    const response = await fetchEvents(collabVersion);
    if (response.status == 502) {
      // Status 502 is a connection timeout error,
      // may happen when the connection was pending for too long,
      // and the remote server or a proxy closed it
      // let's reconnect
      await subscribeToCollab();
    } else if (response.status != 200) {
      // Reconnect in one second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await subscribeToCollab();
    } else {
      // Get and show the message
      // const data: INewStepsResponse = await response.json()
      const data: any = await response.json();
      handleCollabEvents(data);
      subscribeToCollab();
    }
  }

  // function handleCollabEvents(data: INewStepsResponse) {
  function handleCollabEvents(data: any) {
    const { editorView } = viewProvider;
    let tr = receiveTransaction(
      editorView.state,
      data.steps.map((j) => Step.fromJSON(editorView.state.schema, j)),
      data.clientIDs,
    );
    editorView.dispatch(tr);
    collabVersion = data.version;
  }

  async function sendStepsToCollabServer(newState: EditorState) {
    const sendable = sendableSteps(newState);
    if (sendable) {
      // TODO hackz
      const clientID = sendable.clientID as number;
      const { version } = await sendSteps({
        ...sendable,
        clientID,
        version: collabVersion,
      });
      if (version) collabVersion = version;
    }
  }

  return (
    <EditorLayoutComponent>
      <div ref={editorViewRef} />
    </EditorLayoutComponent>
  );
}
