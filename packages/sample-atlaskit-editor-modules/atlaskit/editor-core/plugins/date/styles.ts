import { css } from 'styled-components';

import { DateSharedCssClassName } from '../../../editor-common';
import {
  SelectionStyle,
  akEditorDeleteBorder,
  akEditorSelectedBorderSize,
  akEditorSelectedNodeClassName,
  getSelectionStyles,
} from '../../../editor-shared-styles';

export const dateStyles = css`
  .${DateSharedCssClassName.DATE_CONTAINER} {
    .${DateSharedCssClassName.DATE_WRAPPER} {
      line-height: initial;
      cursor: pointer;
    }

    &.${akEditorSelectedNodeClassName} {
      .${DateSharedCssClassName.DATE_WRAPPER} > span {
        ${getSelectionStyles([SelectionStyle.BoxShadow])}
      }
    }
  }

  .danger {
    .${DateSharedCssClassName.DATE_CONTAINER}.${akEditorSelectedNodeClassName}
      .${DateSharedCssClassName.DATE_WRAPPER}
      > span {
      box-shadow: 0 0 0 ${akEditorSelectedBorderSize}px ${akEditorDeleteBorder};
    }
  }
`;
