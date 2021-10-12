import applyDevTools from 'prosemirror-dev-tools';
import { EditorState, Transaction } from 'prosemirror-state';
import { DirectEditorProps, EditorProps, EditorView } from 'prosemirror-view';
import React, {
  CSSProperties,
  Dispatch,
  SetStateAction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

type Config = Parameters<typeof EditorState.create>[0];

/**
 * 通过react创建并管理 EditorState
 * @param config 直接传递给EditorState.create()的配置参数
 * @returns [state, useState]
 */
export function useProseMirror(
  config: Config,
): [EditorState, Dispatch<SetStateAction<EditorState>>] {
  return useState(() => EditorState.create(config));
}

export interface Handle {
  view: EditorView;
}

interface PropsBase extends EditorProps {
  state: EditorState;
  style?: CSSProperties;
  className?: string;
}

// If using TypeScript, the compiler will enforce that either
// `onChange` or `dispatchTransaction` are provided, but not both:

interface PropsWithOnChange {
  onChange: (state: EditorState) => void;
  dispatchTransaction?: never;
}

interface PropsWithDispatchTransaction {
  dispatchTransaction: (transaction: Transaction) => void;
  onChange?: never;
}

type Props = PropsBase & (PropsWithOnChange | PropsWithDispatchTransaction);

export const ProseMirrorEditor = forwardRef<Handle, Props>(function ProseMirror(
  props,
  ref,
): JSX.Element {
  const initialProps = useRef(props);
  const rootRef = useRef<HTMLDivElement>(null!);
  const viewRef = useRef<EditorView<any>>(null!);

  // If this is a non-initial render, update the editor view with
  // the React render.
  // - First update editor state using `EditorView#updateState()`.
  // - Then update other props using `EditorView#setProps()`.
  // If we update state with other props together using
  // `setProps()`, scroll-into-view will not occur due to:
  // https://github.com/ProseMirror/prosemirror-view/blob/13b046a834b489530a98dd362fa55703e52e076d/src/index.js#L183-L195
  const { state, ...restProps } = props;

  function buildProps(props: Partial<Props>): Partial<DirectEditorProps> {
    return {
      ...props,
      dispatchTransaction: (transaction) => {
        // `dispatchTransaction` takes precedence.
        if (props.dispatchTransaction) {
          props.dispatchTransaction(transaction);
        } else if (props.onChange) {
          const newState = viewRef.current.state.apply(transaction);
          console.log(';;/PM-dispatchTr, ', newState);

          props.onChange(newState);
        }
      },
    };
  }

  viewRef.current?.updateState(state);
  viewRef.current?.setProps(buildProps(restProps));

  useEffect(() => {
    // Bootstrap the editor on first render. Note: running
    // non-initial renders inside `useEffect` produced glitchy
    // behavior.
    const view = new EditorView(rootRef.current, {
      state: initialProps.current.state,
      ...buildProps(initialProps.current),
    });
    // applyDevTools(view);
    viewRef.current = view;
    return () => {
      view.destroy();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    get view() {
      return viewRef.current;
    },
  }));

  return <div ref={rootRef} style={props.style} className={props.className} />;
});
