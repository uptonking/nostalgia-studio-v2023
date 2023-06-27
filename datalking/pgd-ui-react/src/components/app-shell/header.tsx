import React from 'react';

import { css } from '@linaria/core';
import { themed } from '@pgd/ui-tokens';

import { useAppShellContext } from './api-hooks';

export const Header = () => {
  const appShellStore = useAppShellContext();

  return (
    <header className={rootCss}>
      <div className={logoPartCss}>
        <div>logo</div>
        <div>
          <button onClick={() => appShellStore.toggleSidebar()}>toggle</button>
        </div>
      </div>
      <div className={actionsPartCss}>user/darkMode</div>
    </header>
  );
};

const rootCss = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${themed.spacing.rem.n16};
  border-bottom: 1px solid #f3f5f7;
`;
const logoPartCss = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: ${themed.spacing.rem.n64};
  padding: 18px 32px;
`;
const actionsPartCss = css`
  display: flex;
  align-items: center;
  /* justify-content: space-between;
  width:${themed.spacing.rem.n64};
  padding: 18px 32px; */
`;
