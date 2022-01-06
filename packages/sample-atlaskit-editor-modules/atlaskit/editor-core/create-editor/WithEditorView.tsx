import type { EditorView } from 'prosemirror-view';
import React, { ComponentType, FunctionComponent } from 'react';

import { useEditorContext } from '../ui/EditorContext';

export interface WithEditorViewInternalProps {
  editorView?: EditorView | undefined;
}

/** 高阶组件，添加pm-EditorView对象作为props */
export const WithEditorView = <P extends WithEditorViewInternalProps>(
  WrappedComponent: ComponentType<P>,
): ComponentType<Omit<P, keyof WithEditorViewInternalProps>> => {
  /** 定义一个新组件 */
  const _WithFeatureFlags: FunctionComponent<
    Omit<P, keyof WithEditorViewInternalProps>
  > = (props) => {
    const { editorActions } = useEditorContext();

    return (
      <WrappedComponent
        {...(props as P)}
        editorView={editorActions?._privateGetEditorView()}
      />
    );
  };

  return _WithFeatureFlags;
};
