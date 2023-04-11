import { css } from '@linaria/core';

import { themed } from '../../styles';

export const rootMenuCss = css`
  padding: 6px 14px;
  border: none;
  border-radius: ${themed.size.borderRadius.xs};
  border: 1px solid #d7dce5;
  background: none;

  &[data-open],
  &:hover {
    background-color: ${themed.color.background.hover};
  }
`;

export const menuCss = css`
  backdrop-filter: blur(10px);
  padding: 4px;
  border-radius: ${themed.size.borderRadius.xs};
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.1);
  outline: 0;
  width: max-content;
`;

export const menuItemCss = css`
  display: flex;
  justify-content: space-between;
  width: 100%;
  border: none;
  border-radius: ${themed.size.borderRadius.xs};
  font-size: 16px;
  text-align: left;
  line-height: 1.8;
  min-width: 110px;
  margin: 0;
  outline: 0;
  background: none;

  &[data-open],
  &:focus,
  &:not([disabled]):active {
    background-color: ${themed.color.background.hover};
  }
`;
