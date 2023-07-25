import { css } from '@linaria/core';

export const rootMenuCss = css`
  padding: 6px 14px;
  border-radius: 4px;
  border: 1px solid #d7dce5;
  background: none;
  color: #bbb;
  cursor: pointer;

  &.hideMenuBorder {
    border: none;
  }

  &[data-open],
  &:hover {
    background-color: #f1f3f5;
  }
`;

export const menuCss = css`
  width: max-content;
  padding: 4px;
  border-radius: 4px;
  box-shadow:
    2px 4px 12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  outline: 0;
  color: #bbb;
`;

export const menuItemCss = css`
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  width: 100%;
  margin: 0;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  text-align: left;
  line-height: 1.8;
  min-width: 110px;
  outline: 0;
  background: #fff;
  color: #bbb;
  cursor: pointer;

  &:hover {
    background-color: #f1f3f5;
  }

  &[data-open],
  &:focus,
  &:not([disabled]):active {
    background-color: #f1f3f5;
  }

  & .i-icon {
    margin-right: 6px;
  }
`;
