import React from 'react';

import { css } from '@linaria/core';
import { themed } from '@pgd/ui-tokens';

import { useAppShellContext } from './api-hooks';

export const Header = () => {
  const appShellStore = useAppShellContext();

  return (
    <header className={rootCss}>
      <div className={logoPartCss}>
        <div className={logoCss}>logo</div>
        <div>
          <button onClick={() => appShellStore.toggleSidebar()}>toggle</button>
        </div>
      </div>
      <div className={actionsPartCss}>user/darkMode</div>
    </header>
  );
};

const rootCss = css`
  /* position: sticky; */
  position: fixed;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: ${themed.spacing.rem.n16};
  border-bottom: ${themed.border.presets.default};
  background-color: ${themed.palette.white};
  z-index: ${themed.zIndex.n30};
`;

const logoPartCss = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: ${themed.spacing.rem.n64};
  padding-left: ${themed.spacing.rem.n6};
`;

const logoCss = css`
  color: ${themed.color.brand.primary};
  font-size: ${themed.font.size.xl3};
  font-weight: 600;
  line-height: ${themed.size.lineHeight.rem.n9};
`;

const actionsPartCss = css`
  display: flex;
  align-items: center;
  padding-right: ${themed.spacing.rem.n6};
`;
