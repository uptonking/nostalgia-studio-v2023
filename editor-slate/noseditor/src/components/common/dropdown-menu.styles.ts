import { css } from '@linaria/core';

import { themed } from '../../styles';

export const rootMenuCss = css`
  padding: 6px 14px;
  border-radius: ${themed.size.borderRadius.xs};
  border: 1px solid #d7dce5;
  background: none;
  color: ${themed.color.text.muted};
  cursor: pointer;

  &.hideMenuBorder {
    border: none;
  }

  &[data-open],
  &:hover {
    background-color: ${themed.color.background.hover};
  }
`;

export const menuCss = css`
  width: max-content;
  padding: 4px;
  border-radius: ${themed.size.borderRadius.xs};
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  outline: 0;
  color: ${themed.color.text.muted};
`;

export const menuItemCss = css`
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  width: 100%;
  margin: 0;
  border: none;
  border-radius: ${themed.size.borderRadius.xs};
  font-size: 16px;
  text-align: left;
  line-height: 1.8;
  min-width: 110px;
  outline: 0;
  background: ${themed.palette.white};
  color: ${themed.color.text.muted};
  cursor: pointer;

  &:hover {
    background-color: ${themed.color.background.hover};
  }

  &[data-open],
  &:focus,
  &:not([disabled]):active {
    background-color: ${themed.color.background.hover};
  }

  & .i-icon {
    margin-right: ${themed.spacing.spacer.sm};
  }
`;
