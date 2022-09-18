import React, { ComponentClass, HTMLAttributes } from 'react';
import styled from 'styled-components';

import { WidthObserver } from '@atlaskit/width-detector';

import { akEditorMobileMaxWidth } from '../../../editor-shared-styles';
import { Toolbar } from './Toolbar';
import { useElementWidth } from './hooks';
import { toolbarSizeToWidth, widthToToolbarSize } from './toolbar-size';
import type { ToolbarWithSizeDetectorProps } from './toolbar-types';
import { ToolbarSize } from './types';

// const StyledToolBar: ComponentClass<
//   HTMLAttributes<{}> & {
//     minWidth?: string;
//   }
// >
const StyledToolBar = styled.div<any>`
  width: 100%;
  min-width: ${({ minWidth }) => minWidth};
  position: relative;
  @media (max-width: ${akEditorMobileMaxWidth}px) {
    grid-column: 1 / 2;
    grid-row: 2;
    width: calc(100% - 30px);
    margin: 0 15px;
  }
`;

/** FullPageEditor默认使用的Toolbar。会自适应宽度。
 * - todo FunctionComponent中不应该使用React.createRef
 */
export const ToolbarWithSizeDetector: React.FunctionComponent<
  ToolbarWithSizeDetectorProps
> = (props) => {
  const ref = React.createRef<HTMLDivElement>();
  const [width, setWidth] = React.useState<number | undefined>(undefined);
  const elementWidth = useElementWidth(ref, {
    skip: typeof width !== 'undefined',
  });

  const toolbarSize =
    typeof width === 'undefined' && typeof elementWidth === 'undefined'
      ? undefined
      : widthToToolbarSize((width || elementWidth)!, props.appearance);

  const toolbarMinWidth = toolbarSizeToWidth(ToolbarSize.S, props.appearance);

  return (
    <StyledToolBar
      minWidth={props.hasMinWidth ? `${toolbarMinWidth}px` : '254px'}
    >
      <WidthObserver setWidth={setWidth} />
      {props.editorView && toolbarSize ? (
        <Toolbar {...props} toolbarSize={toolbarSize} />
      ) : (
        <div ref={ref} />
      )}
    </StyledToolBar>
  );
};
