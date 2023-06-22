import React from 'react';

import { css } from '@linaria/core';

export const Sidebar = () => {
  return <aside className={rootCss}>sidebar</aside>;
};

const rootCss = css`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 240px;
  padding: 0 16px;
  border-right: 1px solid #f3f5f7;
  overflow: auto;
`;
