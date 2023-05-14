import { css } from '@linaria/core';

const flexCss = css`
  display: flex;
`;

export const textInputCss = css`
  white-space: pre-wrap;
  border: none;
  padding: 0.5rem;
  color: #424242;
  font-size: 1rem;
  border-radius: 4px;
  resize: none;
  background-color: white;
  box-sizing: border-box;
  flex: 1 1 auto;
  &:focus {
    outline: none;
  }
`;

export const headerMenuContainerCss = css`
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.12),
    0 4px 6px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.12);
  background-color: white;
`;

export const menuItemBtnCss = css`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.25rem 0.75rem;
  border: 0;
  background-color: transparent;
  color: #757575;
  font-size: 0.875rem;
  font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, 'avenir next',
    avenir, 'segoe ui', 'helvetica neue', helvetica, Ubuntu, noto, arial,
    sans-serif;
  text-align: left;
  text-transform: capitalize;
  cursor: pointer;
  &:hover {
    background-color: #eeeeee;
  }

  & svg {
    width: 18px;
    height: 18px;
    margin-top: 4px;
    margin-right: 8px;
  }
`;

export const listContainerCss = css`
  padding: 4px 0px;
`;
