import PropTypes from 'prop-types';
import * as React from 'react';

import type EditorActions from '../../actions';

export interface WithEditorActionsProps {
  render(actions: EditorActions): React.ReactElement<any> | null;
}

/** 基于render props定义的react组件，从context中获取editorActions作为数据 */
export default class WithEditorActions extends React.Component<
  WithEditorActionsProps,
  any
> {
  static contextTypes = {
    editorActions: PropTypes.object.isRequired,
  };

  context!: {
    editorActions: EditorActions;
  };

  componentDidMount() {
    this.context.editorActions._privateSubscribe(this.onContextUpdate);
  }

  componentWillUnmount() {
    this.context.editorActions._privateUnsubscribe(this.onContextUpdate);
  }

  /** 强制rerender本组件的方法，通过注册监听器暴露出去 */
  private onContextUpdate = () => {
    // Re-render actions when editorActions changes...
    this.forceUpdate();
  };

  render() {
    return this.props.render(this.context.editorActions);
  }
}
