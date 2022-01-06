import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import type { ComponentClass, HTMLAttributes } from 'react';
import styled from 'styled-components';

import { clickAreaClickHandler } from '../click-area-helper';

// const ClickWrapper: ComponentClass<HTMLAttributes<{}>> = styled.div`
const ClickWrapper = styled.div`
  flex-grow: 1;
  height: 100%;
  /* background-color: beige; */
`;
ClickWrapper.displayName = 'ClickWrapper';

export interface Props {
  editorView?: EditorView;
  children?: any;
}

export default class ClickAreaBlock extends React.Component<Props> {
  private handleClick = (event: React.MouseEvent<any>) => {
    const { editorView: view } = this.props;
    if (!view) {
      return;
    }
    clickAreaClickHandler(view, event);
  };

  render() {
    return (
      <ClickWrapper onClick={this.handleClick}>
        {this.props.children}
      </ClickWrapper>
    );
  }
}
