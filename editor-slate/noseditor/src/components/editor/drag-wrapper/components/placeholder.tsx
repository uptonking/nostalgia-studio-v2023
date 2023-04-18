import React from 'react';

import cx from 'clsx';
import { Range } from 'slate';
import { useSlate } from 'slate-react';

import { css } from '@linaria/core';

export const Placeholder = () => {
  const editor = useSlate();

  if (!(editor.selection && Range.isCollapsed(editor.selection))) {
    return null;
  }

  return (
    <div
      contentEditable={false}
      className={cx('clipboardSkip', placeholderCss)}
    >
      Start writing and creating...
    </div>
  );
};

export const placeholderCss = css`
  position: absolute;
  top: 6px;
  /* left: 40px; */
  width: calc(100% - 46px);
  overflow: hidden;
  border-radius: 8px;
  vertical-align: middle;
  text-align: start;
  line-height: 1.5;
  background: transparent;
  pointer-events: none;
  user-select: none;
  z-index: 1;
  opacity: 0.3;
  cursor: pointer;
  /* font-style: italic; */
`;
