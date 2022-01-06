import { css } from 'styled-components';

import { TaskDecisionSharedCssClassName } from '../../../editor-common';
import {
  SelectionStyle,
  akEditorDeleteBackgroundWithOpacity,
  akEditorDeleteBorder,
  akEditorSelectedBorderSize,
  akEditorSelectedNodeClassName,
  getSelectionStyles,
} from '../../../editor-shared-styles';

export const taskDecisionStyles = css`
  [data-decision-wrapper] {
    cursor: pointer;
  }

  .${akEditorSelectedNodeClassName} > [data-decision-wrapper],
  ol[data-node-type='decisionList'].${akEditorSelectedNodeClassName} {
    border-radius: 4px;
    ${getSelectionStyles([SelectionStyle.BoxShadow, SelectionStyle.Blanket])}
  }

  .danger {
    .${TaskDecisionSharedCssClassName.DECISION_CONTAINER}.${akEditorSelectedNodeClassName}
      > div {
      box-shadow: 0 0 0 ${akEditorSelectedBorderSize}px ${akEditorDeleteBorder};
      background-color: ${akEditorDeleteBackgroundWithOpacity};
      &::after {
        content: none; /* reset the Blanket selection style */
      }
    }
  }
`;
