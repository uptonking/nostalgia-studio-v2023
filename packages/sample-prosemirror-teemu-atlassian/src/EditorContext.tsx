import PropTypes from 'prop-types';
import React from 'react';

import { EditorActions } from './EditorActions';

export type EditorContextProps = { editorActions?: EditorActions };

/** legacy context组件，用来传递editorActions，注意没有提供更新值的方法 */
export class EditorContext extends React.Component<EditorContextProps> {
  static childContextTypes = {
    editorActions: PropTypes.object,
  };

  private editorActions: EditorActions;

  constructor(props: EditorContextProps) {
    super(props);
    this.editorActions = props.editorActions || new EditorActions();
  }

  /** legacy context, 定义要传下去的context value */
  getChildContext() {
    return {
      editorActions: this.editorActions,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
