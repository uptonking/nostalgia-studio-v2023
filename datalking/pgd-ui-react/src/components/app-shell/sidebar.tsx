import React from 'react';

import cx from 'clsx';

import { useStoreState } from '@ariakit/react-core/utils/store';
import { css } from '@linaria/core';
import { themed } from '@pgd/ui-tokens';

import { useAppShellContext } from './api-hooks';

export const Sidebar = () => {
  const appShellStore = useAppShellContext();
  const isSidebarOpen = useStoreState(appShellStore, (state) => {
    return state.isSidebarOpen;
  });

  return (
    <aside className={cx(rootCss, { [rootPositionCss]: !isSidebarOpen })}>
      <div className={rootInnerCss}>sidebar</div>
    </aside>
  );
};

const rootCss = css`
  position: fixed;
  width: ${themed.spacing.rem.n64};
  /* transform: translateX(0); */
  transition: transform ${themed.transition.period.n200} ease;
`;

const rootPositionCss = css`
  transform: translateX(calc(${themed.spacing.rem.n64}*-1));
`;

const rootInnerCss = css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* padding: 0 16px; */
  border-right: 1px solid #f3f5f7;
  overflow: auto;
`;
