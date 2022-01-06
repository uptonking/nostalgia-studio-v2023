import { css } from 'styled-components';

import {
  blockquoteSharedStyles,
  headingsSharedStyles,
} from '../../../editor-common';

export const blocktypeStyles = css`
  .ProseMirror {
    ${blockquoteSharedStyles};
    ${headingsSharedStyles};
  }
`;
