import React from 'react';

import cx from 'clsx';

import { useStoreState } from '@ariakit/react-core/utils/store';
import { css } from '@linaria/core';
import { themed } from '@pgd/ui-tokens';

import { cardBoxCss } from '../../styles';
import { Switch } from '../switch';
import { useAppShellContext } from './api-hooks';

type MainContentProps = {
  children?: React.ReactNode;
};

export const MainContent = (props: MainContentProps) => {
  const { children } = props;

  const appShellStore = useAppShellContext();
  const isSidebarOpen = useStoreState(appShellStore, (state) => {
    return state.isSidebarOpen;
  });

  return (
    <div className={cx(rootCss, { [rootPositionCss]: isSidebarOpen })}>
      <div className={rootInnerCss}>
        <div className={cardBoxCss}>
          <h3>{children || 'content'}</h3>
          <Switch> ready for interview</Switch>
        </div>
      </div>
    </div>
  );
};

const rootCss = css`
  flex-grow: 1;
  overflow-y: auto;
  margin-left: ${themed.spacing.rem.n6};
  margin-right: ${themed.spacing.rem.n6};
  /* display: flex; */
  /* background-color: #f3f5f7; */
  transition: transform ${themed.transition.period.n200} ease;
`;

const rootPositionCss = css`
  transform: translateX(${themed.spacing.rem.n64});
  /* width: calc(100% - ${themed.spacing.rem.n64}); */
`;

const rootInnerCss = css`
  /* display: flex; */
  /* width: 70%; */
`;

const infoPanelCss = css`
  /* display: flex; */
  /* width: 30%; */
`;

export const MainContentTest = (props: MainContentProps) => {
  const { children } = props;

  return (
    <div className={cx(rootCss)}>
      <div className={rootInnerCss}>
        <div className={cardBoxCss}>
          <h3>content</h3>
          <Switch> ready for interview</Switch>
        </div>
      </div>
      <div className={infoPanelCss}>
        <div className={cardBoxCss}>description</div>
      </div>
    </div>
  );
};
