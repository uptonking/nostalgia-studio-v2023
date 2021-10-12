import applyDevTools from 'prosemirror-dev-tools';
import { EditorState, Transaction } from 'prosemirror-state';
import { DirectEditorProps, EditorView } from 'prosemirror-view';
import React, { useRef, useState } from 'react';

import { useEditorContext } from '../context';
import { useSsrLayoutEffect } from '../react';
import { EditorProps } from './types/editor';

/**
 * 基于prosemirror编辑器实现的react组件，
 * 若不提供自己的UserContext.Provider，就会使用默认值，多个provider都有自己的默认值。
 */
export function Editor(props: EditorProps) {
  const editorContextVal = useEditorContext();
  const { viewProvider, extensionProvider, analyticsProvider, portalProvider } =
    editorContextVal;

  /** 指向本组件的最外层div */
  const editorViewRef = useRef(null);

  /** 一直为true，无意义 */
  const [canDispatchTransactions, _] = useState(true);

  // 创建prosemirror的EditorState和EditorView
  useSsrLayoutEffect(() => {
    const state = createEditorState();

    const editorViewDOM = editorViewRef.current;

    if (editorViewDOM) {
      const pmEditorProps = createDirectEditorProps(state);

      // 创建prosemirror-EditorView
      const view = createEditorView(editorViewDOM, pmEditorProps);

      // 保存全局editorView到provider
      viewProvider.init(view);
      props.onEditorReady && props?.onEditorReady(editorContextVal);
    }
    return () => {
      viewProvider.editorView.destroy();
    };
  }, []);

  /** 创建 prosemirror-EditorState */
  function createEditorState() {
    return EditorState.create({
      schema: extensionProvider.createSchema(),
      plugins: extensionProvider.createPlugins(),
    });
  }

  /** 创建 prosemirror-EditorView */
  function createEditorView(
    element: HTMLDivElement,
    editorProps: DirectEditorProps,
  ) {
    const view = new EditorView({ mount: element }, editorProps);

    applyDevTools(view);

    // todo, 页面中有多个编辑器时不能直接挂载到window
    (window as any).editorView = view;
    return view;
  }

  /** 可传入EditorView的所有props，包括state、dispatchTr、editable */
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
      editable: (_state) => !props.disabled,
      attributes: { 'data-gramm': 'false' },
    };
  }

  function dispatchingTransaction(transaction: Transaction) {
    console.log(';;/dispatchingTransaction');

    const { editorView } = viewProvider;

    if (!editorView) {
      return;
    }

    analyticsProvider.perf.warn('EditorView', 'dispatchTransaction');

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

    editorView.updateState(newState);

    analyticsProvider.perf.stop(
      'EditorView',
      'dispatchTransaction updateState',
      100,
    );
    analyticsProvider.perf.debug('EditorView', 'dispatchTransaction flush');

    portalProvider.flush();
    analyticsProvider.perf.stop('EditorView', 'dispatchTransaction flush', 100);
    // A bit hackish way to stop triggering sync events when the whole document is replaced by the user
    if (!transaction.getMeta('SKIP_AFTER_TR')) {
      afterTrHooks(newState);
    }

    analyticsProvider.perf.stop('EditorView', 'dispatchTransaction', 1000);
  }

  function afterTrHooks(newState: EditorState) {
    if (props.onDocumentEdit) {
      props.onDocumentEdit(newState);
    }
  }

  return <div ref={editorViewRef}>{props.children}</div>;
}
