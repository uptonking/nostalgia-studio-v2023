import PropTypes from 'prop-types';
import React from 'react';

import EditorActions from '../../actions';

export type EditorContextProps = { editorActions?: EditorActions };

const EditorContext = React.createContext({});

/** 获取EditorContext中保存的editorActions对象 */
export const useEditorContext = () =>
  React.useContext<EditorContextProps>(EditorContext);

/** legacy context组件，用来传递editorActions，注意没有提供更新值的方法 */
export default class LegacyEditorContext extends React.Component<
  EditorContextProps,
  {}
> {
  static childContextTypes = {
    editorActions: PropTypes.object,
  };

  /** legacy context, 定义要传下去的context value */
  getChildContext() {
    return {
      editorActions: this.editorActions,
    };
  }

  private editorActions: EditorActions;

  constructor(props: EditorContextProps) {
    super(props);
    this.editorActions = props.editorActions || new EditorActions();
  }

  render() {
    return (
      <EditorContext.Provider value={this.getChildContext()}>
        {this.props.children}
      </EditorContext.Provider>
    );
  }
}
