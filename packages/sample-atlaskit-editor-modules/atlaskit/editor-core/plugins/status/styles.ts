import { css } from 'styled-components';

import { StatusSharedCssClassName } from '../../../editor-common';
import {
  SelectionStyle,
  akEditorDeleteBackgroundWithOpacity,
  akEditorDeleteBorder,
  akEditorSelectedBorderSize,
  akEditorSelectedNodeClassName,
  getSelectionStyles,
} from '../../../editor-shared-styles';

export const statusStyles = css`
  .${StatusSharedCssClassName.STATUS_CONTAINER} {
    > span {
      display: inline-block;
      cursor: pointer;
      line-height: 0; /* Prevent responsive layouts increasing height of container. */
    }

    &.${akEditorSelectedNodeClassName}
      .${StatusSharedCssClassName.STATUS_LOZENGE}
      > span {
      ${getSelectionStyles([SelectionStyle.BoxShadow])}
    }
  }

  .danger {
    .${StatusSharedCssClassName.STATUS_LOZENGE} > span {
      background-color: ${akEditorDeleteBackgroundWithOpacity};
    }

    .${StatusSharedCssClassName.STATUS_CONTAINER}.${akEditorSelectedNodeClassName}
      .${StatusSharedCssClassName.STATUS_LOZENGE}
      > span {
      box-shadow: 0 0 0 ${akEditorSelectedBorderSize}px ${akEditorDeleteBorder};
    }
  }
`;
