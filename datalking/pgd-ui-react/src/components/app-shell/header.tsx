import React from 'react';

import { css } from '@linaria/core';

export const Header = () => {
  return <header className={rootCss}>header darkMode</header>;
};

const rootCss = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 32px;
  border-bottom: 1px solid #f3f5f7;
`;
