import { css } from '@linaria/core';

import { themed } from '../../src/styles/theme-vars';

export const popupWrapperCss = css`
  position: relative;
  display: inline;
`;

export const popupCss = css`
  position: absolute;
  left: 0;
  height: fit-content;
  padding: 12px 8px;
  box-shadow: ${themed.shadow.lg};
  background-color: white;
  z-index: 1;
`;
