import * as React from 'react';
import styled from 'styled-components';

import {
  indentationSharedStyles,
  inlineNodeSharedStyle,
  listsSharedStyles,
  paragraphSharedStyles,
  shadowSharedStyle,
  whitespaceSharedStyles,
} from '../../../editor-common';
import { editorFontSize } from '../../../editor-shared-styles';
import { blocktypeStyles } from '../../plugins/block-type/styles';
import { fakeCursorStyles } from '../../plugins/fake-text-cursor/styles';
import { useFeatureFlags } from '../../plugins/feature-flags-context';
import { ClassNames } from '../../plugins/media/pm-plugins/alt-text/style';
import { ruleStyles } from '../../plugins/rule/styles';
import { gapCursorStyles } from '../../plugins/selection/gap-cursor/styles';
import { textFormattingStyles } from '../../plugins/text-formatting/styles';
import type { FeatureFlags } from '../../types/feature-flags';

// #region /folded imports-plugins-styles

// import { smartCardStyles } from '../../plugins/card/styles';
// import { embedCardStyles } from '../../plugins/card/ui/styled';
// import {
//   codeBlockStyles,
//   highlightingCodeBlockStyles,
// } from '../../plugins/code-block/styles';
// import { telepointerStyle } from '../../plugins/collab-edit/styles';
// import { dateStyles } from '../../plugins/date/styles';
// import { emojiStyles, emojiStylesNext } from '../../plugins/emoji/styles';
// import { expandStyles } from '../../plugins/expand/ui/styles';
// import { extensionStyles } from '../../plugins/extension/ui/styles';
// import { findReplaceStyles } from '../../plugins/find-replace/styles';
// import { gridStyles } from '../../plugins/grid/styles';
// import { linkStyles } from '../../plugins/hyperlink/styles';
// import { layoutStyles } from '../../plugins/layout/styles';
// import { listsStyles } from '../../plugins/lists/styles';
// import { unsupportedStyles } from '../../plugins/unsupported-content/styles';

// import { mediaStyles } from '../../plugins/media/styles';
// import { mentionsStyles } from '../../plugins/mentions/styles';
// import { panelStyles } from '../../plugins/panel/styles';
// import { placeholderTextStyles } from '../../plugins/placeholder-text/styles';
// import { placeholderStyles } from '../../plugins/placeholder/styles';
// import { statusStyles } from '../../plugins/status/styles';
// import { tableStyles } from '../../plugins/table/ui/common-styles.css';
// import { taskDecisionStyles } from '../../plugins/tasks-and-decisions/styles';

// ${blocktypeStyles}
// ${textFormattingStyles}
// ${placeholderTextStyles}
// ${placeholderStyles}
// ${({
//   featureFlags,
// }) =>
//   featureFlags?.codeBlockSyntaxHighlighting
//     ? highlightingCodeBlockStyles
//     : codeBlockStyles}
// ${listsStyles}
// ${ruleStyles}
// ${mediaStyles}
// ${layoutStyles}
// ${telepointerStyle}
// ${gapCursorStyles};
// ${tableStyles}
// ${panelStyles}
// ${fakeCursorStyles}
// ${mentionsStyles}
// ${({
//   featureFlags,
// }) =>
//   featureFlags?.nextEmojiNodeView
//     ? emojiStylesNext
//     : emojiStyles}
// ${tasksAndDecisionsStyles}
// ${gridStyles}
// ${linkStyles}
// ${blockMarksSharedStyles}
// ${dateSharedStyle}
// ${extensionStyles}
// ${expandStyles}
// ${findReplaceStyles}
// ${taskDecisionStyles}
// ${statusStyles}
// ${annotationSharedStyles}
// ${smartCardStyles}
// ${smartCardSharedStyles}
// ${dateStyles}
// ${embedCardStyles}
// ${unsupportedStyles}

// #endregion /folded imports-plugins-styles

type ContentStylesProps = {
  theme?: any;
  allowAnnotation?: boolean;
  featureFlags?: FeatureFlags;
  innerRef?: any;
};

const ContentStyles = styled.div<ContentStylesProps>`
  .ProseMirror {
    outline: none;
    font-size: ${editorFontSize}px;
    ${whitespaceSharedStyles};
    ${paragraphSharedStyles};
    ${listsSharedStyles};
    ${indentationSharedStyles};
    ${shadowSharedStyle};
    ${inlineNodeSharedStyle};
  }

  .ProseMirror[contenteditable='false'] .taskItemView-content-wrap {
    pointer-events: none;
    opacity: 0.7;
  }

  .ProseMirror-hideselection *::selection {
    background: transparent;
  }

  .ProseMirror-hideselection *::-moz-selection {
    background: transparent;
  }

  .ProseMirror-selectednode {
    outline: none;
  }

  .ProseMirror-selectednode:empty {
    outline: 2px solid #8cf;
  }

  ${blocktypeStyles}
  ${textFormattingStyles}
  ${ruleStyles}
  ${gapCursorStyles};
  ${fakeCursorStyles}

  .panelView-content-wrap {
    box-sizing: border-box;
  }

  .mediaGroupView-content-wrap ul {
    padding: 0;
  }

  /** Needed to override any cleared floats, e.g. image wrapping */

  div.fabric-editor-block-mark[class^='fabric-editor-align'] {
    clear: none !important;
  }

  .fabric-editor-align-end {
    text-align: right;
  }

  .fabric-editor-align-start {
    text-align: left;
  }

  .fabric-editor-align-center {
    text-align: center;
  }

  .pm-table-header-content-wrap,
  .pm-table-cell-content-wrap div.fabric-editor-block-mark {
    p {
      margin-top: 0;
    }
  }

  .hyperlink-floating-toolbar,
  .${ClassNames.FLOATING_TOOLBAR_COMPONENT} {
    padding: 0;
  }

  /* Link icon in the Atlaskit package
     is bigger than the others
  */
  .hyperlink-open-link {
    svg {
      max-width: 18px;
    }
    &[href] {
      padding: 0 4px;
    }
  }
`;

export default React.forwardRef(
  (
    props: Omit<
      ContentStylesProps & {
        className?: string;
      },
      'featureFlags'
    >,
    ref,
  ) => {
    const featureFlags = useFeatureFlags();
    return (
      <ContentStyles
        {...props}
        innerRef={ref as any}
        featureFlags={featureFlags}
      />
    );
  },
);
